"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Lock, Building2, User, Mail, Key, Check, Upload, Bot, DollarSign, Globe, FileText, Loader2 } from 'lucide-react';

type Tab = 'company' | 'account' | 'notifications' | 'ai' | 'billing';

export default function RecruiterSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('company');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [company, setCompany] = useState({
    name: 'TechCorp Rwanda',
    website: 'https://techcorp.rw',
    industry: 'Technology',
    size: '11-50',
    location: 'Kigali, Rwanda',
    description: 'Leading technology company in Rwanda focused on building innovative solutions for African markets.',
    linkedin: 'https://linkedin.com/company/techcorp-rw',
    logo: null as File | null,
  });

  const [account, setAccount] = useState({
    fullName: user?.fullName || 'John Smith',
    email: user?.email || 'john@techcorp.rw',
    phone: '+250 788 123 456',
    position: 'HR Manager',
  });

  const [notifications, setNotifications] = useState({
    newApplications: true,
    screeningComplete: true,
    interviewScheduled: false,
    weeklyDigest: true,
    marketingEmails: false,
  });

  const [aiSettings, setAiSettings] = useState({
    autoScreen: true,
    minScore: 60,
    sendResults: true,
    prioritizeHighlyQualified: true,
  });

  const tabs = [
    { id: 'company', label: 'Company', icon: <Building2 className="w-4 h-4" /> },
    { id: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Settings', icon: <Bot className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing', icon: <DollarSign className="w-4 h-4" /> },
  ];

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black uppercase tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-2">Manage your company and account settings</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-64 flex-shrink-0"
        >
          <Card className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeTab === tab.id 
                      ? 'bg-blue-500 text-white' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </Card>
        </motion.div>

        <div className="flex-1 space-y-6">
          {activeTab === 'company' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-8 space-y-8">
                  <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-3xl font-black text-slate-400">
                        {company.name.charAt(0)}
                      </div>
                      <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors">
                        <Upload className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <h2 className="text-xl font-black">{company.name}</h2>
                      <p className="text-slate-500">{company.industry} - {company.size} employees</p>
                      <button className="mt-2 text-xs font-bold text-blue-500 uppercase tracking-wider hover:underline flex items-center gap-1">
                        Upload Company Logo
                      </button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Company Name</label>
                      <input 
                        type="text" 
                        value={company.name}
                        onChange={(e) => setCompany({...company, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Website</label>
                      <input 
                        type="url" 
                        value={company.website}
                        onChange={(e) => setCompany({...company, website: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Industry</label>
                      <select 
                        value={company.industry}
                        onChange={(e) => setCompany({...company, industry: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors"
                      >
                        <option>Technology</option>
                        <option>Finance</option>
                        <option>Healthcare</option>
                        <option>Education</option>
                        <option>Retail</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Company Size</label>
                      <select 
                        value={company.size}
                        onChange={(e) => setCompany({...company, size: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors"
                      >
                        <option>1-10</option>
                        <option>11-50</option>
                        <option>51-200</option>
                        <option>201-500</option>
                        <option>500+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                    <textarea 
                      value={company.description}
                      onChange={(e) => setCompany({...company, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors resize-none" 
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all"
                      style={{ backgroundColor: saving ? '#93c5fd' : saved ? '#10b981' : '#2b71f0' }}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : saved ? (
                        <>
                          <Check className="w-4 h-4" /> Saved!
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'account' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-8 space-y-8">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-6">Personal Information</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                        <input 
                          type="text" 
                          value={account.fullName}
                          onChange={(e) => setAccount({...account, fullName: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                        <input 
                          type="email" 
                          value={account.email}
                          onChange={(e) => setAccount({...account, email: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                        <input 
                          type="tel" 
                          value={account.phone}
                          onChange={(e) => setAccount({...account, phone: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Position</label>
                        <input 
                          type="text" 
                          value={account.position}
                          onChange={(e) => setAccount({...account, position: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-black uppercase tracking-tight mb-6">Security</h3>
                    <div className="space-y-4 max-w-lg">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                        <input type="password" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                        <input type="password" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors" />
                      </div>
                      <button className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm uppercase tracking-wider hover:bg-slate-200 transition-colors">
                        Update Password
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-6">Email Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'newApplications', label: 'New Applications', desc: 'Get notified when candidates apply to your jobs' },
                        { key: 'screeningComplete', label: 'Screening Complete', desc: 'Receive alerts when AI screening finishes' },
                        { key: 'interviewScheduled', label: 'Interview Reminders', desc: 'Get reminders before scheduled interviews' },
                        { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Receive a weekly summary of your recruitment activity' },
                        { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Updates about new features and tips' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                          <div>
                            <p className="font-bold">{item.label}</p>
                            <p className="text-xs text-slate-500">{item.desc}</p>
                          </div>
                          <button 
                            onClick={() => setNotifications({...notifications, [item.key]: !notifications[item.key as keyof typeof notifications]})}
                            className={`w-12 h-6 rounded-full transition-all ${notifications[item.key as keyof typeof notifications] ? 'bg-blue-500' : 'bg-slate-200'}`}
                          >
                            <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-8 space-y-8">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-2">AI Screening Settings</h3>
                    <p className="text-sm text-slate-500 mb-6">Configure how AI screens and evaluates candidates</p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-bold">Auto-Screen Applications</p>
                          <p className="text-xs text-slate-500">Automatically run AI screening on new applications</p>
                        </div>
                        <button 
                          onClick={() => setAiSettings({...aiSettings, autoScreen: !aiSettings.autoScreen})}
                          className={`w-12 h-6 rounded-full transition-all ${aiSettings.autoScreen ? 'bg-blue-500' : 'bg-slate-200'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${aiSettings.autoScreen ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-bold">Minimum Score Threshold</p>
                          <p className="text-xs text-slate-500">Only qualify candidates above this score</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={aiSettings.minScore}
                            onChange={(e) => setAiSettings({...aiSettings, minScore: parseInt(e.target.value)})}
                            className="w-32"
                          />
                          <span className="w-12 text-center font-bold">{aiSettings.minScore}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-bold">Send Results to Candidates</p>
                          <p className="text-xs text-slate-500">Automatically email candidates their screening results</p>
                        </div>
                        <button 
                          onClick={() => setAiSettings({...aiSettings, sendResults: !aiSettings.sendResults})}
                          className={`w-12 h-6 rounded-full transition-all ${aiSettings.sendResults ? 'bg-blue-500' : 'bg-slate-200'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${aiSettings.sendResults ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-bold">Prioritize Highly Qualified</p>
                          <p className="text-xs text-slate-500">Show qualified candidates at the top of the list</p>
                        </div>
                        <button 
                          onClick={() => setAiSettings({...aiSettings, prioritizeHighlyQualified: !aiSettings.prioritizeHighlyQualified})}
                          className={`w-12 h-6 rounded-full transition-all ${aiSettings.prioritizeHighlyQualified ? 'bg-blue-500' : 'bg-slate-200'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${aiSettings.prioritizeHighlyQualified ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-lg font-black uppercase tracking-tight mb-6">Current Plan</h3>
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-2xl font-black">Professional</h4>
                        <p className="text-blue-100">Unlimited job posts and AI screenings</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black">$99</p>
                        <p className="text-blue-100 text-sm">per month</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-blue-100">
                      <span>10 team members</span>
                      <span>-</span>
                      <span>5 active jobs</span>
                      <span>-</span>
                      <span>500 AI screenings</span>
                    </div>
                    <button className="mt-6 px-6 py-3 rounded-xl bg-white text-blue-600 font-bold text-sm uppercase tracking-wider hover:bg-blue-50 transition-colors">
                      Upgrade Plan
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
