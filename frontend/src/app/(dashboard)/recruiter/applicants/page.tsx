"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { api, ENDPOINTS } from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import { FaSearch, FaFilter, FaUserPlus, FaUpload, FaDownload, FaEye, FaEdit, FaTrash, FaAngleLeft, FaAngleRight, FaBriefcase, FaGraduationCap, FaLanguage, FaStar, FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa';
import { SkeletonTable, SkeletonCard } from '@/components/ui/Skeleton';

interface ExternalApplicant {
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  skills: string[];
  skillDetails?: { name: string; level: string; yearsOfExperience: number }[];
  experience: { years: number; currentRole?: string };
  education: { degree: string; institution: string; year?: number; field?: string }[];
  languages?: { name: string; proficiency: string }[];
  resumeText?: string;
  status: string;
  source: string;
  jobId: { _id: string; title: string };
  createdAt: string;
  resumeLink?: string;
}

interface InternalApplicant {
  _id: string;
  userId: { _id: string; email: string; firstName: string; lastName: string; phone?: string; id: string };
  talentProfileId: {
    basicInfo: { firstName: string; lastName: string; email: string; headline: string; bio: string; location: string; phone: string; avatar: string };
    skills: { name: string; level: string; yearsOfExperience: number; _id: string }[];
    languages: { name: string; proficiency: string; _id: string }[];
    experience: { company: string; role: string; startDate: string; endDate: string; description: string; technologies: string[]; isCurrent: boolean; _id: string }[];
    education: { institution: string; degree: string; fieldOfStudy: string; startYear: number; endYear: number; _id: string }[];
    certifications: { name: string; issuer: string; issueDate: string; _id: string }[];
    projects: { name: string; description: string; technologies: string[]; role: string; link: string; startDate?: string; endDate?: string; _id: string }[];
    availability: { status: string; type: string; startDate: string; _id: string };
    socialLinks: { linkedin?: string; github?: string; portfolio?: string; _id: string };
    profileCompletion: {
      basicInfo: number;
      skills: number;
      languages: number;
      experience: number;
      education: number;
      certifications: number;
      projects: number;
      availability: number;
      socialLinks: number;
      overall: number;
    };
    createdAt: string;
    updatedAt: string;
    _id: string;
    userId: string;
    id: string;
  };
  jobId: {
    location: { address: string; city: string; country: string; remote: boolean };
    applicationProcess: { steps: string[] };
    analytics: { applications: number; shortlisted: number };
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
    salary: { min: number; max: number; currency: string; _id: string };
    benefits: string[];
    tags: string[];
    createdBy: string;
    status: string;
    applicationDeadline: string;
    expirationDate: string;
    createdAt: string;
    updatedAt: string;
    countdown: { expired: boolean; daysRemaining: number; hoursRemaining: number; endDate: string };
    id: string;
  };
  status: string;
  resumeLink?: string;
  coverLetter?: string;
  appliedAt: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}

interface Job {
  _id: string;
  title: string;
  createdAt?: string;
  [key: string]: any;
}

export default function ApplicantsPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'external' | 'internal'>('external');
  const [externalApplicants, setExternalApplicants] = useState<ExternalApplicant[]>([]);
  const [internalApplicants, setInternalApplicants] = useState<InternalApplicant[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [internalJobFilter, setInternalJobFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<ExternalApplicant | InternalApplicant | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', skills: '', jobId: '', resumeLink: '' });
  const [uploadJobId, setUploadJobId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedExternalIds, setSelectedExternalIds] = useState<string[]>([]);
  const [selectAllExternal, setSelectAllExternal] = useState(false);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplicants, setTotalApplicants] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const showConfirmation = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    if (confirmAction) {
      confirmAction();
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

  const enterBulkSelectMode = () => {
    setBulkSelectMode(true);
  };

  const exitBulkSelectMode = () => {
    setBulkSelectMode(false);
    setSelectedExternalIds([]);
    setSelectAllExternal(false);
  };

  const fetchJobs = useCallback(async () => {
    try {
      const response = await api.get<{ success: boolean; data: { jobs: Job[] } }>(`${ENDPOINTS.JOBS.ALL}?status=published`, token || undefined);
      if (response.success) {
        setJobs(response.data.jobs);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, internalJobFilter]);

  const fetchExternalApplicants = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      if (jobFilter) params.append('jobId', jobFilter);
      params.append('page', currentPage.toString());
      params.append('limit', ITEMS_PER_PAGE.toString());

      const endpoint = `/applicants/external${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<{ success: boolean; data: { applicants: ExternalApplicant[]; pagination: { total: number; pages: number } } }>(endpoint, token || undefined);
      if (response.success) {
        setExternalApplicants(response.data.applicants);
        setTotalApplicants(response.data.pagination.total || 0);
        setTotalPages(response.data.pagination.pages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch external applicants:', error);
    } finally {
      setLoading(false);
    }
  }, [token, searchQuery, statusFilter, jobFilter, currentPage]);

  const fetchInternalApplicants = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (internalJobFilter) params.append('jobId', internalJobFilter);
      params.append('page', currentPage.toString());
      params.append('limit', ITEMS_PER_PAGE.toString());

      const endpoint = `/applicants/internal${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<{ success: boolean; data: { applications: InternalApplicant[]; pagination: { total: number; pages: number } } }>(endpoint, token || undefined);
      if (response.success) {
        setInternalApplicants(response.data.applications);
        setTotalApplicants(response.data.pagination.total || 0);
        setTotalPages(response.data.pagination.pages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch internal applicants:', error);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, internalJobFilter, currentPage]);

  useEffect(() => {
    if (activeTab === 'external') {
      fetchExternalApplicants();
    } else {
      fetchInternalApplicants();
    }
  }, [activeTab, fetchExternalApplicants, fetchInternalApplicants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const skillsArray = form.skills.split(',').map(s => s.trim()).filter(s => s);
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        skills: skillsArray,
        jobId: form.jobId,
        resumeLink: form.resumeLink || undefined
      };
      await api.post(ENDPOINTS.APPLICANTS.EXTERNAL, payload, token || undefined);
      setShowModal(false);
      setForm({ name: '', email: '', phone: '', skills: '', jobId: '', resumeLink: '' });
      fetchExternalApplicants();
    } catch (error) {
      console.error('Failed to create applicant:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      if (activeTab === 'external') {
        await api.put(ENDPOINTS.APPLICANTS.EXTERNAL_STATUS(id), { status }, token || undefined);
        fetchExternalApplicants();
      } else {
        await api.put(ENDPOINTS.APPLICANTS.INTERNAL_STATUS(id), { status }, token || undefined);
        fetchInternalApplicants();
      }
      setSelectedApplicant(null);
      showToast('Status updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update status:', error);
      showToast('Failed to update status', 'error');
    }
  };

  const handleUpdateApplicant = async (applicant: ExternalApplicant) => {
    try {
      const { _id, ...updateData } = applicant;
      await api.put(ENDPOINTS.APPLICANTS.EXTERNAL_DETAIL(_id), updateData, token || undefined);
      fetchExternalApplicants();
      setSelectedApplicant(null);
      showToast('Applicant updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update applicant:', error);
      showToast('Failed to update applicant', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    showConfirmation('Are you sure you want to delete this applicant?', async () => {
      try {
        await api.delete(ENDPOINTS.APPLICANTS.EXTERNAL_DETAIL(id), token || undefined);
        fetchExternalApplicants();
        showToast('Applicant deleted successfully', 'success');
      } catch (error) {
        console.error('Failed to delete applicant:', error);
        showToast('Failed to delete applicant', 'error');
      }
    });
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (uploadJobId) formData.append('jobId', uploadJobId);
    
    try {
      const response = await fetch(`${API_BASE_URL}/applicants/external/upload-bulk`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        const summary = data.data?.summary;
        if (summary) {
          showToast(`${summary.successfullyCreated} applicant(s) imported successfully!${summary.failed > 0 ? ` (${summary.failed} failed)` : ''}`, summary.failed > 0 ? 'warning' : 'success');
        } else {
          showToast('Applicants imported successfully!', 'success');
        }
        setShowUploadModal(false);
        setUploadJobId('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchExternalApplicants();
      } else {
        showToast(data.error?.message || 'Failed to upload', 'error');
      }
    } catch (error) {
      console.error('Failed to upload:', error);
      showToast('Failed to upload file', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleBulkDelete = async () => {
    showConfirmation(`Are you sure you want to delete ${selectedExternalIds.length} applicant(s)?`, async () => {
    try {
      await api.post(ENDPOINTS.APPLICANTS.EXTERNAL_BULK_DELETE, { ids: selectedExternalIds }, token || undefined);
      setSelectedExternalIds([]);
      setSelectAllExternal(false);
      fetchExternalApplicants();
      showToast(`${selectedExternalIds.length} applicant(s) deleted successfully`, 'success');
    } catch (error) {
      console.error('Failed to bulk delete applicants:', error);
      showToast('Failed to delete applicants', 'error');
    }
    });
  };

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/applicants/external/preview`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setPreviewData(data.data);
        setShowPreviewModal(true);
        setShowUploadModal(false);
        showToast('Preview generated successfully', 'success');
      } else {
        showToast(data.error?.message || 'Failed to generate preview', 'error');
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
      showToast('Failed to generate preview', 'error');
    } finally {
      setUploading(false);
    }
  };


  const handleDownloadCV = async (applicationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/applicants/internal/${applicationId}/cv`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cv-${applicationId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        showToast('Failed to download CV', 'error');
      }
    } catch (error) {
      console.error('CV download error:', error);
      showToast('Failed to download CV', 'error');
    }
  };

  const externalStatuses = ['screening', 'interview', 'offer', 'hired', 'rejected'];

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-10 w-20 bg-slate-200 rounded animate-pulse" />
            <div className="h-10 w-20 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>

        <div className="flex gap-2 sm:gap-4 mb-4">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
              <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-slate-200">
              <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto max-h-[60vh]">
            <SkeletonTable rows={8} cols={bulkSelectMode ? 8 : 7} className="p-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Applicants</h1>
          <p className="text-sm sm:text-base text-slate-500">Manage external and internal applicants</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'external' && bulkSelectMode && selectedExternalIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm sm:text-base"
            >
              <FaTrash /> Delete ({selectedExternalIds.length})
            </button>
          )}
          {activeTab === 'external' && !bulkSelectMode && (
            <button
              onClick={enterBulkSelectMode}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm sm:text-base"
            >
              <FaTrash /> Bulk Delete
            </button>
          )}
          {bulkSelectMode && (
            <button
              onClick={exitBulkSelectMode}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm sm:text-base"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => { setForm({ name: '', email: '', phone: '', skills: '', jobId: '', resumeLink: '' }); setShowModal(true); }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
          >
            <FaUserPlus /> <span className="hidden sm:inline">Add</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base"
          >
            <FaUpload /> <span className="hidden sm:inline">Import</span>
          </button>
        </div>
      </div>

      <div className="flex gap-2 sm:gap-4 mb-4">
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('external')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'external' ? 'bg-white text-slate-900 shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            External
          </button>
          <button
            onClick={() => setActiveTab('internal')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'internal' ? 'bg-white text-slate-900 shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Internal
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        {activeTab === 'internal' && (
          <select
            value={internalJobFilter}
            onChange={(e) => { setInternalJobFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-sm sm:text-base"
          >
            <option value="">All Jobs</option>
            {jobs.map(job => (
              <option key={job._id} value={job._id}>{job.title}</option>
            ))}
          </select>
        )}
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-sm sm:text-base"
        >
          <option value="">All Status</option>
          {externalStatuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {activeTab === 'external' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full min-w-[600px]">
              <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  {bulkSelectMode && (
                    <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600">
                      <input
                        type="checkbox"
                        checked={selectAllExternal}
                        onChange={(e) => {
                          setSelectAllExternal(e.target.checked);
                          setSelectedExternalIds(e.target.checked ? externalApplicants.map(a => a._id) : []);
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                  )}
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600">Candidate</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600 hidden lg:table-cell">Skills</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600">Status</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600 hidden lg:table-cell">Applied Position</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600 hidden lg:table-cell">Source</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {externalApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={bulkSelectMode ? 9 : 8} className="p-8 text-center text-slate-500">No external applicants found</td>
                  </tr>
                ) : (
                  externalApplicants.map((applicant) => (
                    <tr key={applicant._id} className="border-b border-slate-50 hover:bg-slate-50">
                      {bulkSelectMode && (
                        <td className="p-3 sm:p-4">
                          <input
                            type="checkbox"
                            checked={selectedExternalIds.includes(applicant._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExternalIds(prev => [...prev, applicant._id]);
                              } else {
                                setSelectedExternalIds(prev => prev.filter(id => id !== applicant._id));
                                setSelectAllExternal(false);
                              }
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                      )}
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                            {(applicant.firstName && applicant.lastName)
                              ? `${applicant.firstName[0]}${applicant.lastName[0]}`.toUpperCase()
                              : applicant.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
                            }
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">
                              {applicant.firstName && applicant.lastName
                                ? `${applicant.firstName} ${applicant.lastName}`
                                : applicant.name
                              }
                            </p>
                            <p className="text-xs text-slate-500">{applicant.phone || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {applicant.skills?.slice(0, 3).map(skill => (
                            <span key={skill} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{skill}</span>
                          ))}
                          {applicant.skills?.length > 3 && <span className="text-xs text-slate-500">+{applicant.skills.length - 3}</span>}
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                          ${applicant.status === 'hired' ? 'bg-green-100 text-green-700' : 
                            applicant.status === 'interview' ? 'bg-purple-100 text-purple-700' : 
                            applicant.status === 'offer' ? 'bg-blue-100 text-blue-700' : 
                            applicant.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {applicant.status}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 text-slate-600 text-sm hidden lg:table-cell">{applicant.jobId?.title || '-'}</td>
                      <td className="p-3 sm:p-4 text-slate-600 text-sm hidden lg:table-cell">
                        <span className={`px-2 py-0.5 rounded text-xs capitalize
                          ${applicant.source === 'manual' ? 'bg-slate-100 text-slate-600' : 
                            applicant.source === 'excel' ? 'bg-green-100 text-green-700' : 
                            applicant.source === 'csv' ? 'bg-blue-100 text-blue-700' :
                            applicant.source === 'pdf' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                          {applicant.source}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelectedApplicant(applicant)} className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View">
                            <FaEye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button onClick={() => handleDelete(applicant._id)} className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                            <FaTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <select
                            value={applicant.status}
                            onChange={(e) => handleStatusUpdate(applicant._id, e.target.value)}
                            className="text-xs border border-slate-200 rounded px-1 py-0.5 bg-white"
                          >
                            <option value="screening">Screening</option>
                            <option value="interview">Interview</option>
                            <option value="offer">Offer</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && activeTab === 'external' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalApplicants)} of {totalApplicants} applicants
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
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full min-w-[600px]">
              <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600">Candidate</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600 hidden lg:table-cell">Skills</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600">Status</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600 hidden lg:table-cell">Applied Position</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600 hidden lg:table-cell">Applied</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {internalApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      {internalJobFilter ? 'No applicants for this job' : 'Select a job to view applicants'}
                    </td>
                  </tr>
                ) : (
                  internalApplicants.map((applicant) => (
                    <tr key={applicant._id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                            {applicant.userId?.firstName?.[0]}{applicant.userId?.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{applicant.userId?.firstName} {applicant.userId?.lastName}</p>
                            <p className="text-xs text-slate-500">{applicant.userId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {applicant.talentProfileId?.skills?.slice(0, 3).map((skill, i) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{skill.name}</span>
                          ))}
                          {applicant.talentProfileId?.skills?.length > 3 && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">+{applicant.talentProfileId.skills.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                          ${applicant.status === 'hired' ? 'bg-green-100 text-green-700' : 
                            applicant.status === 'interview' ? 'bg-purple-100 text-purple-700' : 
                            applicant.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                            applicant.status === 'shortlisted' ? 'bg-indigo-100 text-indigo-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {applicant.status || 'pending'}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 text-slate-600 text-sm hidden lg:table-cell">{applicant.jobId?.title || '-'}</td>
                      <td className="p-3 sm:p-4 text-sm text-slate-600 hidden lg:table-cell">
                        {applicant.appliedAt ? new Date(applicant.appliedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => setSelectedApplicant(applicant)} 
                            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="View Profile"
                          >
                            <FaEye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button 
                            onClick={() => handleDownloadCV(applicant._id)}
                            className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Download CV"
                          >
                            <FaDownload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <select
                            value={applicant.status || 'pending'}
                            onChange={(e) => handleStatusUpdate(applicant._id, e.target.value)}
                            className="text-xs border border-slate-200 rounded px-1 py-0.5 bg-white"
                          >
                            <option value="pending">Pending</option>
                            <option value="screening">Screening</option>
                            <option value="interview">Interview</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="rejected">Rejected</option>
                            <option value="hired">Hired</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && activeTab === 'internal' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalApplicants)} of {totalApplicants} applicants
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-3 sm:p-4 md:p-6 border-b border-slate-100">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900">Add External Applicant</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm sm:text-base"
                  placeholder="JavaScript, React, Node.js"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job *</label>
                <select
                  required
                  value={form.jobId}
                  onChange={(e) => setForm({ ...form, jobId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm sm:text-base"
                >
                  <option value="">Select a job</option>
                  {jobs.map(job => (
                    <option key={job._id} value={job._id}>{job.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Resume Link</label>
                <input
                  type="url"
                  value={form.resumeLink}
                  onChange={(e) => setForm({ ...form, resumeLink: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm sm:text-base"
                  placeholder="https://example.com/resume.pdf"
                />
              </div>
              <div className="flex gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4">
                <button type="submit" disabled={uploading} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base">
                  {uploading ? 'Adding...' : 'Add Applicant'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm sm:text-base">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-3 sm:p-4 md:p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Bulk Import Applicants</h2>
                <p className="text-sm text-slate-500">Upload CSV or Excel file</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const response = await fetch(`${API_BASE_URL}/applicants/external/template`, {
                      headers: { 
                        Authorization: `Bearer ${token}`,
                        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                      }
                    });
                    if (response.ok) {
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'applicants_template.xlsx';
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      a.remove();
                      showToast('Template downloaded successfully', 'success');
                    } else if (response.status === 401) {
                      showToast('Session expired. Please log in again.', 'error');
                    } else {
                      showToast('Failed to download template', 'error');
                    }
                  } catch (error) {
                    console.error('Download template error:', error);
                    showToast('Failed to download template', 'error');
                  }
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Download Template
              </button>
            </div>
            <form onSubmit={handleBulkUpload} className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Upload File</label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  ref={fileInputRef}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Associate with Job (optional)</label>
                <select
                  value={uploadJobId}
                  onChange={(e) => setUploadJobId(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="">Select a job (optional)</option>
                  {jobs.map(job => (
                    <option key={job._id} value={job._id}>{job.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4">
                <button type="button" onClick={handlePreview} disabled={uploading} className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed">
                  {uploading ? 'Processing...' : 'Preview'}
                </button>
                <button type="submit" disabled={uploading} className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base">
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                type="button"
                onClick={() => { setShowUploadModal(false); setUploadJobId(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="px-3 sm:px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm sm:text-base"
              >
                Cancel
              </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedApplicant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              {'name' in selectedApplicant ? (
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {selectedApplicant.firstName && selectedApplicant.lastName
                    ? `${selectedApplicant.firstName} ${selectedApplicant.lastName}`
                    : selectedApplicant.name
                  }
                </h2>
              ) : (
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    {selectedApplicant.userId?.firstName} {selectedApplicant.userId?.lastName}
                  </h2>
                  <p className="text-sm text-slate-500">{selectedApplicant.talentProfileId?.basicInfo?.headline || 'No headline'}</p>
                </div>
              )}
              <button onClick={() => setSelectedApplicant(null)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-6">
              {'name' in selectedApplicant ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="text-sm text-slate-900">{selectedApplicant.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="text-sm text-slate-900">{selectedApplicant.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Source</p>
                      <span className={`px-2 py-0.5 rounded text-xs capitalize
                        ${selectedApplicant.source === 'manual' ? 'bg-slate-100 text-slate-600' : 
                          selectedApplicant.source === 'excel' ? 'bg-green-100 text-green-700' : 
                          selectedApplicant.source === 'csv' ? 'bg-blue-100 text-blue-700' :
                          selectedApplicant.source === 'pdf' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                        {selectedApplicant.source}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Applied Position</p>
                      <p className="text-sm text-slate-900">{selectedApplicant.jobId?.title || '-'}</p>
                    </div>
                  </div>
                  
                  {selectedApplicant.skillDetails && selectedApplicant.skillDetails.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Skills with Details</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplicant.skillDetails.map((skill, i) => (
                          <span key={i} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">
                            {skill.name} <span className="text-xs text-blue-500">({skill.level}, {skill.yearsOfExperience}y)</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(!selectedApplicant.skillDetails || selectedApplicant.skillDetails.length === 0) && selectedApplicant.skills && selectedApplicant.skills.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedApplicant.skills.map(skill => (
                          <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedApplicant.experience && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Experience</p>
                        <p className="text-sm text-slate-900">{selectedApplicant.experience.years || 0} years</p>
                      </div>
                      {selectedApplicant.experience.currentRole && (
                        <div>
                          <p className="text-xs text-slate-500">Current Role</p>
                          <p className="text-sm text-slate-900">{selectedApplicant.experience.currentRole}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selectedApplicant.education && selectedApplicant.education.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Education</p>
                      <div className="space-y-2">
                        {selectedApplicant.education.map((edu, i) => (
                          <div key={i} className="p-3 bg-slate-50 rounded-lg">
                            <p className="font-medium text-slate-900 text-sm">{edu.degree}</p>
                            <p className="text-xs text-slate-600">{edu.institution} {edu.year && `(${edu.year})`}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedApplicant.languages && selectedApplicant.languages.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Languages</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplicant.languages.map((lang, i) => (
                          <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            {lang.name} <span className="text-xs text-green-600">- {lang.proficiency}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedApplicant.resumeText && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Resume Text</p>
                      <p className="text-sm text-slate-700">{selectedApplicant.resumeText}</p>
                    </div>
                  )}
                  
                  {selectedApplicant.resumeLink && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Resume Link</p>
                      <a href={selectedApplicant.resumeLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        {selectedApplicant.resumeLink}
                      </a>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">Update Status</label>
                    <select
                      value={selectedApplicant.status}
                      onChange={(e) => handleStatusUpdate(selectedApplicant._id, e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                    >
                      {externalStatuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="text-sm text-slate-900">{selectedApplicant.userId?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="text-sm text-slate-900">{selectedApplicant.talentProfileId?.basicInfo?.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Location</p>
                      <p className="text-sm text-slate-900">{selectedApplicant.talentProfileId?.basicInfo?.location || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Profile Completion</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selectedApplicant.talentProfileId?.profileCompletion?.overall || 0}%` }} />
                        </div>
                        <span className="text-sm font-medium text-slate-900">{selectedApplicant.talentProfileId?.profileCompletion?.overall || 0}%</span>
                      </div>
                    </div>
                  </div>

                  {selectedApplicant.talentProfileId?.basicInfo?.bio && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Bio</p>
                      <p className="text-sm text-slate-700">{selectedApplicant.talentProfileId.basicInfo.bio}</p>
                    </div>
                  )}

                  {selectedApplicant.talentProfileId?.skills?.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplicant.talentProfileId.skills.map((skill, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            {skill.name} <span className="text-xs text-blue-500">({skill.yearsOfExperience}y, {skill.level})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedApplicant.talentProfileId?.languages?.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2"><FaLanguage className="inline mr-1" />Languages</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplicant.talentProfileId.languages.map((lang, i) => (
                          <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            {lang.name} <span className="text-xs text-green-600">- {lang.proficiency}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedApplicant.talentProfileId?.experience?.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2"><FaBriefcase className="inline mr-1" />Experience</p>
                      <div className="space-y-3">
                        {selectedApplicant.talentProfileId.experience.map((exp, i) => (
                          <div key={i} className="p-3 bg-slate-50 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-slate-900">{exp.role}</p>
                                <p className="text-sm text-slate-600">{exp.company}</p>
                              </div>
                              <span className="text-xs text-slate-500">
                                {exp.startDate ? new Date(exp.startDate).getFullYear() : ''} - {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                              </span>
                            </div>
                            {exp.description && <p className="text-sm text-slate-600 mt-1">{exp.description}</p>}
                            {exp.technologies?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {exp.technologies.map((tech, j) => (
                                  <span key={j} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{tech}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedApplicant.talentProfileId?.education?.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2"><FaGraduationCap className="inline mr-1" />Education</p>
                      <div className="space-y-2">
                        {selectedApplicant.talentProfileId.education.map((edu, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div>
                              <p className="font-medium text-slate-900">{edu.fieldOfStudy}</p>
                              <p className="text-sm text-slate-600">{edu.institution}</p>
                            </div>
                            <span className="text-xs text-slate-500">{edu.startYear} - {edu.endYear}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedApplicant.talentProfileId?.certifications?.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Certifications</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplicant.talentProfileId.certifications.map((cert, i) => (
                          <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                            {cert.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedApplicant.talentProfileId?.availability && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 mb-1">Availability</p>
                      <p className="text-sm text-slate-900">
                        {selectedApplicant.talentProfileId.availability.status} - {selectedApplicant.talentProfileId.availability.type}
                        {selectedApplicant.talentProfileId.availability.startDate && ` (Available from ${new Date(selectedApplicant.talentProfileId.availability.startDate).toLocaleDateString()})`}
                      </p>
                    </div>
                  )}

                  {selectedApplicant.talentProfileId?.projects?.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Projects</p>
                      <div className="space-y-3">
                        {selectedApplicant.talentProfileId.projects.map((project, i) => (
                          <div key={i} className="p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-slate-900">{project.name}</p>
                              {project.link && (
                                <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">View</a>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{project.description}</p>
                            {project.role && <p className="text-xs text-slate-500 mt-1">Role: {project.role}</p>}
                            {project.technologies?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {project.technologies.map((tech, j) => (
                                  <span key={j} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">{tech}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(selectedApplicant.talentProfileId?.socialLinks?.linkedin || selectedApplicant.talentProfileId?.socialLinks?.github || selectedApplicant.talentProfileId?.socialLinks?.portfolio) && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Social Links</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplicant.talentProfileId?.socialLinks?.linkedin && (
                          <a href={selectedApplicant.talentProfileId?.socialLinks?.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200">
                            <FaLinkedin className="w-4 h-4" /> LinkedIn
                          </a>
                        )}
                        {selectedApplicant.talentProfileId?.socialLinks?.github && (
                          <a href={selectedApplicant.talentProfileId?.socialLinks?.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-white rounded-full text-sm hover:bg-slate-700">
                            <FaGithub className="w-4 h-4" /> GitHub
                          </a>
                        )}
                        {selectedApplicant.talentProfileId?.socialLinks?.portfolio && (
                          <a href={selectedApplicant.talentProfileId?.socialLinks?.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200">
                            <FaGlobe className="w-4 h-4" /> Portfolio
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-slate-500 mb-1">Update Status</label>
                    <select
                      value={selectedApplicant.status}
                      onChange={(e) => handleStatusUpdate(selectedApplicant._id, e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                    >
                      {externalStatuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleDownloadCV(selectedApplicant._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full"
                    >
                      <FaDownload /> Download CV
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && previewData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-3 sm:p-4 md:p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900">Preview Import Data</h2>
                <p className="text-xs sm:text-sm text-slate-500">Review applicants before importing</p>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="text-slate-400 hover:text-slate-600 text-xl sm:text-2xl">×</button>
            </div>

            <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{previewData.totalRows}</div>
                  <div className="text-sm text-blue-600">Total Rows</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{previewData.preview?.length || 0}</div>
                  <div className="text-sm text-green-600">Preview Rows</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{previewData.validationErrors?.length || 0}</div>
                  <div className="text-sm text-red-600">Validation Errors</div>
                </div>
              </div>

              {previewData.validationErrors && previewData.validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-red-800 mb-2">Validation Errors:</h3>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {previewData.validationErrors.slice(0, 10).map((error: any, i: number) => (
                      <div key={i} className="text-sm text-red-700">
                        Row {error.row}: {error.error}
                      </div>
                    ))}
                    {previewData.validationErrors.length > 10 && (
                      <div className="text-sm text-red-700 font-medium">
                        ... and {previewData.validationErrors.length - 10} more errors
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Preview Data (First {previewData.preview?.length || 0} rows):</h3>
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        {previewData.preview && previewData.preview[0] && Object.keys(previewData.preview[0]).map((key, i) => (
                          <th key={i} className="text-left p-2 border-b border-slate-200 font-medium text-slate-700">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.preview?.map((row: any, i: number) => (
                        <tr key={i} className="border-b border-slate-200">
                          {Object.values(row).map((value: any, j: number) => (
                            <td key={j} className="p-2 text-slate-600 max-w-[200px] truncate">{String(value || '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setShowUploadModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Back to Upload
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm"
                >
                  Close
                </button>
              </div>
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