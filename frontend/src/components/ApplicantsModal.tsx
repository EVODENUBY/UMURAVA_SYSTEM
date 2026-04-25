"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { FaUser, FaUsers, FaEnvelope, FaPhone, FaTimes, FaBriefcase } from 'react-icons/fa';

interface ApplicantsModalProps {
  job: { _id: string; title: string } | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Applicant {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  status: string;
  userId?: { fullName: string; email: string; firstName: string };
  appliedAt?: string;
}

export default function ApplicantsModal({ job, isOpen, onClose }: ApplicantsModalProps) {
  const { token } = useAuth();
  const [applicants, setApplicants] = useState<{ internal: Applicant[]; external: Applicant[] }>({ 
    internal: [], 
    external: [] 
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'internal' | 'external'>('all');

  useEffect(() => {
    if (isOpen && job) {
      fetchApplicants();
    }
  }, [isOpen, job]);

  const fetchApplicants = async () => {
    if (!job) return;
    setLoading(true);
    try {
      const [internalRes, externalRes] = await Promise.all([
        api.get<{ success: boolean; data: { applications: Applicant[]; pagination: any } }>(`/api/applicants/internal?jobId=${job._id}&limit=1000`, token || undefined),
        api.get<{ success: boolean; data: { applicants: Applicant[]; pagination: any } }>(`/api/applicants/external?jobId=${job._id}&limit=1000`, token || undefined)
      ]);
      setApplicants({
        internal: (internalRes.success && Array.isArray(internalRes.data?.applications)) ? internalRes.data.applications : [],
        external: (externalRes.success && Array.isArray(externalRes.data?.applicants)) ? externalRes.data.applicants : []
      });
    } catch (error) {
      console.error('Failed to fetch applicants:', error);
      setApplicants({ internal: [], external: [] });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-700';
      case 'screening': return 'bg-yellow-100 text-yellow-700';
      case 'shortlisted': return 'bg-purple-100 text-purple-700';
      case 'interview': return 'bg-pink-100 text-pink-700';
      case 'offer': return 'bg-cyan-100 text-cyan-700';
      case 'hired': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  const allApplicants = [...(applicants.external || []), ...(applicants.internal || [])];
  const totalCount = allApplicants.length;
  const internalCount = (applicants.internal || []).length;
  const externalCount = (applicants.external || []).length;

  const filteredApplicants = activeTab === 'all' 
    ? allApplicants 
    : activeTab === 'internal' 
      ? (applicants.internal || []) 
      : (applicants.external || []);

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaBriefcase className="text-blue-600 w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-blue-600">{job.title}</h2>
                <p className="text-sm text-slate-500">
                  {totalCount} total applicants
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab('internal')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'internal' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Internal ({internalCount})
            </button>
            <button
              onClick={() => setActiveTab('external')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'external' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              External ({externalCount})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-slate-500">Loading applicants...</p>
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="text-center py-8">
              <FaUsers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No applicants yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplicants.map((app, index) => (
                <div 
                  key={app._id} 
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {app.name ? getInitials(app.name) : getInitials(app.userId?.fullName || 'U')}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {app.name || app.userId?.fullName || 'Applicant'}
                      </p>
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        <FaEnvelope className="w-3 h-3" />
                        {app.email || app.userId?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(app.status)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {index + 1}. {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}