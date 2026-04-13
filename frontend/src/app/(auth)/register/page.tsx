"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { FaUser, FaEnvelope, FaLock, FaArrowRight, FaGlobe, FaCheck, FaArrowLeft } from 'react-icons/fa';
import AuthSidebar from '@/components/ui/AuthSidebar';

const BRAND_COLOR = "#2b71f0";

const translations = {
  en: {
    createAccount: 'Create Account',
    getStarted: 'Join Umurava and start your journey',
    fullName: 'Full Name',
    fullNamePlaceholder: 'John Doe',
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
    fullName: 'Nom complet',
    fullNamePlaceholder: 'Jean Dupont',
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
    fullName: 'Amazina',
    fullNamePlaceholder: 'Izina rishya',
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

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState<{fullName?: string; email?: string; password?: string}>({});
  const { register, isLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [language, setLanguage] = useState<Language>('en');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const newErrors: {fullName?: string; email?: string; password?: string} = {};
    if (!formData.fullName) newErrors.fullName = 'Required';
    if (!formData.email) newErrors.email = 'Required';
    if (!formData.password) newErrors.password = 'Required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      await register({ ...formData, phone: "", role: 'applicant' as any });
      showToast('Account created! Redirecting to login...', 'success');
      setTimeout(() => {
        router.push('/login');
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
    <div className="min-h-screen text-slate-900 font-sans">
      <div 
        className="fixed inset-0 -z-10 bg-cover bg-center bg-fixed lg:bg-none"
        style={{ backgroundImage: "url('/bg-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-white/40 lg:hidden" />
      </div>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-white/20 lg:hidden">
        <div className="px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-1.5">
            <Image src="/hire me.png" alt="Hire Me" width={32} height={32} className="object-contain" />
            <span className="text-lg font-bold">Umurava <span style={{ color: BRAND_COLOR }}>AI</span></span>
          </Link>
          
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              <FaGlobe className="w-4 h-4" />
            </button>
            {isLangOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[120px]"
              >
                {[
                  { code: 'en', label: 'English' },
                  { code: 'fr', label: 'Français' },
                  { code: 'rw', label: 'Kinyarwanda' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code as Language); setIsLangOpen(false); }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 ${language === lang.code ? 'text-blue-600 font-semibold' : 'text-slate-600'}`}
                  >
                    {lang.label}
                    {language === lang.code && <FaCheck className="text-xs ml-auto" />}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </header>

      <AuthSidebar 
        title="Start Your Journey with Umurava"
        subtitle="Join thousands of professionals building their careers through exciting challenges and opportunities."
      />
         
      <div className="lg:fixed lg:inset-0 lg:flex lg:items-center lg:justify-center px-4 sm:px-6 lg:px-8 xl:px-12 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px] mx-auto pointer-events-auto py-8 lg:py-0"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8">
            <div className="mb-5">
              <Link href="/" className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-700 transition-all text-xs font-medium">
                <FaArrowLeft className="text-xs" />
                <span>Back</span>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{t.createAccount}</h1>
              <p className="text-sm text-slate-500">{t.getStarted}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.fullName}</label>
                <div className="relative">
                  <FaUser className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${errors.fullName ? 'text-red-500' : 'text-slate-400'}`} />
                  <input 
                    type="text" 
                    required 
                    placeholder={t.fullNamePlaceholder} 
                    value={formData.fullName} 
                    onChange={(e) => { setFormData({ ...formData, fullName: e.target.value }); setErrors(prev => ({ ...prev, fullName: undefined })); }}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none focus:ring-2 transition-all ${errors.fullName ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'}`} 
                  />
                </div>
                {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.email}</label>
                <div className="relative">
                  <FaEnvelope className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${errors.email ? 'text-red-500' : 'text-slate-400'}`} />
                  <input 
                    type="email" 
                    required 
                    placeholder={t.emailPlaceholder} 
                    value={formData.email} 
                    onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors(prev => ({ ...prev, email: undefined })); }}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'}`} 
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.password}</label>
                <div className="relative">
                  <FaLock className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${errors.password ? 'text-red-500' : 'text-slate-400'}`} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder={t.passwordPlaceholder} 
                    value={formData.password} 
                    onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setErrors(prev => ({ ...prev, password: undefined })); }}
                    className={`w-full pl-10 pr-12 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none focus:ring-2 transition-all ${errors.password ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'}`} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-70 relative overflow-hidden mt-1"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                {isLoading ? (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    </div>
                    <span className="opacity-0">{t.creating}</span>
                  </>
                ) : (
                  <>
                    {t.createAccountButton} <FaArrowRight className="text-xs" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-3 text-[11px] text-center text-slate-500">
              By creating an account, you agree to our Terms and Privacy Policy
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-center text-slate-500">
                {t.haveAccount}{' '}
                <Link href="/login" className="font-semibold" style={{ color: BRAND_COLOR }}>{t.signIn}</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}