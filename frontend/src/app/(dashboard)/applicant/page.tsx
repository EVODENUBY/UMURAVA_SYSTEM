"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FaBriefcase, FaFileAlt, FaClock, FaSearch, FaRocket, FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';
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
    { label: 'Applications', value: '0', icon: <FaFileAlt /> },
    { label: 'In Review', value: '0', icon: <FaClock /> },
  ];

  const quickActions = [
    { label: 'Find Jobs', icon: <FaSearch />, href: '/applicant/jobs' },
    { label: 'View Applications', icon: <FaFileAlt />, href: '/applicant/applications' },
    { label: 'My Profile', icon: <FaRocket />, href: '/applicant/profile' },
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
          </div>
          <Link 
            href="/applicant/jobs"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-blue-600 font-bold text-sm uppercase tracking-wider shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            <FaBriefcase /> Browse Jobs
          </Link>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-3">
        {stats.map((stat, i) => (
          <Link
            key={stat.label}
            href={stat.label === 'Applications' ? '/applicant/applications' : '/applicant/jobs'}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            <span className="text-slate-600">{stat.icon}</span>
            <span className="text-sm font-medium text-slate-700">{stat.label}</span>
            <span className="text-lg font-bold" style={{ color: BRAND_COLOR }}>{stat.value}</span>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {quickActions.map((action, i) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            <span className="text-slate-600">{action.icon}</span>
            <span className="text-sm font-medium text-slate-700">{action.label}</span>
          </Link>
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
    </div>
  );
}
