"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaPlus, FaMapMarkerAlt, FaBriefcase, FaUsers, FaEdit, FaTrash } from 'react-icons/fa';
import { Card, CardContent } from '@/components/ui/Card';

interface Job {
  _id: string;
  title: string;
  location: string;
  experience: { level: string };
  requiredSkills: string[];
  applicants: number;
  createdAt: string;
}

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://recruiter-ai-platform.onrender.com/api/jobs?page=1&limit=10');
        const result = await res.json();
        if (result.success) setJobs(result.data.jobs);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">My Jobs</h1>
          <p className="text-slate-500 mt-2">Manage your posted positions</p>
        </div>
        <Link href="/recruiter/jobs/create" className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:brightness-110 transition-all" style={{ backgroundColor: '#2b71f0' }}>
          <FaPlus /> Post New Job
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-400 font-bold uppercase tracking-wider mb-4">No jobs posted yet</p>
          <Link href="/recruiter/jobs/create" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm uppercase tracking-wider" style={{ backgroundColor: '#2b71f0' }}>
            <FaPlus /> Create Your First Job
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <motion.div key={job._id} whileHover={{ y: -2 }}>
              <Card className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-black" style={{ color: '#2b71f0' }}>{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><FaMapMarkerAlt /> {job.location}</span>
                      <span className="flex items-center gap-1"><FaBriefcase /> {job.experience.level}</span>
                      <span className="flex items-center gap-1"><FaUsers /> {job.applicants || 0} applicants</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-3 rounded-xl hover:bg-slate-100 transition-colors"><FaEdit className="text-slate-400" /></button>
                    <button className="p-3 rounded-xl hover:bg-red-50 transition-colors"><FaTrash className="text-red-400" /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-50">
                  {job.requiredSkills.slice(0, 5).map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs font-bold">{skill}</span>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
