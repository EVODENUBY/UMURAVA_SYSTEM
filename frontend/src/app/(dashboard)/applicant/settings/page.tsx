"use client";

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import {
  Bell,
  Lock,
  Globe,
  User,
  Key,
  Trash2,
  Camera,
  Check,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Settings,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://recruiter-ai-platform.onrender.com';
const AUTH_STORAGE_KEY = 'umurava_auth';

type Tab = 'profile' | 'notifications' | 'security' | 'privacy';

type NotificationsState = {
  emailApplications: boolean;
  emailJobs: boolean;
  emailInterviews: boolean;
  pushMessages: boolean;
};

type SecurityState = {
  twoFactor: boolean;
  passwordAlerts: boolean;
  sessionReview: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type PrivacyState = {
  publicProfile: boolean;
  showJobStatus: boolean;
  analyticsOptIn: boolean;
};

const defaultNotifications: NotificationsState = {
  emailApplications: true,
  emailJobs: true,
  emailInterviews: false,
  pushMessages: true,
};

const defaultSecurity: SecurityState = {
  twoFactor: false,
  passwordAlerts: true,
  sessionReview: true,
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const defaultPrivacy: PrivacyState = {
  publicProfile: true,
  showJobStatus: true,
  analyticsOptIn: true,
};

export default function ApplicantSettingsPage() {
  const { user, token, setUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
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
  const [notifications, setNotifications] = useState<NotificationsState>(defaultNotifications);
  const [security, setSecurity] = useState<SecurityState>(defaultSecurity);
  const [privacy, setPrivacy] = useState<PrivacyState>(defaultPrivacy);
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Globe className="w-4 h-4" /> },
  ];

  const userInitials = useMemo(
    () => profile.fullName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join(''),
    [profile.fullName]
  );

  useEffect(() => {
    if (!token) return;

    const savedNotifications = typeof window !== 'undefined' ? window.localStorage.getItem('umurava_notifications') : null;
    const savedSecurity = typeof window !== 'undefined' ? window.localStorage.getItem('umurava_security') : null;
    const savedPrivacy = typeof window !== 'undefined' ? window.localStorage.getItem('umurava_privacy') : null;

    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch {}
    }

    if (savedSecurity) {
      try {
        setSecurity({ ...defaultSecurity, ...JSON.parse(savedSecurity) });
      } catch {}
    }

    if (savedPrivacy) {
      try {
        setPrivacy({ ...defaultPrivacy, ...JSON.parse(savedPrivacy) });
      } catch {}
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data) {
          const basicInfo = data.data.basicInfo || {};
          const socialLinks = data.data.socialLinks || {};
          const fullName = `${basicInfo.firstName || ''} ${basicInfo.lastName || ''}`.trim() || user?.fullName || profile.fullName;
          setProfile((prev) => ({
            ...prev,
            fullName,
            email: basicInfo.email || prev.email,
            phone: basicInfo.phone || prev.phone,
            location: basicInfo.location || prev.location,
            headline: basicInfo.headline || prev.headline,
            bio: basicInfo.bio || prev.bio,
            linkedin: socialLinks.linkedin || prev.linkedin,
            github: socialLinks.github || prev.github,
            portfolio: socialLinks.portfolio || prev.portfolio,
          }));
        }
      } catch (error) {
        console.error('Unable to load profile', error);
      }
    };

    fetchProfile();
  }, [token, user?.fullName, profile.fullName]);

  const persistLocalSettings = (key: string, value: object) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  const handleProfileSave = async () => {
    if (!token) {
      showToast('Unable to save, auth missing', 'error');
      return;
    }

    const nameParts = profile.fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          basicInfo: {
            firstName,
            lastName,
            email: profile.email,
            phone: profile.phone,
            location: profile.location,
            headline: profile.headline,
            bio: profile.bio,
          },
          socialLinks: {
            linkedin: profile.linkedin,
            github: profile.github,
            portfolio: profile.portfolio,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        showToast('Profile updated successfully', 'success');
        if (user) {
          const updatedUser = { ...user, fullName: profile.fullName, email: profile.email };
          setUser(updatedUser);
          persistLocalSettings(AUTH_STORAGE_KEY, { user: updatedUser, token });
        }
      } else {
        showToast(data.error?.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      showToast('Profile save failed', 'error');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleTabSave = async () => {
    setSaving(true);
    if (activeTab === 'profile') {
      await handleProfileSave();
    } else if (activeTab === 'notifications') {
      persistLocalSettings('umurava_notifications', notifications);
      showToast('Notification preferences saved', 'success');
    } else if (activeTab === 'security') {
      persistLocalSettings('umurava_security', security);
      showToast('Security settings saved', 'success');
    } else if (activeTab === 'privacy') {
      persistLocalSettings('umurava_privacy', privacy);
      showToast('Privacy settings saved', 'success');
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-2 sm:p-4 lg:ml-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Settings</p>
          <h1 className="text-4xl font-black text-slate-900">Control your account</h1>
          <p className="max-w-3xl text-slate-500 leading-7">Manage your profile, notification preferences, security and privacy settings from one elegant experience. Your updates are saved and reflected instantly.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <Card className="rounded-[32px] border border-slate-200 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl border border-slate-200 text-blue-600">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Dashboard</p>
                  <h2 className="mt-2 text-xl font-black text-slate-900">Settings hub</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500">Clean, modern controls for your account and profile.</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[32px] border border-slate-200 overflow-hidden">
              <nav className="space-y-2 p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`group flex w-full items-center gap-3 rounded-[24px] px-4 py-3 text-sm font-semibold transition ${
                      activeTab === tab.id
                        ? 'border border-blue-200 bg-slate-100 text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`}>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </aside>

          <main className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{activeTab === 'profile' ? 'Profile settings' : activeTab === 'notifications' ? 'Notification preferences' : activeTab === 'security' ? 'Security center' : 'Privacy controls'}</h2>
                <p className="mt-2 text-sm text-slate-500">{activeTab === 'profile' ? 'Update your name, contact, bio, and social links.' : activeTab === 'notifications' ? 'Choose the alerts that matter most.' : activeTab === 'security' ? 'Strengthen access and review your security posture.' : 'Adjust who sees your profile and data.'}</p>
              </div>
              <button
                onClick={handleTabSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save settings'}
              </button>
            </div>

            {activeTab === 'profile' && (
              <Card className="rounded-[32px] border border-slate-200">
                <CardContent className="space-y-6 p-6">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-5">
                      <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-200 text-2xl font-black text-blue-600">{userInitials}</div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Personal profile</p>
                        <h3 className="mt-2 text-2xl font-black text-slate-900">{profile.fullName}</h3>
                      </div>
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-blue-300 hover:text-blue-600">
                      <Camera className="w-4 h-4" /> Change avatar
                    </button>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Full name</label>
                      <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Phone</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Location</label>
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Headline</label>
                      <input
                        type="text"
                        value={profile.headline}
                        onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Portfolio</label>
                      <input
                        type="url"
                        value={profile.portfolio}
                        onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={4}
                      className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 resize-none"
                    />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-3">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">LinkedIn</label>
                      <input
                        type="url"
                        value={profile.linkedin}
                        onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">GitHub</label>
                      <input
                        type="url"
                        value={profile.github}
                        onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Website</label>
                      <input
                        type="url"
                        value={profile.portfolio}
                        onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-3 text-slate-900 font-semibold text-lg">
                      <Bell className="w-5 h-5 text-slate-700" />
                      Email & push alerts
                    </div>
                    <div className="grid gap-4">
                      {[
                        { key: 'emailApplications', label: 'Application updates', desc: 'Receive status changes by email.' },
                        { key: 'emailJobs', label: 'Job match alerts', desc: 'New opportunities delivered to your inbox.' },
                        { key: 'emailInterviews', label: 'Interview reminders', desc: 'Never miss an interview.' },
                        { key: 'pushMessages', label: 'Messages & activity', desc: 'Real-time push alerts for new messages.' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between rounded-[28px] border border-slate-200 p-4">
                          <div>
                            <p className="font-semibold text-slate-900">{item.label}</p>
                            <p className="text-sm text-slate-500">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => {
                              setNotifications((prev) => {
                                const next = { ...prev, [item.key]: !prev[item.key as keyof NotificationsState] };
                                persistLocalSettings('umurava_notifications', next);
                                return next;
                              });
                            }}
                            className={`h-6 w-12 rounded-full transition ${notifications[item.key as keyof NotificationsState] ? 'bg-blue-600' : 'bg-slate-200'}`}
                          >
                            <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${notifications[item.key as keyof NotificationsState] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-3 text-slate-900 font-semibold text-lg">
                      <ShieldCheck className="w-5 h-5 text-slate-700" />
                      Access & password
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-[28px] border border-slate-200 p-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">Two-factor authentication</p>
                          <p className="text-sm text-slate-500">Add an extra verification step.</p>
                        </div>
                        <button
                          onClick={() => {
                            setSecurity((prev) => {
                              const next = { ...prev, twoFactor: !prev.twoFactor };
                              persistLocalSettings('umurava_security', next);
                              return next;
                            });
                          }}
                          className={`h-6 w-12 rounded-full transition ${security.twoFactor ? 'bg-blue-600' : 'bg-slate-200'}`}
                        >
                          <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${security.twoFactor ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                      <div className="rounded-[28px] border border-slate-200 p-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">Password alerts</p>
                          <p className="text-sm text-slate-500">Receive notification when your password expires.</p>
                        </div>
                        <button
                          onClick={() => {
                            setSecurity((prev) => {
                              const next = { ...prev, passwordAlerts: !prev.passwordAlerts };
                              persistLocalSettings('umurava_security', next);
                              return next;
                            });
                          }}
                          className={`h-6 w-12 rounded-full transition ${security.passwordAlerts ? 'bg-blue-600' : 'bg-slate-200'}`}
                        >
                          <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${security.passwordAlerts ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                      <div className="rounded-[28px] border border-slate-200 p-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">Session review</p>
                          <p className="text-sm text-slate-500">View active devices signed in.</p>
                        </div>
                        <button
                          onClick={() => {
                            setSecurity((prev) => {
                              const next = { ...prev, sessionReview: !prev.sessionReview };
                              persistLocalSettings('umurava_security', next);
                              return next;
                            });
                          }}
                          className={`h-6 w-12 rounded-full transition ${security.sessionReview ? 'bg-blue-600' : 'bg-slate-200'}`}
                        >
                          <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${security.sessionReview ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Current password</label>
                        <input
                          type="password"
                          value={security.currentPassword}
                          onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                          className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">New password</label>
                        <input
                          type="password"
                          value={security.newPassword}
                          onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                          className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Confirm new</label>
                        <input
                          type="password"
                          value={security.confirmPassword}
                          onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                          className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight mb-2">Profile Visibility</h3>
                      <p className="text-sm text-slate-500 mb-6">Control who can see your profile information</p>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                          <div>
                            <p className="font-bold">Public Profile</p>
                            <p className="text-xs text-slate-500">Allow recruiters to find your profile</p>
                          </div>
                          <button
                            onClick={() => {
                              setPrivacy((prev) => {
                                const next = { ...prev, publicProfile: !prev.publicProfile };
                                persistLocalSettings('umurava_privacy', next);
                                return next;
                              });
                            }}
                            className={`h-6 w-12 rounded-full transition ${privacy.publicProfile ? 'bg-blue-600' : 'bg-slate-200'}`}
                          >
                            <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${privacy.publicProfile ? 'translate-x-6' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                          <div>
                            <p className="font-bold">Show current role</p>
                            <p className="text-xs text-slate-500">Display your current job on your profile</p>
                          </div>
                          <button
                            onClick={() => {
                              setPrivacy((prev) => {
                                const next = { ...prev, showJobStatus: !prev.showJobStatus };
                                persistLocalSettings('umurava_privacy', next);
                                return next;
                              });
                            }}
                            className={`h-6 w-12 rounded-full transition ${privacy.showJobStatus ? 'bg-blue-600' : 'bg-slate-200'}`}
                          >
                            <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${privacy.showJobStatus ? 'translate-x-6' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                          <div>
                            <p className="font-bold">Analytics sharing</p>
                            <p className="text-xs text-slate-500">Send anonymous data to improve the platform</p>
                          </div>
                          <button
                            onClick={() => {
                              setPrivacy((prev) => {
                                const next = { ...prev, analyticsOptIn: !prev.analyticsOptIn };
                                persistLocalSettings('umurava_privacy', next);
                                return next;
                              });
                            }}
                            className={`h-6 w-12 rounded-full transition ${privacy.analyticsOptIn ? 'bg-blue-600' : 'bg-slate-200'}`}
                          >
                            <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${privacy.analyticsOptIn ? 'translate-x-6' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
