"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Briefcase, ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import JobCard from '@/components/JobCard';
import JobDetailPopup from '@/components/JobDetailPopup';
import { JobListSkeleton } from '@/components/Skeleton';

interface Job {
  _id: string;
  title: string;
  location?: { address?: string; city?: string; country?: string; remote?: boolean };
  experience?: string;
  jobLevel?: string;
  salary?: { min: number; max: number; currency: string };
  requiredSkills?: string[];
  postedDate?: string;
  expirationDate?: string;
  description?: string;
  company?: string;
  employmentType?: string;
}

export default function ApplicantJobsPage() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [filters, setFilters] = useState({
    experience: '',
    jobType: '',
    location: ''
  });

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setShowPopup(true);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?page=${currentPage}&limit=${itemsPerPage}&search=${search}`, { headers }).then(r => r.json());
        if (res.success && res.data?.jobs) {
          setJobs(res.data.jobs);
        } else {
          setJobs([]);
        }
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };
    const timer = setTimeout(fetchJobs, 300);
    return () => clearTimeout(timer);
  }, [search, currentPage, itemsPerPage, token]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = !search || 
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.company?.toLowerCase().includes(search.toLowerCase()) ||
        job.requiredSkills?.some(skill => skill.toLowerCase().includes(search.toLowerCase()));
      
      const matchesExperience = !filters.experience || 
        job.experience?.toLowerCase() === filters.experience.toLowerCase() ||
        job.jobLevel?.toLowerCase() === filters.experience.toLowerCase();
      
      const matchesType = !filters.jobType || 
        job.employmentType?.toLowerCase().includes(filters.jobType.toLowerCase());
      
      const matchesLocation = !filters.location || 
        (filters.location === 'remote' && job.location?.remote) ||
        job.location?.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
        job.location?.country?.toLowerCase().includes(filters.location.toLowerCase());

      return matchesSearch && matchesExperience && matchesType && matchesLocation;
    });
  }, [jobs, search, filters]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filters, itemsPerPage]);

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  const clearFilters = () => {
    setFilters({ experience: '', jobType: '', location: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 sm:p-8 relative overflow-hidden">
            <svg className="absolute right-0 top-0 w-64 h-64 opacity-10" viewBox="0 0 200 200">
              <circle cx="150" cy="50" r="80" fill="white" />
              <circle cx="100" cy="120" r="60" fill="white" />
              <circle cx="180" cy="140" r="40" fill="white" />
            </svg>
            <svg className="absolute left-0 bottom-0 w-48 h-48 opacity-5" viewBox="0 0 200 200">
              <rect x="20" y="100" width="60" height="80" rx="8" fill="white" />
              <rect x="100" y="60" width="80" height="120" rx="8" fill="white" />
            </svg>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Find Your Dream Job</h1>
                <p className="text-blue-100 text-sm mt-1">{filteredJobs.length} jobs available</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search jobs, skills, or companies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filters:</span>
              <div className="flex flex-wrap gap-2">
                <select 
                  value={filters.experience}
                  onChange={(e) => setFilters({...filters, experience: e.target.value})}
                  className={`px-3 py-2 rounded-lg border-2 text-sm outline-none cursor-pointer transition-all ${filters.experience ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 focus:border-blue-500'}`}
                >
                  <option value="">Experience</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid-Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                </select>
                <select 
                  value={filters.jobType}
                  onChange={(e) => setFilters({...filters, jobType: e.target.value})}
                  className={`px-3 py-2 rounded-lg border-2 text-sm outline-none cursor-pointer transition-all ${filters.jobType ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 focus:border-blue-500'}`}
                >
                  <option value="">Job Type</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
                <select 
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className={`px-3 py-2 rounded-lg border-2 text-sm outline-none cursor-pointer transition-all ${filters.location ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 focus:border-blue-500'}`}
                >
                  <option value="">Location</option>
                  <option value="remote">Remote</option>
                  <option value="kigali">Kigali</option>
                  <option value="nairobi">Nairobi</option>
                  <option value="lagos">Lagos</option>
                </select>
                {activeFiltersCount > 0 && (
                  <button 
                    onClick={clearFilters}
                    className="px-3 py-2 rounded-lg border-2 border-red-200 bg-red-50 text-red-600 text-sm hover:bg-red-100 flex items-center gap-1.5 font-medium"
                  >
                    <X className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <JobListSkeleton count={itemsPerPage} />
        ) : paginatedJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">No jobs found</h3>
            <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {paginatedJobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <JobCard job={job} onViewDetails={handleViewDetails} />
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">Show:</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-slate-500">
                  of {filteredJobs.length} jobs
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        <JobDetailPopup 
          job={selectedJob}
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          onApply={() => setShowPopup(false)}
        />
      </div>
    </div>
  );
}
