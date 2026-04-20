"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, Briefcase, User, Sparkles, Star, 
  CheckCircle, ArrowRight, AlertCircle, Loader
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

const BRAND_COLOR = "#2b71f0";
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://recruiter-ai-platform.onrender.com';

interface Suggestion {
  category: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

interface JobRecommendation {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  reasoning: string;
}

type TabType = 'jobs' | 'profile';

const getString = (val: any, fallback = 'N/A') => {
  if (typeof val === 'string') return val;
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object') return val.name || val.city || val.country || val.address || String(val);
  return String(val || fallback);
};

export default function RecommendationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('jobs');
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [jobRecommendations, setJobRecommendations] = useState<JobRecommendation[]>([]);
  const [profileSuggestions, setProfileSuggestions] = useState<Suggestion[]>([]);
  const [jobRecommendationText, setJobRecommendationText] = useState('');
  const [profileSuggestionText, setProfileSuggestionText] = useState('');
  const [hasLoadedJobs, setHasLoadedJobs] = useState(false);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  
  const { token } = useAuth();
  const { showToast } = useToast();

  const fetchJobRecommendations = async () => {
    setIsLoadingJobs(true);
    try {
      const res = await fetch(`${API_BASE}/api/profile/recommendations`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      
      if (data.success) {
        setJobRecommendationText(data.data.recommendations || '');
        setJobRecommendations(data.data.jobs || []);
        setHasLoadedJobs(true);
        showToast('Job recommendations loaded!', 'success');
      } else {
        showToast(data.error?.message || 'Failed to get recommendations', 'error');
      }
    } catch (error) {
      showToast('Failed to connect to server', 'error');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const fetchProfileSuggestions = async () => {
    setIsLoadingProfile(true);
    try {
      const res = await fetch(`${API_BASE}/api/profile/improve-suggestions`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      
      if (data.success) {
        const suggestions = data.data.suggestions || [];
        if (suggestions.length > 0 && typeof suggestions[0] === 'object' && 'suggestion' in suggestions[0]) {
          setProfileSuggestions(suggestions as Suggestion[]);
        } else {
          setProfileSuggestionText(data.data.suggestions || data.data.message || '');
          setProfileSuggestions([]);
        }
        setHasLoadedProfile(true);
        showToast('Profile suggestions loaded!', 'success');
      } else {
        showToast(data.error?.message || 'Failed to get suggestions', 'error');
      }
    } catch (error) {
      showToast('Failed to connect to server', 'error');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const renderContent = () => {
    if (activeTab === 'jobs') {
      return (
        <div>
          {!hasLoadedJobs ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Get Job Recommendations</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                Our AI will analyze your profile and recommend the most suitable jobs based on your skills and experience.
              </p>
              <button
                onClick={fetchJobRecommendations}
                disabled={isLoadingJobs}
                className="px-8 py-3 rounded-xl text-white font-semibold flex items-center gap-2 mx-auto transition-all disabled:opacity-70"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                {isLoadingJobs ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Analyzing profile...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Get Recommendations</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobRecommendationText && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold text-slate-900">AI Analysis</span>
                  </div>
                  <div className="text-sm text-slate-700 space-y-4">
                    {jobRecommendationText.split('\n').map((line, i) => {
                      const trimmed = line.trim();
                      if (!trimmed) return null;
                      if (trimmed.startsWith('### ')) {
                        return <h4 key={i} className="text-base font-bold text-slate-900 mt-4">{trimmed.replace('### ', '')}</h4>;
                      }
                      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                        return <h5 key={i} className="text-sm font-bold text-slate-800 mt-3">{trimmed.replace(/\*\*/g, '')}</h5>;
                      }
                      if (trimmed.startsWith('* **')) {
                        const match = trimmed.match(/\* \*\*(.+?)\*\*/);
                        return (
                          <div key={i} className="mt-2 pl-2">
                            <span className="font-semibold text-slate-700">{match ? match[1] : trimmed}</span>
                          </div>
                        );
                      }
                      if (trimmed.startsWith('- **') || trimmed.startsWith('* **')) {
                        const match = trimmed.match(/[-*] \*\*(.+?)\*\*/);
                        if (match) {
                          const content = trimmed.replace(/^[-*] \*\*.+?\*\*:?\s*/, '').replace(/\*\*/g, '');
                          return (
                            <div key={i} className="flex items-start gap-2 mt-1 pl-2">
                              <span className="text-red-500 mt-1">•</span>
                              <div>
                                <span className="font-semibold text-slate-700">{match[1]}</span>
                                <span className="text-slate-600">{content && `: ${content}`}</span>
                              </div>
                            </div>
                          );
                        }
                      }
                      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                        return (
                          <div key={i} className="flex items-start gap-2 mt-1 pl-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span className="text-slate-600">{trimmed.replace(/^[-*] /, '').replace(/\*\*/g, '')}</span>
                          </div>
                        );
                      }
                      return <p key={i} className="text-slate-600 mt-1">{trimmed.replace(/\*\*/g, '')}</p>;
                    })}
                  </div>
                </div>
              )}

              {jobRecommendations.length > 0 && jobRecommendations.some(j => j.matchScore) && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>Matching Jobs</span>
                    <span className="text-xs font-normal text-slate-500">({jobRecommendations.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {jobRecommendations.map((job, index) => (
                      <motion.div
                        key={job.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-slate-50 rounded-lg p-3 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-slate-900 truncate">
                            {getString(job.title, 'Job')}
                          </h5>
                          <p className="text-xs text-slate-500 truncate">
                            {getString(job.location, 'Location')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-100 border border-green-200 flex-shrink-0">
                          <Star className="w-3 h-3 text-yellow-600" />
                          <span className="text-sm font-bold text-green-700">
                            {job.matchScore ? getString(job.matchScore, '0') : '-'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {jobRecommendations.length === 0 && !jobRecommendationText && (
                <div className="text-center py-8 text-slate-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>No job recommendations available at the moment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div>
          {!hasLoadedProfile ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <User className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Improve Your Profile</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                Our AI will analyze your profile and provide personalized suggestions to make it stand out to recruiters.
              </p>
              <button
                onClick={fetchProfileSuggestions}
                disabled={isLoadingProfile}
                className="px-8 py-3 rounded-xl text-white font-semibold flex items-center gap-2 mx-auto transition-all disabled:opacity-70"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                {isLoadingProfile ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Analyzing profile...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Get Suggestions</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {profileSuggestionText && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold text-slate-900">AI Recommendations</span>
                  </div>
                  <div className="text-sm text-slate-700 space-y-2">
                    {profileSuggestionText.split('\n').map((line, i) => {
                      const trimmed = line.trim();
                      if (!trimmed) return null;
                      if (trimmed.startsWith('### ')) {
                        return <h4 key={i} className="text-base font-bold text-slate-900 mt-3">{trimmed.replace('### ', '')}</h4>;
                      }
                      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                        return <h5 key={i} className="text-sm font-bold text-slate-800 mt-3">{trimmed.replace(/\*\*/g, '')}</h5>;
                      }
                      if (trimmed.startsWith('**')) {
                        return <p key={i} className="font-semibold text-slate-700 mt-2">{trimmed.replace(/\*\*/g, '')}</p>;
                      }
                      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                        return (
                          <div key={i} className="flex items-start gap-2 pl-2">
                            <span className="text-purple-500 mt-1">•</span>
                            <span className="text-slate-600">{trimmed.replace(/^[-*] /, '').replace(/\*\*/g, '')}</span>
                          </div>
                        );
                      }
                      return <p key={i} className="text-slate-600">{trimmed.replace(/\*\*/g, '')}</p>;
                    })}
                  </div>
                </div>
              )}

              {profileSuggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Profile Improvements</span>
                  </h4>
                  <div className="space-y-3">
                    {profileSuggestions.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`rounded-xl p-4 border ${getPriorityColor(item.priority || '')}`}
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          <div>
                            {item.category && (
                              <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                                {getString(item.category)}
                              </span>
                            )}
                            <p className="text-sm text-slate-700">{getString(item.suggestion)}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {profileSuggestions.length === 0 && !profileSuggestionText && (
                <div className="text-center py-8 text-slate-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>No profile suggestions available. Please complete your profile first.</p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">AI Recommendations</h1>
          <p className="text-slate-500">Get personalized job recommendations and profile improvement suggestions powered by AI</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex-1 py-4 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'jobs' 
                  ? 'text-white border-b-0' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              style={activeTab === 'jobs' ? { backgroundColor: BRAND_COLOR } : {}}
            >
              <Briefcase className="w-4 h-4" />
              <span>Job Recommendations</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'profile' 
                  ? 'text-white border-b-0' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              style={activeTab === 'profile' ? { backgroundColor: BRAND_COLOR } : {}}
            >
              <User className="w-4 h-4" />
              <span>Profile Suggestions</span>
            </button>
          </div>

          <div className="p-5 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}