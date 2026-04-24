"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { api, ENDPOINTS } from '@/lib/api';
import { FaBriefcase, FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaMapMarker, FaClock, FaUsers, FaChartLine, FaAngleLeft, FaAngleRight, FaCheck, FaTimes, FaBuilding } from 'react-icons/fa';
import { SkeletonTable } from '@/components/ui/Skeleton';

interface Job {
  _id: string;
  title: string;
  employmentType: string;
  jobLevel: string;
  location: { city: string; country: string; remote: boolean };
  status: string;
  createdAt: string;
  createdBy: { fullName: string; email: string };
  stats?: {
    totalCandidates: number;
    averageScore: number;
    shortlistedCount: number;
    rejectedCount: number;
    biasAlertCount: number;
  };
}

const statusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  published: 'bg-green-100 text-green-700',
  closed: 'bg-red-100 text-red-600',
  archived: 'bg-yellow-100 text-yellow-700',
};

export default function AdminJobsPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page. toString());
      params. append('limit', '10');
      if (searchQuery) params. append('search', searchQuery);
      if (statusFilter) params. append('status', statusFilter);

      const response = await api.get<{ success: boolean; data: { jobs: Job[]; pagination: { page: number; limit: number; total: number; pages: number } } }>(ENDPOINTS.JOBS.ALL, token || undefined);
      const jobsArray = response. data?.jobs || [];
      setJobs(Array. isArray(jobsArray) ? jobsArray : []);
      setTotalPages(response. data?.pagination?.pages || 1);
      setTotalJobs(response. data?.pagination?.total || jobsArray.length || 0);
    } catch (error: any) {
      showToast(error. message || 'Failed to fetch jobs', 'error');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs(1);
  };

  const handleToggleStatus = async (job: Job) => {
    const newStatus = job.status === 'published' ? 'draft' : 'published';
    try {
      setSubmitting(true);
      await api.put(`${ENDPOINTS.JOBS.UPDATE(job._id)}`, { status: newStatus }, token || undefined);
      showToast(`Job ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`, 'success');
      fetchJobs(currentPage);
    } catch (error: any) {
      showToast(error.message || 'Failed to update job status', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      job.title?.toLowerCase().includes(query) ||
      job.createdBy?.fullName?.toLowerCase().includes(query) ||
      job.location?.city?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FaBriefcase className="text-blue-600" />
            Job Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage all job postings ({totalJobs} total)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by title, createdBy, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Job</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Recruiter</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Posted</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{job.title}</p>
                          <p className="text-slate-500 text-xs flex items-center gap-2 mt-1">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{job.employmentType}</span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{job.jobLevel}</span>
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                            {job.createdBy?.fullName?.charAt(0) || 'R'}
                          </div>
                          <div>
                            <p className="text-sm text-slate-900">{job.createdBy?.fullName || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{job.createdBy?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <FaMapMarker className="w-3 h-3 text-slate-400" />
                          {job.location?.city}, {job.location?.country}
                          {job.location?.remote && (
                            <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Remote</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[job.status] || 'bg-slate-100 text-slate-600'}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingJob(job)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(job)}
                            disabled={submitting}
                            className={`p-2 rounded-lg transition-colors ${
                              job.status === 'published'
                                ? 'text-slate-400 hover:text-yellow-600 hover:bg-yellow-50'
                                : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={job.status === 'published' ? 'Unpublish' : 'Publish'}
                          >
                            {job.status === 'published' ? (
                              <FaTimes className="w-4 h-4" />
                            ) : (
                              <FaCheck className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <FaAngleLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <FaAngleRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* View Job Modal */}
      {viewingJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{viewingJob.title}</h3>
                <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                  <FaBuilding className="w-3 h-3" />
                  {viewingJob.createdBy?.fullName}
                </p>
              </div>
              <button
                onClick={() => setViewingJob(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Employment Type</p>
                <p className="font-medium text-slate-900 mt-1">{viewingJob.employmentType}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Job Level</p>
                <p className="font-medium text-slate-900 mt-1">{viewingJob.jobLevel}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Location</p>
                <p className="font-medium text-slate-900 mt-1">{viewingJob.location?.city}, {viewingJob.location?.country}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Status</p>
                <span className={`inline-flex mt-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[viewingJob.status]}`}>
                  {viewingJob.status}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setViewingJob(null)}
                className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}