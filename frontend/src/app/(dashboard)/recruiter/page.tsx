"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { FaBriefcase, FaUsers, FaFileAlt, FaChartLine, FaCheckCircle, FaClock } from 'react-icons/fa';
import Link from 'next/link';
import { SkeletonStats, SkeletonCard } from '@/components/ui/Skeleton';

interface Stats {
  overview: {
    totalJobs: number;
    totalApplicants: number;
    totalInternalApplicants: number;
    totalExternalApplicants: number;
    totalScreened: number;
  };
  averageScore: number;
  statusBreakdown: Record<string, number>;
  jobs?: { _id: string; title: string; status: string }[];
}

export default function RecruiterDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get<{ success: boolean; data: Stats }>('/analytics', token || undefined);
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
        </div>

        <SkeletonStats count={4} className="mb-6 sm:mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Jobs', value: stats?.overview.totalJobs || 0, icon: <FaBriefcase />, color: 'blue', bgColor: 'bg-blue-500' },
    { label: 'Total Applicants', value: stats?.overview.totalApplicants || 0, icon: <FaUsers />, color: 'purple', bgColor: 'bg-purple-500' },
    { label: 'Screened', value: stats?.overview.totalScreened || 0, icon: <FaFileAlt />, color: 'green', bgColor: 'bg-green-500' },
    { label: 'Avg Score', value: stats?.averageScore || 0, icon: <FaChartLine />, color: 'orange', bgColor: 'bg-orange-500', suffix: '%' },
  ];

  const getBgColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500', purple: 'bg-purple-500', green: 'bg-green-500',
      orange: 'bg-orange-500', cyan: 'bg-cyan-500', indigo: 'bg-indigo-500',
    };
    return colors[color] || 'bg-slate-500';
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Recruiter Dashboard</h1>
        <p className="text-sm sm:text-base text-slate-500">Welcome back, {user?.fullName || 'Recruiter'}!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white ${stat.bgColor}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">
                  {stat.value}{stat.suffix || ''}
                </p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-100">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Quick Actions</h2>
          <div className="space-y-2 sm:space-y-3">
            <Link href="/recruiter/jobs" className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <FaBriefcase className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base text-slate-700">Post New Job</span>
            </Link>
            <Link href="/recruiter/applicants" className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <FaUsers className="text-purple-600 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base text-slate-700">View Applicants</span>
            </Link>
            <Link href="/recruiter/screening" className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <FaFileAlt className="text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base text-slate-700">Run Screening</span>
            </Link>
            <Link href="/recruiter/shortlist" className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <FaCheckCircle className="text-orange-600 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base text-slate-700">View Shortlist</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-100">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Candidate Status</h2>
          <div className="space-y-2 sm:space-y-3">
            {Object.entries(stats?.statusBreakdown || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-lg">
                <span className="text-sm sm:text-base text-slate-700 capitalize">{status}</span>
                <span className="font-semibold text-slate-900">{count}</span>
              </div>
            ))}
            {(!stats?.statusBreakdown || Object.keys(stats.statusBreakdown).length === 0) && (
              <p className="text-slate-500 text-center py-4">No candidates yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}