"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FaFileAlt, FaClock, FaCheckCircle, FaTimesCircle, FaEye, 
  FaRobot, FaMapMarker, FaCalendar, FaInfoCircle, FaExclamationCircle,
  FaBriefcase, FaBuilding, FaGlobe, FaMoneyBillWave, FaLevelUpAlt,
  FaTimes, FaChevronRight, FaUserTie, FaClipboardList, FaStar
} from 'react-icons/fa';
import { 
  MapPin, Briefcase, DollarSign, Clock, Users, CheckCircle, 
  GraduationCap, Award, Star as LucideStar, X, FileText, Globe as LucideGlobe 
} from 'lucide-react';

interface JobInfo {
  _id: string;
  title: string;
  description?: string;
  employmentType?: string;
  jobLevel?: string;
  requiredSkills?: string[];
  responsibilities?: string[];
  experience?: string;
  education?: { degree: string; field?: string; required: boolean }[];
  certifications?: string[];
  languages?: string[];
  location?: { city?: string; country?: string; remote?: boolean };
  salary?: { min?: number; max?: number; currency?: string };
  benefits?: string[];
  tags?: string[];
  company?: string;
  postedDate?: string;
  applicationDeadline?: string;
  expirationDate?: string;
  applicationProcess?: { steps?: string[] };
  status?: string;
  analytics?: { applications: number; shortlisted: number };
}

interface Application {
  _id: string;
  jobId?: JobInfo;
  status: string;
  coverLetter?: string;
  resumeLink?: string;
  appliedAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: JSX.Element }> = {
  applied: { label: 'Applied', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', icon: <FaFileAlt /> },
  interview: { label: 'Interview', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', icon: <FaCheckCircle /> },
  offer: { label: 'Offer', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', icon: <FaCheckCircle /> },
  hired: { label: 'Hired', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', icon: <FaCheckCircle /> },
  rejected: { label: 'Declined', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', icon: <FaTimesCircle /> },
};

export default function ApplicantApplicationsPage() {
  const { token } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobInfo | null>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonApp, setReasonApp] = useState<Application | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!token) return;
      
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/my-applications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
          setApplications(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token]);

  const filteredApps = filter === 'all' 
    ? applications 
    : applications.filter(a => a.status === filter);

  const stats = [
    { label: 'Total', value: applications.length, color: 'from-blue-500 to-blue-600' },
    { label: 'In Progress', value: applications.filter(a => ['applied'].includes(a.status)).length, color: 'from-amber-500 to-amber-600' },
    { label: 'Interviews', value: applications.filter(a => a.status === 'interview').length, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Offers', value: applications.filter(a => a.status === 'offer').length, color: 'from-purple-500 to-purple-600' },
  ];

  const getLocation = (loc?: { city?: string; country?: string; remote?: boolean }) => {
    if (!loc) return 'Not specified';
    if (loc.remote) return 'Remote';
    if (loc.city) return `${loc.city}${loc.country ? ', ' + loc.country : ''}`;
    return 'Not specified';
  };

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min || !max || !currency) return 'Not specified';
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const getTimeAgo = (date?: string) => {
    if (!date) return '';
    const posted = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - posted.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleViewJob = (job: JobInfo) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const handleViewReason = (app: Application) => {
    setReasonApp(app);
    setShowReasonModal(true);
  };

  const getStatusConfig = (status: string) => {
    const config = statusConfig[status];
    return config || { label: status, color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', icon: <FaClock /> };
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">My Applications</h1>
        <p className="text-slate-500 mt-2">Track your job application journey</p>
      </motion.div>

      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs font-bold uppercase">{stat.label}</p>
                    <p className="text-3xl font-black mt-1">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <FaUserTie className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {['all', 'applied', 'interview', 'offer', 'rejected'].map((status) => (
          <button 
            key={status} 
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${filter === status ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
          >
            {status === 'all' ? 'All' : statusConfig[status]?.label || status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse border border-slate-100">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-200" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <FaFileAlt className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500 font-semibold text-lg">No applications found</p>
          <p className="text-slate-400 text-sm mt-2">Start applying to jobs to see your applications here</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredApps.map((app, i) => {
              const config = getStatusConfig(app.status);
              return (
                <motion.div 
                  key={app._id} 
                  layout
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                    <div className={`h-2 bg-gradient-to-r ${config.color.replace('text', 'from').replace('-600', '-500').replace('text', '')} to-blue-500`} />
                    
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <FaBriefcase className="w-7 h-7 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {app.jobId?.title || 'Job Position'}
                          </h3>
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <FaBuilding className="w-3 h-3" /> {app.jobId?.company || 'Company'}
                          </p>
                        </div>
                      </div>

                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${config.bgColor} ${config.borderColor} border ${config.color}`}>
                        {config.icon} {config.label}
                      </div>

                      <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                        {app.jobId?.location && (
                          <span className="flex items-center gap-1">
                            <FaMapMarker className="w-3 h-3" /> {getLocation(app.jobId.location)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                        <FaCalendar className="w-3 h-3" /> Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </div>

                      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
                        <button 
                          onClick={() => app.jobId && handleViewJob(app.jobId)}
                          className="flex-1 py-2.5 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs uppercase hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <FaEye /> View Job
                        </button>
                        {app.status === 'rejected' && (
                          <button 
                            onClick={() => handleViewReason(app)}
                            className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-xs uppercase hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                          >
                            <FaInfoCircle className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showJobModal && selectedJob && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4"
            onClick={() => setShowJobModal(false)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.15 }}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg text-white">{selectedJob.title}</h2>
                      <p className="text-blue-100 text-sm font-medium">{selectedJob.company || 'Company'}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowJobModal(false)} className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <FaCheckCircle className="w-3 h-3" /> Applied
                  </span>
                  <span className="text-xs text-blue-200 capitalize">{selectedJob.employmentType || 'Full-time'}</span>
                  <span className="text-xs text-blue-200">• {getTimeAgo(selectedJob.postedDate)}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-slate-50 rounded-lg p-2.5">
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-1">
                      <MapPin className="w-2.5 h-2.5" /> Location
                    </div>
                    <p className="font-semibold text-slate-800 text-xs">{getLocation(selectedJob.location)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2.5">
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-1">
                      <Briefcase className="w-2.5 h-2.5" /> Type
                    </div>
                    <p className="font-semibold text-slate-800 text-xs capitalize">{selectedJob.employmentType || 'Full-time'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2.5">
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-1">
                      <Award className="w-2.5 h-2.5" /> Level
                    </div>
                    <p className="font-semibold text-slate-800 text-xs capitalize">{selectedJob.jobLevel || 'Mid'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2.5">
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-1">
                      <DollarSign className="w-2.5 h-2.5" /> Salary
                    </div>
                    <p className="font-semibold text-slate-800 text-xs">{formatSalary(selectedJob.salary?.min, selectedJob.salary?.max, selectedJob.salary?.currency)}</p>
                  </div>
                </div>

                {selectedJob.description ? (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h3 className="text-xs font-bold text-blue-800 mb-1.5">Job Description</h3>
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-4">{selectedJob.description}</p>
                  </div>
                ) : (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h3 className="text-xs font-bold text-blue-800 mb-1.5">Job Description</h3>
                    <p className="text-slate-400 text-xs">No description available</p>
                  </div>
                )}

                {selectedJob.requiredSkills && selectedJob.requiredSkills.length > 0 ? (
                  <div className="bg-purple-50 rounded-lg p-3">
                    <h3 className="text-xs font-bold text-purple-800 mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.requiredSkills.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <h3 className="text-xs font-bold text-emerald-800 mb-2">Responsibilities</h3>
                    <ul className="space-y-1">
                      {selectedJob.responsibilities.slice(0, 4).map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-slate-600 text-xs">
                          <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                      {selectedJob.responsibilities.length > 4 && (
                        <li className="text-slate-400 text-xs">+{selectedJob.responsibilities.length - 4} more...</li>
                      )}
                    </ul>
                  </div>
                )}

                {selectedJob.experience && (
                  <div className="bg-amber-50 rounded-lg p-3">
                    <h3 className="text-xs font-bold text-amber-800 mb-1">Experience</h3>
                    <p className="text-slate-600 text-xs">{selectedJob.experience}</p>
                  </div>
                )}

                {selectedJob.education && selectedJob.education.length > 0 && (
                  <div className="bg-indigo-50 rounded-lg p-3">
                    <h3 className="text-xs font-bold text-indigo-800 mb-1">Education</h3>
                    <div className="space-y-0.5">
                      {selectedJob.education.map((edu, i) => (
                        <p key={i} className="text-slate-600 text-xs">
                          {edu.degree}{edu.field && ` in ${edu.field}`}
                          {edu.required && <span className="text-[10px] text-indigo-500 ml-1">(Required)</span>}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {selectedJob.certifications && selectedJob.certifications.length > 0 && (
                  <div className="bg-orange-50 rounded-lg p-3">
                    <h3 className="text-xs font-bold text-orange-800 mb-1.5">Certifications</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.certifications.map((cert, i) => (
                        <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-medium">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedJob.languages && selectedJob.languages.length > 0 && (
                  <div className="bg-teal-50 rounded-lg p-3">
                    <h3 className="text-xs font-bold text-teal-800 mb-1.5">Languages</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.languages.map((lang, i) => (
                        <span key={i} className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded text-[10px] font-medium">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <h3 className="text-xs font-bold text-green-800 mb-1.5">Benefits</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.benefits.map((benefit, i) => (
                        <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedJob.tags && selectedJob.tags.length > 0 && (
                  <div className="bg-pink-50 rounded-lg p-3">
                    <h3 className="text-xs font-bold text-pink-800 mb-1.5">Tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded text-[10px] font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedJob.applicationDeadline && (
                  <div className="bg-yellow-50 rounded-lg p-2.5 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-yellow-600" />
                    <span className="text-xs text-yellow-700 font-medium">Deadline: {formatDate(selectedJob.applicationDeadline)}</span>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-slate-100 bg-slate-50">
                <button 
                  onClick={() => setShowJobModal(false)}
                  className="w-full py-2.5 rounded-lg font-semibold text-sm text-white bg-blue-500 hover:bg-blue-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReasonModal && reasonApp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReasonModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <FaExclamationCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Application Decision</h3>
                  <p className="text-sm text-slate-500">{reasonApp.jobId?.title}</p>
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-xl border border-red-100 mb-4">
                <p className="text-xs font-bold text-red-600 uppercase mb-2 flex items-center gap-1">
                  <FaExclamationCircle className="w-3 h-3" /> Reason for Declining
                </p>
                <p className="text-sm text-slate-700">{reasonApp.rejectionReason || 'The hiring team has decided to move forward with other candidates whose qualifications more closely match our current needs.'}</p>
              </div>

              <div className="text-xs text-slate-400 mb-4">
                <p>This does not reflect on your abilities. We encourage you to apply for other positions that match your skills.</p>
              </div>

              <button 
                onClick={() => setShowReasonModal(false)}
                className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-colors"
              >
                Understood
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}