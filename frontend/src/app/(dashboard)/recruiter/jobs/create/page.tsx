"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaMapMarkerAlt, FaBriefcase, FaDollarSign, FaTags } from 'react-icons/fa';

const BRAND_COLOR = "#2b71f0";

export default function CreateJobPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    experienceLevel: '',
    salaryMin: '',
    salaryMax: '',
    description: '',
    skills: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Job created:', formData);
    router.push('/recruiter/jobs');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-3 rounded-xl hover:bg-slate-100 transition-colors">
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Post New Job</h1>
          <p className="text-slate-500 mt-2">Create a new job posting for your company</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Job Title</label>
              <input type="text" required placeholder="e.g. Senior Frontend Developer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 transition-all" />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />Location
                </label>
                <input type="text" required placeholder="e.g. Kigali, Rwanda"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
                  <FaBriefcase className="inline mr-2" />Experience Level
                </label>
                <select required value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 transition-all bg-white">
                  <option value="">Select level</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead / Principal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
                <FaDollarSign className="inline mr-2" />Salary Range (USD)
              </label>
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="number" placeholder="Min" value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 transition-all" />
                <input type="number" placeholder="Max" value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
                <FaTags className="inline mr-2" />Required Skills (comma separated)
              </label>
              <input type="text" placeholder="e.g. React, TypeScript, Node.js"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 transition-all" />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Job Description</label>
              <textarea rows={6} required placeholder="Describe the role, responsibilities, and requirements..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 transition-all resize-none" />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => router.back()}
              className="px-8 py-4 rounded-2xl border-2 border-slate-200 font-bold text-sm uppercase tracking-wider hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button type="submit"
              className="px-8 py-4 rounded-2xl text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:brightness-110 transition-all"
              style={{ backgroundColor: BRAND_COLOR }}>
              Publish Job
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
