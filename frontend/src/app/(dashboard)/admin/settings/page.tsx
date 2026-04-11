"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Bell, Lock, Database, Shield, User, Settings, Key, Check, Globe, Server, AlertTriangle, Loader2 } from 'lucide-react';

type Tab = 'security' | 'platform' | 'users' | 'notifications' | 'system';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('security');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [security, setSecurity] = useState({
    twoFactor: true,
    sessionTimeout: '30',
    passwordExpiry: '90',
    ipWhitelist: false,
  });

  const [platform, setPlatform] = useState({
    maintenanceMode: false,
    registration: true,
    emailVerification: true,
    publicListings: true,
    aiFeatures: true,
  });

  const [notifications, setNotifications] = useState({
    systemAlerts: true,
    userActivity: true,
    securityAlerts: true,
    weeklyReports: false,
    errorReports: true,
  });

  const tabs = [
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'platform', label: 'Platform', icon: <Globe className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'system', label: 'System', icon: <Server className="w-4 h-4" /> },
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
        <h1 className="text-3xl font-black uppercase tracking-tight">Admin Settings</h1>
        <p className="text-slate-500 mt-2">Platform configuration and security</p>
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
                      ? 'bg-red-500 text-white' 
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
          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-8 space-y-8">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                      <Shield className="w-5 h-5 text-red-500" /> Security Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-bold">Two-Factor Authentication</p>
                          <p className="text-xs text-slate-500">Require 2FA for all admin users</p>
                        </div>
                        <button 
                          onClick={() => setSecurity({...security, twoFactor: !security.twoFactor})}
                          className={`w-12 h-6 rounded-full transition-all ${security.twoFactor ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${security.twoFactor ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-bold">Session Timeout</p>
                          <p className="text-xs text-slate-500">Auto logout after inactivity</p>
                        </div>
                        <select 
                          value={security.sessionTimeout}
                          onChange={(e) => setSecurity({...security, sessionTimeout: e.target.value})}
                          className="px-4 py-2 rounded-xl border border-slate-200 bg-white"
                        >
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="60">1 hour</option>
                          <option value="240">4 hours</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-bold">Password Expiry</p>
                          <p className="text-xs text-slate-500">Force password change after X days</p>
                        </div>
                        <select 
                          value={security.passwordExpiry}
                          onChange={(e) => setSecurity({...security, passwordExpiry: e.target.value})}
                          className="px-4 py-2 rounded-xl border border-slate-200 bg-white"
                        >
                          <option value="30">30 days</option>
                          <option value="60">60 days</option>
                          <option value="90">90 days</option>
                          <option value="never">Never</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-bold">IP Whitelist</p>
                          <p className="text-xs text-slate-500">Only allow admin access from specific IPs</p>
                        </div>
                        <button 
                          onClick={() => setSecurity({...security, ipWhitelist: !security.ipWhitelist})}
                          className={`w-12 h-6 rounded-full transition-all ${security.ipWhitelist ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${security.ipWhitelist ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                      <Key className="w-5 h-5 text-blue-500" /> API Keys
                    </h3>
                    <div className="p-4 rounded-xl bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold">Production API Key</p>
                          <p className="text-xs text-slate-400 font-mono">umr_prod_****************************</p>
                        </div>
                        <button className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-xs uppercase hover:bg-slate-50">
                          Regenerate
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'platform' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-8 space-y-8">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                      <Globe className="w-5 h-5 text-blue-500" /> Platform Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-bold">Maintenance Mode</p>
                          <p className="text-xs text-slate-500">Show maintenance page to all users</p>
                        </div>
                        <button 
                          onClick={() => setPlatform({...platform, maintenanceMode: !platform.maintenanceMode})}
                          className={`w-12 h-6 rounded-full transition-all ${platform.maintenanceMode ? 'bg-red-500' : 'bg-slate-200'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${platform.maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-bold">User Registration</p>
                          <p className="text-xs text-slate-500">Allow new users to create accounts</p>
                        </div>
                        <button 
                          onClick={() => setPlatform({...platform, registration: !platform.registration})}
                          className={`w-12 h-6 rounded-full transition-all ${platform.registration ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${platform.registration ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-bold">Email Verification</p>
                          <p className="text-xs text-slate-500">Require email verification for new accounts</p>
                        </div>
                        <button 
                          onClick={() => setPlatform({...platform, emailVerification: !platform.emailVerification})}
                          className={`w-12 h-6 rounded-full transition-all ${platform.emailVerification ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${platform.emailVerification ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-bold">Public Job Listings</p>
                          <p className="text-xs text-slate-500">Show jobs to non-logged-in users</p>
                        </div>
                        <button 
                          onClick={() => setPlatform({...platform, publicListings: !platform.publicListings})}
                          className={`w-12 h-6 rounded-full transition-all ${platform.publicListings ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${platform.publicListings ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-bold">AI Features</p>
                          <p className="text-xs text-slate-500">Enable AI screening and matching features</p>
                        </div>
                        <button 
                          onClick={() => setPlatform({...platform, aiFeatures: !platform.aiFeatures})}
                          className={`w-12 h-6 rounded-full transition-all ${platform.aiFeatures ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${platform.aiFeatures ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                      <User className="w-5 h-5 text-blue-500" /> User Management
                    </h3>
                    <div className="flex items-center gap-4">
                      <input 
                        type="text" 
                        placeholder="Search users..." 
                        className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                      />
                      <select className="px-4 py-2 rounded-xl border border-slate-200">
                        <option>All Roles</option>
                        <option>Applicants</option>
                        <option>Recruiters</option>
                        <option>Admins</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-4">User</th>
                          <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-4">Role</th>
                          <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-4">Status</th>
                          <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-4">Joined</th>
                          <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Jane Mukamana', email: 'jane@email.com', role: 'Applicant', status: 'Active', joined: '2024-01-15' },
                          { name: 'John Smith', email: 'john@techcorp.rw', role: 'Recruiter', status: 'Active', joined: '2024-02-20' },
                          { name: 'Admin User', email: 'admin@umurava.ai', role: 'Admin', status: 'Active', joined: '2023-12-01' },
                        ].map((user, i) => (
                          <tr key={i} className="border-b border-slate-50">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-500">
                                  {user.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold">{user.name}</p>
                                  <p className="text-xs text-slate-400">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                user.role === 'Admin' ? 'bg-red-100 text-red-600' : 
                                user.role === 'Recruiter' ? 'bg-blue-100 text-blue-600' : 
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-600">
                                {user.status}
                              </span>
                            </td>
                            <td className="py-4 text-sm text-slate-500">{user.joined}</td>
                            <td className="py-4">
                              <button className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs uppercase hover:bg-slate-200">
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                    <Bell className="w-5 h-5 text-amber-500" /> System Notifications
                  </h3>
                  <div className="space-y-4">
                    {[
                      { key: 'systemAlerts', label: 'System Alerts', desc: 'Critical platform notifications' },
                      { key: 'userActivity', label: 'User Activity', desc: 'New user registrations and actions' },
                      { key: 'securityAlerts', label: 'Security Alerts', desc: 'Login attempts and suspicious activity' },
                      { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Platform analytics summary' },
                      { key: 'errorReports', label: 'Error Reports', desc: 'Application errors and exceptions' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-bold">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                        <button 
                          onClick={() => setNotifications({...notifications, [item.key]: !notifications[item.key as keyof typeof notifications]})}
                          className={`w-12 h-6 rounded-full transition-all ${notifications[item.key as keyof typeof notifications] ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'system' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-8 space-y-8">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                      <Server className="w-5 h-5 text-blue-500" /> System Status
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'API Status', value: 'Operational', color: 'text-emerald-500' },
                        { label: 'Database', value: 'Healthy', color: 'text-emerald-500' },
                        { label: 'AI Services', value: 'Operational', color: 'text-emerald-500' },
                        { label: 'Uptime', value: '99.9%', color: 'text-emerald-500' },
                      ].map((item, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50">
                          <p className="text-xs text-slate-400 uppercase font-bold">{item.label}</p>
                          <p className={`text-lg font-black ${item.color}`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-black uppercase tracking-tight mb-6">Danger Zone</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-100">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <div>
                            <p className="font-bold text-red-700">Clear Cache</p>
                            <p className="text-xs text-red-500">Clear all cached data</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-xs uppercase hover:bg-red-600">
                          Clear
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-100">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <div>
                            <p className="font-bold text-red-700">Database Backup</p>
                            <p className="text-xs text-red-500">Download full database backup</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-xs uppercase hover:bg-red-600">
                          Backup
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="flex justify-end">
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
        </div>
      </div>
    </div>
  );
}
