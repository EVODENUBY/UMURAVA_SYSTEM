"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { FaChartLine, FaCheckCircle, FaClock, FaUsers, FaDownload, FaFilter, FaChevronDown, FaChartBar, FaCalendar } from 'react-icons/fa';

interface Result {
  id: string;
  name: string;
  role: string;
  job: string;
  score: number;
  status: 'highly_qualified' | 'qualified' | 'under_qualified';
  recommendation: string;
  interviewDate?: string;
  finalScore: number;
  skills: { name: string; score: number }[];
}

const mockResults: Result[] = [
  { id: '1', name: 'Jane Mukamana', role: 'Frontend Developer', job: 'Senior Frontend Developer', score: 94, status: 'highly_qualified', recommendation: 'Strong hire - Proceed to final interview', interviewDate: '2024-03-25', finalScore: 92, skills: [
    { name: 'Technical', score: 95 },
    { name: 'Communication', score: 88 },
    { name: 'Culture Fit', score: 90 },
  ]},
  { id: '2', name: 'Patrick Habimana', role: 'Backend Engineer', job: 'Senior Frontend Developer', score: 72, status: 'qualified', recommendation: 'Consider - Schedule technical interview', finalScore: 0, skills: [
    { name: 'Technical', score: 75 },
    { name: 'Communication', score: 68 },
    { name: 'Culture Fit', score: 72 },
  ]},
  { id: '3', name: 'Grace Uwimana', role: 'UI/UX Designer', job: 'Senior Frontend Developer', score: 45, status: 'under_qualified', recommendation: 'Pass - Role mismatch', finalScore: 0, skills: [
    { name: 'Technical', score: 40 },
    { name: 'Communication', score: 55 },
    { name: 'Culture Fit', score: 50 },
  ]},
  { id: '4', name: 'David Nkusi', role: 'Full Stack Developer', job: 'Senior Frontend Developer', score: 88, status: 'highly_qualified', recommendation: 'Strong hire - Fast track to offer', interviewDate: '2024-03-28', finalScore: 85, skills: [
    { name: 'Technical', score: 90 },
    { name: 'Communication', score: 85 },
    { name: 'Culture Fit', score: 82 },
  ]},
  { id: '5', name: 'Emmy Murenzi', role: 'Frontend Developer', job: 'Senior Frontend Developer', score: 78, status: 'qualified', recommendation: 'Consider - Schedule initial screening', finalScore: 0, skills: [
    { name: 'Technical', score: 80 },
    { name: 'Communication', score: 75 },
    { name: 'Culture Fit', score: 78 },
  ]},
];

export default function RecruiterResultsPage() {
  const [results, setResults] = useState<Result[]>(mockResults);
  const [filter, setFilter] = useState('all');
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredResults = filter === 'all' ? results : results.filter(r => r.status === filter);

  const stats = [
    { label: 'Highly Qualified', value: results.filter(r => r.status === 'highly_qualified').length, color: 'bg-emerald-500', icon: <FaCheckCircle /> },
    { label: 'Qualified', value: results.filter(r => r.status === 'qualified').length, color: 'bg-blue-500', icon: <FaUsers /> },
    { label: 'Under Qualified', value: results.filter(r => r.status === 'under_qualified').length, color: 'bg-red-500', icon: <FaClock /> },
    { label: 'Avg Score', value: Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length) + '%', color: 'bg-purple-500', icon: <FaChartLine /> },
  ];

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    highly_qualified: { bg: 'bg-emerald-100', text: 'text-emerald-600', label: 'Highly Qualified' },
    qualified: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Qualified' },
    under_qualified: { bg: 'bg-red-100', text: 'text-red-600', label: 'Under Qualified' },
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Screening Results</h1>
            <p className="text-slate-500 mt-2">AI-powered candidate evaluation results</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button 
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'cards' ? 'bg-white shadow-sm' : ''}`}
              >
                Cards
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'table' ? 'bg-white shadow-sm' : ''}`}
              >
                Table
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 font-bold text-sm hover:bg-slate-50 transition-colors">
              <FaDownload /> Export
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xl font-black">{stat.value}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'highly_qualified', 'qualified', 'under_qualified'].map((status) => (
          <button 
            key={status} 
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${filter === status ? 'bg-blue-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {viewMode === 'cards' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.map((result, i) => {
            const status = statusColors[result.status];
            const isSelected = selectedResult?.id === result.id;
            
            return (
              <motion.div 
                key={result.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card 
                  className={`p-6 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedResult(isSelected ? null : result)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${result.score >= 80 ? 'bg-emerald-100 text-emerald-600' : result.score >= 60 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'} flex items-center justify-center text-xl font-black`}>
                        {result.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold">{result.name}</h3>
                        <p className="text-xs text-slate-500">{result.role}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-500">AI Score</span>
                      <span className={`text-xl font-black ${result.score >= 80 ? 'text-emerald-500' : result.score >= 60 ? 'text-blue-500' : 'text-red-500'}`}>
                        {result.score}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${result.score >= 80 ? 'bg-emerald-500' : result.score >= 60 ? 'bg-blue-500' : 'bg-red-500'}`}
                        style={{ width: `${result.score}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{result.recommendation}</p>

                  {isSelected && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-4 border-t border-slate-100 space-y-4"
                    >
                      <div className="grid grid-cols-3 gap-2">
                        {result.skills.map((skill, idx) => (
                          <div key={idx} className="text-center p-2 rounded-lg bg-slate-50">
                            <p className={`text-lg font-black ${skill.score >= 80 ? 'text-emerald-500' : skill.score >= 60 ? 'text-blue-500' : 'text-red-500'}`}>
                              {skill.score}%
                            </p>
                            <p className="text-[10px] text-slate-400 uppercase">{skill.name}</p>
                          </div>
                        ))}
                      </div>

                      {result.interviewDate && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <FaCalendar /> Interview: {new Date(result.interviewDate).toLocaleDateString()}
                        </div>
                      )}

                      <div className="flex gap-2">
                        {result.status === 'highly_qualified' && !result.interviewDate && (
                          <button className="flex-1 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs uppercase hover:bg-emerald-600 transition-colors">
                            Schedule Interview
                          </button>
                        )}
                        {result.interviewDate && (
                          <button className="flex-1 py-2 rounded-xl bg-blue-500 text-white font-bold text-xs uppercase hover:bg-blue-600 transition-colors">
                            View Details
                          </button>
                        )}
                        <button className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-xs uppercase hover:bg-slate-50 transition-colors">
                          Resume
                        </button>
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider p-4">Candidate</th>
                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider p-4">Applied For</th>
                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider p-4">AI Score</th>
                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider p-4">Status</th>
                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider p-4">Recommendation</th>
                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, i) => {
                    const status = statusColors[result.status];
                    return (
                      <tr key={result.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${result.score >= 80 ? 'bg-emerald-100 text-emerald-600' : result.score >= 60 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'} flex items-center justify-center font-black`}>
                              {result.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold">{result.name}</p>
                              <p className="text-xs text-slate-400">{result.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600">{result.job}</td>
                        <td className="p-4">
                          <span className={`text-lg font-black ${result.score >= 80 ? 'text-emerald-500' : result.score >= 60 ? 'text-blue-500' : 'text-red-500'}`}>
                            {result.score}%
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{result.recommendation}</td>
                        <td className="p-4">
                          <button className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs uppercase hover:bg-blue-100 transition-colors">
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
