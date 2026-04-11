"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FaEnvelope, FaLock, FaArrowRight, FaArrowLeft, FaGlobe, FaCheck, FaBars, FaTimes } from 'react-icons/fa';
import AuthSidebar from '@/components/ui/AuthSidebar';

const BRAND_COLOR = "#2b71f0";

const translations = {
  en: {
    signIn: 'Sign In',
    welcomeBack: 'Welcome back',
    enterCredentials: 'Enter your credentials to access your account',
    email: 'Email address',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    forgotPassword: 'Forgot password?',
    signInButton: 'Sign in',
    signingIn: 'Signing in...',
    noAccount: "Don't have an account?",
    createOne: 'Create one',
    backToHome: 'Back to Home',
  },
  fr: {
    signIn: 'Connexion',
    welcomeBack: 'Bon retour',
    enterCredentials: 'Entrez vos identifiants pour accéder à votre compte',
    email: 'Adresse e-mail',
    emailPlaceholder: 'vous@exemple.com',
    password: 'Mot de passe',
    passwordPlaceholder: 'Entrez votre mot de passe',
    forgotPassword: 'Mot de passe oublié ?',
    signInButton: 'Se connecter',
    signingIn: 'Connexion...',
    noAccount: "Vous n'avez pas de compte ?",
    createOne: 'Créer un compte',
    backToHome: 'Retour à l\'accueil',
  },
  rw: {
    signIn: 'Injira',
    welcomeBack: 'Murakaza neza',
    enterCredentials: 'Shakisha amakuru yawe yo winjira',
    email: 'Imeyili',
    emailPlaceholder: 'wewe@Urugerero.com',
    password: 'Ijambo ryibanga',
    passwordPlaceholder: 'Injiza irindi jambo',
    forgotPassword: 'Wibagiwe ijambo?',
    signInButton: 'Injira',
    signingIn: 'Urakora...',
    noAccount: 'Nta konti ufite?',
    createOne: 'Fungura konte',
    backToHome: 'Subira ahabanza',
  }
};

type Language = 'en' | 'fr' | 'rw';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('en');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const t = translations[language];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await login(email, password);
  };

  return (
    <div className="min-h-screen text-slate-900 font-sans">
      <div 
        className="fixed inset-0 -z-10 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/bg-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-white/40" />
      </div>

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold shadow-md" style={{ backgroundColor: BRAND_COLOR }}>U</div>
              <span className="text-base sm:text-lg font-bold">Umurava <span style={{ color: BRAND_COLOR }}>AI</span></span>
            </Link>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="relative">
                <button 
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  <FaGlobe className="w-5 h-5 sm:w-5 sm:h-5" />
                </button>
                {isLangOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 py-2 min-w-[140px] overflow-hidden"
                  >
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'fr', label: 'Français' },
                      { code: 'rw', label: 'Kinyarwanda' },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code as Language); setIsLangOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${language === lang.code ? 'text-blue-500 font-semibold bg-blue-50' : 'text-slate-600'}`}
                      >
                        {lang.label}
                        {language === lang.code && <FaCheck className="text-xs" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
              
              <div className="hidden sm:flex items-center gap-4 font-semibold text-sm text-slate-600">
                <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
                <Link href="/#jobs" className="hover:text-slate-900 transition-colors">Jobs</Link>
                <Link href="/register" className="px-4 py-2 rounded-lg text-white transition-all" style={{ backgroundColor: BRAND_COLOR }}>Get Started</Link>
              </div>

              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2 rounded-lg hover:bg-slate-100 transition-all"
              >
                {isMobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="sm:hidden mt-3 pt-3 border-t border-slate-100"
              >
                <div className="flex flex-col gap-2 pb-2">
                  <Link href="/" className="px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">Home</Link>
                  <Link href="/#jobs" className="px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">Jobs</Link>
                  <Link href="/register" className="px-3 py-2.5 rounded-lg text-white text-center text-sm font-semibold" style={{ backgroundColor: BRAND_COLOR }}>Get Started</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <AuthSidebar 
        title="Welcome Back to Umurava"
        subtitle="Continue your journey to success. Sign in to access exclusive opportunities and connect with our community."
      />
        
      <div className="fixed inset-0 flex items-center justify-center px-4 lg:pr-10 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px] lg:ml-[30%] xl:ml-[32%] pointer-events-auto"
        >
          <div className="mb-6 lg:mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 lg:mb-6 group">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md transition-transform group-hover:scale-105" style={{ backgroundColor: BRAND_COLOR }}>
                <FaArrowLeft className="text-sm lg:text-sm" />
              </div>
              <span className="text-xs lg:text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">{t.backToHome}</span>
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{t.welcomeBack}</h1>
            <p className="text-sm text-slate-500">{t.enterCredentials}</p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm p-5 lg:p-8 rounded-2xl shadow-lg lg:shadow-xl border border-slate-200">
            <form onSubmit={handleSignIn} className="space-y-4 lg:space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{t.email}</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input 
                    type="email" 
                    required 
                    placeholder={t.emailPlaceholder} 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t.password}</label>
                  <Link href="#" className="text-[11px] font-medium" style={{ color: BRAND_COLOR }}>{t.forgotPassword}</Link>
                </div>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder={t.passwordPlaceholder} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="relative">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  {isLoading && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-xl">
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    </span>
                  )}
                  <span className={`flex items-center gap-2 transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                    {t.signInButton} <FaArrowRight className="text-xs" />
                  </span>
                </button>
              </div>
            </form>

            <div className="mt-5 pt-5 border-t border-slate-100">
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
