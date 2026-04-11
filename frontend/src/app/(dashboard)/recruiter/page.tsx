"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { FaBriefcase, FaUsers, FaRobot, FaChartBar, FaArrowRight, FaPlus } from 'react-icons/fa';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<{ total: number }>({ total: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('https://recruiter-ai-platform.onrender.com/api/jobs?page=1&limit=1');
        const result = await res.json();
        if (result.success) setJobs({ total: result.data.total || 0 });
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: 'Active Jobs', value: jobs.total || 8, icon: <FaBriefcase />, color: 'bg-blue-500' },
    { label: 'Total Applicants', value: '124', icon: <FaUsers />, color: 'bg-emerald-500' },
    { label: 'AI Screenings', value: '89', icon: <FaRobot />, color: 'bg-purple-500' },
    { label: 'Interviews', value: '15', icon: <FaChartBar />, color: 'bg-amber-500' },
  ];

  const recentActivity = [
    { title: 'New application for Senior Frontend Dev', time: '2 hours ago', type: 'application' },
    { title: 'AI screening completed for UX Designer', time: '4 hours ago', type: 'screening' },
    { title: 'Interview scheduled with John Doe', time: '1 day ago', type: 'interview' },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Welcome, {user?.fullName?.split(' ')[0] || 'Recruiter'}</h1>
          <p className="text-slate-500 mt-2">Manage your recruitment pipeline</p>
        </div>
        <Link href="/recruiter/jobs/create" className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:brightness-110 transition-all" style={{ backgroundColor: '#2b71f0' }}>
          <FaPlus /> Post New Job
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardContent>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight">Recent Activity</h2>
              <Link href="/recruiter/applicants" className="text-xs font-bold uppercase tracking-wider hover:underline" style={{ color: '#2b71f0' }}>
                View All <FaArrowRight className="inline ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                  <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#2b71f0' }} />
                  <div className="flex-1">
                    <p className="font-bold text-sm">{activity.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight">AI Screening Results</h2>
              <Link href="/recruiter/screening" className="text-xs font-bold uppercase tracking-wider hover:underline" style={{ color: '#2b71f0' }}>
                View All <FaArrowRight className="inline ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Jane Mukamana', role: 'Frontend Developer', score: 92, status: 'Highly Qualified' },
                { name: 'Patrick Habimana', role: 'Backend Engineer', score: 78, status: 'Qualified' },
                { name: 'Grace Uwimana', role: 'UI/UX Designer', score: 85, status: 'Highly Qualified' },
              ].map((candidate, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold" style={{ color: '#2b71f0' }}>
                    {candidate.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{candidate.name}</p>
                    <p className="text-xs text-slate-500">{candidate.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black" style={{ color: '#2b71f0' }}>{candidate.score}%</p>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase">{candidate.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
