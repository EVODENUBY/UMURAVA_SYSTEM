"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { FaUser, FaEnvelope, FaLock, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';

const BRAND_COLOR = "#2b71f0";

const translations = {
  en: {
    createAccount: 'Create Account',
    getStarted: 'Join Umurava and start your journey',
    firstName: 'First Name',
    firstNamePlaceholder: 'Muyisingize',
    lastName: 'Last Name',
    lastNamePlaceholder: 'Evode',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    passwordPlaceholder: 'Create password',
    createAccountButton: 'Create Account',
    creating: 'Creating...',
    haveAccount: 'Already have an account?',
    signIn: 'Sign in',
  },
  fr: {
    createAccount: 'Créer un compte',
    getStarted: 'Rejoignez Umurava',
    firstName: 'Prénom',
    firstNamePlaceholder: 'Jean',
    lastName: 'Nom',
    lastNamePlaceholder: 'Dupont',
    email: 'E-mail',
    emailPlaceholder: 'vous@exemple.com',
    password: 'Mot de passe',
    passwordPlaceholder: 'Créer un mot de passe',
    createAccountButton: 'Créer un compte',
    creating: 'Création...',
    haveAccount: 'Vous avez déjà un compte?',
    signIn: 'Se connecter',
  },
  rw: {
    createAccount: 'Fungura Konte',
    getStarted: 'Fungura umurenge',
    firstName: 'Izina rishya',
    firstNamePlaceholder: 'Agaciro',
    lastName: 'Izina',
    lastNamePlaceholder: 'Ryjabo',
    email: 'Imeyili',
    emailPlaceholder: 'wewe@exemple.com',
    password: 'Ijambo ryibanga',
    passwordPlaceholder: 'Fungura ijambo',
    createAccountButton: 'Fungura konte',
    creating: 'Urakora...',
    haveAccount: 'Ufite konte?',
    signIn: 'Injira',
  }
};

type Language = 'en' | 'fr' | 'rw';
type Props = { language: Language; onSwitchTab: () => void };

export default function SignupForm({ language, onSwitchTab }: Props) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState<{firstName?: string; lastName?: string; email?: string; password?: string}>({});
  const { register, isLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const newErrors: {firstName?: string; lastName?: string; email?: string; password?: string} = {};
    if (!formData.firstName) newErrors.firstName = 'Required';
    if (!formData.lastName) newErrors.lastName = 'Required';
    if (!formData.email) newErrors.email = 'Required';
    if (!formData.password) newErrors.password = 'Required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      await register({ fullName, email: formData.email, password: formData.password, phone: "", role: 'applicant' as any });
      showToast('Account created! Redirecting to login...', 'success');
      setTimeout(() => {
        onSwitchTab();
      }, 2000);
    } catch (error: any) {
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('email') || msg.includes('already exist') || msg.includes('taken')) {
        setErrors({ email: 'Email already registered' });
      } else if (msg.includes('password')) {
        setErrors({ password: error.message });
      } else {
        showToast(error.message || 'Registration failed', 'error');
      }
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">{t.createAccount}</h1>
        <p className="text-xs sm:text-sm text-slate-500">{t.getStarted}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">{t.firstName}</label>
            <div className="relative">
              <FaUser className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-xs ${errors.firstName ? 'text-red-500' : 'text-slate-400'}`} />
              <input 
                type="text" 
                required 
                placeholder={t.firstNamePlaceholder} 
                value={formData.firstName} 
                onChange={(e) => { setFormData({ ...formData, firstName: e.target.value }); setErrors(prev => ({ ...prev, firstName: undefined })); }}
                className={`w-full pl-8 pr-2 py-2 text-sm bg-slate-50 border rounded-lg outline-none focus:ring-2 transition-all ${errors.firstName ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'}`} 
              />
            </div>
            {errors.firstName && <p className="text-[10px] text-red-500 mt-0.5">{errors.firstName}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">{t.lastName}</label>
            <div className="relative">
              <FaUser className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-xs ${errors.lastName ? 'text-red-500' : 'text-slate-400'}`} />
              <input 
                type="text" 
                required 
                placeholder={t.lastNamePlaceholder} 
                value={formData.lastName} 
                onChange={(e) => { setFormData({ ...formData, lastName: e.target.value }); setErrors(prev => ({ ...prev, lastName: undefined })); }}
                className={`w-full pl-8 pr-2 py-2 text-sm bg-slate-50 border rounded-lg outline-none focus:ring-2 transition-all ${errors.lastName ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'}`} 
              />
            </div>
            {errors.lastName && <p className="text-[10px] text-red-500 mt-0.5">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">{t.email}</label>
          <div className="relative">
            <FaEnvelope className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-xs ${errors.email ? 'text-red-500' : 'text-slate-400'}`} />
            <input 
              type="email" 
              required 
              placeholder={t.emailPlaceholder} 
              value={formData.email} 
              onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors(prev => ({ ...prev, email: undefined })); }}
              className={`w-full pl-8 pr-2 py-2 text-sm bg-slate-50 border rounded-lg outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'}`} 
            />
          </div>
          {errors.email && <p className="text-[10px] text-red-500 mt-0.5">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">{t.password}</label>
          <div className="relative">
            <FaLock className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-xs ${errors.password ? 'text-red-500' : 'text-slate-400'}`} />
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              placeholder={t.passwordPlaceholder} 
              value={formData.password} 
              onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setErrors(prev => ({ ...prev, password: undefined })); }}
              className={`w-full pl-8 pr-10 py-2 text-sm bg-slate-50 border rounded-lg outline-none focus:ring-2 transition-all ${errors.password ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'}`} 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
            </button>
          </div>
          {errors.password && <p className="text-[10px] text-red-500 mt-0.5">{errors.password}</p>}
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-2 rounded-lg text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-70 relative overflow-hidden"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          {isLoading ? (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              </div>
              <span className="opacity-0">{t.creating}</span>
            </>
          ) : (
            <>
              {t.createAccountButton} <FaArrowRight className="text-[10px]" />
            </>
          )}
        </button>
      </form>

      <p className="mt-2 text-[10px] text-center text-slate-500">
        By creating an account, you agree to our Terms and Privacy Policy
      </p>
    </div>
  );
}