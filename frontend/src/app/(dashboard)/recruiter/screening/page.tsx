"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, ENDPOINTS } from '@/lib/api';
import { FaPlay, FaSearch, FaFilter, FaUser, FaStar, FaExclamationTriangle, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { SkeletonTable, SkeletonCard } from '@/components/ui/Skeleton';

interface Job {
  _id: string;
  title: string;
  status: string;
}

interface ScreeningResult {
  _id: string;
  applicantId: { _id: string; name: string; email: string; skills: string[]; experience: { years: number }; education: unknown[] };
  score: number;
  ranking: number;
  status: string;
  strengths: string[];
  gaps: string[];
  reasoning: string;
  matchDetails: {
    skillsMatch: number;
    experienceMatch: number;
    educationMatch: number;
    overallMatch: number;
  };
}

interface ScreeningStats {
  totalCandidates: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  shortlistedCount: number;
  rejectedCount: number;
  pendingCount: number;
  interviewCount: number;
}

export default function ScreeningPage() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [results, setResults] = useState<ScreeningResult[]>([]);
  const [stats, setStats] = useState<ScreeningStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ScreeningResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchJobs();
  }, [token]);

  useEffect(() => {
    if (selectedJob) {
      fetchResults();
    }
  }, [selectedJob, currentPage]);

  const fetchJobs = async () => {
    try {
      const response = await api.get<{ success: boolean; data: { jobs: Job[] } }>(`${ENDPOINTS.JOBS.ALL}?status=published`, token || undefined);
      if (response.success) {
        setJobs(response.data.jobs);
        if (response.data.jobs.length > 0) {
          setSelectedJob(response.data.jobs[0]._id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const fetchResults = async () => {
    if (!selectedJob) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', ITEMS_PER_PAGE.toString());
      
      const resultsResponse = await api.get<{ success: boolean; data: { results: ScreeningResult[]; total: number; pages: number } }>(
        `${ENDPOINTS.SCREENING.RESULTS(selectedJob)}?${params.toString()}`,
        token || undefined
      );
      if (resultsResponse.success) {
        setResults(resultsResponse.data.results);
        setTotalResults(resultsResponse.data.total || 0);
        setTotalPages(resultsResponse.data.pages || 1);
      }

      const statsResponse = await api.get<{ success: boolean; data: { statistics: ScreeningStats } }>(
        ENDPOINTS.SCREENING.STATS(selectedJob),
        token || undefined
      );
      if (statsResponse.success) {
        setStats(statsResponse.data.statistics);
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  const runScreening = async () => {
    if (!selectedJob) return;
    setRunning(true);
    try {
      const response = await api.post<{ success: boolean }>(ENDPOINTS.SCREENING.RUN, { jobId: selectedJob }, token || undefined);
      if (response.success) {
        fetchResults();
      }
    } catch (error) {
      console.error('Failed to run screening:', error);
    } finally {
      setRunning(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-blue-100 text-blue-700';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-green-100 text-green-700';
      case 'interview':
        return 'bg-purple-100 text-purple-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">AI Screening</h1>
          <p className="text-sm sm:text-base text-slate-500">Run AI-powered candidate screening</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
          <select
            value={selectedJob}
            onChange={(e) => { setSelectedJob(e.target.value); setCurrentPage(1); }}
            className="px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-sm sm:text-base w-full sm:w-auto"
          >
            <option value="">Select Job</option>
            {jobs.map(job => (
              <option key={job._id} value={job._id}>{job.title}</option>
            ))}
          </select>
          <button
            onClick={runScreening}
            disabled={!selectedJob || running}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <FaPlay /> {running ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      {selectedJob && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-100 text-center">
            <p className="text-lg sm:text-2xl font-bold text-slate-900">{stats.totalCandidates}</p>
            <p className="text-xs sm:text-sm text-slate-500">Total</p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-100 text-center">
            <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.averageScore}%</p>
            <p className="text-xs sm:text-sm text-slate-500">Avg Score</p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-100 text-center">
            <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.highestScore}%</p>
            <p className="text-xs sm:text-sm text-slate-500">Highest</p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-100 text-center">
            <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.lowestScore}%</p>
            <p className="text-xs sm:text-sm text-slate-500">Lowest</p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-100 text-center">
            <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.shortlistedCount}</p>
            <p className="text-xs sm:text-sm text-slate-500">Shortlisted</p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-100 text-center">
            <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.rejectedCount}</p>
            <p className="text-xs sm:text-sm text-slate-500">Rejected</p>
          </div>
        </div>
      )}

      {!selectedJob ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <FaUser className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Select a job to view screening results</p>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto max-h-[60vh]">
            <SkeletonTable rows={8} cols={6} className="p-4" />
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <FaUser className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No screening results yet</p>
          <p className="text-sm text-slate-400 mt-2">Run screening to generate results</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full min-w-[550px]">
              <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600">Rank</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600">Candidate</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600 hidden sm:table-cell">Score</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600">Status</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600 hidden md:table-cell">Strengths</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result._id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-3 sm:p-4">
                      <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${
                        result.ranking <= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {result.ranking}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4">
                      <p className="font-medium text-slate-900 text-sm">{result.applicantId?.name}</p>
                      <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">{result.applicantId?.email}</p>
                    </td>
                    <td className="p-3 sm:p-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-12 sm:w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${result.score}%` }} />
                        </div>
                        <span className={`px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium ${getScoreColor(result.score)}`}>
                          {result.score}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(result.status)}`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {result.strengths?.slice(0, 2).map(s => (
                          <span key={s} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <button
                        onClick={() => setSelectedResult(result)}
                        className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalResults)} of {totalResults} results
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaAngleLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaAngleRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">{selectedResult.applicantId?.name}</h2>
                <p className="text-sm text-slate-500 hidden sm:block">{selectedResult.applicantId?.email}</p>
              </div>
              <button onClick={() => setSelectedResult(null)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex-1 text-center p-3 sm:p-4 bg-blue-50 rounded-xl">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">{selectedResult.score}%</p>
                  <p className="text-xs sm:text-sm text-slate-500">Match Score</p>
                </div>
                <div className="flex-1 text-center p-3 sm:p-4 bg-slate-50 rounded-xl">
                  <p className="text-2xl sm:text-3xl font-bold">#{selectedResult.ranking}</p>
                  <p className="text-xs sm:text-sm text-slate-500">Ranking</p>
                </div>
                <div className="flex-1 text-center p-3 sm:p-4 bg-green-50 rounded-xl">
                  <p className="text-sm sm:text-lg font-semibold text-green-700">
                    {selectedResult.score >= 80 ? 'Strong' : selectedResult.score >= 60 ? 'Good' : 'Low'}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">Status</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Key Strengths</p>
                <div className="flex flex-wrap gap-2">
                  {selectedResult.strengths?.map(s => (
                    <span key={s} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm">{s}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Gaps / Areas for Improvement</p>
                <div className="flex flex-wrap gap-2">
                  {selectedResult.gaps?.map(g => (
                    <span key={g} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs sm:text-sm">{g}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">AI Reasoning</p>
                <div className="p-3 sm:p-4 bg-slate-50 rounded-lg text-slate-700 text-sm">
                  {selectedResult.reasoning}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}