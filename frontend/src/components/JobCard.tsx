"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Briefcase } from 'lucide-react';

interface JobCardProps {
  job: {
    _id: string;
    title: string;
    description?: string;
    employmentType?: string;
    jobLevel?: string;
    requiredSkills?: string[];
    responsibilities?: string[];
    experience?: string;
    education?: { degree: string; field: string }[];
    certifications?: string[];
    languages?: string[];
    location?: { address?: string; city?: string; country?: string; remote?: boolean };
    salary?: { min: number; max: number; currency: string };
    benefits?: string[];
    applicationProcess?: object;
    tags?: string[];
    status?: string;
    applicationDeadline?: string;
    postedDate?: string;
    expirationDate?: string;
    createdAt?: string;
    company?: string;
  };
  variant?: 'default' | 'compact' | 'featured';
  onViewDetails?: (job: any) => void;
}

export default function JobCard({ job, variant = 'default', onViewDetails }: JobCardProps) {
  const getLocation = (loc?: { address?: string; city?: string; country?: string; remote?: boolean }) => {
    if (!loc) return 'Not specified';
    if (loc.remote) return 'Remote';
    if (loc.city) return `${loc.city}${loc.country ? ', ' + loc.country : ''}`;
    if (loc.address) return loc.address;
    if (loc.country) return loc.country;
    return 'Not specified';
  };

  const getTimeAgo = (date?: string) => {
    if (!date) return '';
    const posted = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - posted.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1d ago';
    return `${diffDays}d ago`;
  };

  const getExpirationCountdown = (date?: string) => {
    if (!date) return '';
    const expiration = new Date(date);
    const now = new Date();
    const diffMs = expiration.getTime() - now.getTime();
    if (diffMs < 0) return 'Expired';
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1d left';
    return `${diffDays}d left`;
  };

  const getEmploymentColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'full-time': return 'bg-emerald-100 text-emerald-700';
      case 'part-time': return 'bg-amber-100 text-amber-700';
      case 'contract': return 'bg-blue-100 text-blue-700';
      case 'internship': return 'bg-purple-100 text-purple-700';
      case 'freelance': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (variant === 'compact') {
    return (
      <Link href={`/jobs/${job._id}`}>
        <motion.div 
          whileHover={{ y: -2 }} 
          className="bg-white rounded-lg p-4 border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-slate-900 truncate">{job.title}</h3>
              <p className="text-xs text-slate-500">{job.company || 'Company'}</p>
            </div>
            <span className="text-[10px] text-slate-400">{getTimeAgo(job.postedDate || job.createdAt)}</span>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <div 
        className="bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer overflow-hidden"
        onClick={() => onViewDetails?.(job)}
      >
        <div className="flex">
          <div className="w-1 bg-gradient-to-b from-blue-500 to-blue-600" />
          <div className="flex-1 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{job.title}</h3>
                <p className="text-xs text-slate-500">{job.company || 'Company'}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[10px] text-slate-400">{getTimeAgo(job.postedDate || job.createdAt)}</span>
                {job.expirationDate && <span className="text-[10px] text-orange-500 font-medium">{getExpirationCountdown(job.expirationDate)}</span>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${getEmploymentColor(job.employmentType)}`}>
                <MapPin className="w-3 h-3" /> {getLocation(job.location)}
              </span>
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${getEmploymentColor(job.employmentType)}`}>
                {job.employmentType || 'Full-time'}
              </span>
            </div>

            <p className="text-xs text-slate-500 line-clamp-2 mb-3">
              {job.description || 'No description provided.'}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {(job.requiredSkills || []).slice(0, 3).map((skill) => (
                <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                  {skill}
                </span>
              ))}
              {(job.requiredSkills?.length || 0) > 3 && (
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                  +{job.requiredSkills!.length - 3}
                </span>
              )}
            </div>

            <button className="w-full py-2 text-xs font-semibold text-center text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
              View Details
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
