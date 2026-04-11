"use client";

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMapMarkerAlt, FaBriefcase, FaClock, FaDollarSign, FaBuilding, FaGlobe, FaCalendar, FaUsers, FaShareAlt, FaCheck, FaArrowRight, FaBookmark } from 'react-icons/fa';

interface Job {
  _id: string;
  title: string;
  location: string;
  experience: { level: string };
  salary?: { min: number; max: number; currency: string };
  requiredSkills: string[];
  createdAt: string;
  company?: string;
  employmentType?: string;
  description?: string;
}

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
}

export default function JobDetailModal({ job, isOpen, onClose, onApply }: JobDetailModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const formatSalary = (min: number, max: number, currency: string) => {
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffMs = now.getTime() - posted.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title,
          text: `Check out this job: ${job?.title} at ${job?.company}`,
          url: url
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (!job) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 md:inset-10 lg:inset-20 bg-white rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            <div className="flex-shrink-0 relative">
              <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/20 to-transparent" />
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>

              <div className="absolute -bottom-12 left-6 md:left-8">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white shadow-xl flex items-center justify-center text-3xl md:text-4xl font-black text-blue-600 border-4 border-white">
                  {job.company?.charAt(0) || <FaBuilding className="text-3xl" />}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pt-16 md:pt-20 pb-32">
              <div className="px-6 md:px-8 lg:px-10">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">{job.title}</h1>
                    <p className="text-lg text-slate-600 flex items-center gap-2">
                      <FaBuilding className="text-blue-500" />
                      {job.company || 'Company'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleShare}
                      className="p-3 rounded-xl border-2 border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all"
                      title="Share job"
                    >
                      <FaShareAlt />
                    </button>
                    <button 
                      className="p-3 rounded-xl border-2 border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Save job"
                    >
                      <FaBookmark />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-8">
                  <span className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium">
                    <FaMapMarkerAlt /> {job.location}
                  </span>
                  <span className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-medium">
                    <FaBriefcase /> {job.experience.level}
                  </span>
                  {job.salary && (
                    <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium">
                      <FaDollarSign /> {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                    </span>
                  )}
                  {job.employmentType && (
                    <span className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium">
                      <FaClock /> {job.employmentType}
                    </span>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-8">
                    <section>
                      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FaBriefcase className="text-blue-600" />
                        </div>
                        Job Description
                      </h2>
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-600 leading-relaxed">
                          {job.description || 'No description provided for this position.'}
                        </p>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                          <FaCheck className="text-purple-600" />
                        </div>
                        Required Skills
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.map((skill, index) => (
                          <span 
                            key={index}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-default"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <FaUsers className="text-emerald-600" />
                        </div>
                        Experience Level
                      </h2>
                      <p className="text-slate-600">
                        This position requires <span className="font-semibold text-slate-900">{job.experience.level}</span> level of experience.
                      </p>
                    </section>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-slate-50 rounded-2xl p-6">
                      <h3 className="font-bold text-slate-900 mb-4">Job Summary</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400">
                            <FaBuilding />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">Company</p>
                            <p className="text-sm font-semibold text-slate-900">{job.company || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400">
                            <FaMapMarkerAlt />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">Location</p>
                            <p className="text-sm font-semibold text-slate-900">{job.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400">
                            <FaClock />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">Job Type</p>
                            <p className="text-sm font-semibold text-slate-900">{job.employmentType || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400">
                            <FaCalendar />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">Posted</p>
                            <p className="text-sm font-semibold text-slate-900">{timeAgo(job.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                      <h3 className="font-bold mb-2">Ready to apply?</h3>
                      <p className="text-blue-100 text-sm mb-4">Join thousands of candidates who found their dream job through Umurava AI.</p>
                      <button 
                        onClick={onApply}
                        className="w-full py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                      >
                        Apply Now <FaArrowRight />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-white border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <FaCalendar className="text-slate-400" />
                  Posted {formatDate(job.createdAt)}
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl font-bold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                  <button 
                    onClick={onApply}
                    className="px-8 py-3 rounded-xl font-bold text-sm text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    style={{ backgroundColor: '#2b71f0' }}
                  >
                    Apply for this Job <FaArrowRight />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
