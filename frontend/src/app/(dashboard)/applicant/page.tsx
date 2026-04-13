"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Briefcase, FileText, Clock, Search, User, TrendingUp, 
  Calendar, ArrowRight, MapPin, CheckCircle, AlertCircle,
  Target, Award, Zap, ChevronRight, Loader2
} from 'lucide-react';
import { JobListSkeleton } from '@/components/Skeleton';

const CircularProgress = ({ percentage, size = 120, strokeWidth = 8 }: { percentage: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  const getColor = () => {
    if (percentage >= 80) return { stroke: '#10b981', bg: 'emerald' };
    if (percentage >= 50) return { stroke: '#f59e0b', bg: 'amber' };
    return { stroke: '#ef4444', bg: 'red' };
  };
  
  const color = getColor();
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-black text-${color.bg}-600`}>{percentage}%</span>
        <span className="text-[10px] text-slate-400 font-medium">Complete</span>
      </div>
    </div>
  );
};

interface ProfileCompletion {
  basicInfo: number;
  skills: number;
  languages: number;
  experience: number;
  education: number;
  certifications: number;
  projects: number;
  availability: number;
  socialLinks: number;
  overall: number;
}

interface Application {
  _id: string;
  status: string;
  jobId?: { title: string; company?: string };
  appliedAt?: string;
}

interface Job {
  _id: string;
  title: string;
  location?: { city?: string; country?: string; remote?: boolean };
  requiredSkills?: string[];
  company?: string;
  employmentType?: string;
  postedDate?: string;
}

export default function ApplicantDashboard() {
  const { user, token } = useAuth();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied': return 'bg-blue-100 text-blue-700';
      case 'screening': return 'bg-amber-100 text-amber-700';
      case 'interview': return 'bg-purple-100 text-purple-700';
      case 'offer': return 'bg-emerald-100 text-emerald-700';
      case 'hired': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-600' };
    if (percentage >= 50) return { bg: 'bg-amber-500', text: 'text-amber-600' };
    return { bg: 'bg-red-500', text: 'text-red-600' };
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      try {
        const [jobsRes, profileRes, appsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?page=1&limit=4`, { headers }).then(r => r.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/completion`, { headers }).then(r => r.json()).catch(() => null),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applicants/internal/my-applications`, { headers }).then(r => r.json()).catch(() => null)
        ]);

        if (jobsRes.success) setRecentJobs(jobsRes.data?.jobs || []);
        if (profileRes?.success) setProfileCompletion(profileRes.data || null);
        if (appsRes?.success) setApplications(appsRes.data?.applications || appsRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const getLocation = (loc?: { city?: string; country?: string; remote?: boolean }) => {
    if (!loc) return 'Not specified';
    if (loc.remote) return 'Remote';
    if (loc.city) return `${loc.city}${loc.country ? ', ' + loc.country : ''}`;
    return 'Not specified';
  };

  const completion = profileCompletion?.overall || 0;
  const colors = getCompletionColor(completion);

  const completionCategories = profileCompletion ? [
    { label: 'Basic Info', value: profileCompletion.basicInfo, icon: User },
    { label: 'Skills', value: profileCompletion.skills, icon: Target },
    { label: 'Experience', value: profileCompletion.experience, icon: Briefcase },
    { label: 'Education', value: profileCompletion.education, icon: Award },
    { label: 'Certifications', value: profileCompletion.certifications, icon: CheckCircle },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                      {getGreeting()}, {user?.fullName?.split(' ')[0] || 'Talent'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-blue-100 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {formatDate()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {formatTime()}
                      </span>
                    </div>
                  </div>
                  <Link 
                    href="/applicant/jobs"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors"
                  >
                    <Search className="w-4 h-4" /> Find Jobs
                  </Link>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/applicant/jobs" className="bg-white rounded-3xl border border-slate-200 p-5 min-h-[110px] hover:border-blue-300 hover:shadow-sm transition-all flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Find Jobs</p>
                  <p className="text-xs text-slate-500 mt-2">Browse open roles</p>
                </div>
              </Link>
              <Link href="/applicant/applications" className="bg-white rounded-3xl border border-slate-200 p-5 min-h-[110px] hover:border-emerald-300 hover:shadow-sm transition-all flex items-start gap-3">
                <FileText className="w-5 h-5 text-emerald-600 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Applications</p>
                  <p className="text-xs text-slate-500 mt-2">Track your progress</p>
                </div>
              </Link>
              <Link href="/applicant/profile" className="bg-white rounded-3xl border border-slate-200 p-5 min-h-[110px] hover:border-purple-300 hover:shadow-sm transition-all flex items-start gap-3">
                <User className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">My Profile</p>
                  <p className="text-xs text-slate-500 mt-2">Update your details</p>
                </div>
              </Link>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-2">Your recruitment dashboard</h3>
              <p className="text-sm leading-6 text-slate-600">
                Stay on top of the latest job opportunities, review your application status, and keep your profile updated in one place. This dashboard helps you move quickly from discovery to application with clear next steps.
              </p>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center"
          >
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-amber-500" /> Profile Score
            </h3>
            
            <div className="mb-4">
              <CircularProgress percentage={completion} size={140} strokeWidth={10} />
            </div>

            {completionCategories.length > 0 ? (
              <div className="w-full space-y-2">
                {completionCategories.slice(0, 4).map((cat) => (
                  <div key={cat.label} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <cat.icon className="w-3 h-3" /> {cat.label}
                    </span>
                    <span className={`font-semibold ${cat.value >= 50 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {cat.value}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-2">Complete your profile to see breakdown</p>
            )}
            
            <Link 
              href="/applicant/profile"
              className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Complete Profile <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                </div>
                Latest Jobs
              </h3>
              <Link href="/applicant/jobs" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
                      <div className="w-10 h-10 rounded-lg bg-slate-200" />
                      <div className="flex-1">
                        <div className="h-4 w-3/4 bg-slate-200 rounded mb-2" />
                        <div className="h-3 w-1/2 bg-slate-100 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentJobs.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No jobs available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentJobs.map((job) => (
                    <Link 
                      key={job._id} 
                      href={`/applicant/jobs/${job._id}`}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h4>
                        <p className="text-xs text-slate-500">{job.company || 'Company'}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {getLocation(job.location)}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium">
                        Apply
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-emerald-600" />
                </div>
                My Applications
              </h3>
              <Link href="/applicant/applications" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 mb-3">No applications yet</p>
                  <Link href="/applicant/jobs" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                    Browse Jobs →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 4).map((app) => (
                    <div key={app._id} className="p-3 rounded-xl bg-slate-50">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">{app.jobId?.title || 'Job'}</h4>
                          <p className="text-xs text-slate-500">{app.jobId?.company || 'Company'}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
