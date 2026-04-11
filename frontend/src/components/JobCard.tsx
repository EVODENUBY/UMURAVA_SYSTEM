"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, Clock, DollarSign, Building2, Heart } from 'lucide-react';

interface JobCardProps {
  job: {
    _id: string;
    title: string;
    location: string;
    experience: { level: string };
    salary?: { min: number; max: number; currency: string };
    requiredSkills: string[];
    createdAt: string;
    company?: string;
    employmentType?: string;
    description?: string;
    remote?: boolean;
  };
  variant?: 'default' | 'compact' | 'featured';
  onViewDetails?: (job: any) => void;
}

export default function JobCard({ job, variant = 'default', onViewDetails }: JobCardProps) {
  const formatSalary = (min: number, max: number, currency: string) => {
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffMs = now.getTime() - posted.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (variant === 'compact') {
    return (
      <Link href={`/jobs/${job._id}`}>
        <motion.div 
          whileHover={{ y: -2 }} 
          className="bg-white rounded-xl p-4 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-slate-900 truncate">{job.title}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {job.company || 'Company'}
              </p>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.experience.level}</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 whitespace-nowrap">{timeAgo(job.createdAt)}</span>
          </div>
        </motion.div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <motion.div 
        whileHover={{ y: -5, scale: 1.02 }} 
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 shadow-xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-4">Featured</span>
          <h3 className="text-2xl font-black mb-2">{job.title}</h3>
          <p className="text-blue-100 flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4" /> {job.company || 'Company Name'}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="flex items-center gap-1 text-sm bg-white/20 px-3 py-1 rounded-full"><MapPin className="w-4 h-4" /> {job.location}</span>
            <span className="flex items-center gap-1 text-sm bg-white/20 px-3 py-1 rounded-full"><Briefcase className="w-4 h-4" /> {job.experience.level}</span>
            {job.salary && (
              <span className="flex items-center gap-1 text-sm bg-white/20 px-3 py-1 rounded-full">
                <DollarSign className="w-4 h-4" /> {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
              </span>
            )}
          </div>

          <Link 
            href={`/jobs/${job._id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-blue-50 transition-colors"
          >
            Apply Now <Briefcase className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-xl transition-all group">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-xl font-black text-slate-400 group-hover:from-blue-50 group-hover:to-blue-100 group-hover:text-blue-500 transition-all">
              {job.company?.charAt(0) || <Building2 className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">{job.title}</h3>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> {job.company || 'Company'}
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
            <Clock className="w-4 h-4" /> {timeAgo(job.createdAt)}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 mb-4 text-sm">
          <span className="flex items-center gap-2 text-slate-500">
            <MapPin className="w-4 h-4 text-blue-500" /> {job.location}
          </span>
          <span className="flex items-center gap-2 text-slate-500">
            <Briefcase className="w-4 h-4 text-blue-500" /> {job.experience.level}
          </span>
          {job.salary && (
            <span className="flex items-center gap-2 text-slate-500">
              <DollarSign className="w-4 h-4 text-blue-500" /> {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
            </span>
          )}
          {job.employmentType && (
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase">
              {job.employmentType}
            </span>
          )}
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
          {job.description || 'No description provided.'}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {job.requiredSkills.slice(0, 4).map((skill) => (
            <span 
              key={skill} 
              className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-100"
            >
              {skill}
            </span>
          ))}
          {job.requiredSkills.length > 4 && (
            <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
              +{job.requiredSkills.length - 4} more
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
          {onViewDetails ? (
            <button 
              onClick={() => onViewDetails(job)}
              className="flex-1 text-center py-3 rounded-xl font-bold text-sm uppercase tracking-wider text-white shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: '#2b71f0' }}
            >
              View Details
            </button>
          ) : (
            <Link 
              href={`/jobs/${job._id}`}
              className="flex-1 text-center py-3 rounded-xl font-bold text-sm uppercase tracking-wider text-white shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: '#2b71f0' }}
            >
              View Details
            </Link>
          )}
          <button className="p-3 rounded-xl border-2 border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-400 hover:bg-red-50 transition-all">
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
