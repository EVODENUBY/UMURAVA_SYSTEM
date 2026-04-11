"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FaMapMarkerAlt, FaBriefcase, FaClock, FaDollarSign, FaBuilding, FaUsers, FaCheck, FaArrowLeft, FaRobot, FaGlobe, FaLock, FaUser, FaTimes } from 'react-icons/fa';

interface Job {
  _id: string;
  title: string;
  location: string;
  experience: { level: string };
  salary: { min: number; max: number; currency: string };
  requiredSkills: string[];
  createdAt: string;
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  company: string;
  employmentType: string;
  applications?: number;
  remote?: boolean;
}

export default function PublicJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [apiError, setApiError] = useState(false);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/jobs');
    }
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://recruiter-ai-platform.onrender.com/api/jobs/${params.id}`);
        const result = await res.json();
        
        if (result.success && result.data) {
          setJob({
            ...result.data,
            responsibilities: result.data.responsibilities || [],
            requirements: result.data.requirements || [],
            benefits: result.data.benefits || [],
            requiredSkills: result.data.requiredSkills || [],
          });
          setApiError(false);
        } else {
          setApiError(true);
          loadMockData();
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        setApiError(true);
        loadMockData();
      } finally {
        setLoading(false);
      }
    };

    const loadMockData = () => {
      setJob({
        _id: params.id as string,
        title: 'Senior Frontend Developer',
        location: 'Kigali, Rwanda',
        experience: { level: 'Senior' },
        salary: { min: 150000, max: 250000, currency: 'RWF' },
        requiredSkills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Node.js'],
        createdAt: new Date().toISOString(),
        description: 'We are looking for an experienced Frontend Developer to join our team. You will be responsible for building user-facing features, optimizing web applications, and collaborating with designers and backend developers. This is an exciting opportunity to work with cutting-edge technologies and make a real impact.',
        responsibilities: [
          'Develop new user-facing features using React.js',
          'Build reusable components and front-end libraries',
          'Optimize components for maximum performance across all modern browsers',
          'Collaborate with team members on UI/UX improvements',
          'Participate in code reviews and mentor junior developers',
          'Work closely with product managers to define product requirements',
        ],
        requirements: [
          '5+ years of experience in frontend development',
          'Strong proficiency in React.js and TypeScript',
          'Experience with Next.js and modern CSS frameworks',
          'Excellent problem-solving skills and attention to detail',
          'Strong communication skills in English',
        ],
        benefits: [
          'Competitive salary package',
          'Health insurance coverage',
          'Flexible working hours',
          'Remote work options',
          'Professional development budget',
          'Stock options',
        ],
        company: 'TechCorp Rwanda',
        employmentType: 'Full-time',
        applications: 24,
        remote: true,
      });
    };

    if (params.id) {
      fetchJob();
    }
  }, [params.id]);

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min || !max || !currency) return 'Not specified';
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Recently';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const timeAgo = (date?: string) => {
    if (!date) return 'Recently';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-100 h-16" />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-4" />
          <div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900">Job not found</h2>
          <Link href="/jobs" className="mt-4 text-blue-500 font-bold hover:underline">Back to Jobs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center font-black text-white">U</div>
              <span className="text-lg font-black uppercase tracking-tight">Umurava AI</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login" className="px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="px-6 py-3 rounded-xl text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all" style={{ backgroundColor: '#2b71f0' }}>
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <button onClick={handleGoBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 font-bold text-sm mb-6">
          <FaArrowLeft /> Back
        </button>
        
        {apiError && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
            <strong>Note:</strong> Showing sample data. API is currently unavailable.
          </div>
        )}
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-2xl md:text-3xl font-black text-slate-400">
                      {job.company?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900">{job.title}</h1>
                      <p className="text-base md:text-lg text-slate-500 mt-1 md:mt-2 flex items-center gap-2">
                        <FaBuilding className="text-blue-500" /> {job.company || 'Company'}
                      </p>
                      <div className="flex flex-wrap gap-3 md:gap-4 mt-3 md:mt-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-blue-500" /> {job.location}</span>
                        <span className="flex items-center gap-1"><FaBriefcase className="text-blue-500" /> {job.experience?.level || 'Any level'}</span>
                        {job.salary && (
                          <span className="flex items-center gap-1"><FaDollarSign className="text-blue-500" /> {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}</span>
                        )}
                        <span className="flex items-center gap-1"><FaClock className="text-blue-500" /> {timeAgo(job.createdAt)}</span>
                        {job.remote && <span className="flex items-center gap-1 text-emerald-500"><FaGlobe /> Remote OK</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => setShowLoginModal(true)}
                      className="flex-1 md:flex-none px-6 md:px-8 py-3 md:py-4 rounded-2xl text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all"
                      style={{ backgroundColor: '#2b71f0' }}
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
                <h2 className="text-lg md:text-xl font-black uppercase tracking-tight mb-4">Job Description</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{job.description || 'No description provided.'}</p>
              </div>
            </motion.div>

            {job.responsibilities && job.responsibilities.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
                  <h2 className="text-lg md:text-xl font-black uppercase tracking-tight mb-4">Responsibilities</h2>
                  <ul className="space-y-3">
                    {job.responsibilities.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600">
                        <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FaCheck className="text-blue-500 text-xs" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {job.requirements && job.requirements.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
                  <h2 className="text-lg md:text-xl font-black uppercase tracking-tight mb-4">Requirements</h2>
                  <ul className="space-y-3">
                    {job.requirements.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600">
                        <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FaCheck className="text-amber-500 text-xs" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {job.benefits && job.benefits.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
                  <h2 className="text-lg md:text-xl font-black uppercase tracking-tight mb-4">Benefits & Perks</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {job.benefits.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50">
                        <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <FaCheck className="text-emerald-500" />
                        </span>
                        <span className="font-medium text-emerald-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm sticky top-24">
                <h3 className="text-lg font-black uppercase tracking-tight mb-4">Job Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Employment Type</span>
                    <span className="font-bold text-sm">{job.employmentType || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Experience Level</span>
                    <span className="font-bold text-sm">{job.experience?.level || 'Any'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Salary Range</span>
                    <span className="font-bold text-sm">{formatSalary(job.salary?.min, job.salary?.max, job.salary?.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Location</span>
                    <span className="font-bold text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Posted</span>
                    <span className="font-bold text-sm">{formatDate(job.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-slate-500 text-sm">Applicants</span>
                    <span className="font-bold text-sm">{job.applications || 0}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-2">
                    <FaRobot /> AI Match
                  </div>
                  <p className="text-xs text-blue-500">Sign in to see your match score based on your profile</p>
                </div>

                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="w-full mt-6 py-4 rounded-2xl text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all"
                  style={{ backgroundColor: '#2b71f0' }}
                >
                  Apply for this Position
                </button>
              </div>
            </motion.div>

            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-black uppercase tracking-tight mb-4">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, i) => (
                      <span key={i} className="px-3 md:px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showLoginModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center relative"
            >
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
              
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
                <FaUser className="text-3xl text-blue-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Sign in to Apply</h3>
              <p className="text-slate-500 mb-6">Create a free account or sign in to apply for this job and many more.</p>
              
              <div className="space-y-3">
                <Link 
                  href={`/register?job_id=${job._id}`}
                  className="w-full py-4 rounded-2xl text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#2b71f0' }}
                >
                  Create Account
                </Link>
                <Link 
                  href={`/login?job_id=${job._id}`}
                  className="w-full py-4 rounded-2xl border-2 border-slate-200 font-bold text-sm uppercase tracking-wider hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
              </div>
              
              <button 
                onClick={() => setShowLoginModal(false)}
                className="mt-6 text-sm text-slate-400 hover:text-slate-600"
              >
                Continue browsing
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="bg-slate-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center font-black">U</div>
              <span className="text-lg font-black uppercase tracking-tight">Umurava AI</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-slate-400">
              <Link href="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link>
              <Link href="/register?role=recruiter" className="hover:text-white transition-colors">Post a Job</Link>
              <Link href="#" className="hover:text-white transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-slate-400">2024 Umurava AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
