"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { api } from '@/lib/api';
import { FaPlay, FaSearch, FaFilter, FaUser, FaStar, FaExclamationTriangle, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { SkeletonTable, SkeletonCard } from '@/components/ui/Skeleton';

interface Job {
  _id: string;
  title: string;
  status: string;
}

interface ScreeningResult {
  _id: string;
  applicantId: { _id: string; name: string; email: string; skills: string[]; experience: { years: number }; education: unknown[]; skillDetails?: Array<{ name: string; level: string; yearsOfExperience: number }>; languages?: Array<{ name: string; proficiency: string }> } | null;
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
  biasAlerts?: Array<{
    type: string;
    severity: string;
    description: string;
    suggestion: string;
  }>;
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
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [results, setResults] = useState<ScreeningResult[]>([]);
  const [stats, setStats] = useState<ScreeningStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ScreeningResult | null>(null);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const fetchJobs = async () => {
    try {
      const response = await api.get<{ success: boolean; data: { jobs: Job[] } }>('/jobs/all?status=published', token || undefined);
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
        `/screening/results/${selectedJob}?${params.toString()}`,
        token || undefined
      );
      if (resultsResponse.success) {
        setResults(resultsResponse.data.results);
        setTotalResults(resultsResponse.data.total || 0);
        setTotalPages(resultsResponse.data.pages || 1);
      }

      const statsResponse = await api.get<{ success: boolean; data: { statistics: ScreeningStats } }>(
        `/screening/stats/${selectedJob}`,
        token || undefined
      );
      if (statsResponse.success) {
        setStats(statsResponse.data.statistics);
      }
    } catch (error) {
      console.error('Failed to fetch screening data:', error);
      showToast('Failed to load screening results', 'error');
    } finally {
      setLoading(false);
    }
  };

  const runScreening = async () => {
    if (!selectedJob) return;
    setRunning(true);
    try {
      const response = await api.post<{ success: boolean }>('/screening/run', { jobId: selectedJob }, token || undefined);
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

  useEffect(() => {
    fetchJobs();
  }, [token]);

  useEffect(() => {
    if (selectedJob) {
      fetchResults();
    }
  }, [selectedJob, currentPage]);

  const updateCandidateStatus = async (applicantId: string, newStatus: string) => {
    try {
      await api.put(`/screening/status/${selectedJob}/${applicantId}`, { status: newStatus }, token || undefined);
      fetchResults();
      showToast(`Candidate status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Failed to update status:', error);
      showToast('Failed to update candidate status', 'error');
    }
  };

  const rerunScreening = async () => {
    if (!selectedJob) return;
    setRunning(true);
    try {
      const response = await api.post<{ success: boolean }>(`/screening/rerun/${selectedJob}`, {}, token || undefined);
      if (response.success) {
        fetchResults();
        showToast('Screening re-run completed', 'success');
      }
    } catch (error) {
      console.error('Failed to re-run screening:', error);
      showToast('Failed to re-run screening', 'error');
    } finally {
      setRunning(false);
    }
  };

  const compareCandidates = async () => {
    if (selectedForComparison.length < 2) {
      showToast('Please select at least 2 candidates to compare', 'warning');
      return;
    }
    try {
      const response = await api.post<{ success: boolean; data: any }>(
        `/screening/compare/${selectedJob}`,
        { applicantIds: selectedForComparison },
        token || undefined
      );
      if (response.success) {
        setComparisonResult(response.data);
        setShowComparison(true);
      }
    } catch (error) {
      console.error('Failed to compare candidates:', error);
      showToast('Failed to compare candidates', 'error');
    }
  };

  const generateInterviewQuestions = async (applicantId: string) => {
    if (!selectedJob) return;
    setLoadingQuestions(true);
    try {
      const response = await api.get<{ success: boolean; data: { questions: string[] } }>(
        `/chat/questions/${selectedJob}/${applicantId}`,
        token || undefined
      );
      if (response.success) {
        setInterviewQuestions(response.data.questions);
      }
    } catch (error) {
      console.error('Failed to generate questions:', error);
      showToast('Failed to generate interview questions', 'error');
    } finally {
      setLoadingQuestions(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">AI Screening</h1>
          <p className="text-sm sm:text-base text-slate-500">Run AI-powered candidate screening</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
          <select
            value={selectedJob}
            onChange={(e) => { setSelectedJob(e.target.value); setCurrentPage(1); setSelectedForComparison([]); }}
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
          <button
            onClick={rerunScreening}
            disabled={!selectedJob || running || results.length === 0}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <FaPlay /> Re-run
          </button>
          {selectedForComparison.length > 0 && (
            <button
              onClick={compareCandidates}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <FaUser /> Compare ({selectedForComparison.length})
            </button>
          )}
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
            <table className="w-full min-w-[650px]">
              <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={selectedForComparison.length === results.filter(r => r.applicantId?._id).length && results.filter(r => r.applicantId?._id).length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedForComparison(results.filter(r => r.applicantId?._id).map(r => r.applicantId!._id));
                        } else {
                          setSelectedForComparison([]);
                        }
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600">Rank</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600">Candidate</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600 hidden sm:table-cell">Score</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600">Status</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600 hidden lg:table-cell">API Match</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600 hidden md:table-cell">Strengths</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result._id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-3 sm:p-4">
                      <input
                        type="checkbox"
                        checked={result.applicantId?._id ? selectedForComparison.includes(result.applicantId._id) : false}
                        onChange={(e) => {
                          if (result.applicantId?._id) {
                            if (e.target.checked) {
                              setSelectedForComparison(prev => [...prev, result.applicantId!._id]);
                            } else {
                              setSelectedForComparison(prev => prev.filter(id => id !== result.applicantId!._id));
                            }
                          }
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        disabled={!result.applicantId?._id}
                      />
                    </td>
                    <td className="p-3 sm:p-4">
                      <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${
                        result.ranking <= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {result.ranking}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4">
                      <p className="font-medium text-slate-900 text-sm">{result.applicantId?.name || 'Applicant Data Unavailable'}</p>
                      <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">{result.applicantId?.email || 'Contact support if issue persists'}</p>
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
                      <select
                        value={result.status}
                        onChange={(e) => result.applicantId?._id && updateCandidateStatus(result.applicantId._id, e.target.value)}
                        className="px-2 py-1 border border-slate-200 rounded text-xs font-medium capitalize focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={!result.applicantId?._id}
                      >
                        <option value="pending">Pending</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview">Interview</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="p-3 sm:p-4 hidden lg:table-cell">
                      {result.matchDetails && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-500">Skills:</span>
                            <span className={`text-xs font-medium ${result.matchDetails.skillsMatch >= 70 ? 'text-green-600' : result.matchDetails.skillsMatch >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {result.matchDetails.skillsMatch}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-500">Exp:</span>
                            <span className={`text-xs font-medium ${result.matchDetails.experienceMatch >= 70 ? 'text-green-600' : result.matchDetails.experienceMatch >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {result.matchDetails.experienceMatch}%
                            </span>
                          </div>
                        </div>
                      )}
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

      {showComparison && comparisonResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Candidate Comparison</h2>
                <p className="text-sm text-slate-500">Comparing {selectedForComparison.length} candidates</p>
              </div>
              <button onClick={() => { setShowComparison(false); setComparisonResult(null); }} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              {comparisonResult.candidates?.map((candidate: any, index: number) => (
                <div key={candidate.applicantId} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-500' : 'bg-slate-400'
                    }`}>
                      {index + 1}
                    </span>
                    <h3 className="font-semibold text-slate-900">{candidate.name}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{candidate.score}%</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2">Strengths</h4>
                      <div className="space-y-1">
                        {candidate.strengths?.map((strength: string, i: number) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">•</span>
                            <span className="text-sm text-slate-600">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2">Comparison Notes</h4>
                      <div className="space-y-1">
                        {candidate.comparisonNotes?.map((note: string, i: number) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span className="text-sm text-slate-600">{note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {comparisonResult.overallRecommendation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Overall Recommendation</h3>
                  <p className="text-blue-800">{comparisonResult.overallRecommendation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">{selectedResult.applicantId?.name || 'Applicant Data Unavailable'}</h2>
                <p className="text-sm text-slate-500 hidden sm:block">{selectedResult.applicantId?.email || 'Contact support if issue persists'}</p>
              </div>
              <button onClick={() => setSelectedResult(null)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex-1 text-center p-3 sm:p-4 bg-blue-50 rounded-xl">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">{selectedResult.score}%</p>
                  <p className="text-xs sm:text-sm text-slate-500">Overall Match</p>
                </div>
                <div className="flex-1 text-center p-3 sm:p-4 bg-slate-50 rounded-xl">
                  <p className="text-2xl sm:text-3xl font-bold">#{selectedResult.ranking}</p>
                  <p className="text-xs sm:text-sm text-slate-500">Ranking</p>
                </div>
                <div className="flex-1 text-center p-3 sm:p-4 bg-green-50 rounded-xl">
                  <p className="text-sm sm:text-lg font-semibold text-green-700">
                    {selectedResult.score >= 80 ? 'Strong' : selectedResult.score >= 60 ? 'Good' : 'Low'}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">Recommendation</p>
                </div>
              </div>

              {selectedResult.matchDetails && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 text-sm sm:text-base">Detailed Match Analysis</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-lg font-bold text-blue-600">{selectedResult.matchDetails.skillsMatch}%</p>
                      <p className="text-xs text-slate-500">Skills Match</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-lg font-bold text-green-600">{selectedResult.matchDetails.experienceMatch}%</p>
                      <p className="text-xs text-slate-500">Experience Match</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-lg font-bold text-purple-600">{selectedResult.matchDetails.educationMatch}%</p>
                      <p className="text-xs text-slate-500">Education Match</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-lg font-bold text-orange-600">{selectedResult.matchDetails.overallMatch}%</p>
                      <p className="text-xs text-slate-500">Overall Match</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedResult.biasAlerts && selectedResult.biasAlerts.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 text-sm sm:text-base">Bias Alerts</h3>
                  <div className="space-y-3">
                    {selectedResult.biasAlerts.map((alert, index) => (
                      <div key={index} className={`p-3 rounded-lg border ${alert.severity === 'high' ? 'bg-red-50 border-red-200' : alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${alert.severity === 'high' ? 'bg-red-100 text-red-700' : alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className="font-medium text-slate-900 text-sm">{alert.type}</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">{alert.description}</p>
                        <p className="text-sm text-green-700"><strong>Suggestion:</strong> {alert.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

              <div className="flex gap-3">
                <button
                  onClick={() => selectedResult.applicantId?._id && generateInterviewQuestions(selectedResult.applicantId._id)}
                  disabled={loadingQuestions || !selectedResult.applicantId?._id}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
                >
                  {loadingQuestions ? 'Generating...' : 'Generate Interview Questions'}
                </button>
              </div>

              {interviewQuestions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Suggested Interview Questions</p>
                  <div className="space-y-2">
                    {interviewQuestions.map((question, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold text-sm">{index + 1}.</span>
                        <p className="text-slate-700 text-sm">{question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}