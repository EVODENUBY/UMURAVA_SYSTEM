"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { FaEnvelope, FaLock, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import { ROUTES, ROLES, UserRole } from '@/lib/types';

const BRAND_COLOR = "#2b71f0";

const translations = {
  en: {
    welcomeBack: 'Welcome back!',
    enterCredentials: 'Sign in to access your account',
    email: 'Email',
    emailPlaceholder: 'you@gmail.com',
    password: 'Password',
    passwordPlaceholder: 'Enter password',
    forgotPassword: 'Forgot password?',
    signInButton: 'Sign In',
    signingIn: 'Signing in...',
  },
  fr: {
    welcomeBack: 'Bon retour!',
    enterCredentials: 'Connectez-vous pour accéder à votre compte',
    email: 'E-mail',
    emailPlaceholder: 'vous@gmail.com',
    password: 'Mot de passe',
    passwordPlaceholder: 'Entrez le mot de passe',
    forgotPassword: 'Mot de passe oublié?',
    signInButton: 'Se connecter',
    signingIn: 'Connexion...',
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
  }
};

type Language = 'en' | 'fr' | 'rw';
type Props = { language: Language };

export default function LoginForm({ language }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
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
    <div>
      <div className="mb-4">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">{t.welcomeBack}</h1>
        <p className="text-xs sm:text-sm text-slate-500">{t.enterCredentials}</p>
      </div>

      <form onSubmit={handleSignIn} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">{t.email}</label>
          <div className="relative">
            <FaEnvelope className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${emailError ? 'text-red-500' : 'text-slate-400'}`} />
            <input 
              type="email" 
              required 
              placeholder={t.emailPlaceholder} 
              value={email} 
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
              className={`w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border rounded-lg outline-none focus:ring-2 transition-all ${emailError ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'}`} 
            />
          </div>
          {emailError && <p className="text-[10px] text-red-500 mt-0.5">{emailError}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-600">{t.password}</label>
            <Link href="#" className="text-[10px] font-medium" style={{ color: BRAND_COLOR }}>{t.forgotPassword}</Link>
          </div>
          <div className="relative">
            <FaLock className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${passwordError ? 'text-red-500' : 'text-slate-400'}`} />
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              placeholder={t.passwordPlaceholder} 
              value={password} 
              onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
              className={`w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border rounded-lg outline-none focus:ring-2 transition-all ${passwordError ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'}`} 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
            </button>
          </div>
          {passwordError && <p className="text-[10px] text-red-500 mt-0.5">{passwordError}</p>}
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
              <span className="opacity-0">{t.signingIn}</span>
            </>
          ) : (
            <>
              {t.signInButton} <FaArrowRight className="text-[10px]" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}