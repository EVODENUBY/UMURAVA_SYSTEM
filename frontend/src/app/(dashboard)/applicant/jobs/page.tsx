"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronDown, Briefcase } from 'lucide-react';
import { useLoading } from '@/contexts/LoadingContext';
import JobCard from '@/components/JobCard';
import JobDetailPopup from '@/components/JobDetailPopup';

const BRAND_COLOR = "#2b71f0";

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
}

export default function ApplicantJobsPage() {
  const { withLoading } = useLoading();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [filters, setFilters] = useState({
    experience: '',
    jobType: '',
    location: '',
    salary: ''
  });

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setShowPopup(true);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await withLoading(
          fetch(`https://recruiter-ai-platform.onrender.com/api/jobs?page=1&limit=20&search=${search}`)
            .then(r => r.json())
        );
        if (res.success) setJobs(res.data.jobs);
      } catch (error) {
        setJobs([
          {
            _id: '1',
            title: 'Senior Frontend Developer',
            location: 'Kigali, Rwanda',
            experience: { level: 'Senior' },
            salary: { min: 200000, max: 350000, currency: 'RWF' },
            requiredSkills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
            createdAt: new Date().toISOString(),
            description: 'Join our team to build cutting-edge web applications...',
            company: 'TechCorp Rwanda',
            employmentType: 'Full-time'
          },
          {
            _id: '2',
            title: 'Backend Engineer',
            location: 'Remote',
            experience: { level: 'Mid-Level' },
            salary: { min: 180000, max: 280000, currency: 'RWF' },
            requiredSkills: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            description: 'We need a skilled backend engineer to build scalable APIs...',
            company: 'StartupHub Africa',
            employmentType: 'Full-time'
          },
          {
            _id: '3',
            title: 'UI/UX Designer',
            location: 'Nairobi, Kenya',
            experience: { level: 'Mid-Level' },
            salary: { min: 150000, max: 250000, currency: 'USD' },
            requiredSkills: ['Figma', 'Adobe XD', 'UI Design', 'User Research'],
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            description: 'Design beautiful and intuitive user interfaces...',
            company: 'DesignStudio',
            employmentType: 'Contract'
          },
          {
            _id: '4',
            title: 'Product Manager',
            location: 'Kigali, Rwanda',
            experience: { level: 'Senior' },
            salary: { min: 250000, max: 400000, currency: 'RWF' },
            requiredSkills: ['Product Strategy', 'Agile', 'Analytics', 'Leadership'],
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            description: 'Lead product development from ideation to launch...',
            company: 'Innovation Labs',
            employmentType: 'Full-time'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchJobs, 300);
    return () => clearTimeout(timer);
  }, [search, withLoading]);

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Find Jobs</h1>
          <p className="text-blue-100">Explore opportunities that match your skills</p>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search jobs, skills, or companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-white outline-none focus:border-blue-500 transition-all"
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-6 py-4 rounded-2xl border-2 font-bold text-sm uppercase tracking-wider transition-all ${showFilters ? 'bg-blue-500 text-white border-blue-500' : 'border-slate-200 hover:bg-slate-50'}`}
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white rounded-2xl border border-slate-200 p-6"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Experience Level</label>
              <select 
                value={filters.experience}
                onChange={(e) => setFilters({...filters, experience: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500"
              >
                <option value="">All Levels</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid-Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Job Type</label>
              <select 
                value={filters.jobType}
                onChange={(e) => setFilters({...filters, jobType: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="fulltime">Full-time</option>
                <option value="parttime">Part-time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location</label>
              <select 
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500"
              >
                <option value="">All Locations</option>
                <option value="kigali">Kigali, Rwanda</option>
                <option value="nairobi">Nairobi, Kenya</option>
                <option value="lagos">Lagos, Nigeria</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Salary Range</label>
              <select 
                value={filters.salary}
                onChange={(e) => setFilters({...filters, salary: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500"
              >
                <option value="">Any Salary</option>
                <option value="0-100">Under 100K</option>
                <option value="100-200">100K - 200K</option>
                <option value="200-500">200K - 500K</option>
                <option value="500+">500K+</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-white/50 border-t-white animate-spin" />
            </div>
          </div>
          <p className="text-slate-500 font-bold">Searching for jobs...</p>
          <p className="text-slate-400 text-sm mt-1">Please wait while we find the best opportunities</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Briefcase className="w-12 h-12 text-slate-300" />
          </div>
          <p className="text-slate-500 font-bold text-lg">No jobs found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {jobs.map((job, index) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <JobCard job={job} onViewDetails={handleViewDetails} />
            </motion.div>
          ))}
        </div>
      )}

      <JobDetailPopup 
        job={selectedJob}
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onApply={() => {
          setShowPopup(false);
        }}
      />
    </div>
  );
}
