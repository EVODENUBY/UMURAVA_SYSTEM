"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Card, CardContent } from '@/components/ui/Card';
import { MapPin, Briefcase, Clock, DollarSign, Building2, Users, Check, GraduationCap, FileText, Upload, X, ArrowLeft, Loader2, Star, Globe, Award, Tag, CheckCircle, Link } from 'lucide-react';

interface Job {
  _id: string;
  title: string;
  location: string | { address?: string; city?: string; country?: string; remote?: boolean };
  experience: { level: string; minYears?: number };
  salary?: { min: number; max: number; currency: string };
  requiredSkills?: string[];
  postedDate?: string;
  expirationDate?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  company?: string;
  employmentType?: string;
  recruiter?: { fullName: string; email: string };
  applications?: number;
  education?: { degree?: string; field?: string; required?: boolean }[];
  jobLevel?: string;
  certifications?: string[];
  languages?: string[];
  tags?: string[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://recruiter-ai-platform.onrender.com';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const auth = useAuth();
  const token = auth?.token;
  const user = auth?.user;
  const { showToast } = useToast();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState<File | null>(null);

  const handleApply = async () => {
    if (!token) { showToast('Please login to apply', 'error'); return; }
    if (applying) return;
    
    setApplying(true);
    try {
      const res = await fetch(`${API_BASE}/api/profile/apply/${params.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverLetter: coverLetter || 'Optional cover letter' })
      });
      const data = await res.json();
      if (data.success) { showToast('Application submitted!', 'success'); setApplied(true); }
      else { showToast(data.error?.message || 'Failed to apply', 'error'); }
    } catch (error) { showToast('Failed to apply', 'error'); }
    finally { setApplying(false); }
  };

  const getLocation = (loc: any) => typeof loc === 'string' ? loc : loc?.city || loc?.address || loc?.country || 'Remote';
  const formatSalary = (min: number, max: number, c: string) => `${c} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  const timeAgo = (d?: string) => { if (!d) return ''; const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000); if (days === 0) return 'Today'; if (days === 1) return '1 day ago'; return `${days} days ago`; };
  const getExp = (d?: string) => { if (!d) return ''; const days = Math.floor((new Date(d).getTime() - Date.now()) / 86400000); if (days < 0) return 'Expired'; if (days === 0) return 'Expires today'; if (days === 1) return '1 day left'; return `${days} days left`; };

  useEffect(() => {
    fetch(`${API_BASE}/api/jobs/${params.id}`).then(r => r.json()).then(d => { if (d.success) setJob(d.data); }).finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  if (!job) return <div className="text-center py-20 text-xl font-bold">Job not found</div>;

  return (
    <div className="space-y-5 ml-4 lg:ml-8 xl:ml-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-3 text-white">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><Briefcase className="w-6 h-6" /></div>
              <div className="flex-1">
                <h1 className="text-xl font-bold">{job.title}</h1>
                <p className="text-blue-100 text-sm">{job.company}</p>
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-blue-100">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(job.postedDate)}</span>
                  {job.expirationDate && <span className="px-2 py-0.5 bg-white/20 rounded-full">{getExp(job.expirationDate)}</span>}
                  {job.applications !== undefined && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {job.applications}</span>}
                </div>
              </div>
              <button onClick={() => setShowApplyModal(true)} className="px-5 py-2.5 rounded-lg text-sm font-bold bg-white text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2"><Link className="w-4 h-4" /> Apply Now</button>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-50 rounded-lg p-3"><div className="flex items-center gap-1 text-slate-400 text-xs mb-1"><MapPin className="w-3 h-3" /> Location</div><p className="font-semibold text-sm">{getLocation(job.location)}</p></div>
            <div className="bg-slate-50 rounded-lg p-3"><div className="flex items-center gap-1 text-slate-400 text-xs mb-1"><Briefcase className="w-3 h-3" /> Type</div><p className="font-semibold text-sm capitalize">{job.employmentType || 'Full-time'}</p></div>
            <div className="bg-slate-50 rounded-lg p-3"><div className="flex items-center gap-1 text-slate-400 text-xs mb-1"><Award className="w-3 h-3" /> Level</div><p className="font-semibold text-sm capitalize">{job.jobLevel || job.experience?.level || 'Mid'}</p></div>
            <div className="bg-slate-50 rounded-lg p-3"><div className="flex items-center gap-1 text-slate-400 text-xs mb-1"><DollarSign className="w-3 h-3" /> Salary</div><p className="font-semibold text-sm">{job.salary ? formatSalary(job.salary.min, job.salary.max, job.salary.currency) : 'Negotiable'}</p></div>
          </div>

          <Card><CardContent><h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /> Description</h3><p className="text-sm text-slate-600 leading-relaxed">{job.description}</p></CardContent></Card>

          {job.responsibilities && job.responsibilities.length > 0 && <Card><CardContent><h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Responsibilities</h3><ul className="space-y-2">{job.responsibilities.map((r, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />{r}</li>)}</ul></CardContent></Card>}

          {job.requirements && job.requirements.length > 0 && <Card><CardContent><h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Award className="w-4 h-4 text-amber-500" /> Requirements</h3><ul className="space-y-2">{job.requirements.map((r, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-600"><Award className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />{r}</li>)}</ul></CardContent></Card>}

          {job.education && job.education.length > 0 && <Card><CardContent><h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-purple-500" /> Education</h3><ul className="space-y-1">{job.education.map((e, i) => <li key={i} className="text-sm text-slate-600">{e.degree}{e.field && ` in ${e.field}`}{e.required && <span className="text-xs text-purple-500 ml-2">(Required)</span>}</li>)}</ul></CardContent></Card>}

          {job.benefits && job.benefits.length > 0 && <Card><CardContent><h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Benefits</h3><div className="flex flex-wrap gap-2">{job.benefits.map((b, i) => <span key={i} className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">{b}</span>)}</div></CardContent></Card>}
        </div>

        <div className="space-y-4">
          <Card><CardContent><h3 className="font-bold text-slate-800 mb-3">Required Skills</h3><div className="flex flex-wrap gap-1.5">{job.requiredSkills?.map(s => <span key={s} className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">{s}</span>)}</div></CardContent></Card>
          
          {job.certifications && job.certifications.length > 0 && <Card><CardContent><h3 className="font-bold text-slate-800 mb-2">Certifications</h3><div className="flex flex-wrap gap-1.5">{job.certifications.map((c, i) => <span key={i} className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium">{c}</span>)}</div></CardContent></Card>}
          
          {job.languages && job.languages.length > 0 && <Card><CardContent><h3 className="font-bold text-slate-800 mb-2">Languages</h3><div className="flex flex-wrap gap-1.5">{job.languages.map((l, i) => <span key={i} className="px-2.5 py-1 bg-teal-100 text-teal-700 rounded-lg text-xs font-medium">{l}</span>)}</div></CardContent></Card>}
          
          {job.tags && job.tags.length > 0 && <Card><CardContent><h3 className="font-bold text-slate-800 mb-2"><Tag className="w-4 h-4 inline" /> Tags</h3><div className="flex flex-wrap gap-1.5">{job.tags.map((t, i) => <span key={i} className="px-2.5 py-1 bg-pink-100 text-pink-700 rounded-lg text-xs font-medium">{t}</span>)}</div></CardContent></Card>}
        </div>
      </div>

      <AnimatePresence>
        {showApplyModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-3">
            <div className="absolute inset-0 bg-black/50" onClick={() => !applying && setShowApplyModal(false)} />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
              {applied ? (
                <div className="p-8 text-center"><div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle className="w-7 h-7 text-green-500" /></div><h3 className="font-bold text-lg">Application Submitted!</h3><p className="text-slate-500 text-sm mt-1">Your application has been sent to {job.company}</p></div>
              ) : (
                <>
                  <div className="p-4 border-b flex justify-between items-center">
                    <div><h3 className="font-bold">Apply for {job.title}</h3><p className="text-xs text-slate-500">{job.company}</p></div>
                    <button onClick={() => setShowApplyModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4 text-slate-400" /></button>
                  </div>
                  <div className="p-4 space-y-3">
                    <div><label className="block text-xs font-medium text-slate-700 mb-1">Cover Letter (Optional)</label>
                      <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder="Why you're a great fit..." rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 outline-none" />
                    </div>
                    <div><label className="block text-xs font-medium text-slate-700 mb-1">Resume/CV (Optional)</label><div className={`relative border-2 border-dashed rounded-lg p-3 text-center transition-colors ${resume ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>{resume ? <div className="flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" /><span className="text-green-700 text-sm">{resume.name}</span><button onClick={() => setResume(null)}><X className="w-3 h-3 text-green-600" /></button>
                      </div> : <div className="py-1"><Upload className="w-6 h-6 text-slate-300 mx-auto" /><p className="text-slate-400 text-xs">Click to upload PDF/DOC</p></div>}<input type="file" accept=".pdf,.doc,.docx" onChange={e => e.target.files?.[0] && setResume(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" /></div></div>
                  </div>
                  <div className="p-3 border-t flex gap-2">
                    <button onClick={() => setShowApplyModal(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50">Cancel</button>
                    <button onClick={handleApply} disabled={applying} className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2" style={{ backgroundColor: applying ? '#93c5fd' : '#2b71f0' }}>{applying ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Application'}</button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}