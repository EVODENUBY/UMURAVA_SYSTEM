"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, FaEnvelope, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, 
  FaCertificate, FaProjectDiagram, FaClock, FaLink, FaGithub, FaLinkedin,
  FaPlus, FaSave, FaTimes, FaChevronRight, FaChevronLeft,
  FaCode, FaBuilding, FaCalendar, FaCheck, FaGlobe, FaLanguage,
  FaExternalLinkAlt, FaCheckCircle
} from 'react-icons/fa';
import Link from 'next/link';

const BRAND_COLOR = "#2b71f0";

type StepKey = 'basic' | 'skills' | 'experience' | 'education' | 'certifications' | 'projects' | 'availability' | 'social';

interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience: number;
}

interface Language {
  id: string;
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
  isCurrent: boolean;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  role: string;
  link: string;
  startDate: string;
  endDate: string;
}

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio: string;
  location: string;
  phone: string;
  skills: Skill[];
  languages: Language[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  projects: Project[];
  availability: {
    status: 'Available' | 'Open to Opportunities' | 'Not Available';
    type: 'Full-time' | 'Part-time' | 'Contract';
    startDate: string;
  };
  socialLinks: {
    linkedin: string;
    github: string;
    portfolio: string;
  };
}

const initialProfile: Profile = {
  firstName: '',
  lastName: '',
  email: '',
  headline: '',
  bio: '',
  location: '',
  phone: '',
  skills: [],
  languages: [],
  experience: [],
  education: [],
  certifications: [],
  projects: [],
  availability: {
    status: 'Open to Opportunities',
    type: 'Full-time',
    startDate: '',
  },
  socialLinks: {
    linkedin: '',
    github: '',
    portfolio: '',
  },
};

const steps: { key: StepKey; label: string; icon: JSX.Element }[] = [
  { key: 'basic', label: 'Basic Info', icon: <FaUser /> },
  { key: 'skills', label: 'Skills', icon: <FaCode /> },
  { key: 'experience', label: 'Experience', icon: <FaBuilding /> },
  { key: 'education', label: 'Education', icon: <FaGraduationCap /> },
  { key: 'certifications', label: 'Certifications', icon: <FaCertificate /> },
  { key: 'projects', label: 'Projects', icon: <FaProjectDiagram /> },
  { key: 'availability', label: 'Availability', icon: <FaClock /> },
  { key: 'social', label: 'Social', icon: <FaLink /> },
];

export default function ProfilePage() {
  const [currentStep, setCurrentStep] = useState<StepKey>('basic');
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [tempProfile, setTempProfile] = useState<Profile>(initialProfile);
  const [isDirty, setIsDirty] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<StepKey>>(new Set());
  const [showSaveModal, setShowSaveModal] = useState(false);

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  const isStepCompleted = (step: StepKey) => completedSteps.has(step);

  const markStepCompleted = (step: StepKey) => {
    setCompletedSteps(prev => new Set(Array.from(prev).concat([step])));
  };

  const isStepValid = (step: StepKey) => {
    switch (step) {
      case 'basic':
        return tempProfile.firstName && tempProfile.lastName && tempProfile.email;
      case 'skills':
        return tempProfile.skills.length > 0;
      case 'experience':
        return tempProfile.experience.length > 0;
      case 'education':
        return tempProfile.education.length > 0;
      case 'certifications':
        return true;
      case 'projects':
        return true;
      case 'availability':
        return true;
      case 'social':
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      markStepCompleted(currentStep);
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex].key);
      }
    }
    setIsDirty(true);
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const handleSave = () => {
    setProfile(tempProfile);
    markStepCompleted(currentStep);
    setShowSaveModal(true);
    setIsDirty(false);
    setTimeout(() => setShowSaveModal(false), 2000);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert': return 'bg-purple-100 text-purple-700';
      case 'Advanced': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-blue-100 text-blue-700';
      case 'Beginner': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getLevelProgress = (level: string) => {
    switch (level) {
      case 'Expert': return 100;
      case 'Advanced': return 75;
      case 'Intermediate': return 50;
      case 'Beginner': return 25;
      default: return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-500';
      case 'Open to Opportunities': return 'bg-blue-500';
      case 'Not Available': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const addSkill = () => {
    setTempProfile({
      ...tempProfile,
      skills: [...tempProfile.skills, { id: Date.now().toString(), name: '', level: 'Intermediate', yearsOfExperience: 1 }]
    });
  };

  const addLanguage = () => {
    setTempProfile({
      ...tempProfile,
      languages: [...tempProfile.languages, { id: Date.now().toString(), name: '', proficiency: 'Conversational' }]
    });
  };

  const addExperience = () => {
    setTempProfile({
      ...tempProfile,
      experience: [...tempProfile.experience, { id: Date.now().toString(), company: '', role: '', startDate: '', endDate: '', description: '', technologies: [], isCurrent: false }]
    });
  };

  const addEducation = () => {
    setTempProfile({
      ...tempProfile,
      education: [...tempProfile.education, { id: Date.now().toString(), institution: '', degree: '', fieldOfStudy: '', startYear: 2020, endYear: 2024 }]
    });
  };

  const addCertification = () => {
    setTempProfile({
      ...tempProfile,
      certifications: [...tempProfile.certifications, { id: Date.now().toString(), name: '', issuer: '', issueDate: '' }]
    });
  };

  const addProject = () => {
    setTempProfile({
      ...tempProfile,
      projects: [...tempProfile.projects, { id: Date.now().toString(), name: '', description: '', technologies: [], role: '', link: '', startDate: '', endDate: '' }]
    });
  };

  const removeItem = (type: keyof Profile, id: string) => {
    setTempProfile({
      ...tempProfile,
      [type]: (tempProfile[type] as any[]).filter((item: any) => item.id !== id)
    });
  };

  const updateItem = (type: keyof Profile, id: string, field: string, value: any) => {
    setTempProfile({
      ...tempProfile,
      [type]: (tempProfile[type] as any[]).map((item: any) => 
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const progressPercentage = Math.round((completedSteps.size / steps.length) * 100);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/applicant" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <FaChevronLeft className="text-xs" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-black text-white">Complete Your Profile</h1>
              <p className="text-blue-100 text-sm mt-1">{progressPercentage}% Complete - {completedSteps.size} of {steps.length} sections</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-white">{progressPercentage}%</div>
            </div>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="h-full bg-white rounded-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex min-w-max px-4 py-3 border-b border-slate-100">
            {steps.map((step, index) => {
              const isActive = step.key === currentStep;
              const isCompleted = isStepCompleted(step.key);
              const isClickable = index <= currentStepIndex + 1 || isCompleted;
              
              return (
                <button
                  key={step.key}
                  onClick={() => isClickable && setCurrentStep(step.key)}
                  disabled={!isClickable}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : isCompleted 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : isClickable
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isActive 
                      ? 'bg-white/20' 
                      : isCompleted 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-200'
                  }`}>
                    {isCompleted ? <FaCheck className="text-xs" /> : step.icon}
                  </span>
                  {step.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mb-8"
        >
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                {steps.find(s => s.key === currentStep)?.icon}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {steps.find(s => s.key === currentStep)?.label}
                </h2>
                <p className="text-sm text-slate-500">
                  {currentStep === 'basic' && 'Tell us about yourself'}
                  {currentStep === 'skills' && 'Add your technical skills and languages'}
                  {currentStep === 'experience' && 'Share your work history'}
                  {currentStep === 'education' && 'Add your educational background'}
                  {currentStep === 'certifications' && 'Showcase your professional certifications'}
                  {currentStep === 'projects' && 'Highlight your best work'}
                  {currentStep === 'availability' && 'Let employers know when you can start'}
                  {currentStep === 'social' && 'Connect your professional profiles'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {currentStep === 'basic' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-3xl font-black text-blue-500">
                    {tempProfile.firstName?.charAt(0) || '?'}{tempProfile.lastName?.charAt(0) || ''}
                  </div>
                  <div>
                    <button className="px-4 py-2 rounded-xl text-white text-sm font-medium shadow-lg" style={{ backgroundColor: BRAND_COLOR }}>
                      Upload Photo
                    </button>
                    <p className="text-xs text-slate-400 mt-2">JPG, PNG up to 5MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">First Name *</label>
                    <input
                      type="text"
                      value={tempProfile.firstName}
                      onChange={(e) => setTempProfile({ ...tempProfile, firstName: e.target.value })}
                      placeholder="John"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={tempProfile.lastName}
                      onChange={(e) => setTempProfile({ ...tempProfile, lastName: e.target.value })}
                      placeholder="Mugabo"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email *</label>
                    <input
                      type="email"
                      value={tempProfile.email}
                      onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone</label>
                    <input
                      type="tel"
                      value={tempProfile.phone}
                      onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
                      placeholder="+250 788 123 456"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location</label>
                    <input
                      type="text"
                      value={tempProfile.location}
                      onChange={(e) => setTempProfile({ ...tempProfile, location: e.target.value })}
                      placeholder="Kigali, Rwanda"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Professional Headline</label>
                  <input
                    type="text"
                    value={tempProfile.headline}
                    onChange={(e) => setTempProfile({ ...tempProfile, headline: e.target.value })}
                    placeholder="Full Stack Developer | React, Node.js & AI"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bio</label>
                  <textarea
                    value={tempProfile.bio}
                    onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })}
                    placeholder="Tell employers about yourself..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            {currentStep === 'skills' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <FaCode /> Skills
                    </h3>
                    <button 
                      onClick={addSkill}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: BRAND_COLOR }}
                    >
                      <FaPlus /> Add
                    </button>
                  </div>
                  
                  {tempProfile.skills.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                      <p className="text-slate-400 text-sm">No skills added yet</p>
                      <button onClick={addSkill} className="mt-2 text-xs font-bold text-blue-500 hover:underline">
                        Add your first skill
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tempProfile.skills.map((skill) => (
                        <div key={skill.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                          <div className="flex-1 grid grid-cols-3 gap-3">
                            <input
                              type="text"
                              value={skill.name}
                              onChange={(e) => updateItem('skills', skill.id, 'name', e.target.value)}
                              placeholder="Skill name"
                              className="px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm"
                            />
                            <select
                              value={skill.level}
                              onChange={(e) => updateItem('skills', skill.id, 'level', e.target.value)}
                              className="px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm"
                            >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                              <option value="Expert">Expert</option>
                            </select>
                            <input
                              type="number"
                              value={skill.yearsOfExperience}
                              onChange={(e) => updateItem('skills', skill.id, 'yearsOfExperience', parseInt(e.target.value))}
                              placeholder="Years"
                              className="px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm"
                            />
                          </div>
                          <button 
                            onClick={() => removeItem('skills', skill.id)}
                            className="p-2 text-slate-400 hover:text-red-500"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <FaLanguage /> Languages
                    </h3>
                    <button 
                      onClick={addLanguage}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: BRAND_COLOR }}
                    >
                      <FaPlus /> Add
                    </button>
                  </div>
                  
                  {tempProfile.languages.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                      <p className="text-slate-400 text-sm">No languages added yet</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tempProfile.languages.map((lang) => (
                        <div key={lang.id} className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                          <input
                            type="text"
                            value={lang.name}
                            onChange={(e) => updateItem('languages', lang.id, 'name', e.target.value)}
                            placeholder="Language"
                            className="bg-transparent outline-none text-sm font-medium w-24"
                          />
                          <select
                            value={lang.proficiency}
                            onChange={(e) => updateItem('languages', lang.id, 'proficiency', e.target.value)}
                            className="bg-transparent outline-none text-xs text-slate-500"
                          >
                            <option value="Basic">Basic</option>
                            <option value="Conversational">Conversational</option>
                            <option value="Fluent">Fluent</option>
                            <option value="Native">Native</option>
                          </select>
                          <button 
                            onClick={() => removeItem('languages', lang.id)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 'experience' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <FaBuilding /> Work Experience
                  </h3>
                  <button 
                    onClick={addExperience}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: BRAND_COLOR }}
                  >
                    <FaPlus /> Add
                  </button>
                </div>

                {tempProfile.experience.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                    <FaBriefcase className="text-4xl text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No work experience added yet</p>
                    <button onClick={addExperience} className="mt-2 text-xs font-bold text-blue-500 hover:underline">
                      Add your first experience
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tempProfile.experience.map((exp, idx) => (
                      <div key={exp.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-start justify-between mb-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-lg">Position {idx + 1}</span>
                          <button onClick={() => removeItem('experience', exp.id)} className="text-slate-400 hover:text-red-500">
                            <FaTimes />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => updateItem('experience', exp.id, 'role', e.target.value)}
                            placeholder="Job Title"
                            className="px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm"
                          />
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateItem('experience', exp.id, 'company', e.target.value)}
                            placeholder="Company"
                            className="px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm"
                          />
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => updateItem('experience', exp.id, 'startDate', e.target.value)}
                            placeholder="Start Date (YYYY-MM)"
                            className="px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm"
                          />
                          <input
                            type="text"
                            value={exp.endDate}
                            onChange={(e) => updateItem('experience', exp.id, 'endDate', e.target.value)}
                            placeholder="End Date (YYYY-MM)"
                            className="px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm"
                          />
                        </div>
                        <textarea
                          value={exp.description}
                          onChange={(e) => updateItem('experience', exp.id, 'description', e.target.value)}
                          placeholder="Describe your responsibilities and achievements..."
                          rows={3}
                          className="w-full mt-3 px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm resize-none"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 'education' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <FaGraduationCap /> Education
                  </h3>
                  <button 
                    onClick={addEducation}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: BRAND_COLOR }}
                  >
                    <FaPlus /> Add
                  </button>
                </div>

                {tempProfile.education.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                    <FaGraduationCap className="text-4xl text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No education added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tempProfile.education.map((edu) => (
                      <div key={edu.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: BRAND_COLOR }}>
                              <FaGraduationCap />
                            </div>
                            <div>
                              <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => updateItem('education', edu.id, 'degree', e.target.value)}
                                placeholder="Degree (e.g., Bachelor's)"
                                className="font-bold text-slate-900 bg-transparent outline-none"
                              />
                              <input
                                type="text"
                                value={edu.fieldOfStudy}
                                onChange={(e) => updateItem('education', edu.id, 'fieldOfStudy', e.target.value)}
                                placeholder="Field of Study"
                                className="text-sm text-slate-500 bg-transparent outline-none w-full"
                              />
                            </div>
                          </div>
                          <button onClick={() => removeItem('education', edu.id)} className="text-slate-400 hover:text-red-500">
                            <FaTimes />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateItem('education', edu.id, 'institution', e.target.value)}
                          placeholder="University/Institution"
                          className="w-full px-3 py-2 mb-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm"
                        />
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            value={edu.startYear}
                            onChange={(e) => updateItem('education', edu.id, 'startYear', parseInt(e.target.value))}
                            placeholder="Start"
                            className="px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm"
                          />
                          <span className="text-slate-400">to</span>
                          <input
                            type="number"
                            value={edu.endYear}
                            onChange={(e) => updateItem('education', edu.id, 'endYear', parseInt(e.target.value))}
                            placeholder="End"
                            className="px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 'certifications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <FaCertificate /> Certifications
                  </h3>
                  <button 
                    onClick={addCertification}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: BRAND_COLOR }}
                  >
                    <FaPlus /> Add
                  </button>
                </div>

                {tempProfile.certifications.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                    <FaCertificate className="text-4xl text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No certifications added yet (optional)</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {tempProfile.certifications.map((cert) => (
                      <div key={cert.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-start justify-between mb-3">
                          <FaCertificate className="text-blue-500 text-xl" />
                          <button onClick={() => removeItem('certifications', cert.id)} className="text-slate-400 hover:text-red-500">
                            <FaTimes />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => updateItem('certifications', cert.id, 'name', e.target.value)}
                          placeholder="Certification Name"
                          className="w-full px-3 py-2 mb-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm font-bold"
                        />
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => updateItem('certifications', cert.id, 'issuer', e.target.value)}
                          placeholder="Issuer"
                          className="w-full px-3 py-2 mb-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          value={cert.issueDate}
                          onChange={(e) => updateItem('certifications', cert.id, 'issueDate', e.target.value)}
                          placeholder="Issue Date"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 'projects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <FaProjectDiagram /> Projects
                  </h3>
                  <button 
                    onClick={addProject}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: BRAND_COLOR }}
                  >
                    <FaPlus /> Add
                  </button>
                </div>

                {tempProfile.projects.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                    <FaProjectDiagram className="text-4xl text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No projects added yet (optional)</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tempProfile.projects.map((project) => (
                      <div key={project.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <FaProjectDiagram className="text-blue-500 text-xl" />
                            <input
                              type="text"
                              value={project.name}
                              onChange={(e) => updateItem('projects', project.id, 'name', e.target.value)}
                              placeholder="Project Name"
                              className="font-bold text-slate-900 bg-transparent outline-none"
                            />
                          </div>
                          <button onClick={() => removeItem('projects', project.id)} className="text-slate-400 hover:text-red-500">
                            <FaTimes />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={project.role}
                          onChange={(e) => updateItem('projects', project.id, 'role', e.target.value)}
                          placeholder="Your Role"
                          className="w-full px-3 py-2 mb-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm"
                        />
                        <textarea
                          value={project.description}
                          onChange={(e) => updateItem('projects', project.id, 'description', e.target.value)}
                          placeholder="Project description..."
                          rows={2}
                          className="w-full mb-2 px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm resize-none"
                        />
                        <input
                          type="url"
                          value={project.link}
                          onChange={(e) => updateItem('projects', project.id, 'link', e.target.value)}
                          placeholder="Project URL (optional)"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 'availability' && (
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FaClock /> Current Status
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {['Available', 'Open to Opportunities', 'Not Available'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setTempProfile({ 
                          ...tempProfile, 
                          availability: { ...tempProfile.availability, status: status as any }
                        })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          tempProfile.availability.status === status 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${getStatusColor(status)}`} />
                        <span className="text-xs font-bold">{status}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employment Type</label>
                    <select
                      value={tempProfile.availability.type}
                      onChange={(e) => setTempProfile({ 
                        ...tempProfile, 
                        availability: { ...tempProfile.availability, type: e.target.value as any }
                      })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Available From</label>
                    <input
                      type="date"
                      value={tempProfile.availability.startDate}
                      onChange={(e) => setTempProfile({ 
                        ...tempProfile, 
                        availability: { ...tempProfile.availability, startDate: e.target.value }
                      })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'social' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FaLink /> Social Links
                </h3>

                <a
                  href={tempProfile.socialLinks.linkedin || '#'}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <FaLinkedin className="text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">LinkedIn</p>
                    <input
                      type="url"
                      value={tempProfile.socialLinks.linkedin}
                      onChange={(e) => setTempProfile({ 
                        ...tempProfile, 
                        socialLinks: { ...tempProfile.socialLinks, linkedin: e.target.value }
                      })}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="w-full text-sm text-slate-500 bg-transparent outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <FaExternalLinkAlt className="text-slate-400" />
                </a>

                <a
                  href={tempProfile.socialLinks.github || '#'}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-gray-600 hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-gray-800 group-hover:text-white transition-colors">
                    <FaGithub className="text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">GitHub</p>
                    <input
                      type="url"
                      value={tempProfile.socialLinks.github}
                      onChange={(e) => setTempProfile({ 
                        ...tempProfile, 
                        socialLinks: { ...tempProfile.socialLinks, github: e.target.value }
                      })}
                      placeholder="https://github.com/yourusername"
                      className="w-full text-sm text-slate-500 bg-transparent outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <FaExternalLinkAlt className="text-slate-400" />
                </a>

                <a
                  href={tempProfile.socialLinks.portfolio || '#'}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <FaGlobe className="text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">Portfolio</p>
                    <input
                      type="url"
                      value={tempProfile.socialLinks.portfolio}
                      onChange={(e) => setTempProfile({ 
                        ...tempProfile, 
                        socialLinks: { ...tempProfile.socialLinks, portfolio: e.target.value }
                      })}
                      placeholder="https://yourportfolio.com"
                      className="w-full text-sm text-slate-500 bg-transparent outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <FaExternalLinkAlt className="text-slate-400" />
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
        >
          <FaChevronLeft /> Previous
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-bold text-sm"
            style={{ borderColor: BRAND_COLOR, color: BRAND_COLOR }}
          >
            <FaSave /> Save Progress
          </button>
          
          {currentStepIndex < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              Next Step <FaChevronRight />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={!isStepValid(currentStep)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all"
              style={{ backgroundColor: isStepValid(currentStep) ? '#10b981' : '#9ca3af' }}
            >
              <FaCheckCircle /> Complete Profile
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"
              >
                <FaCheckCircle className="text-3xl text-emerald-500" />
              </motion.div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Saved!</h3>
              <p className="text-slate-500">Your profile has been saved successfully.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
