"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { User, Mail, FileText, CheckCircle2, XCircle, Bot, ChevronDown, Search, SlidersHorizontal, Star, Sparkles, TrendingUp, Loader2 } from 'lucide-react';

interface Applicant {
  id: string;
  name: string;
  email: string;
  role: string;
  job: string;
  status: 'pending' | 'screened' | 'qualified' | 'unqualified';
  score: number;
  skills: { name: string; match: number }[];
  experience: number;
  education: string;
  appliedDate: string;
  aiSummary: string;
}

const mockApplicants: Applicant[] = [
  {
    id: '1',
    name: 'Jane Mukamana',
    email: 'jane.m@email.com',
    role: 'Frontend Developer',
    job: 'Senior Frontend Developer',
    status: 'qualified',
    score: 94,
    skills: [
      { name: 'React', match: 95 },
      { name: 'TypeScript', match: 92 },
      { name: 'Next.js', match: 88 },
      { name: 'Tailwind CSS', match: 90 },
    ],
    experience: 5,
    education: 'BS Computer Science, KIST',
    appliedDate: '2024-03-15',
    aiSummary: 'Highly qualified candidate with strong React expertise. 5 years of frontend experience including 2 years at tech startups. Strong portfolio with e-commerce projects.',
  },
  {
    id: '2',
    name: 'Patrick Habimana',
    email: 'patrick.h@email.com',
    role: 'Backend Engineer',
    job: 'Senior Frontend Developer',
    status: 'screened',
    score: 72,
    skills: [
      { name: 'Node.js', match: 85 },
      { name: 'React', match: 68 },
      { name: 'Python', match: 78 },
      { name: 'SQL', match: 70 },
    ],
    experience: 3,
    education: 'BS Information Systems, AUCA',
    appliedDate: '2024-03-14',
    aiSummary: 'Backend-focused developer with some frontend experience. May need ramp-up time for React specifics but shows strong fundamentals.',
  },
  {
    id: '3',
    name: 'Grace Uwimana',
    email: 'grace.u@email.com',
    role: 'UI/UX Designer',
    job: 'Senior Frontend Developer',
    status: 'unqualified',
    score: 45,
    skills: [
      { name: 'Figma', match: 90 },
      { name: 'UI Design', match: 85 },
      { name: 'React', match: 20 },
      { name: 'TypeScript', match: 15 },
    ],
    experience: 4,
    education: 'BA Design, Kigali Arts',
    appliedDate: '2024-03-13',
    aiSummary: 'Design background, limited technical frontend experience. Better suited for design-focused roles.',
  },
  {
    id: '4',
    name: 'David Nkusi',
    email: 'david.n@email.com',
    role: 'Full Stack Developer',
    job: 'Senior Frontend Developer',
    status: 'qualified',
    score: 88,
    skills: [
      { name: 'React', match: 90 },
      { name: 'Vue.js', match: 85 },
      { name: 'TypeScript', match: 88 },
      { name: 'Node.js', match: 82 },
    ],
    experience: 6,
    education: 'MSc Software Engineering, UK',
    appliedDate: '2024-03-12',
    aiSummary: 'Strong full-stack developer with excellent React credentials. International experience and strong English communication skills.',
  },
  {
    id: '5',
    name: 'Marie Uwase',
    email: 'marie.u@email.com',
    role: 'Frontend Developer',
    job: 'Senior Frontend Developer',
    status: 'pending',
    score: 0,
    skills: [],
    experience: 2,
    education: 'BS IT, KIST',
    appliedDate: '2024-03-22',
    aiSummary: 'Pending AI screening completion.',
  },
];

export default function RecruiterScreeningPage() {
  const [applicants, setApplicants] = useState<Applicant[]>(mockApplicants);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [screening, setScreening] = useState<string | null>(null);

  const filteredApplicants = applicants.filter(a => {
    const matchesFilter = filter === 'all' || a.status === filter;
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleScreen = async (id: string) => {
    setScreening(id);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setApplicants(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'screened', score: Math.floor(Math.random() * 20) + 70, skills: [
        { name: 'React', match: Math.floor(Math.random() * 20) + 75 },
        { name: 'TypeScript', match: Math.floor(Math.random() * 20) + 70 },
        { name: 'Next.js', match: Math.floor(Math.random() * 20) + 65 },
        { name: 'Tailwind CSS', match: Math.floor(Math.random() * 20) + 70 },
      ], aiSummary: 'Screening complete. Candidate shows good technical fundamentals with potential for growth.' } : a
    ));
    setScreening(null);
  };

  const handleQualify = (id: string, qualified: boolean) => {
    setApplicants(prev => prev.map(a => 
      a.id === id ? { ...a, status: qualified ? 'qualified' : 'unqualified' } : a
    ));
  };

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Pending' },
    screened: { bg: 'bg-purple-100', text: 'text-purple-600', label: 'Screened' },
    qualified: { bg: 'bg-emerald-100', text: 'text-emerald-600', label: 'Qualified' },
    unqualified: { bg: 'bg-red-100', text: 'text-red-600', label: 'Unqualified' },
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">AI Screening</h1>
            <p className="text-slate-500 mt-2">AI-powered candidate evaluation</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">
              <Sparkles className="w-4 h-4" /> AI Model: v2.1
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: applicants.length, color: 'bg-slate-500' },
          { label: 'Pending', value: applicants.filter(a => a.status === 'pending').length, color: 'bg-slate-400' },
          { label: 'Qualified', value: applicants.filter(a => a.status === 'qualified').length, color: 'bg-emerald-500' },
          { label: 'Unqualified', value: applicants.filter(a => a.status === 'unqualified').length, color: 'bg-red-500' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-white font-black`}>
                  {stat.value}
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase">{stat.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search applicants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-white outline-none focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'screened', 'qualified', 'unqualified'].map((status) => (
            <button 
              key={status} 
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${filter === status ? 'bg-blue-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {filteredApplicants.map((applicant, i) => {
          const status = statusColors[applicant.status];
          const isSelected = selectedApplicant?.id === applicant.id;
          
          return (
            <motion.div 
              key={applicant.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`overflow-hidden transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => setSelectedApplicant(isSelected ? null : applicant)}
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-xl font-black text-blue-500">
                        {applicant.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-lg">{applicant.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{applicant.role} - {applicant.job}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                          <span>{applicant.experience} years exp</span>
                          <span>-</span>
                          <span>{applicant.education}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {applicant.score > 0 ? (
                        <div className="text-right">
                          <p className={`text-2xl font-black ${applicant.score >= 80 ? 'text-emerald-500' : applicant.score >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                            {applicant.score}%
                          </p>
                          <p className="text-xs text-slate-400 uppercase">AI Score</p>
                        </div>
                      ) : (
                        <div className="text-right">
                          <p className="text-lg font-black text-slate-400">--</p>
                          <p className="text-xs text-slate-400 uppercase">Not Screened</p>
                        </div>
                      )}
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isSelected ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isSelected && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100"
                    >
                      <div className="p-6 space-y-6">
                        <div className="grid lg:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-blue-500" /> AI Summary
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed bg-blue-50 p-4 rounded-xl border border-blue-100">
                              {applicant.aiSummary}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-sm font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-blue-500" /> Skill Match
                            </h4>
                            {applicant.skills.length > 0 ? (
                              <div className="space-y-3">
                                {applicant.skills.map((skill, idx) => (
                                  <div key={idx}>
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-sm font-medium">{skill.name}</span>
                                      <span className={`text-sm font-bold ${skill.match >= 80 ? 'text-emerald-500' : skill.match >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                                        {skill.match}%
                                      </span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full transition-all ${skill.match >= 80 ? 'bg-emerald-500' : skill.match >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                        style={{ width: `${skill.match}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400">Skills analysis pending...</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                          {applicant.status === 'pending' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleScreen(applicant.id); }}
                              disabled={screening === applicant.id}
                              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500 text-white font-bold text-sm uppercase tracking-wider hover:bg-blue-600 transition-colors"
                            >
                              {screening === applicant.id ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  Screening...
                                </>
                              ) : (
                                <>
                                  <Bot className="w-4 h-4" /> Run AI Screening
                                </>
                              )}
                            </button>
                          )}
                          
                          {(applicant.status === 'screened' || applicant.score > 0) && (
                            <>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleQualify(applicant.id, true); }}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm uppercase tracking-wider hover:bg-emerald-600 transition-colors"
                              >
                                <CheckCircle2 className="w-4 h-4" /> Qualify
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleQualify(applicant.id, false); }}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 text-white font-bold text-sm uppercase tracking-wider hover:bg-red-600 transition-colors"
                              >
                                <XCircle className="w-4 h-4" /> Disqualify
                              </button>
                            </>
                          )}

                          <button className="px-6 py-3 rounded-xl border-2 border-slate-200 font-bold text-sm uppercase tracking-wider hover:bg-slate-50 transition-colors">
                            <FileText className="w-4 h-4" /> View Resume
                          </button>
                          <button className="px-6 py-3 rounded-xl border-2 border-slate-200 font-bold text-sm uppercase tracking-wider hover:bg-slate-50 transition-colors">
                            <Mail className="w-4 h-4" /> Contact
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
