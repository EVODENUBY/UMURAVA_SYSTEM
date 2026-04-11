"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FaBriefcase, FaFileAlt, FaClock, FaCheckCircle, FaArrowRight, FaSearch, FaMapMarkerAlt, FaRobot, FaTrophy, FaRocket } from 'react-icons/fa';
import { useLoading } from '@/contexts/LoadingContext';

const BRAND_COLOR = "#2b71f0";

interface Job {
  _id: string;
  title: string;
  location: string;
  experience: { level: string };
  salary?: { min: number; max: number; currency: string };
  company?: string;
}

export default function ApplicantDashboard() {
  const { user } = useAuth();
  const { withLoading } = useLoading();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await withLoading(
          fetch('https://recruiter-ai-platform.onrender.com/api/jobs?page=1&limit=5')
            .then(r => r.json())
        );
        if (res.success) setRecentJobs(res.data.jobs);
      } catch (error) {
        setRecentJobs([
          { _id: '1', title: 'Senior Frontend Developer', location: 'Kigali, Rwanda', experience: { level: 'Senior' }, salary: { min: 200000, max: 350000, currency: 'RWF' }, company: 'TechCorp Rwanda' },
          { _id: '2', title: 'Backend Engineer', location: 'Remote', experience: { level: 'Mid-Level' }, salary: { min: 180000, max: 280000, currency: 'RWF' }, company: 'StartupHub Africa' },
          { _id: '3', title: 'UI/UX Designer', location: 'Nairobi, Kenya', experience: { level: 'Mid-Level' }, salary: { min: 150000, max: 250000, currency: 'USD' }, company: 'DesignStudio' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [withLoading]);

  const stats = [
    { label: 'Applications', value: '12', icon: <FaFileAlt />, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'In Review', value: '3', icon: <FaClock />, color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
    { label: 'Interviews', value: '2', icon: <FaCheckCircle />, color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { label: 'Saved Jobs', value: '8', icon: <FaBriefcase />, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
  ];

  const quickActions = [
    { label: 'Find Jobs', icon: <FaSearch />, href: '/applicant/jobs', color: 'from-blue-500 to-blue-600' },
    { label: 'View Applications', icon: <FaFileAlt />, href: '/applicant/applications', color: 'from-emerald-500 to-emerald-600' },
    { label: 'AI Match Score', icon: <FaRobot />, href: '/applicant/profile', color: 'from-purple-500 to-purple-600' },
    { label: 'Complete Profile', icon: <FaRocket />, href: '/applicant/profile', color: 'from-amber-500 to-amber-600' },
  ];

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
              Welcome, {user?.fullName?.split(' ')[0] || "Talent"}
            </h1>
            <p className="text-blue-100 text-lg">Find your next opportunity in Africa&apos;s tech ecosystem</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-sm">
                <FaTrophy className="text-amber-300" /> #1 Match Rate
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-sm">
                <FaRocket /> 95% Profile Score
              </div>
            </div>
          </div>
          <Link 
            href="/applicant/jobs"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-blue-600 font-bold text-sm uppercase tracking-wider shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            <FaBriefcase /> Browse Jobs
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
          >
            <div className={`p-6 rounded-2xl ${stat.bgColor} border border-white shadow-lg`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-3xl font-black" style={{ color: BRAND_COLOR }}>{stat.value}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.05 }}
          >
            <Link 
              href={action.href}
              className={`block p-4 rounded-2xl bg-gradient-to-br ${action.color} text-white text-center hover:shadow-xl hover:scale-105 transition-all`}
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-2">
                {action.icon}
              </div>
              <span className="font-bold text-sm uppercase tracking-wider">{action.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: BRAND_COLOR }}>
                  <FaBriefcase />
                </div>
                Latest Opportunities
              </h2>
              <Link href="/applicant/jobs" className="text-xs font-bold uppercase tracking-wider hover:underline flex items-center gap-1" style={{ color: BRAND_COLOR }}>
                View All <FaArrowRight />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading opportunities...</p>
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="text-center py-8">
                <FaBriefcase className="text-4xl text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No jobs found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <Link 
                    key={job._id} 
                    href={`/applicant/jobs/${job._id}`} 
                    className="block p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">{job.company || 'Company'}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><FaMapMarkerAlt /> {job.location}</span>
                          <span>{job.experience.level}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                        Apply
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: BRAND_COLOR }}>
                <FaFileAlt />
              </div>
              Application Status
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { title: 'Senior Frontend Developer', company: 'TechCorp Rwanda', status: 'Under Review', progress: 66, color: 'from-amber-500 to-amber-600' },
                { title: 'UI/UX Designer', company: 'Kigali Startup', status: 'Interview Scheduled', progress: 100, color: 'from-emerald-500 to-emerald-600' },
                { title: 'Backend Engineer', company: 'FinTech Ltd', status: 'Application Sent', progress: 33, color: 'from-blue-500 to-blue-600' },
              ].map((app, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{app.title}</h3>
                      <p className="text-xs text-slate-500">{app.company}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r ${app.color} text-white`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${app.progress}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                        className={`h-full rounded-full bg-gradient-to-r ${app.color}`} 
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-500 w-10">{app.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
            
            <Link 
              href="/applicant/applications"
              className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-slate-200 font-bold text-sm uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              View All Applications <FaArrowRight />
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 text-white"
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <FaRobot className="text-3xl" />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight">AI-Powered Matching</h3>
              <p className="text-blue-100 mt-1">Our AI analyzes your profile and matches you with the best opportunities</p>
            </div>
          </div>
          <Link 
            href="/applicant/profile"
            className="px-8 py-4 rounded-2xl bg-white text-blue-600 font-bold text-sm uppercase tracking-wider shadow-xl hover:shadow-2xl hover:scale-105 transition-all whitespace-nowrap"
          >
            Update Profile for Better Matches
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
