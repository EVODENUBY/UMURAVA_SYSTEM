"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { FaFileAlt, FaClock, FaCheckCircle, FaTimesCircle, FaEye, FaCalendar, FaRobot, FaChevronRight, FaEnvelope, FaDownload } from 'react-icons/fa';

interface Application {
  id: string;
  job: string;
  company: string;
  logo: string;
  status: 'submitted' | 'ai_review' | 'under_review' | 'interview' | 'offer' | 'rejected';
  appliedDate: string;
  lastUpdated: string;
  matchScore: number;
  coverLetter: string;
  resume: string;
  notes: string[];
  timeline: {
    date: string;
    action: string;
    status: string;
  }[];
}

const mockApplications: Application[] = [
  {
    id: '1',
    job: 'Senior Frontend Developer',
    company: 'TechCorp Rwanda',
    logo: 'T',
    status: 'interview',
    appliedDate: '2024-03-15',
    lastUpdated: '2024-03-20',
    matchScore: 92,
    coverLetter: 'I am excited to apply for this position...',
    resume: 'resume_jane.pdf',
    notes: ['Strong React experience', 'Great portfolio'],
    timeline: [
      { date: '2024-03-15', action: 'Application Submitted', status: 'submitted' },
      { date: '2024-03-16', action: 'AI Resume Screening', status: 'ai_review' },
      { date: '2024-03-18', action: 'Application Under Review', status: 'under_review' },
      { date: '2024-03-20', action: 'Interview Scheduled', status: 'interview' },
    ]
  },
  {
    id: '2',
    job: 'UI/UX Designer',
    company: 'Kigali Startup',
    logo: 'K',
    status: 'ai_review',
    appliedDate: '2024-03-18',
    lastUpdated: '2024-03-19',
    matchScore: 87,
    coverLetter: 'With my background in design...',
    resume: 'resume_jane.pdf',
    notes: [],
    timeline: [
      { date: '2024-03-18', action: 'Application Submitted', status: 'submitted' },
      { date: '2024-03-19', action: 'AI Resume Screening', status: 'ai_review' },
    ]
  },
  {
    id: '3',
    job: 'Backend Engineer',
    company: 'FinTech Ltd',
    logo: 'F',
    status: 'rejected',
    appliedDate: '2024-02-28',
    lastUpdated: '2024-03-05',
    matchScore: 65,
    coverLetter: 'I have extensive backend experience...',
    resume: 'resume_jane.pdf',
    notes: ['Experience mismatch'],
    timeline: [
      { date: '2024-02-28', action: 'Application Submitted', status: 'submitted' },
      { date: '2024-03-01', action: 'AI Resume Screening', status: 'ai_review' },
      { date: '2024-03-05', action: 'Application Declined', status: 'rejected' },
    ]
  },
  {
    id: '4',
    job: 'Product Manager',
    company: 'E-commerce Plus',
    logo: 'E',
    status: 'submitted',
    appliedDate: '2024-03-22',
    lastUpdated: '2024-03-22',
    matchScore: 78,
    coverLetter: 'Eager to bring my product skills...',
    resume: 'resume_jane.pdf',
    notes: [],
    timeline: [
      { date: '2024-03-22', action: 'Application Submitted', status: 'submitted' },
    ]
  },
  {
    id: '5',
    job: 'Full Stack Developer',
    company: 'Innovation Labs',
    logo: 'I',
    status: 'offer',
    appliedDate: '2024-03-01',
    lastUpdated: '2024-03-25',
    matchScore: 95,
    coverLetter: 'I would love to join your team...',
    resume: 'resume_jane.pdf',
    notes: ['Excellent technical skills', 'Culture fit confirmed'],
    timeline: [
      { date: '2024-03-01', action: 'Application Submitted', status: 'submitted' },
      { date: '2024-03-02', action: 'AI Resume Screening', status: 'ai_review' },
      { date: '2024-03-05', action: 'Application Under Review', status: 'under_review' },
      { date: '2024-03-15', action: 'Technical Interview', status: 'interview' },
      { date: '2024-03-20', action: 'Final Interview', status: 'interview' },
      { date: '2024-03-25', action: 'Offer Extended', status: 'offer' },
    ]
  },
];

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: JSX.Element }> = {
  submitted: { label: 'Submitted', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: <FaFileAlt /> },
  ai_review: { label: 'AI Review', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: <FaRobot /> },
  under_review: { label: 'Under Review', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: <FaClock /> },
  interview: { label: 'Interview', color: 'text-emerald-600', bgColor: 'bg-emerald-100', icon: <FaCheckCircle /> },
  offer: { label: 'Offer', color: 'text-emerald-600', bgColor: 'bg-emerald-100', icon: <FaCheckCircle /> },
  rejected: { label: 'Declined', color: 'text-red-600', bgColor: 'bg-red-100', icon: <FaTimesCircle /> },
};

export default function ApplicantApplicationsPage() {
  const [filter, setFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const filteredApps = filter === 'all' ? mockApplications : mockApplications.filter(a => a.status === filter);

  const stats = [
    { label: 'Total', value: mockApplications.length, color: 'bg-slate-500' },
    { label: 'In Progress', value: mockApplications.filter(a => ['submitted', 'ai_review', 'under_review'].includes(a.status)).length, color: 'bg-blue-500' },
    { label: 'Interviews', value: mockApplications.filter(a => a.status === 'interview').length, color: 'bg-emerald-500' },
    { label: 'Offers', value: mockApplications.filter(a => a.status === 'offer').length, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black uppercase tracking-tight">My Applications</h1>
        <p className="text-slate-500 mt-2">Track your job application journey</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-white font-black`}>
                  {stat.value}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'submitted', 'ai_review', 'under_review', 'interview', 'offer', 'rejected'].map((status) => (
          <button 
            key={status} 
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${filter === status ? 'bg-blue-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredApps.map((app, i) => {
            const config = statusConfig[app.status];
            return (
              <motion.div 
                key={app.id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card 
                  className={`p-6 cursor-pointer transition-all hover:shadow-xl ${selectedApp?.id === app.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-xl font-black text-slate-400">
                      {app.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">{app.job}</h3>
                          <p className="text-sm text-slate-500">{app.company}</p>
                        </div>
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase ${config.bgColor} ${config.color}`}>
                          {config.icon} {config.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-400">Match:</span>
                          <span className={`text-sm font-black ${app.matchScore >= 80 ? 'text-emerald-500' : app.matchScore >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                            {app.matchScore}%
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">Applied: {new Date(app.appliedDate).toLocaleDateString()}</span>
                      </div>

                      {selectedApp?.id === app.id && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t border-slate-100"
                        >
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Cover Letter</p>
                              <p className="text-sm text-slate-600 line-clamp-2">{app.coverLetter}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Timeline</p>
                              <div className="space-y-2">
                                {app.timeline.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-3 text-sm">
                                    <div className={`w-2 h-2 rounded-full ${idx === app.timeline.length - 1 ? 'bg-blue-500' : 'bg-slate-200'}`} />
                                    <span className="text-slate-600">{item.action}</span>
                                    <span className="text-xs text-slate-400 ml-auto">{new Date(item.date).toLocaleDateString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div className="flex items-center gap-2 mt-4">
                        <button className="flex-1 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs uppercase hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                          <FaEye /> View
                        </button>
                        <button className="flex-1 py-2 rounded-xl bg-slate-50 text-slate-600 font-bold text-xs uppercase hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                          <FaDownload /> Resume
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredApps.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <p className="text-slate-400 font-bold uppercase tracking-wider">No applications found</p>
          </div>
        )}
      </div>
    </div>
  );
}
