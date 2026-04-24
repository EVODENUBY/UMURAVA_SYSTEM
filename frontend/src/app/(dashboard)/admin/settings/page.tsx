"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { api, ENDPOINTS } from '@/lib/api';
import { FaCog, FaUser, FaLock, FaSave, FaUpload, FaCamera } from 'react-icons/fa';
import Image from 'next/image';

interface SystemSettings {
  general: {
    siteName: string;
    siteUrl: string;
    supportEmail: string;
    allowRegistration: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requireEmailVerification: boolean;
    require2FA: boolean;
  };
  limits: {
    maxJobsPerRecruiter: number;
    maxApplicantsPerJob: number;
    aiScreeningLimit: number;
  };
}

const defaultSettings: SystemSettings = {
  general: {
    siteName: 'Umurava AI',
    siteUrl: 'https://umurava.ai',
    supportEmail: 'support@umurava.ai',
    allowRegistration: true,
  },
  security: {
    sessionTimeout: 60,
    passwordMinLength: 8,
    requireEmailVerification: false,
    require2FA: false,
  },
  limits: {
    maxJobsPerRecruiter: 10,
    maxApplicantsPerJob: 100,
    aiScreeningLimit: 50,
  },
};

export default function AdminSettingsPage() {
  const { user, token, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (user?.avatar) {
      setAvatarPreview(user.avatar);
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await api.get<SystemSettings>(ENDPOINTS.ADMIN.SETTINGS, token || undefined);
      if (data) {
        setSettings({ ...defaultSettings, ...data });
      }
    } catch (error: any) {
      console.log('Using default settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(ENDPOINTS.ADMIN.SETTINGS, settings, token || undefined);
      showToast('Settings saved successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const data = await api.post(ENDPOINTS.AUTH.AVATAR, formData, token || undefined);
      
      showToast('Profile picture updated successfully', 'success');
      setAvatarFile(null);
      refreshUser();
    } catch (error: any) {
      showToast(error.message || 'Failed to upload avatar', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const updateSettings = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FaUser className="w-4 h-4" /> },
    { id: 'general', label: 'General', icon: <FaCog className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <FaLock className="w-4 h-4" /> },
    { id: 'limits', label: 'Limits', icon: <FaCog className="w-4 h-4" /> },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FaCog className="text-blue-600" />
            Settings
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage your profile and system settings</p>
        </div>
        {activeTab !== 'profile' && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <FaSave className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 p-2 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                      <FaUser className="text-blue-600" />
                      Profile Settings
                    </h3>
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          {avatarPreview ? (
                            <Image
                              src={avatarPreview}
                              alt="Profile"
                              width={128}
                              height={128}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-4xl font-bold text-white">
                              {user?.fullName?.charAt(0) || 'U'}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                        >
                          <FaCamera className="w-4 h-4" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </div>
                      {avatarFile && (
                        <button
                          onClick={handleAvatarUpload}
                          disabled={uploadingAvatar}
                          className="mt-4 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <FaUpload className="w-4 h-4" />
                          {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                        </button>
                      )}
                    </div>
                    <div className="mt-6 space-y-4 max-w-md mx-auto">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={user?.fullName || ''}
                          disabled
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                        <input
                          type="text"
                          value={user?.role || ''}
                          disabled
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 capitalize"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                      <FaCog className="text-blue-600" />
                      General Settings
                    </h3>
                    <div className="grid gap-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Site Name</label>
                        <input
                          type="text"
                          value={settings.general.siteName}
                          onChange={(e) => updateSettings('general', 'siteName', e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Site URL</label>
                        <input
                          type="url"
                          value={settings.general.siteUrl}
                          onChange={(e) => updateSettings('general', 'siteUrl', e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Support Email</label>
                        <input
                          type="email"
                          value={settings.general.supportEmail}
                          onChange={(e) => updateSettings('general', 'supportEmail', e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center justify-between py-3 border border-slate-200 rounded-lg px-4">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">Allow User Registration</p>
                          <p className="text-slate-500 text-xs">New users can register themselves</p>
                        </div>
                        <button
                          onClick={() => updateSettings('general', 'allowRegistration', !settings.general.allowRegistration)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            settings.general.allowRegistration ? 'bg-blue-600' : 'bg-slate-200'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                            settings.general.allowRegistration ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                      <FaLock className="text-blue-600" />
                      Security Settings
                    </h3>
                    <div className="grid gap-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (minutes)</label>
                        <input
                          type="number"
                          min={15}
                          max={480}
                          value={settings.security.sessionTimeout}
                          onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Password Length</label>
                        <input
                          type="number"
                          min={6}
                          max={32}
                          value={settings.security.passwordMinLength}
                          onChange={(e) => updateSettings('security', 'passwordMinLength', parseInt(e.target.value))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center justify-between py-3 border border-slate-200 rounded-lg px-4">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">Require Email Verification</p>
                          <p className="text-slate-500 text-xs">Users must verify email before login</p>
                        </div>
                        <button
                          onClick={() => updateSettings('security', 'requireEmailVerification', !settings.security.requireEmailVerification)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            settings.security.requireEmailVerification ? 'bg-blue-600' : 'bg-slate-200'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                            settings.security.requireEmailVerification ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-3 border border-slate-200 rounded-lg px-4">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">Require 2FA</p>
                          <p className="text-slate-500 text-xs">Enforce two-factor authentication</p>
                        </div>
                        <button
                          onClick={() => updateSettings('security', 'require2FA', !settings.security.require2FA)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            settings.security.require2FA ? 'bg-blue-600' : 'bg-slate-200'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                            settings.security.require2FA ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Limits Settings */}
              {activeTab === 'limits' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                      <FaCog className="text-blue-600" />
                      System Limits
                    </h3>
                    <div className="grid gap-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Max Jobs per Recruiter</label>
                        <input
                          type="number"
                          min={1}
                          value={settings.limits.maxJobsPerRecruiter}
                          onChange={(e) => updateSettings('limits', 'maxJobsPerRecruiter', parseInt(e.target.value))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Max Applicants per Job</label>
                        <input
                          type="number"
                          min={1}
                          value={settings.limits.maxApplicantsPerJob}
                          onChange={(e) => updateSettings('limits', 'maxApplicantsPerJob', parseInt(e.target.value))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">AI Screening Limit (per day)</label>
                        <input
                          type="number"
                          min={1}
                          value={settings.limits.aiScreeningLimit}
                          onChange={(e) => updateSettings('limits', 'aiScreeningLimit', parseInt(e.target.value))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
