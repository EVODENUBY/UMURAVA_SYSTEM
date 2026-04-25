"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { api } from '@/lib/api';
import { FaBriefcase, FaUsers, FaFileAlt, FaChartLine, FaCheckCircle, FaClock, FaTimesCircle, FaUserGraduate, FaUserTie, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { SkeletonStats, SkeletonCard } from '@/components/ui/Skeleton';
import Link from 'next/link';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, LineChart, Line
} from 'recharts';

interface Analytics {
  overview: {
    totalJobs: number;
    totalApplicants: number;
    totalInternalApplicants: number;
    totalExternalApplicants: number;
    totalScreened: number;
    totalShortlisted: number;
  };
  averageScore: number;
  statusBreakdown: Record<string, number>;
  jobs: { _id: string; title: string; status: string }[];
  jobsWithApplicants: { _id: string; title: string; status: string; totalApplicants: number; externalCount: number; internalCount: number }[];
  recentActivity?: { date: string; count: number }[];
  scoreDistribution?: { range: string; count: number }[];
}

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

export default function AnalyticsPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);

  useEffect(() => {
    const currentRequestId = ++requestId.current;
    setLoading(true);
    
    const loadAnalytics = async () => {
      try {
        const params = selectedJob ? `?jobId=${selectedJob}` : '';
        const response = await api.get<{ success: boolean; data: Analytics }>(
          `/api/analytics${params}`,
          token || undefined
        );
        if (currentRequestId !== requestId.current) return;
        if (response.success) {
          setAnalytics(response.data);
        } else {
          showToast('Failed to fetch analytics data', 'error');
        }
      } catch (error: any) {
        if (currentRequestId !== requestId.current) return;
        console.error('Failed to fetch analytics:', error);
        showToast(error?.response?.data?.error?.message || 'Failed to fetch analytics. Please try again.', 'error');
      } finally {
        if (currentRequestId !== requestId.current) return;
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [selectedJob, token]);

  const handleJobChange = (jobId: string) => {
    setSelectedJob(jobId);
  };

  const totalApplicants = selectedJob 
    ? (analytics?.jobsWithApplicants?.find((j: any) => String(j._id) === selectedJob)?.totalApplicants || 0)
    : (analytics?.overview.totalApplicants || 0);
  const totalInternal = selectedJob
    ? (analytics?.jobsWithApplicants?.find((j: any) => String(j._id) === selectedJob)?.internalCount || 0)
    : (analytics?.overview.totalInternalApplicants || 0);
  const totalExternal = selectedJob
    ? (analytics?.jobsWithApplicants?.find((j: any) => String(j._id) === selectedJob)?.externalCount || 0)
    : (analytics?.overview.totalExternalApplicants || 0);
  const totalScreened = analytics?.overview.totalScreened || 0;

  const applicantSourceData = [
    { name: 'Internal', value: totalInternal, fill: '#10B981' },
    { name: 'External', value: totalExternal, fill: '#F59E0B' }
  ];

  const statusData = Object.entries(analytics?.statusBreakdown || {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    fill: COLORS[Object.keys(analytics?.statusBreakdown || {}).indexOf(key) % COLORS.length]
  }));

  const topJobs = selectedJob 
    ? (analytics?.jobsWithApplicants || []).filter((j: any) => String(j._id) === String(selectedJob)).map((job: any) => ({
      name: job.title.length > 25 ? job.title.substring(0, 25) + '...' : job.title,
      fullName: job.title,
      status: job.status,
      applicants: Number(job.totalApplicants) || 0,
      external: Number(job.externalCount) || 0,
      internal: Number(job.internalCount) || 0
    }))
    : (analytics?.jobsWithApplicants || []).slice(0, 6).map((job: any) => ({
      name: job.title.length > 25 ? job.title.substring(0, 25) + '...' : job.title,
      fullName: job.title,
      status: job.status,
      applicants: Number(job.totalApplicants) || 0,
      external: Number(job.externalCount) || 0,
      internal: Number(job.internalCount) || 0
    }));

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <div className="h-6 w-24 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
        <SkeletonStats className="mb-4 sm:mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">Recruitment Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-500">Real-time insights on your hiring pipeline</p>
        </div>
        <select
          value={selectedJob}
          onChange={(e) => handleJobChange(e.target.value)}
          className="px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-200 rounded-lg text-xs sm:text-sm w-full sm:w-48"
        >
          <option value="">All Jobs</option>
          {analytics?.jobs.map(job => (
            <option key={job._id} value={job._id}>{job.title}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <Link href="/recruiter/jobs" className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <FaBriefcase className="w-4 h-4 opacity-80" />
            <FaArrowUp className="w-3 h-3 opacity-60" />
          </div>
          <p className="text-xl sm:text-2xl font-bold mt-1">{analytics?.overview.totalJobs || 0}</p>
          <p className="text-xs opacity-80">Active Jobs</p>
        </Link>

        <Link href="/recruiter/applicants" className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <FaUsers className="w-4 h-4 opacity-80" />
            <FaArrowUp className="w-3 h-3 opacity-60" />
          </div>
          <p className="text-xl sm:text-2xl font-bold mt-1">{totalApplicants}</p>
          <p className="text-xs opacity-80">Total Applicants</p>
        </Link>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <FaUserGraduate className="w-4 h-4 opacity-80" />
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">{totalApplicants > 0 ? Math.round(totalInternal / totalApplicants * 100) : 0}%</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold mt-1">{totalInternal}</p>
          <p className="text-xs opacity-80">Internal</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <FaUserTie className="w-4 h-4 opacity-80" />
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">{totalApplicants > 0 ? Math.round(totalExternal / totalApplicants * 100) : 0}%</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold mt-1">{totalExternal}</p>
          <p className="text-xs opacity-80">External</p>
        </div>

        <Link href="/recruiter/screening" className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg p-3 text-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <FaFileAlt className="w-4 h-4 opacity-80" />
            <FaArrowUp className="w-3 h-3 opacity-60" />
          </div>
          <p className="text-xl sm:text-2xl font-bold mt-1">{totalScreened}</p>
          <p className="text-xs opacity-80">Screened</p>
        </Link>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-3 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <FaClock className="w-4 h-4 opacity-80" />
          </div>
          <p className="text-xl sm:text-2xl font-bold mt-1">{analytics?.statusBreakdown?.pending || 0}</p>
          <p className="text-xs opacity-80">Pending</p>
        </div>

        <Link href="/recruiter/shortlist" className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg p-3 text-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <FaCheckCircle className="w-4 h-4 opacity-80" />
            <FaArrowUp className="w-3 h-3 opacity-60" />
          </div>
          <p className="text-xl sm:text-2xl font-bold mt-1">{analytics?.overview.totalShortlisted || 0}</p>
          <p className="text-xs opacity-80">Shortlisted</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Applicant Sources</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={applicantSourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {applicantSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} (${totalApplicants > 0 ? Math.round(Number(value) / totalApplicants * 100) : 0}%)`, 'Applicants']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {applicantSourceData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-xs text-slate-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Candidate Pipeline</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={70} />
                <Tooltip formatter={(value) => [value, 'Count']} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Status Distribution</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  innerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {statusData.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-[10px] text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Top Jobs by Applicants</h3>
            <Link href="/recruiter/jobs" className="text-xs text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topJobs} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 shadow-lg rounded-lg border border-slate-200 text-xs">
                          <p className="font-semibold text-slate-900 mb-1">{data?.fullName}</p>
                          <p className="text-slate-600">Total: <span className="font-bold">{data?.applicants}</span> applicants</p>
                          <p className="text-orange-600">External: <span className="font-bold">{data?.external}</span></p>
                          <p className="text-green-600">Internal: <span className="font-bold">{data?.internal}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="applicants" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Hiring Funnel</h3>
            <span className="text-xs text-slate-500">{totalApplicants} total</span>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Applied', value: analytics?.statusBreakdown?.applied || 0, color: 'bg-blue-500' },
              { label: 'Pending', value: analytics?.statusBreakdown?.pending || 0, color: 'bg-yellow-500' },
              { label: 'Screening', value: analytics?.statusBreakdown?.screening || 0, color: 'bg-blue-400' },
              { label: 'Shortlisted', value: analytics?.statusBreakdown?.shortlisted || 0, color: 'bg-purple-500' },
              { label: 'Interview', value: analytics?.statusBreakdown?.interview || 0, color: 'bg-pink-500' },
              { label: 'Offer', value: analytics?.statusBreakdown?.offer || 0, color: 'bg-cyan-500' },
              { label: 'Hired', value: analytics?.statusBreakdown?.hired || 0, color: 'bg-green-500' }
            ].map((step, idx) => {
              const percentage = totalApplicants > 0 ? (step.value / totalApplicants) * 100 : 0;
              return (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 w-16 text-right">{step.label}</span>
                  <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`${step.color} h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage > 10 && (
                        <span className="text-[10px] text-white font-medium">{step.value}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 w-8">{Math.round(percentage)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-slate-900">{analytics?.statusBreakdown?.pending || 0}</p>
            <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1"><FaClock className="w-3 h-3 text-yellow-500" /> Pending</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-green-600">{analytics?.statusBreakdown?.shortlisted || 0}</p>
            <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1"><FaCheckCircle className="w-3 h-3 text-green-500" /> Shortlisted</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-purple-600">{analytics?.statusBreakdown?.interview || 0}</p>
            <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1"><FaUsers className="w-3 h-3 text-purple-500" /> Interview</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-blue-600">{analytics?.statusBreakdown?.offer || 0}</p>
            <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1"><FaFileAlt className="w-3 h-3 text-blue-500" /> Offer</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-emerald-600">{analytics?.statusBreakdown?.hired || 0}</p>
            <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1"><FaCheckCircle className="w-3 h-3 text-emerald-500" /> Hired</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-red-600">{analytics?.statusBreakdown?.rejected || 0}</p>
            <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1"><FaTimesCircle className="w-3 h-3 text-red-500" /> Rejected</p>
          </div>
        </div>
      </div>
    </div>
  );
}