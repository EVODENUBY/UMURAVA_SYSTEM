"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Lock, Globe, Moon, User, Mail, Key, Trash2, Camera, Check, Upload, Loader2 } from 'lucide-react';

type Tab = 'profile' | 'notifications' | 'security' | 'privacy';

export default function ApplicantSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [profile, setProfile] = useState({
    fullName: user?.fullName || 'Jane Mukamana',
    email: user?.email || 'jane.mukamana@email.com',
    phone: '+250 788 123 456',
    location: 'Kigali, Rwanda',
    headline: 'Senior Frontend Developer',
    bio: 'Passionate developer with 5+ years of experience building web applications.',
    linkedin: 'https://linkedin.com/in/jane-mukamana',
    github: 'https://github.com/janemukamana',
    portfolio: 'https://janemukamana.dev',
  });

  const [notifications, setNotifications] = useState({
    emailApplications: true,
    emailJobs: true,
    emailInterviews: false,
    pushNewJobs: true,
    pushApplications: true,
    pushMessages: true,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Globe className="w-4 h-4" /> },
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
        <p className="text-slate-500 mt-2">Manage your account and preferences</p>
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
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-8 space-y-8">
                  <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-3xl font-black text-blue-500">
                        {profile.fullName.charAt(0)}
                      </div>
                      <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <h2 className="text-xl font-black">{profile.fullName}</h2>
                      <p className="text-slate-500">{profile.headline}</p>
                      <button className="mt-2 text-xs font-bold text-blue-500 uppercase tracking-wider hover:underline flex items-center gap-1">
                        <Upload className="w-3 h-3" /> Upload Photo
                      </button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={profile.fullName}
                        onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                      <input 
                        type="email" 
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                      <input 
                        type="tel" 
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location</label>
                      <input 
                        type="text" 
                        value={profile.location}
                        onChange={(e) => setProfile({...profile, location: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Professional Headline</label>
                    <input 
                      type="text" 
                      value={profile.headline}
                      onChange={(e) => setProfile({...profile, headline: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bio</label>
                    <textarea 
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
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

              <Card className="mt-6">
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-lg font-black uppercase tracking-tight">Social Links</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">LinkedIn</label>
                      <input 
                        type="url" 
                        value={profile.linkedin}
                        onChange={(e) => setProfile({...profile, linkedin: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">GitHub</label>
                      <input 
                        type="url" 
                        value={profile.github}
                        onChange={(e) => setProfile({...profile, github: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Portfolio</label>
                      <input 
                        type="url" 
                        value={profile.portfolio}
                        onChange={(e) => setProfile({...profile, portfolio: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-8 space-y-8">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-2">Email Notifications</h3>
                    <p className="text-sm text-slate-500 mb-6">Manage which emails you receive</p>
                    <div className="space-y-4">
                      {[
                        { key: 'emailApplications', label: 'Application Updates', desc: 'Get notified when your application status changes' },
                        { key: 'emailJobs', label: 'New Job Recommendations', desc: 'Receive personalized job suggestions' },
                        { key: 'emailInterviews', label: 'Interview Reminders', desc: 'Get reminders before scheduled interviews' },
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

                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-black uppercase tracking-tight mb-2">Push Notifications</h3>
                    <p className="text-sm text-slate-500 mb-6">Manage browser and mobile notifications</p>
                    <div className="space-y-4">
                      {[
                        { key: 'pushNewJobs', label: 'New Jobs', desc: 'Get notified about matching opportunities' },
                        { key: 'pushApplications', label: 'Application Updates', desc: 'Real-time application status updates' },
                        { key: 'pushMessages', label: 'Messages', desc: 'Get notified when employers message you' },
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

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-8 space-y-8">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-2">Change Password</h3>
                    <p className="text-sm text-slate-500 mb-6">Update your password to keep your account secure</p>
                    <div className="space-y-4 max-w-lg">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                        <input type="password" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                        <input type="password" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                        <input type="password" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 transition-colors" />
                      </div>
                      <button className="px-8 py-4 rounded-2xl text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all" style={{ backgroundColor: '#2b71f0' }}>
                        Update Password
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-black uppercase tracking-tight mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-slate-500 mb-6">Add an extra layer of security to your account</p>
                    <button className="px-6 py-3 rounded-xl border-2 border-blue-500 text-blue-500 font-bold text-sm uppercase tracking-wider hover:bg-blue-50 transition-colors">
                      Enable 2FA
                    </button>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-red-500">Danger Zone</h3>
                    <p className="text-sm text-slate-500 mb-4">Permanently delete your account and all data</p>
                    <button className="px-6 py-3 rounded-xl bg-red-500 text-white font-bold text-sm uppercase tracking-wider hover:bg-red-600 transition-colors flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Delete Account
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'privacy' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-8 space-y-8">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-2">Profile Visibility</h3>
                    <p className="text-sm text-slate-500 mb-6">Control who can see your profile information</p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-bold">Public Profile</p>
                          <p className="text-xs text-slate-500">Allow recruiters to find your profile</p>
                        </div>
                        <button className="w-12 h-6 rounded-full bg-blue-500">
                          <div className="w-5 h-5 rounded-full bg-white shadow translate-x-6" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-bold">Show Current Position</p>
                          <p className="text-xs text-slate-500">Display your current job on your profile</p>
                        </div>
                        <button className="w-12 h-6 rounded-full bg-blue-500">
                          <div className="w-5 h-5 rounded-full bg-white shadow translate-x-6" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-bold">Show Salary Expectations</p>
                          <p className="text-xs text-slate-500">Display your salary range to employers</p>
                        </div>
                        <button className="w-12 h-6 rounded-full bg-slate-200">
                          <div className="w-5 h-5 rounded-full bg-white shadow translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-black uppercase tracking-tight mb-2">Data & Analytics</h3>
                    <p className="text-sm text-slate-500 mb-6">Manage how we use your data</p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-bold">Allow Analytics Cookies</p>
                          <p className="text-xs text-slate-500">Help us improve by sharing usage data</p>
                        </div>
                        <button className="w-12 h-6 rounded-full bg-blue-500">
                          <div className="w-5 h-5 rounded-full bg-white shadow translate-x-6" />
                        </button>
                      </div>
                    </div>
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
