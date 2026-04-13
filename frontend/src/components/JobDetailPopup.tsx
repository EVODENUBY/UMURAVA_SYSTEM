"use client";

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Briefcase, DollarSign, X, Clock, Users, CheckCircle, GraduationCap, Award, Tag, FileText, AlertCircle, Globe, Star } from 'lucide-react';

interface Education {
  degree: string;
  field?: string;
  required: boolean;
}

interface ApplicationProcess {
  steps?: string[];
}

interface Analytics {
  applications: number;
  shortlisted: number;
}

interface Job {
  _id: string;
  title: string;
  description?: string;
  employmentType?: string;
  jobLevel?: string;
  requiredSkills?: string[];
  responsibilities?: string[];
  experience?: string;
  education?: Education[];
  certifications?: string[];
  languages?: string[];
  location?: { address?: string; city?: string; country?: string; remote?: boolean };
  salary?: { min?: number; max?: number; currency?: string };
  benefits?: string[];
  applicationProcess?: ApplicationProcess;
  tags?: string[];
  status?: string;
  applicationDeadline?: string;
  expirationDate?: string;
  postedDate?: string;
  analytics?: Analytics;
  company?: string;
}

interface JobDetailPopupProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
}

export default function JobDetailPopup({ job, isOpen, onClose, onApply }: JobDetailPopupProps) {
  const getLocation = (loc?: { address?: string; city?: string; country?: string; remote?: boolean }) => {
    if (!loc) return 'Not specified';
    if (loc.remote) return 'Remote';
    if (loc.city) return `${loc.city}${loc.country ? ', ' + loc.country : ''}`;
    if (loc.address) return loc.address;
    if (loc.country) return loc.country;
    return 'Not specified';
  };

  const getTimeAgo = (date?: string) => {
    if (!date) return '';
    const posted = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - posted.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const getExpirationCountdown = (date?: string) => {
    if (!date) return null;
    const expiration = new Date(date);
    const now = new Date();
    const diffMs = expiration.getTime() - now.getTime();
    if (diffMs < 0) return 'Expired';
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min || !max || !currency) return 'Not specified';
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!job) return null;

  const expiration = getExpirationCountdown(job.expirationDate);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.15 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-white">{job.title}</h2>
                    <p className="text-blue-100 text-sm">{job.company || 'Company'}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs text-blue-100">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {getTimeAgo(job.postedDate)}</span>
                      {expiration && <span className="px-2 py-0.5 bg-white/20 rounded-full">{expiration}</span>}
                      {job.analytics?.applications !== undefined && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {job.analytics.applications}</span>}
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <div className="bg-slate-50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
                    <MapPin className="w-3 h-3" /> Location
                  </div>
                  <p className="font-semibold text-slate-800 text-xs">{getLocation(job.location)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
                    <Briefcase className="w-3 h-3" /> Type
                  </div>
                  <p className="font-semibold text-slate-800 text-xs capitalize">{job.employmentType || 'Full-time'}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
                    <Award className="w-3 h-3" /> Level
                  </div>
                  <p className="font-semibold text-slate-800 text-xs capitalize">{job.jobLevel || 'Mid'}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
                    <DollarSign className="w-3 h-3" /> Salary
                  </div>
                  <p className="font-semibold text-slate-800 text-xs">{formatSalary(job.salary?.min, job.salary?.max, job.salary?.currency)}</p>
                </div>
              </div>

              {job.description && (
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-2">
                    <FileText className="w-4 h-4" /> Description
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{job.description}</p>
                </div>
              )}

              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-purple-800 mb-2">
                    <Star className="w-4 h-4" /> Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="bg-emerald-50 rounded-lg p-3 sm:p-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-800 mb-2">
                    <CheckCircle className="w-4 h-4" /> Responsibilities
                  </h3>
                  <ul className="space-y-1.5">
                    {job.responsibilities.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.experience && (
                <div className="bg-amber-50 rounded-lg p-3 sm:p-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-amber-800 mb-2">
                    <Briefcase className="w-4 h-4" /> Experience
                  </h3>
                  <p className="text-slate-600 text-sm">{job.experience}</p>
                </div>
              )}

              {job.education && job.education.length > 0 && (
                <div className="bg-indigo-50 rounded-lg p-3 sm:p-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-800 mb-2">
                    <GraduationCap className="w-4 h-4" /> Education
                  </h3>
                  <div className="space-y-1">
                    {job.education.map((edu, i) => (
                      <p key={i} className="text-slate-600 text-sm">
                        {edu.degree}{edu.field && ` in ${edu.field}`}
                        {edu.required && <span className="text-xs text-indigo-500 ml-2">(Required)</span>}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {job.certifications && job.certifications.length > 0 && (
                <div className="bg-orange-50 rounded-lg p-3 sm:p-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-orange-800 mb-2">
                    <Award className="w-4 h-4" /> Certifications
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {job.certifications.map((cert, i) => (
                      <span key={i} className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {job.languages && job.languages.length > 0 && (
                <div className="bg-teal-50 rounded-lg p-3 sm:p-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-teal-800 mb-2">
                    <Globe className="w-4 h-4" /> Languages
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {job.languages.map((lang, i) => (
                      <span key={i} className="px-2.5 py-1 bg-teal-100 text-teal-700 rounded-lg text-xs font-medium">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {job.benefits && job.benefits.length > 0 && (
                <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-green-800 mb-2">
                    <CheckCircle className="w-4 h-4" /> Benefits
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {job.benefits.map((benefit, i) => (
                      <span key={i} className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {job.applicationProcess?.steps && job.applicationProcess.steps.length > 0 && (
                <div className="bg-cyan-50 rounded-lg p-3 sm:p-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-cyan-800 mb-2">
                    <FileText className="w-4 h-4" /> Application Process
                  </h3>
                  <ol className="space-y-1.5">
                    {job.applicationProcess.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                        <span className="w-5 h-5 rounded-full bg-cyan-200 text-cyan-800 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {job.tags && job.tags.length > 0 && (
                <div className="bg-pink-50 rounded-lg p-3 sm:p-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-pink-800 mb-2">
                    <Tag className="w-4 h-4" /> Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {job.tags.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 bg-pink-100 text-pink-700 rounded-lg text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {job.applicationDeadline && (
                <div className="bg-yellow-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-sm text-yellow-700">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Deadline:</span> {formatDate(job.applicationDeadline)}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 sm:p-4 border-t border-slate-100 bg-white">
              <button 
                onClick={onApply}
                className="w-full py-3 rounded-lg font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
              >
                Apply Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
