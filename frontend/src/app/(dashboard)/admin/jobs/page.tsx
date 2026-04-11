"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { FaBriefcase, FaMapMarkerAlt, FaUsers, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface Job {
  _id: string;
  title: string;
  location: string;
  experience: { level: string };
  requiredSkills: string[];
  applicants: number;
  status: 'active' | 'pending' | 'closed';
  createdAt: string;
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://recruiter-ai-platform.onrender.com/api/jobs?page=1&limit=20');
        const result = await res.json();
        if (result.success) {
          const jobsWithStatus = result.data.jobs.map((job: Job) => ({
            ...job,
            status: Math.random() > 0.3 ? 'active' : Math.random() > 0.5 ? 'pending' : 'closed',
            applicants: Math.floor(Math.random() * 50) + 1,
          }));
          setJobs(jobsWithStatus);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-600',
    pending: 'bg-amber-100 text-amber-600',
    closed: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">Job Management</h1>
        <p className="text-slate-500 mt-2">Review and moderate all job postings</p>
      </div>

      <div className="flex gap-2">
        {['all', 'active', 'pending', 'closed'].map((status) => (
          <button key={status} onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${filter === status ? 'bg-blue-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job, i) => (
            <motion.div key={job._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-black">{job.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColors[job.status]}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><FaMapMarkerAlt /> {job.location}</span>
                      <span className="flex items-center gap-1"><FaBriefcase /> {job.experience.level}</span>
                      <span className="flex items-center gap-1"><FaUsers /> {job.applicants} applicants</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-emerald-50" title="Approve"><FaCheckCircle className="text-emerald-500" /></button>
                    <button className="p-2 rounded-lg hover:bg-red-50" title="Reject"><FaTimesCircle className="text-red-500" /></button>
                    <button className="p-2 rounded-lg hover:bg-slate-100"><FaEdit className="text-slate-400" /></button>
                    <button className="p-2 rounded-lg hover:bg-red-50"><FaTrash className="text-red-400" /></button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
