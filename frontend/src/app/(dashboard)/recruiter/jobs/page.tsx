"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { api, ENDPOINTS } from '@/lib/api';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaExclamationTriangle, FaChartBar, FaMapMarker, FaClock, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { SkeletonTable, SkeletonCard } from '@/components/ui/Skeleton';

interface Job {
  _id: string;
  title: string;
  description: string;
  employmentType: string;
  jobLevel: string;
  requiredSkills: string[];
  responsibilities: string[];
  experience: string;
  education: { degree: string; field: string; required: boolean; _id: string }[];
  certifications: string[];
  languages: string[];
  location: { address: string; city: string; country: string; remote: boolean };
  salary?: { min: number; max: number; currency: string };
  benefits: string[];
  tags: string[];
  applicationProcess: { steps: string[] };
  status: string;
  applicationDeadline: string;
  expirationDate?: string;
  countdown?: { expired: boolean; daysRemaining: number; hoursRemaining: number; endDate: string };
  createdAt?: string;
  updatedAt?: string;
}

const initialForm = {
  title: '',
  description: '',
  employmentType: 'full-time',
  jobLevel: 'mid',
  requiredSkills: [] as string[],
  responsibilities: [] as string[],
  experience: '',
  education: [] as { degree: string; field: string; required: boolean }[],
  certifications: [] as string[],
  languages: [] as string[],
  location: { address: '', city: '', country: '', remote: false },
  salary: { min: 0, max: 0, currency: 'USD' },
  benefits: [] as string[],
  applicationProcess: { steps: ['Apply', 'Screening', 'Interview', 'Offer'] },
  tags: [] as string[],
  applicationDeadline: '',
  expirationDate: '',
  status: 'draft',
};

const employmentTypes = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];
const jobLevels = ['entry', 'mid', 'senior', 'lead', 'executive'];
const statuses = ['draft', 'published', 'closed', 'archived'];
const currencies = ['USD', 'EUR', 'GBP', 'RWF', 'KES', 'NGN', 'ZAR'];

export default function JobsPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [form, setForm] = useState(initialForm);
  const [skillInput, setSkillInput] = useState('');
  const [respInput, setRespInput] = useState('');
  const [certInput, setCertInput] = useState('');
  const [langInput, setLangInput] = useState('');
  const [benefitInput, setBenefInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [eduInput, setEduInput] = useState({ degree: '', field: '', required: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [selectedJobForView, setSelectedJobForView] = useState<Job | null>(null);
  const [biasResults, setBiasResults] = useState<{ biasAlerts: { type: string; severity: string; description: string; suggestion: string }[]; alertCount: number; hasHighSeverity: boolean } | null>(null);
  const [jobBiasCounts, setJobBiasCounts] = useState<Record<string, { count: number; hasHigh: boolean }>>({});
  const [jobStats, setJobStats] = useState<{ jobId: string; title: string; statistics: { totalCandidates: number; averageScore: number; highestScore: number; lowestScore: number; shortlistedCount: number; rejectedCount: number; pendingCount: number; interviewCount: number; biasAlertCount: number } } | null>(null);
  const [loadingBias, setLoadingBias] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const ITEMS_PER_PAGE = 10;

  const showConfirmation = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage('');
  };

  useEffect(() => {
    const saved = localStorage.getItem('jobBiasCounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setJobBiasCounts(parsed);
      } catch (e) {
        console.error('Failed to parse saved bias counts', e);
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('jobBiasCounts', JSON.stringify(jobBiasCounts));
    } catch (e) {
      console.error('Failed to save bias counts', e);
    }
  }, [jobBiasCounts]);

  useEffect(() => {
    fetchJobs();
  }, [token, searchQuery, statusFilter, currentPage]);

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', currentPage.toString());
      params.append('limit', ITEMS_PER_PAGE.toString());
      const response = await api.get<{ success: boolean; data: { jobs: Job[]; total: number; pages: number } }>(`${ENDPOINTS.JOBS.ALL}${params.toString() ? `?${params.toString()}` : ''}`, token || undefined);
      if (response.success) {
        setJobs(response.data.jobs);
        setTotalJobs(response.data.total || 0);
        setTotalPages(response.data.pages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = {
        ...form,
        salary: form.salary?.min && form.salary?.max ? form.salary : null,
      };
      if (editingJob) {
        await api.put(ENDPOINTS.JOBS.UPDATE(editingJob._id), formData, token || undefined);
      } else {
        await api.post(ENDPOINTS.JOBS.CREATE, formData, token || undefined);
      }
      setShowModal(false);
      setForm(initialForm);
      setEditingJob(null);
      fetchJobs();
    } catch (error) {
      console.error('Failed to save job:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setForm({
      title: job.title,
      description: job.description,
      employmentType: job.employmentType,
      jobLevel: job.jobLevel,
      requiredSkills: job.requiredSkills || [],
      responsibilities: job.responsibilities || [],
      experience: job.experience || '',
      education: job.education || [],
      certifications: job.certifications || [],
      languages: job.languages || [],
      location: job.location || { address: '', city: '', country: '', remote: false },
      salary: job.salary || { min: 0, max: 0, currency: 'USD' },
      benefits: job.benefits || [],
      applicationProcess: job.applicationProcess || { steps: ['Apply', 'Screening', 'Interview', 'Offer'] },
      tags: job.tags || [],
      applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : '',
      expirationDate: job.expirationDate ? job.expirationDate.split('T')[0] : '',
      status: job.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    showConfirmation('Are you sure you want to delete this job?', async () => {
      try {
        await api.delete(ENDPOINTS.JOBS.DELETE(id), token || undefined);
        fetchJobs();
        showToast('Job deleted successfully', 'success');
      } catch (error) {
        console.error('Failed to delete job:', error);
        showToast('Failed to delete job', 'error');
      }
    });
  };

  const handleDetectBias = async (job: Job) => {
    setSelectedJobForView(job);
    setBiasResults(null);
    setJobStats(null);
    setLoadingBias(true);
    try {
      const response = await api.get<{ success: boolean; data: { biasAlerts: { type: string; severity: string; description: string; suggestion: string }[]; alertCount: number; hasHighSeverity: boolean } }>(
        ENDPOINTS.JOBS.BIAS(job._id),
        token || undefined
      );
      if (response.success) {
        setBiasResults(response.data);
        if (response.data.alertCount > 0) {
          setJobBiasCounts(prev => ({
            ...prev,
            [job._id]: { count: response.data.alertCount, hasHigh: response.data.hasHighSeverity }
          }));
        } else {
          const { [job._id]: removed, ...rest } = jobBiasCounts;
          setJobBiasCounts(rest);
          localStorage.setItem('jobBiasCounts', JSON.stringify(rest));
        }
      }
    } catch (error) {
      console.error('Failed to detect bias:', error);
    } finally {
      setLoadingBias(false);
    }
  };

  const handleGetStats = async (job: Job) => {
    setSelectedJobForView(job);
    setBiasResults(null);
    setJobStats(null);
    setLoadingStats(true);
    try {
      const response = await api.get<{ success: boolean; data: { jobId: string; title: string; statistics: { totalCandidates: number; averageScore: number; highestScore: number; lowestScore: number; shortlistedCount: number; rejectedCount: number; pendingCount: number; interviewCount: number; biasAlertCount: number } } }>(
        ENDPOINTS.JOBS.STATS(job._id),
        token || undefined
      );
      if (response.success) {
        setJobStats(response.data);
      }
    } catch (error) {
      console.error('Failed to get stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !form.requiredSkills.includes(skillInput.trim())) {
      setForm({ ...form, requiredSkills: [...form.requiredSkills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setForm({ ...form, requiredSkills: form.requiredSkills.filter(s => s !== skill) });
  };

  const addResp = () => {
    if (respInput.trim() && !form.responsibilities.includes(respInput.trim())) {
      setForm({ ...form, responsibilities: [...form.responsibilities, respInput.trim()] });
      setRespInput('');
    }
  };

  const removeResp = (resp: string) => {
    setForm({ ...form, responsibilities: form.responsibilities.filter(r => r !== resp) });
  };

  const addCert = () => {
    if (certInput.trim() && !form.certifications.includes(certInput.trim())) {
      setForm({ ...form, certifications: [...form.certifications, certInput.trim()] });
      setCertInput('');
    }
  };

  const removeCert = (cert: string) => {
    setForm({ ...form, certifications: form.certifications.filter(c => c !== cert) });
  };

  const addLang = () => {
    if (langInput.trim() && !form.languages.includes(langInput.trim())) {
      setForm({ ...form, languages: [...form.languages, langInput.trim()] });
      setLangInput('');
    }
  };

  const removeLang = (lang: string) => {
    setForm({ ...form, languages: form.languages.filter(l => l !== lang) });
  };

  const addBenefit = () => {
    if (benefitInput.trim() && !form.benefits.includes(benefitInput.trim())) {
      setForm({ ...form, benefits: [...form.benefits, benefitInput.trim()] });
      setBenefInput('');
    }
  };

  const removeBenefit = (benefit: string) => {
    setForm({ ...form, benefits: form.benefits.filter(b => b !== benefit) });
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter(t => t !== tag) });
  };

  const addEdu = () => {
    if (eduInput.degree.trim()) {
      setForm({ ...form, education: [...form.education, { ...eduInput, degree: eduInput.degree.trim(), field: eduInput.field.trim() }] });
      setEduInput({ degree: '', field: '', required: true });
    }
  };

  const removeEdu = (index: number) => {
    setForm({ ...form, education: form.education.filter((_, i) => i !== index) });
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <div className="h-6 w-24 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-10 w-24 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>

        <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="h-10 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto max-h-[60vh]">
            <SkeletonTable rows={8} cols={6} className="p-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Jobs</h1>
          <p className="text-sm sm:text-base text-slate-500">Manage your job postings</p>
        </div>
        <button
          onClick={() => { setEditingJob(null); setForm(initialForm); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          <FaPlus /> <span className="hidden sm:inline">Post New Job</span><span className="sm:hidden">Add Job</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="px-3 sm:px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
        >
          <option value="">All Status</option>
          {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh]">
          <table className="w-full min-w-[600px]">
            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600 whitespace-nowrap">Job Title</th>
                <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600 whitespace-nowrap hidden md:table-cell">Location</th>
                <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600 whitespace-nowrap hidden lg:table-cell">Type</th>
                <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600 whitespace-nowrap">Status</th>
                <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600 whitespace-nowrap">Deadline</th>
                <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No jobs found</td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job._id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-3 sm:p-4">
                      <p className="font-medium text-slate-900 text-sm sm:text-base">{job.title}</p>
                      <p className="text-xs sm:text-sm text-slate-500 truncate max-w-[120px] sm:max-w-[200px] md:max-w-xs">{job.description?.substring(0, 50)}...</p>
                    </td>
                    <td className="p-3 sm:p-4 text-slate-600 hidden md:table-cell text-sm">
                      {job.location?.city}, {job.location?.country}
                      {job.location?.remote && <span className="ml-1 sm:ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 sm:px-2 py-0.5 rounded">Remote</span>}
                    </td>
                    <td className="p-3 sm:p-4 text-slate-600 capitalize hidden lg:table-cell text-sm">{job.employmentType}</td>
                    <td className="p-3 sm:p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${job.status === 'published' ? 'bg-green-100 text-green-700' : job.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : job.status === 'closed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4">
                      {job.countdown ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.countdown.expired ? 'bg-red-100 text-red-700' : job.countdown.daysRemaining <= 7 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {job.countdown.expired ? 'Expired' : `${job.countdown.daysRemaining}d`}
                        </span>
                      ) : job.applicationDeadline ? (
                        <span className="text-slate-600 text-xs sm:text-sm">
                          {new Date(job.applicationDeadline).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="flex gap-1 sm:gap-2">
                        <button onClick={() => setViewingJob(job)} className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg" title="View Details">
                          <FaEye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button onClick={() => handleDetectBias(job)} className="relative p-1.5 sm:p-2 text-orange-600 hover:bg-orange-50 rounded-lg" title="Detect Bias">
                          <FaExclamationTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          {jobBiasCounts[job._id]?.count > 0 && (
                            <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-white ${jobBiasCounts[job._id]?.hasHigh ? 'bg-red-500' : 'bg-orange-500'}`}>
                              {jobBiasCounts[job._id].count}
                            </span>
                          )}
                        </button>
                        <button onClick={() => handleGetStats(job)} className="p-1.5 sm:p-2 text-purple-600 hover:bg-purple-50 rounded-lg" title="View Stats">
                          <FaChartBar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button onClick={() => handleEdit(job)} className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <FaEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button onClick={() => handleDelete(job._id)} className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <FaTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalJobs)} of {totalJobs} jobs
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-slate-900">{editingJob ? 'Edit Job' : 'Post New Job'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Job Title <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Senior Software Engineer" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
                  <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Job description..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Employment Type</label>
                  <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {employmentTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Job Level</label>
                  <select value={form.jobLevel} onChange={(e) => setForm({ ...form, jobLevel: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {jobLevels.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Experience</label>
                  <input type="text" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 5+ years" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Required Skills</label>
                  <div className="flex flex-wrap gap-1 mb-2 min-h-[32px]">
                    {form.requiredSkills.map(skill => (
                      <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs flex items-center gap-1">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="text-blue-500 hover:text-blue-700">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add skill" />
                    <button type="button" onClick={addSkill} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-xs">Add</button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Responsibilities</label>
                  <div className="flex flex-wrap gap-1 mb-2 min-h-[32px]">
                    {form.responsibilities.map(resp => (
                      <span key={resp} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs flex items-center gap-1">
                        {resp.substring(0, 20)}{resp.length > 20 ? '...' : ''}
                        <button type="button" onClick={() => removeResp(resp)} className="text-purple-500 hover:text-purple-700">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <input type="text" value={respInput} onChange={(e) => setRespInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addResp())} className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add responsibility" />
                    <button type="button" onClick={addResp} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-xs">Add</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Education</label>
                  <div className="flex flex-wrap gap-1 mb-2 min-h-[32px]">
                    {form.education.map((edu, i) => (
                      <span key={i} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs flex items-center gap-1">
                        {edu.degree} {edu.field && `(${edu.field})`}
                        <button type="button" onClick={() => removeEdu(i)} className="text-emerald-500 hover:text-emerald-700">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <input type="text" value={eduInput.degree} onChange={(e) => setEduInput({ ...eduInput, degree: e.target.value })} className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Degree" />
                    <input type="text" value={eduInput.field} onChange={(e) => setEduInput({ ...eduInput, field: e.target.value })} className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Field" />
                    <button type="button" onClick={addEdu} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-xs">Add</button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Certifications</label>
                  <div className="flex flex-wrap gap-1 mb-2 min-h-[32px]">
                    {form.certifications.map(cert => (
                      <span key={cert} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs flex items-center gap-1">
                        {cert}
                        <button type="button" onClick={() => removeCert(cert)} className="text-orange-500 hover:text-orange-700">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <input type="text" value={certInput} onChange={(e) => setCertInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCert())} className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add certification" />
                    <button type="button" onClick={addCert} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-xs">Add</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Languages</label>
                  <div className="flex flex-wrap gap-1 mb-2 min-h-[32px]">
                    {form.languages.map(lang => (
                      <span key={lang} className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs flex items-center gap-1">
                        {lang}
                        <button type="button" onClick={() => removeLang(lang)} className="text-cyan-500 hover:text-cyan-700">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <input type="text" value={langInput} onChange={(e) => setLangInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLang())} className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add language" />
                    <button type="button" onClick={addLang} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-xs">Add</button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Benefits</label>
                  <div className="flex flex-wrap gap-1 mb-2 min-h-[32px]">
                    {form.benefits.map(benefit => (
                      <span key={benefit} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1">
                        {benefit}
                        <button type="button" onClick={() => removeBenefit(benefit)} className="text-green-500 hover:text-green-700">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <input type="text" value={benefitInput} onChange={(e) => setBenefInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())} className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add benefit" />
                    <button type="button" onClick={addBenefit} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-xs">Add</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Address</label>
                  <input type="text" value={form.location.address} onChange={(e) => setForm({ ...form, location: { ...form.location, address: e.target.value } })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="KG 11 Ave" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                  <input type="text" value={form.location.city} onChange={(e) => setForm({ ...form, location: { ...form.location, city: e.target.value } })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Country</label>
                  <input type="text" value={form.location.country} onChange={(e) => setForm({ ...form, location: { ...form.location, country: e.target.value } })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 mt-6 cursor-pointer">
                    <input type="checkbox" checked={form.location.remote} onChange={(e) => setForm({ ...form, location: { ...form.location, remote: e.target.checked } })} className="w-4 h-4 rounded" />
                    <span className="text-sm text-slate-700">Remote</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Salary Min</label>
                  <input type="number" value={form.salary?.min || 0} onChange={(e) => setForm({ ...form, salary: { ...form.salary!, min: parseInt(e.target.value) || 0 } })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Salary Max</label>
                  <input type="number" value={form.salary?.max || 0} onChange={(e) => setForm({ ...form, salary: { ...form.salary!, max: parseInt(e.target.value) || 0 } })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Currency</label>
                  <select value={form.salary?.currency || 'USD'} onChange={(e) => setForm({ ...form, salary: { ...form.salary!, currency: e.target.value } })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 mt-6 cursor-pointer">
                    <input type="checkbox" checked={!form.salary?.min && !form.salary?.max} onChange={(e) => setForm({ ...form, salary: e.target.checked ? { min: 0, max: 0, currency: form.salary?.currency || 'USD' } : { min: 0, max: 0, currency: form.salary?.currency || 'USD' } })} className="w-4 h-4 rounded" />
                    <span className="text-sm text-slate-700">Hide Salary</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Application Deadline</label>
                  <input type="date" value={form.applicationDeadline} onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Expiration Date</label>
                  <input type="date" value={form.expirationDate} onChange={(e) => setForm({ ...form, expirationDate: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-1 mb-2 min-h-[32px]">
                  {form.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs flex items-center gap-1">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="text-slate-500 hover:text-slate-700">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1">
                  <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add tag" />
                  <button type="button" onClick={addTag} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-xs">Add</button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
                  {submitting ? 'Saving...' : (editingJob ? 'Update Job' : 'Post Job')}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">{viewingJob.title}</h2>
                <p className="text-sm text-slate-500 capitalize">{viewingJob.employmentType} • {viewingJob.jobLevel} Level</p>
              </div>
              <button onClick={() => setViewingJob(null)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            
            {viewingJob.countdown && (
              <div className={`px-4 sm:px-6 py-3 ${viewingJob.countdown.expired ? 'bg-red-50' : viewingJob.countdown.daysRemaining <= 7 ? 'bg-yellow-50' : 'bg-green-50'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FaClock className={`text-lg ${viewingJob.countdown.expired ? 'text-red-600' : viewingJob.countdown.daysRemaining <= 7 ? 'text-yellow-600' : 'text-green-600'}`} />
                    <span className={`text-sm font-medium ${viewingJob.countdown.expired ? 'text-red-700' : viewingJob.countdown.daysRemaining <= 7 ? 'text-yellow-700' : 'text-green-700'}`}>
                      {viewingJob.countdown.expired 
                        ? 'Applications Closed' 
                        : `${viewingJob.countdown.daysRemaining} days, ${viewingJob.countdown.hoursRemaining} hours remaining`
                      }
                    </span>
                  </div>
                  {viewingJob.applicationDeadline && (
                    <span className="text-xs text-slate-500">
                      Deadline: {new Date(viewingJob.applicationDeadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="p-4 sm:p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                <p className="text-slate-600 text-sm">{viewingJob.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start gap-2">
                  <FaMapMarker className="text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="text-sm text-slate-900">{viewingJob.location?.address || '-'}</p>
                    <p className="text-sm text-slate-900">{viewingJob.location?.city}, {viewingJob.location?.country}</p>
                    {viewingJob.location?.remote && <span className="text-xs text-blue-600">Remote Available</span>}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FaClock className="text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500">Experience</p>
                    <p className="text-sm text-slate-900">{viewingJob.experience || '-'}</p>
                  </div>
                </div>
                {viewingJob.salary && (
                  <div className="flex items-start gap-2">
                    <span className="text-slate-400 mt-1">$</span>
                    <div>
                      <p className="text-xs text-slate-500">Salary</p>
                      <p className="text-sm text-slate-900">{viewingJob.salary.currency} {viewingJob.salary.min?.toLocaleString()} - {viewingJob.salary.max?.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>

              {viewingJob.requiredSkills?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingJob.requiredSkills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {viewingJob.responsibilities?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Responsibilities</h3>
                  <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
                    {viewingJob.responsibilities.map((resp, i) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {viewingJob.education?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Education</h3>
                  <div className="space-y-2">
                    {viewingJob.education.map((edu, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{edu.field}</p>
                          <p className="text-xs text-slate-500">{edu.degree}</p>
                        </div>
                        {edu.required && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Required</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingJob.certifications?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingJob.certifications.map((cert, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">{cert}</span>
                    ))}
                  </div>
                </div>
              )}

              {viewingJob.languages?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingJob.languages.map((lang, i) => (
                      <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">{lang}</span>
                    ))}
                  </div>
                </div>
              )}

              {viewingJob.benefits?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Benefits</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingJob.benefits.map((benefit, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">{benefit}</span>
                    ))}
                  </div>
                </div>
              )}

              {viewingJob.tags?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingJob.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {viewingJob.applicationProcess?.steps?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Application Process</h3>
                  <div className="space-y-2">
                    {viewingJob.applicationProcess.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">{i + 1}</span>
                        <span className="text-slate-600 text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${viewingJob.status === 'published' ? 'bg-green-100 text-green-700' : viewingJob.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                    {viewingJob.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Application Deadline</p>
                  <p className="text-sm text-slate-900">{viewingJob.applicationDeadline ? new Date(viewingJob.applicationDeadline).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Expiration Date</p>
                  <p className="text-sm text-slate-900">{viewingJob.expirationDate ? new Date(viewingJob.expirationDate).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Created At</p>
                  <p className="text-sm text-slate-900">{viewingJob.createdAt ? new Date(viewingJob.createdAt).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Last Updated</p>
                  <p className="text-sm text-slate-900">{viewingJob.updatedAt ? new Date(viewingJob.updatedAt).toLocaleDateString() : '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedJobForView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedJobForView.title}</h2>
                <p className="text-sm text-slate-500">Analysis & Statistics</p>
              </div>
              <button onClick={() => { setSelectedJobForView(null); setBiasResults(null); setJobStats(null); }} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-6">
              {loadingBias && (
                <div className="text-center py-4">
                  <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-slate-500">Analyzing bias...</p>
                </div>
              )}
              {loadingStats && (
                <div className="text-center py-4">
                  <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-slate-500">Loading statistics...</p>
                </div>
              )}
              {!loadingBias && biasResults && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <FaExclamationTriangle className="text-orange-500" /> Bias Detection Results
                  </h3>
                  {biasResults.biasAlerts.length === 0 ? (
                    <p className="text-green-600 bg-green-50 p-3 rounded-lg">No bias detected! Your job description looks fair.</p>
                  ) : (
                    <div className="space-y-3">
                      {biasResults.biasAlerts.map((alert, index) => (
                        <div key={index} className={`p-3 rounded-lg ${alert.severity === 'high' ? 'bg-red-50 border border-red-200' : alert.severity === 'medium' ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${alert.severity === 'high' ? 'bg-red-200 text-red-700' : alert.severity === 'medium' ? 'bg-yellow-200 text-yellow-700' : 'bg-blue-200 text-blue-700'}`}>
                              {alert.severity}
                            </span>
                            <span className="font-medium text-slate-900">{alert.type}</span>
                          </div>
                          <p className="text-sm text-slate-600">{alert.description}</p>
                          <p className="text-sm text-green-700 mt-1"><strong>Suggestion:</strong> {alert.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {!loadingStats && jobStats && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <FaChartBar className="text-purple-500" /> Screening Statistics
                  </h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                      <p className="text-2xl font-bold text-slate-900">{jobStats.statistics.totalCandidates}</p>
                      <p className="text-xs text-slate-500">Total Candidates</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <p className="text-2xl font-bold text-blue-600">{jobStats.statistics.averageScore}%</p>
                      <p className="text-xs text-blue-600">Average Score</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <p className="text-2xl font-bold text-green-600">{jobStats.statistics.highestScore}%</p>
                      <p className="text-xs text-green-600">Highest Score</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-xl">
                      <p className="text-2xl font-bold text-red-600">{jobStats.statistics.lowestScore}%</p>
                      <p className="text-xs text-red-600">Lowest Score</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Candidate Pipeline</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="text-xl font-bold text-yellow-700">{jobStats.statistics.pendingCount}</p>
                        <p className="text-xs text-yellow-700">Pending</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-xl font-bold text-purple-700">{jobStats.statistics.interviewCount}</p>
                        <p className="text-xs text-purple-700">Interview</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-xl font-bold text-green-700">{jobStats.statistics.shortlistedCount}</p>
                        <p className="text-xs text-green-700">Shortlisted</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-xl font-bold text-red-700">{jobStats.statistics.rejectedCount}</p>
                        <p className="text-xs text-red-700">Rejected</p>
                      </div>
                    </div>
                  </div>

                  {jobStats.statistics.biasAlertCount > 0 && (
                    <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                      <div className="flex items-center gap-2">
                        <FaExclamationTriangle className="text-orange-500" />
                        <span className="text-sm font-medium text-orange-700">
                          {jobStats.statistics.biasAlertCount} bias alerts detected in job description
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!loadingBias && !loadingStats && !biasResults && !jobStats && (
                <p className="text-slate-500 text-center py-4">Click the buttons above to analyze this job</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl w-full max-w-sm sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-3 sm:p-4 md:p-6 border-b border-slate-100">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900">Confirm Action</h2>
            </div>
            <div className="p-3 sm:p-4 md:p-6">
              <p className="text-xs sm:text-sm text-slate-700 mb-4 sm:mb-6">{confirmMessage}</p>
              <div className="flex gap-2 sm:gap-3 md:gap-4">
                <button
                  onClick={handleConfirmAction}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm sm:text-base"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}