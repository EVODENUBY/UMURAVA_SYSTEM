"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { FaBriefcase, FaUsers, FaFileAlt, FaChartLine, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { SkeletonStats, SkeletonCard } from '@/components/ui/Skeleton';
import Link from 'next/link';

interface Analytics {
  overview: {
    totalJobs: number;
    totalApplicants: number;
    totalInternalApplicants: number;
    totalExternalApplicants: number;
    totalScreened: number;
  };
  averageScore: number;
  statusBreakdown: Record<string, number>;
  jobs: { _id: string; title: string; status: string }[];
}

interface JobAnalytics {
  job: {
    _id: string;
    title: string;
    status: string;
  };
  applicants: {
    total: number;
    internal: number;
    external: number;
  };
  screeningResults: Array<{
    _id: string;
    score: number;
    ranking?: number;
    status: string;
    strengths: string[];
    gaps: string[];
    reasoning: string;
    applicantId: {
      _id: string;
      name: string;
      email: string;
    };
  }>;
  rankedCandidates: Array<{
    _id: string;
    score: number;
    ranking: number;
    status: string;
    applicantId: {
      _id: string;
      name: string;
      email: string;
    };
  }>;
  scoreDistribution: Array<{
    _id: string;
    count: number;
  }>;
}

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [jobAnalytics, setJobAnalytics] = useState<JobAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingJob, setLoadingJob] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      const params = selectedJob ? `?jobId=${selectedJob}` : '';
      const response = await api.get<{ success: boolean; data: Analytics }>(
        `/analytics${params}`,
        token || undefined
      );
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [token, selectedJob]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const fetchJobAnalytics = async (jobId: string) => {
    setLoadingJob(true);
    try {
      const response = await api.get<{ success: boolean; data: JobAnalytics }>(
        `/analytics/jobs/${jobId}`,
        token || undefined
      );
      if (response.success) {
        setJobAnalytics(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch job analytics:', error);
    } finally {
      setLoadingJob(false);
    }
  };

  useEffect(() => {
    if (selectedJob) {
      fetchJobAnalytics(selectedJob);
    } else {
      setJobAnalytics(null);
    }
  }, [selectedJob, token]);

  const statCards = [
    {
      label: 'Total Jobs',
      value: analytics?.overview.totalJobs || 0,
      icon: <FaBriefcase />,
      bgColor: 'bg-blue-500',
      href: '/recruiter/jobs',
    },
    {
      label: 'Total Applicants',
      value: analytics?.overview.totalApplicants || 0,
      icon: <FaUsers />,
      bgColor: 'bg-purple-500',
      href: '/recruiter/applicants',
    },
    {
      label: 'Internal',
      value: analytics?.overview.totalInternalApplicants || 0,
      icon: <FaUsers />,
      bgColor: 'bg-green-500',
    },
    {
      label: 'External',
      value: analytics?.overview.totalExternalApplicants || 0,
      icon: <FaFileAlt />,
      bgColor: 'bg-orange-500',
    },
    {
      label: 'Screened',
      value: analytics?.overview.totalScreened || 0,
      icon: <FaChartLine />,
      bgColor: 'bg-cyan-500',
      href: '/recruiter/screening',
    },
    {
      label: 'Avg Score',
      value: `${analytics?.averageScore || 0}%`,
      icon: <FaChartLine />,
      bgColor: 'bg-indigo-500',
    },
  ];

  const statusStats = [
    { key: 'pending', label: 'Pending', icon: <FaClock />, color: 'yellow' },
    { key: 'shortlisted', label: 'Shortlisted', icon: <FaCheckCircle />, color: 'green' },
    { key: 'interview', label: 'Interview', icon: <FaUsers />, color: 'purple' },
    { key: 'offer', label: 'Offer', icon: <FaFileAlt />, color: 'blue' },
    { key: 'hired', label: 'Hired', icon: <FaCheckCircle />, color: 'emerald' },
    { key: 'rejected', label: 'Rejected', icon: <FaTimesCircle />, color: 'red' },
  ];

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
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-sm sm:text-base text-slate-500">Dashboard overview and insights</p>
        </div>
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-sm sm:text-base w-full sm:w-auto"
        >
          <option value="">All Jobs</option>
          {analytics?.jobs.map(job => (
            <option key={job._id} value={job._id}>{job.title}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mb-4 sm:mb-6">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            href={stat.href || '#'}
            className={`bg-white rounded-xl p-3 sm:p-5 shadow-sm border border-slate-100 hover:border-blue-300 transition-colors ${
              !stat.href ? 'cursor-default' : ''
            }`}
          >
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white mb-2 sm:mb-3 ${stat.bgColor}`}>
              {stat.icon}
            </div>
            <p className="text-lg sm:text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs sm:text-sm text-slate-500">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-100">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Candidate Pipeline</h2>
          <div className="space-y-2 sm:space-y-3">
            {statusStats.map((status) => {
              const count = analytics?.statusBreakdown?.[status.key] || 0;
              const percentage = analytics?.overview.totalApplicants
                ? Math.round((count / analytics.overview.totalApplicants) * 100)
                : 0;
              return (
                <div key={status.key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-${status.color}-500`}>{status.icon}</span>
                      <span className="text-slate-700 text-sm">{status.label}</span>
                    </div>
                    <span className="text-slate-900 font-medium text-sm">{count}</span>
                  </div>
                  <div className="w-full h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${status.color}-500 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-100">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Job Performance</h2>
          <div className="space-y-2 sm:space-y-3">
            {analytics?.jobs.slice(0, 5).map((job) => (
              <Link
                key={job._id}
                href={`/recruiter/jobs`}
                className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-900 text-sm">{job.title}</p>
                  <p className="text-xs sm:text-sm text-slate-500 capitalize">{job.status}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium
                  ${job.status === 'published' ? 'bg-green-100 text-green-700' : 
                    job.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-gray-100 text-gray-700'}`}>
                  {job.status}
                </span>
              </Link>
            ))}
            {(!analytics?.jobs || analytics.jobs.length === 0) && (
              <p className="text-slate-500 text-center py-4">No jobs yet</p>
            )}
          </div>
        </div>

        {selectedJob && jobAnalytics && (
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-100 mt-4 sm:mt-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">Job Analytics: {jobAnalytics.job.title}</h2>

            {loadingJob ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Applicant Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-xl">
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">{jobAnalytics.applicants.total}</p>
                    <p className="text-xs sm:text-sm text-slate-500">Total Applicants</p>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-green-50 rounded-xl">
                    <p className="text-xl sm:text-2xl font-bold text-green-600">{jobAnalytics.applicants.internal}</p>
                    <p className="text-xs sm:text-sm text-slate-500">Internal</p>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-xl">
                    <p className="text-xl sm:text-2xl font-bold text-purple-600">{jobAnalytics.applicants.external}</p>
                    <p className="text-xs sm:text-sm text-slate-500">External</p>
                  </div>
                </div>

                {/* Score Distribution */}
                {jobAnalytics.scoreDistribution && jobAnalytics.scoreDistribution.length > 0 && (
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-3">Score Distribution</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {jobAnalytics.scoreDistribution.map((dist, index) => (
                        <div key={index} className="text-center p-3 bg-slate-50 rounded-lg">
                          <p className="text-lg font-bold text-slate-900">{dist.count}</p>
                          <p className="text-xs text-slate-500">{dist._id}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Ranked Candidates */}
                {jobAnalytics.rankedCandidates && jobAnalytics.rankedCandidates.length > 0 && (
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-3">Top Ranked Candidates</h3>
                    <div className="space-y-2">
                      {jobAnalytics.rankedCandidates.slice(0, 5).map((candidate, index) => (
                        <div key={candidate._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-500' : 'bg-slate-400'
                            }`}>
                              #{candidate.ranking}
                            </span>
                            <div>
                              <p className="font-medium text-slate-900 text-sm">{candidate.applicantId.name}</p>
                              <p className="text-xs text-slate-500">{candidate.applicantId.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-blue-600">{candidate.score}%</p>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                              candidate.status === 'shortlisted' ? 'bg-green-100 text-green-700' :
                              candidate.status === 'interview' ? 'bg-purple-100 text-purple-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {candidate.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Screening Results */}
                {jobAnalytics.screeningResults && jobAnalytics.screeningResults.length > 0 && (
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-3">Recent Screening Results</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {jobAnalytics.screeningResults.slice(0, 10).map((result, index) => (
                        <div key={result._id} className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-slate-900 text-sm">{result.applicantId.name}</p>
                              <p className="text-xs text-slate-500">{result.applicantId.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-blue-600">{result.score}%</p>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                                result.status === 'shortlisted' ? 'bg-green-100 text-green-700' :
                                result.status === 'interview' ? 'bg-purple-100 text-purple-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {result.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {result.strengths.slice(0, 3).map((strength, i) => (
                              <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">{strength}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}