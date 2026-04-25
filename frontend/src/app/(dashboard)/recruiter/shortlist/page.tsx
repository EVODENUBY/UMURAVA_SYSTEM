"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { api, ENDPOINTS } from '@/lib/api';
import { FaUser, FaStar, FaCheck, FaTimes, FaEnvelope, FaSearch, FaFilter, FaChartBar, FaSortAmountDown } from 'react-icons/fa';
import { SkeletonTable } from '@/components/ui/Skeleton';

interface Job {
  _id: string;
  title: string;
}

interface ShortlistedCandidate {
  _id: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantSkills: string[];
  jobId: string;
  jobTitle: string;
  score: number;
  ranking: number;
  status: string;
  strengths: string[];
  gaps: string[];
  reasoning: string;
  matchDetails?: {
    skillsMatch?: number;
    experienceMatch?: number;
    educationMatch?: number;
    overallMatch?: number;
  };
  recommendation?: string;
  createdAt?: string;
}

interface Statistics {
  highestScore: number;
  lowestScore: number;
  averageScore: number;
  total: number;
  shortlistedCount?: number;
  nonShortlistedCount?: number;
}

export default function ShortlistPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [allCandidates, setAllCandidates] = useState<ShortlistedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<ShortlistedCandidate | null>(null);
  const [compareMode, setCompareMode] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [loadingComparison, setLoadingComparison] = useState(false);

  const fetchJobs = async (): Promise<void> => {
    try {
      const response = await api.get<{ success: boolean; data: { jobs: Job[] } }>(ENDPOINTS.JOBS.ALL, token || undefined);
      if (response.success) {
        setJobs(response.data.jobs);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      let endpoint = selectedJob 
        ? ENDPOINTS.SHORTLIST.JOB(selectedJob)
        : ENDPOINTS.SHORTLIST.LIST;
      
      const response = await api.get<{ 
        success: boolean; 
        data: any; 
        statistics?: Statistics;
      }>(endpoint, token || undefined);
      
      if (response.success) {
        const candidates = response.data.allCandidates || response.data || [];
        setAllCandidates(candidates);
        
        if (response.data.statistics) {
          setStatistics(response.data.statistics);
        } else if (response.statistics) {
          setStatistics(response.statistics);
        } else {
          const scores = candidates.map((c: any) => c.score);
          setStatistics({
            highestScore: scores.length > 0 ? Math.max(...scores) : 0,
            lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
            averageScore: scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0,
            total: candidates.length
          });
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch results:', error);
      showToast(error?.response?.data?.error?.message || 'Failed to fetch results', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [token]);

  useEffect(() => {
    fetchResults();
  }, [selectedJob]);

  const filteredCandidates = useMemo(() => {
    let filtered = [...allCandidates];
    
    if (viewMode === 'shortlisted') {
      filtered = filtered.filter(c => ['shortlisted', 'interview', 'offer'].includes(c.status));
    } else if (viewMode === 'nonShortlisted') {
      filtered = filtered.filter(c => ['pending', 'rejected'].includes(c.status));
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.applicantName.toLowerCase().includes(query) ||
        c.applicantEmail.toLowerCase().includes(query) ||
        c.applicantSkills?.some(s => s.toLowerCase().includes(query))
      );
    }
    
    if (scoreFilter !== 'all') {
      const [min, max] = scoreFilter.split('-').map(Number);
      filtered = filtered.filter(c => c.score >= min && c.score <= max);
    }
    
    if (skillFilter) {
      const query = skillFilter.toLowerCase();
      filtered = filtered.filter(c => 
        c.applicantSkills?.some(s => s.toLowerCase().includes(query))
      );
    }
    
    switch (sortBy) {
      case 'score':
        filtered.sort((a, b) => b.score - a.score);
        break;
      case 'name':
        filtered.sort((a, b) => a.applicantName.localeCompare(b.applicantName));
        break;
      case 'ranking':
        filtered.sort((a, b) => a.ranking - b.ranking);
        break;
    }
    
    return filtered;
  }, [allCandidates, viewMode, searchQuery, scoreFilter, skillFilter, sortBy]);

  const toggleCompare = (id: string): void => {
    if (compareMode.includes(id)) {
      setCompareMode(compareMode.filter(c => c !== id));
    } else if (compareMode.length < 4) {
      setCompareMode([...compareMode, id]);
    }
  };

  const performComparison = async () => {
    if (compareMode.length < 2) {
      alert('Please select at least 2 candidates to compare');
      return;
    }

    setLoadingComparison(true);
    try {
      const response = await api.post<{ success: boolean; data: any }>(
        '/shortlist/compare',
        { applicantIds: compareMode },
        token || undefined
      );
      if (response.success) {
        setComparisonData(response.data);
        setShowComparisonModal(true);
      }
    } catch (error) {
      console.error('Failed to compare candidates:', error);
      alert('Failed to compare candidates');
    } finally {
      setLoadingComparison(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Candidates</h1>
          <p className="text-sm sm:text-base text-slate-500">View and manage shortlisted candidates</p>
        </div>
      </div>

      {statistics && !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 sm:p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <FaChartBar className="text-blue-100" />
              <span className="text-xs sm:text-sm text-blue-100">Total</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{statistics.total}</p>
            <p className="text-xs text-blue-100 mt-1">Candidates</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 sm:p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <FaStar className="text-green-100" />
              <span className="text-xs sm:text-sm text-green-100">Highest</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{statistics.highestScore}%</p>
            <p className="text-xs text-green-100 mt-1">Top Score</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 sm:p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <FaStar className="text-orange-100" />
              <span className="text-xs sm:text-sm text-orange-100">Lowest</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{statistics.lowestScore}%</p>
            <p className="text-xs text-orange-100 mt-1">Min Score</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 sm:p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <FaChartBar className="text-purple-100" />
              <span className="text-xs sm:text-sm text-purple-100">Average</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{statistics.averageScore}%</p>
            <p className="text-xs text-purple-100 mt-1">Avg Score</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Jobs</option>
            {jobs.map(job => (
              <option key={job._id} value={job._id}>{job.title}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('shortlisted')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${viewMode === 'shortlisted' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Shortlisted
            </button>
            <button
              onClick={() => setViewMode('nonShortlisted')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${viewMode === 'nonShortlisted' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Non-Shortlisted
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${viewMode === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              All
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Scores</option>
            <option value="80-100">80-100% (Excellent)</option>
            <option value="60-79">60-79% (Good)</option>
            <option value="40-59">40-59% (Fair)</option>
            <option value="0-39">Below 40%</option>
          </select>
          <input
            type="text"
            placeholder="Filter by skill..."
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
            <option value="ranking">Sort by Ranking</option>
          </select>
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <SkeletonTable rows={8} cols={6} />
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <FaStar className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No candidates found</p>
          <p className="text-sm text-slate-400 mt-2">Try adjusting your filters or run screening for a job</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600 w-10">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCompareMode(filteredCandidates.map(c => c._id));
                        } else {
                          setCompareMode([]);
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600">#</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600">Candidate</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600 hidden md:table-cell">Job</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600 hidden lg:table-cell">Skills</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600">Score</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600">Status</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600 hidden md:table-cell">Strengths</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate._id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${compareMode.includes(candidate._id) ? 'bg-blue-50' : ''}`}>
                    <td className="p-3 sm:p-4">
                      <input
                        type="checkbox"
                        checked={compareMode.includes(candidate._id)}
                        onChange={() => toggleCompare(candidate._id)}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                    </td>
                    <td className="p-3 sm:p-4">
                      <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${candidate.ranking <= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                        {candidate.ranking}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4">
                      <p className="font-medium text-slate-900 text-sm">{candidate.applicantName}</p>
                      <p className="text-xs sm:text-sm text-slate-500">{candidate.applicantEmail}</p>
                    </td>
                    <td className="p-3 sm:p-4 hidden md:table-cell">
                      <p className="text-sm text-slate-600 truncate max-w-[150px]">{candidate.jobTitle}</p>
                    </td>
                    <td className="p-3 sm:p-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {candidate.applicantSkills?.slice(0, 2).map(skill => (
                          <span key={skill} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{skill}</span>
                        ))}
                        {candidate.applicantSkills?.length > 2 && <span className="text-xs text-slate-500">+{candidate.applicantSkills.length - 2}</span>}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 sm:w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${candidate.score}%` }} />
                        </div>
                        <span className={`px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium ${getScoreColor(candidate.score)}`}>
                          {candidate.score}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(candidate.status)}`}>
                        {candidate.status}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {candidate.strengths?.slice(0, 2).map(s => (
                          <span key={s} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setSelectedCandidate(candidate)}
                          className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          View
                        </button>
                        <button
                          onClick={() => toggleCompare(candidate._id)}
                          className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg ${
                            compareMode.includes(candidate._id)
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Compare"
                        >
                          {compareMode.includes(candidate._id) ? '✓' : '⚖'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing {filteredCandidates.length} of {allCandidates.length} candidates
            </p>
          </div>
        </div>
      )}

      {compareMode.length >= 2 && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white rounded-xl shadow-xl border border-slate-200 p-3 sm:p-4 w-64 sm:w-72 max-w-[calc(100vw-2rem)]">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">Compare ({compareMode.length})</h3>
            <button onClick={() => setCompareMode([])} className="text-slate-400 hover:text-slate-600 text-sm">×</button>
          </div>
          <div className="space-y-1 sm:space-y-2 mb-3 max-h-24 overflow-y-auto">
            {compareMode.map(id => {
              const candidate = allCandidates.find(c => c._id === id);
              return candidate ? (
                <div key={id} className="text-xs text-slate-600 truncate">
                  {candidate.applicantName} - {candidate.score}%
                </div>
              ) : null;
            })}
          </div>
          <button
            onClick={performComparison}
            disabled={loadingComparison}
            className="w-full py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-xs sm:text-sm"
          >
            {loadingComparison ? 'Comparing...' : 'Compare Selected'}
          </button>
        </div>
      )}

      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">{selectedCandidate.applicantName}</h2>
                <p className="text-sm text-slate-500 hidden sm:block">{selectedCandidate.jobTitle}</p>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-xl">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">{selectedCandidate.score}%</p>
                  <p className="text-xs sm:text-sm text-slate-500">Match Score</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-slate-50 rounded-xl">
                  <p className="text-2xl sm:text-3xl font-bold">#{selectedCandidate.ranking}</p>
                  <p className="text-xs sm:text-sm text-slate-500">Ranking</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-green-50 rounded-xl">
                  <p className="text-sm sm:text-lg font-semibold text-green-700">
                    {selectedCandidate.score >= 80 ? 'Strong' : selectedCandidate.score >= 60 ? 'Consider' : 'Low'}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">Recommendation</p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <a
                  href={`mailto:${selectedCandidate.applicantEmail}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                >
                  <FaEnvelope /> Email
                </a>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2 sm:mb-3 text-sm sm:text-base">Why shortlisted</h3>
                <div className="p-3 sm:p-4 bg-slate-50 rounded-lg text-slate-700 text-sm whitespace-pre-wrap">
                  {selectedCandidate.reasoning}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2 sm:mb-3 text-sm sm:text-base">Strengths</h3>
                <div className="space-y-2">
                  {selectedCandidate.strengths?.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <FaCheck className="text-green-500 mt-0.5 sm:mt-1" />
                      <span className="text-slate-700 text-sm">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedCandidate.gaps?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2 sm:mb-3 text-sm sm:text-base">Gaps</h3>
                  <div className="space-y-2">
                    {selectedCandidate.gaps?.map((g, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <FaTimes className="text-red-500 mt-0.5 sm:mt-1" />
                        <span className="text-slate-700 text-sm">{g}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showComparisonModal && comparisonData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Candidate Comparison</h2>
                <p className="text-sm text-slate-500">Comparing {compareMode.length} shortlisted candidates</p>
              </div>
              <button onClick={() => { setShowComparisonModal(false); setComparisonData(null); }} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              {comparisonData.comparison?.map((item: any, index: number) => (
                <div key={item.applicantId} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-500' : 'bg-slate-400'
                    }`}>
                      {index + 1}
                    </span>
                    <h3 className="font-semibold text-slate-900">{item.applicantName}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{item.score}% match</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2">Strengths</h4>
                      <div className="space-y-1">
                        {item.strengths?.map((strength: string, i: number) => (
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
                        {item.comparisonNotes?.map((note: string, i: number) => (
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

              {comparisonData.overallRecommendation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Overall Recommendation</h3>
                  <p className="text-blue-800">{comparisonData.overallRecommendation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}