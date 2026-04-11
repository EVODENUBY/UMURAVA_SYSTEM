"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { FaUser, FaEnvelope, FaFileAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const mockApplicants = [
  { id: '1', name: 'Jane Mukamana', email: 'jane.m@email.com', role: 'Frontend Developer', status: 'new', score: 92 },
  { id: '2', name: 'Patrick Habimana', email: 'patrick.h@email.com', role: 'Backend Engineer', status: 'screened', score: 78 },
  { id: '3', name: 'Grace Uwimana', email: 'grace.u@email.com', role: 'UI/UX Designer', status: 'interview', score: 85 },
  { id: '4', name: 'David Nkusi', email: 'david.n@email.com', role: 'Full Stack Developer', status: 'rejected', score: 45 },
];

export default function RecruiterApplicantsPage() {
  const [filter, setFilter] = useState('all');

  const filteredApplicants = filter === 'all' ? mockApplicants : mockApplicants.filter(a => a.status === filter);

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-600',
    screened: 'bg-purple-100 text-purple-600',
    interview: 'bg-emerald-100 text-emerald-600',
    rejected: 'bg-red-100 text-red-600',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">Applicants</h1>
        <p className="text-slate-500 mt-2">Review and manage job applications</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'new', 'screened', 'interview', 'rejected'].map((status) => (
          <button key={status} onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${filter === status ? 'bg-blue-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            {status}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredApplicants.map((applicant, i) => (
          <motion.div key={applicant.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-black" style={{ color: '#2b71f0' }}>
                    {applicant.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold">{applicant.name}</h3>
                    <p className="text-sm text-slate-500">{applicant.role}</p>
                    <p className="text-xs text-slate-400">{applicant.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-black" style={{ color: '#2b71f0' }}>{applicant.score}%</p>
                    <p className="text-[10px] text-slate-400 uppercase">AI Score</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColors[applicant.status]}`}>
                    {applicant.status}
                  </span>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-emerald-50 transition-colors"><FaCheckCircle className="text-emerald-500" /></button>
                    <button className="p-2 rounded-lg hover:bg-red-50 transition-colors"><FaTimesCircle className="text-red-500" /></button>
                    <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors"><FaFileAlt className="text-slate-400" /></button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
