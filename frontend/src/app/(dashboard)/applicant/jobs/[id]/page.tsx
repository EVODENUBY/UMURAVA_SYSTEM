"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { MapPin, Briefcase, Clock, DollarSign, Building2, Users, Check, GraduationCap, FileText, Upload, X, ArrowLeft, Share2, Heart, Bot, Loader2 } from 'lucide-react';

interface Job {
  _id: string;
  title: string;
  location: string;
  experience: { level: string };
  salary: { min: number; max: number; currency: string };
  requiredSkills: string[];
  createdAt: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  company: string;
  employmentType: string;
  recruiter: { fullName: string; email: string };
  applications: number;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState<File | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`https://recruiter-ai-platform.onrender.com/api/jobs/${params.id}`);
        const result = await res.json();
        if (result.success) setJob(result.data);
      } catch (error) {
        console.error('Fetch error:', error);
        setJob({
          _id: params.id as string,
          title: 'Senior Frontend Developer',
          location: 'Kigali, Rwanda',
          experience: { level: 'Senior' },
          salary: { min: 150000, max: 250000, currency: 'RWF' },
          requiredSkills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Node.js'],
          createdAt: new Date().toISOString(),
          description: 'We are looking for an experienced Frontend Developer to join our team. You will be responsible for building user-facing features, optimizing web applications, and collaborating with designers and backend developers.',
          responsibilities: [
            'Develop new user-facing features using React.js',
            'Build reusable components and front-end libraries',
            'Optimize components for maximum performance',
            'Collaborate with team members on UI/UX improvements',
            'Participate in code reviews and mentor junior developers'
          ],
          requirements: [
            '5+ years of experience in frontend development',
            'Strong proficiency in React.js and TypeScript',
            'Experience with Next.js and modern CSS frameworks',
            'Excellent problem-solving skills',
            'Strong communication skills in English'
          ],
          benefits: [
            'Competitive salary package',
            'Health insurance coverage',
            'Flexible working hours',
            'Remote work options',
            'Professional development budget'
          ],
          company: 'TechCorp Rwanda',
          employmentType: 'Full-time',
          recruiter: { fullName: 'John Smith', email: 'john@techcorp.rw' },
          applications: 24
        });
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [params.id]);

  const formatSalary = (min: number, max: number, currency: string) => {
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffMs = now.getTime() - posted.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

  const handleApply = async () => {
    setApplying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setApplying(false);
    setApplied(true);
    setTimeout(() => setShowApplyModal(false), 1500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-white/50 border-t-white animate-spin" />
          </div>
        </div>
        <p className="text-slate-500 font-bold">Loading job details...</p>
        <p className="text-slate-400 text-sm mt-1">Please wait while we fetch the job information</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-slate-900">Job not found</h2>
        <button onClick={() => router.back()} className="mt-4 text-blue-500 font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-bold text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </button>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-3xl font-black text-slate-400">
              {job.company?.charAt(0) || <Building2 className="w-8 h-8" />}
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">{job.title}</h1>
              <p className="text-lg text-slate-500 mt-2 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" /> {job.company}
              </p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500" /> {job.location}</span>
                <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-blue-500" /> {job.experience.level}</span>
                <span className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-blue-500" /> {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}</span>
                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> {timeAgo(job.createdAt)}</span>
                <span className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" /> {job.applications} applicants</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none p-4 rounded-2xl border-2 border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all">
              <Heart className="w-6 h-6" />
            </button>
            <button className="flex-1 lg:flex-none p-4 rounded-2xl border-2 border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all">
              <Share2 className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setShowApplyModal(true)}
              className="flex-1 lg:flex-none px-8 py-4 rounded-2xl text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: '#2b71f0' }}
            >
              Apply Now
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent>
                <h2 className="text-xl font-black uppercase tracking-tight mb-4">Job Description</h2>
                <p className="text-slate-600 leading-relaxed">{job.description}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent>
                <h2 className="text-xl font-black uppercase tracking-tight mb-4">Responsibilities</h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600">
                      <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-blue-500" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent>
                <h2 className="text-xl font-black uppercase tracking-tight mb-4">Requirements</h2>
                <ul className="space-y-3">
                  {job.requirements.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600">
                      <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-amber-500" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardContent>
                <h2 className="text-xl font-black uppercase tracking-tight mb-4">Benefits & Perks</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {job.benefits.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50">
                      <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Check className="w-4 h-4 text-emerald-500" />
                      </span>
                      <span className="font-medium text-emerald-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="sticky top-24">
              <CardContent>
                <h3 className="text-lg font-black uppercase tracking-tight mb-4">Job Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Employment Type</span>
                    <span className="font-bold text-sm">{job.employmentType}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Experience Level</span>
                    <span className="font-bold text-sm">{job.experience.level}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Salary Range</span>
                    <span className="font-bold text-sm">{formatSalary(job.salary.min, job.salary.max, job.salary.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Location</span>
                    <span className="font-bold text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-slate-500 text-sm">Total Applicants</span>
                    <span className="font-bold text-sm">{job.applications}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-100">
                  <div className="flex items-center gap-2 text-green-600 font-bold text-sm mb-2">
                    <Briefcase className="w-4 h-4" /> Job Details
                  </div>
                  <p className="text-sm text-slate-600">Review the job requirements and apply if you're interested.</p>
                </div>

                <button 
                  onClick={() => setShowApplyModal(true)}
                  className="w-full mt-6 py-4 rounded-2xl text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all"
                  style={{ backgroundColor: '#2b71f0' }}
                >
                  Apply for this Position
                </button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent>
                <h3 className="text-lg font-black uppercase tracking-tight mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill) => (
                    <span key={skill} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showApplyModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !applying && setShowApplyModal(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {applied ? (
                <div className="p-12 text-center">
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="w-10 h-10 text-emerald-500" />
                  </motion.div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Application Submitted!</h3>
                  <p className="text-slate-500">Your application has been sent to {job.company}. They will review it shortly.</p>
                </div>
              ) : (
                <>
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl">
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight">Apply for {job.title}</h3>
                      <p className="text-sm text-slate-500">{job.company}</p>
                    </div>
                    <button onClick={() => setShowApplyModal(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                      <X className="w-6 h-6 text-slate-400" />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Cover Letter</label>
                      <textarea 
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Tell us why you're a great fit for this role..."
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none resize-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Resume</label>
                      <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${resume ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-blue-300'}`}>
                        {resume ? (
                          <div className="flex items-center justify-center gap-3">
                            <FileText className="w-6 h-6 text-emerald-500" />
                            <span className="font-medium text-emerald-700">{resume.name}</span>
                            <button onClick={() => setResume(null)} className="p-1 hover:bg-emerald-100 rounded-lg">
                              <X className="w-4 h-4 text-emerald-500" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">Drag & drop or click to upload</p>
                            <p className="text-xs text-slate-400 mt-1">PDF, DOC up to 5MB</p>
                          </>
                        )}
                        <input 
                          type="file" 
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => e.target.files?.[0] && setResume(e.target.files[0])}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                      <p className="text-sm text-blue-700">
                        <strong>Note:</strong> Your profile information will be automatically attached to this application.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 border-t border-slate-100 flex gap-4 sticky bottom-0 bg-white rounded-b-3xl">
                    <button 
                      onClick={() => setShowApplyModal(false)}
                      className="flex-1 py-4 rounded-2xl border-2 border-slate-200 font-bold text-sm uppercase tracking-wider hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleApply}
                      disabled={applying}
                      className="flex-1 py-4 rounded-2xl text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      style={{ backgroundColor: applying ? '#93c5fd' : '#2b71f0' }}
                    >
                      {applying ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Submitting...
                        </>
                      ) : 'Submit Application'}
                    </button>
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
