"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, ENDPOINTS } from '@/lib/api';
import { FaUsers, FaBriefcase, FaChartLine, FaClipboardList, FaUserGraduate, FaUserTie, FaShieldAlt, FaArrowUp, FaArrowDown, FaClock, FaCheckCircle, FaTimesCircle, FaUserCheck, FaUserSlash } from 'react-icons/fa';
import { SkeletonCard } from '@/components/ui/Skeleton';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalJobs: number;
  totalApplicants: number;
  totalRecruiters: number;
  activeJobs: number;
  pendingScreenings: number;
  recentUsers: { id: string; fullName: string; email: string; role: string; isActive: boolean; createdAt: string }[];
  recentJobs: { id: string; title: string; status: string; createdAt: string }[];
  recentActivity: {
    users: number;
    jobs: number;
  };
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: DashboardStats }>(ENDPOINTS.ADMIN.DASHBOARD, token || undefined);
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <FaUsers className="w-5 h-5" />,
      color: 'bg-blue-500',
      href: '/admin/users',
    },
    {
      title: 'Recruiters',
      value: stats?.totalRecruiters || 0,
      icon: <FaUserTie className="w-5 h-5" />,
      color: 'bg-purple-500',
      href: '/admin/users?role=recruiter',
    },
    {
      title: 'Applicants',
      value: stats?.totalApplicants || 0,
      icon: <FaUserGraduate className="w-5 h-5" />,
      color: 'bg-cyan-500',
      href: '/admin/users?role=applicant',
    },
    {
      title: 'Total Jobs',
      value: stats?.totalJobs || 0,
      icon: <FaBriefcase className="w-5 h-5" />,
      color: 'bg-green-500',
      href: '/admin/jobs',
    },
    {
      title: 'Active Jobs',
      value: stats?.activeJobs || 0,
      icon: <FaClipboardList className="w-5 h-5" />,
      color: 'bg-yellow-500',
      href: '/admin/jobs?status=published',
    },
    {
      title: 'Pending Screenings',
      value: stats?.pendingScreenings || 0,
      icon: <FaClock className="w-5 h-5" />,
      color: 'bg-orange-500',
      href: '/admin/jobs',
    },
  ];

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back, {user?.fullName || 'Admin'}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">System Status</p>
          <p className="text-green-600 font-medium flex items-center gap-2 justify-end">
            <FaCheckCircle className="w-4 h-4" />
            All Systems Operational
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            href={stat.href || '#'}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value.toLocaleString()}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color} text-white`}>
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Users */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Users</h2>
            <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {stats?.recentUsers?.length === 0 ? (
              <p className="text-slate-500 text-sm">No recent users</p>
            ) : (
              stats?.recentUsers?.slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                      {u.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{u.fullName || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">{u.role}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {u.isActive ? <FaUserCheck className="w-3 h-3" /> : <FaUserSlash className="w-3 h-3" />}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Jobs</h2>
            <Link href="/admin/jobs" className="text-sm text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {stats?.recentJobs?.length === 0 ? (
              <p className="text-slate-500 text-sm">No recent jobs</p>
            ) : (
              stats?.recentJobs?.slice(0, 5).map((j) => (
                <div key={j.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{j.title}</p>
                    <p className="text-xs text-slate-500">{j.createdAt ? new Date(j.createdAt).toLocaleDateString() : ''}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    j.status === 'published' ? 'bg-green-100 text-green-700' :
                    j.status === 'draft' ? 'bg-slate-100 text-slate-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {j.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/users"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FaUsers className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-slate-700">Manage Users</span>
          </Link>
          <Link
            href="/admin/jobs"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-colors group"
          >
            <div className="p-3 rounded-full bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <FaBriefcase className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-slate-700">Manage Jobs</span>
          </Link>
          <Link
            href="/admin/settings"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
          >
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <FaShieldAlt className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-slate-700">Settings</span>
          </Link>
          <Link
            href="/admin/analytics"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors group"
          >
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white transition-colors">
              <FaChartLine className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-slate-700">Analytics</span>
          </Link>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Umurava AI Admin</h2>
            <p className="text-blue-200 text-sm mt-1">Version 1.0.0</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-200">Logged in as</p>
            <p className="font-medium">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
