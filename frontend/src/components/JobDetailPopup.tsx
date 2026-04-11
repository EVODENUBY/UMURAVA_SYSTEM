"use client";

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Briefcase, DollarSign, Globe, X, Building2 } from 'lucide-react';

interface Job {
  _id: string;
  title: string;
  location: string;
  experience: { level: string };
  salary?: { min: number; max: number; currency: string };
  requiredSkills: string[];
  createdAt: string;
  description?: string;
  company?: string;
  employmentType?: string;
  remote?: boolean;
}

interface JobDetailPopupProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
}

export default function JobDetailPopup({ job, isOpen, onClose, onApply }: JobDetailPopupProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min || !max || !currency) return 'Not specified';
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  if (!job) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">
                  {job.company?.charAt(0) || 'C'}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-slate-900 truncate">{job.title}</h2>
                  <p className="text-xs text-slate-500 truncate">{job.company || 'Company'}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="flex items-center gap-1 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-blue-500" /> {job.location}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-600">
                  <Briefcase className="w-4 h-4 text-blue-500" /> {job.experience?.level || 'Any'}
                </span>
                {job.salary && (
                  <span className="flex items-center gap-1 text-xs text-slate-600">
                    <DollarSign className="w-4 h-4 text-blue-500" /> {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                  </span>
                )}
                {job.remote && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600">
                    <Globe className="w-4 h-4" /> Remote
                  </span>
                )}
              </div>

              <h3 className="text-sm font-semibold text-slate-800 mb-2">Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed max-h-40 overflow-y-auto">
                {job.description || 'No description provided.'}
              </p>

              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills.slice(0, 5).map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills.length > 5 && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                        +{job.requiredSkills.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-100 flex gap-2">
              <button 
                onClick={onClose}
                className="flex-1 py-2 rounded-lg font-medium text-sm text-slate-600 border border-slate-200 hover:bg-slate-50"
              >
                Close
              </button>
              <button 
                onClick={onApply}
                className="flex-1 py-2 rounded-lg font-medium text-sm text-white bg-blue-500 hover:bg-blue-600"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
