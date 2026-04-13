"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { FaEnvelope, FaLock, FaArrowRight, FaGlobe, FaCheck, FaArrowLeft, FaRocket } from 'react-icons/fa';
import AuthSidebar from '@/components/ui/AuthSidebar';
import { ROUTES, ROLES, UserRole } from '@/lib/types';

const BRAND_COLOR = "#2b71f0";

const translations = {
  en: {
    welcomeBack: 'Welcome back!',
    enterCredentials: 'Sign in to access your account',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    passwordPlaceholder: 'Enter password',
    forgotPassword: 'Forgot password?',
    signInButton: 'Sign In',
    signingIn: 'Signing in...',
    noAccount: "Don't have an account?",
    createOne: 'Create one',
  },
  fr: {
    welcomeBack: 'Bon retour!',
    enterCredentials: 'Connectez-vous pour accéder à votre compte',
    email: 'E-mail',
    emailPlaceholder: 'vous@exemple.com',
    password: 'Mot de passe',
    passwordPlaceholder: 'Entrez le mot de passe',
    forgotPassword: 'Mot de passe oublié?',
    signInButton: 'Se connecter',
    signingIn: 'Connexion...',
    noAccount: 'Vous n\'avez pas de compte?',
    createOne: 'Créer un compte',
  },
  rw: {
    welcomeBack: 'Murakaza neza!',
    enterCredentials: 'Injira rubuga rwawe',
    email: 'Imeyili',
    emailPlaceholder: 'you@example.com',
    password: 'Ijambo ryibanga',
    passwordPlaceholder: 'Injiza ijambo',
    forgotPassword: 'Wibagiwe?',
    signInButton: 'Injira',
    signingIn: 'kwinjira...',
    noAccount: 'Nta konti ufite?',
    createOne: 'Fungura',
  }
};

type Language = 'en' | 'fr' | 'rw';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [language, setLanguage] = useState<Language>('en');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const t = translations[language];

  const getRedirectPath = (role: UserRole): string => {
    switch (role) {
      case ROLES.APPLICANT:
        return ROUTES.APPLICANT.DASHBOARD;
      case ROLES.RECRUITER:
        return ROUTES.RECRUITER.DASHBOARD;
      case ROLES.ADMIN:
        return ROUTES.ADMIN.DASHBOARD;
      default:
        return ROUTES.LANDING;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!password) {
      setPasswordError('Password is required');
      return;
    }
    try {
      const user = await login(email, password);
      showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        const redirectPath = getRedirectPath(user.role);
        router.push(redirectPath);
      }, 2000);
    } catch (error: any) {
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('email') || msg.includes('not found') || msg.includes('not exist')) {
        setEmailError('Invalid email address');
      } else if (msg.includes('password') || msg.includes('incorrect') || msg.includes('wrong') || msg.includes('invalid credentials')) {
        setPasswordError('Incorrect password');
      } else {
        showToast(error.message || 'Login failed. Please try again.', 'error');
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
        title="Welcome Back to Umurava"
        subtitle="Continue your journey to success. Sign in to access exclusive opportunities and connect with top recruiters."
        onLanguageChange={(lang) => setLanguage(lang as Language)}
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
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{t.welcomeBack}</h1>
              <p className="text-sm text-slate-500">{t.enterCredentials}</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.email}</label>
                <div className="relative">
                  <FaEnvelope className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${emailError ? 'text-red-500' : 'text-slate-400'}`} />
                  <input 
                    type="email" 
                    required 
                    placeholder={t.emailPlaceholder} 
                    value={email} 
                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none focus:ring-2 transition-all ${emailError ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'}`} 
                  />
                </div>
                {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-600">{t.password}</label>
                  <Link href="#" className="text-[11px] font-medium" style={{ color: BRAND_COLOR }}>{t.forgotPassword}</Link>
                </div>
                <div className="relative">
                  <FaLock className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${passwordError ? 'text-red-500' : 'text-slate-400'}`} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder={t.passwordPlaceholder} 
                    value={password} 
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                    className={`w-full pl-10 pr-12 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none focus:ring-2 transition-all ${passwordError ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'}`} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-70 relative overflow-hidden"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                {isLoading ? (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    </div>
                    <span className="opacity-0">{t.signingIn}</span>
                  </>
                ) : (
                  <>
                    {t.signInButton} <FaArrowRight className="text-xs" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-xs text-center text-slate-500">
                {t.noAccount}{' '}
                <Link href="/register" className="font-semibold" style={{ color: BRAND_COLOR }}>{t.createOne}</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}