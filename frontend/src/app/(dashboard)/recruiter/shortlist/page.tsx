"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { FaUser, FaStar, FaCheck, FaTimes, FaEnvelope, FaPhone } from 'react-icons/fa';
import { SkeletonCard } from '@/components/ui/Skeleton';

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
}

export default function ShortlistPage() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [candidates, setCandidates] = useState<ShortlistedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<ShortlistedCandidate | null>(null);
  const [compareMode, setCompareMode] = useState<string[]>([]);

  useEffect(() => {
    fetchJobs();
  }, [token]);

  useEffect(() => {
    if (selectedJob) {
      fetchShortlist();
    } else {
      fetchAllShortlisted();
    }
  }, [selectedJob]);

  const fetchJobs = async () => {
    try {
      const response = await api.get<{ success: boolean; data: { jobs: Job[] } }>('/jobs/all', token || undefined);
      if (response.success) {
        setJobs(response.data.jobs);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const fetchShortlist = async () => {
    if (!selectedJob) return;
    setLoading(true);
    try {
      const data = await api.get<{ success: boolean; data: { shortlisted: ShortlistedCandidate[] } }>(
        `/shortlist/jobs/${selectedJob}`,
        token || undefined
      );
      if (data.success) {
        setCandidates(data.data.shortlisted);
      }
    } catch (error) {
      console.error('Failed to fetch shortlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllShortlisted = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: ShortlistedCandidate[] }>(
        '/shortlist',
        token || undefined
      );
      if (response.success) {
        setCandidates(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch shortlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCompare = (id: string) => {
    if (compareMode.includes(id)) {
      setCompareMode(compareMode.filter(c => c !== id));
    } else if (compareMode.length < 4) {
      setCompareMode([...compareMode, id]);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Shortlisted Candidates</h1>
          <p className="text-sm sm:text-base text-slate-500">Top candidates from AI screening</p>
        </div>
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-sm sm:text-base w-full sm:w-auto"
        >
          <option value="">All Jobs</option>
          {jobs.map(job => (
            <option key={job._id} value={job._id}>{job.title}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <FaStar className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No shortlisted candidates yet</p>
          <p className="text-sm text-slate-400 mt-2">Run screening to generate shortlist</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {candidates.map((candidate, index) => (
            <div
              key={candidate._id}
              className={`bg-white rounded-xl p-4 sm:p-6 shadow-sm border transition-all ${
                compareMode.includes(candidate._id) ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-100'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                    index < 3 ? 'bg-yellow-500' : 'bg-slate-600'
                  }`}>
                    {candidate.ranking}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900">{candidate.applicantName}</h3>
                      {candidate.score >= 80 && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Strong</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{candidate.applicantEmail}</p>
                    <p className="text-sm text-slate-500 hidden sm:block">{candidate.jobTitle}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {candidate.applicantSkills?.slice(0, 3).map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{skill}</span>
                      ))}
                      {candidate.applicantSkills?.length > 3 && <span className="text-xs text-slate-500">+{candidate.applicantSkills.length - 3}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right flex sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-2">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">{candidate.score}%</div>
                  <p className="text-xs sm:text-sm text-slate-500">Match</p>
                  <div className="flex gap-2 mt-1 sm:mt-2">
                    <button
                      onClick={() => setSelectedCandidate(candidate)}
                      className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
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
                    >
                      Compare
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100">
                <p className="text-xs sm:text-sm text-slate-500 mb-2">Strengths</p>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {candidate.strengths?.slice(0, 3).map(s => (
                    <span key={s} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">{s}</span>
                  ))}
                </div>
              </div>

              {candidate.gaps?.length > 0 && (
                <div className="mt-2 sm:mt-3">
                  <p className="text-xs sm:text-sm text-slate-500 mb-2">Gaps</p>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {candidate.gaps?.slice(0, 2).map(g => (
                      <span key={g} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">{g}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
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
              const candidate = candidates.find(c => c._id === id);
              return candidate ? (
                <div key={id} className="text-xs text-slate-600 truncate">
                  {candidate.applicantName}
                </div>
              ) : null;
            })}
          </div>
          <button
            onClick={() => alert('Compare functionality coming soon!')}
            className="w-full py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm"
          >
            Compare Selected
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
    </div>
  );
}