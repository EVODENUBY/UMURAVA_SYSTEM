"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { FaBriefcase, FaUsers, FaFileAlt, FaChartLine, FaCheckCircle, FaClock, FaUserPlus, FaExternalLinkAlt, FaArrowUp, FaArrowDown, FaCheck, FaTimes, FaHourglassHalf, FaUserTie, FaBuilding, FaStar, FaEnvelope, FaSearch, FaFilter, FaSync } from 'react-icons/fa';
import Link from 'next/link';
import { SkeletonStats, SkeletonCard } from '@/components/ui/Skeleton';

interface DashboardStats {
  overview: {
    totalJobs: number;
    totalApplicants: number;
    totalInternalApplicants: number;
    totalExternalApplicants: number;
    totalScreened: number;
    totalShortlisted: number;
    totalHired: number;
  };
  averageScore: number;
  statusBreakdown: Record<string, number>;
  jobs: { _id: string; title: string; status: string; applicantCount?: number }[];
  recentActivity: { type: string; candidate: string; job: string; date: string }[];
}

const statusConfig = [
  { key: 'applied', label: 'Applied', color: '#3B82F6' },
  { key: 'screening', label: 'Screening', color: '#F59E0B' },
  { key: 'shortlisted', label: 'Shortlisted', color: '#8B5CF6' },
  { key: 'interview', label: 'Interview', color: '#EC4899' },
  { key: 'offer', label: 'Offer', color: '#06B6D4' },
  { key: 'hired', label: 'Hired', color: '#10B981' },
  { key: 'rejected', label: 'Rejected', color: '#EF4444' },
];

const quickActions = [
  { label: 'Post New Job', icon: FaBriefcase, href: '/recruiter/jobs', color: 'blue', bg: 'bg-blue-500' },
  { label: 'View Applicants', icon: FaUsers, href: '/recruiter/applicants', color: 'purple', bg: 'bg-purple-500' },
  { label: 'Run Screening', icon: FaFileAlt, href: '/recruiter/screening', color: 'green', bg: 'bg-green-500' },
  { label: 'Shortlist', icon: FaCheckCircle, href: '/recruiter/shortlist', color: 'orange', bg: 'bg-orange-500' },
];

export default function RecruiterDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      const response = await api.get<{ success: boolean; data: DashboardStats }>('/api/analytics', token || undefined);
      if (response.success) {
        setStats(response.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastUpdated.toLocaleTimeString();
  };

  const pipelineData = useMemo(() => {
    if (!stats?.overview.totalApplicants) {
      return statusConfig.map(s => ({ ...s, count: 0, percentage: 0 }));
    }
    return statusConfig.map(s => {
      const count = stats.statusBreakdown[s.key] || 0;
      const percentage = stats.overview.totalApplicants > 0 
        ? Math.round((count / stats.overview.totalApplicants) * 100) 
        : 0;
      return { ...s, count, percentage };
    });
  }, [stats]);

  const totalApplicants = stats?.overview.totalApplicants || 0;

  const activeJobsCount = stats?.jobs.filter(j => j.status === 'published').length || 0;
  const draftJobsCount = stats?.jobs.filter(j => j.status === 'draft').length || 0;

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
        <div className="mb-8">
          <div className="h-8 w-64 bg-slate-200 rounded animate-pulse mb-3" />
          <div className="h-4 w-96 bg-slate-200 rounded animate-pulse" />
        </div>
        <SkeletonStats count={4} className="mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Recruiter Dashboard</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <span>Welcome back, <span className="font-semibold text-blue-600">{user?.fullName || 'Recruiter'}</span>!</span>
              {lastUpdated && <span className="text-xs text-slate-400">• Updated {formatLastUpdated()}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setRefreshing(true); fetchStats(); }} 
              disabled={refreshing}
              className="p-2 bg-white text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <FaSync className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setTimeRange('7d')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${timeRange === '7d' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>7 days</button>
            <button onClick={() => setTimeRange('30d')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${timeRange === '30d' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>30 days</button>
            <button onClick={() => setTimeRange('90d')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${timeRange === '90d' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>90 days</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Active Jobs</p>
                <p className="text-3xl font-bold mt-1">{activeJobsCount}</p>
                <p className="text-blue-200 text-xs mt-2 flex items-center gap-1"><FaArrowUp className="w-3 h-3" /> {draftJobsCount} drafts</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FaBriefcase className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Internal Candidates</p>
                <p className="text-3xl font-bold mt-1">{stats?.overview.totalInternalApplicants || 0}</p>
                <p className="text-purple-200 text-xs mt-2 flex items-center gap-1"><FaBuilding className="w-3 h-3" /> Platform applicants</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FaUserTie className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">External Candidates</p>
                <p className="text-3xl font-bold mt-1">{stats?.overview.totalExternalApplicants || 0}</p>
                <p className="text-orange-200 text-xs mt-2 flex items-center gap-1"><FaExternalLinkAlt className="w-3 h-3" /> CSV imported</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FaUsers className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Applicants</p>
                <p className="text-3xl font-bold mt-1">{stats?.overview.totalApplicants || 0}</p>
                <p className="text-green-200 text-xs mt-2 flex items-center gap-1"><FaCheck className="w-3 h-3" /> {stats?.overview.totalHired || 0} hired</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FaUserPlus className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Candidate Pipeline</h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Total: <strong className="text-slate-900">{totalApplicants}</strong></span>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="relative w-64 h-64 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {totalApplicants > 0 ? (
                    pipelineData.map((item, idx) => {
                      const radius = 38;
                      const circumference = 2 * Math.PI * radius;
                      const dashLength = (item.percentage / 100) * circumference;
                      const dashOffset = pipelineData.slice(0, idx).reduce((acc, p) => acc + (p.percentage / 100) * circumference, 0);
                      return (
                        <circle
                          key={item.key}
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="none"
                          stroke={item.color}
                          strokeWidth="8"
                          strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                          strokeDashoffset={-dashOffset}
                          strokeLinecap="round"
                          className="transition-all duration-300"
                          style={{ opacity: hoveredSegment && hoveredSegment !== item.key ? 0.3 : 1 }}
                          onMouseEnter={() => setHoveredSegment(item.key)}
                          onMouseLeave={() => setHoveredSegment(null)}
                        />
                      );
                    })
                  ) : (
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                  )}
                  <circle cx="50" cy="50" r="26" fill="white" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-900">{totalApplicants}</p>
                    <p className="text-xs text-slate-500">Total</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 space-y-2 w-full">
                {pipelineData.map((status) => (
                  <div 
                    key={status.key}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    onMouseEnter={() => setHoveredSegment(status.key)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-sm font-medium text-slate-700 flex-1">{status.label}</span>
                    <span className="text-sm font-semibold text-slate-900">{status.count}</span>
                    <span className="text-xs text-slate-500 w-12 text-right">{status.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className={`w-10 h-10 ${action.bg} rounded-lg flex items-center justify-center text-white`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{action.label}</span>
                  <span className="ml-auto text-slate-400 group-hover:text-slate-600">→</span>
                </Link>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-slate-900">{stats?.averageScore || 0}%</p>
                  <p className="text-xs text-slate-500">Avg Score</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-slate-900">{stats?.overview.totalScreened || 0}</p>
                  <p className="text-xs text-slate-500">Screened</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-purple-700">{stats?.overview.totalShortlisted || 0}</p>
                  <p className="text-xs text-purple-500">Shortlisted</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Active Jobs</h2>
              <Link href="/recruiter/jobs" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All →</Link>
            </div>
            <div className="space-y-3">
              {stats?.jobs.slice(0, 5).map((job) => (
                <div key={job._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-medium text-slate-900 truncate">{job.title}</p>
                    <p className="text-xs text-slate-500 capitalize mt-0.5">{job.status}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${job.status === 'published' ? 'bg-green-100 text-green-700' : job.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                    {job.status}
                  </span>
                </div>
              ))}
              {(!stats?.jobs || stats.jobs.length === 0) && (
                <div className="text-center py-6">
                  <FaBriefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No jobs posted yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Hiring Funnel</h2>
              <span className="text-xs text-slate-500">Stage conversion</span>
            </div>
            <div className="space-y-3">
              {pipelineData.slice(0, 5).map((status, idx) => {
                const prevCount = idx > 0 ? pipelineData[idx - 1].count : status.count;
                const conversion = prevCount > 0 ? Math.round((status.count / prevCount) * 100) : 0;
                const maxCount = Math.max(...pipelineData.map(p => p.count), 1);
                const barWidth = totalApplicants > 0 ? Math.max((status.count / maxCount) * 100, 5) : 0;
                return (
                  <div key={status.key} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                        <span className="text-sm text-slate-700">{status.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{status.count}</span>
                        {idx > 0 && status.count > 0 && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{conversion}%</span>
                        )}
                      </div>
                    </div>
                    <div className="h-8 bg-slate-50 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full rounded-lg transition-all duration-500"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: status.color,
                          opacity: 0.8
                        }}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-white drop-shadow">
                        {status.percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}