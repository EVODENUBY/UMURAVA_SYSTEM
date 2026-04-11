"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaArrowRight, FaArrowLeft, FaGlobe, FaCheck, FaBars, FaTimes } from 'react-icons/fa';
import AuthSidebar from '@/components/ui/AuthSidebar';

const BRAND_COLOR = "#2b71f0";

const translations = {
  en: {
    createAccount: 'Create Account',
    getStarted: 'Get started with Umurava and join our community',
    fullName: 'Full Name',
    fullNamePlaceholder: 'John Doe',
    email: 'Email Address',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    passwordPlaceholder: 'Create a strong password',
    createAccountButton: 'Create Account',
    creating: 'Creating account...',
    haveAccount: 'Already have an account?',
    signIn: 'Sign in',
    backToHome: 'Back to Home',
    agreeToTerms: 'By creating an account, you agree to our',
    terms: 'Terms',
    and: 'and',
    privacy: 'Privacy Policy',
  },
  fr: {
    createAccount: 'Créer un compte',
    getStarted: 'Commencez avec Umurava et rejoignez notre communauté',
    fullName: 'Nom complet',
    fullNamePlaceholder: 'Jean Dupont',
    email: 'Adresse e-mail',
    emailPlaceholder: 'vous@exemple.com',
    password: 'Mot de passe',
    passwordPlaceholder: 'Créez un mot de passe fort',
    createAccountButton: 'Créer un compte',
    creating: 'Création du compte...',
    haveAccount: 'Vous avez déjà un compte ?',
    signIn: 'Se connecter',
    backToHome: 'Retour à l\'accueil',
    agreeToTerms: 'En créant un compte, vous acceptez nos',
    terms: 'Conditions',
    and: 'et',
    privacy: 'Politique de confidentialité',
  },
  rw: {
    createAccount: 'Fungura Konte',
    getStarted: 'Fungura na Umurava ujye mu itsinda',
    fullName: 'Amazina',
    fullNamePlaceholder: 'Izina rishya',
    email: 'Imeyili',
    emailPlaceholder: 'wewe@Urugerero.com',
    password: 'Ijambo ryibanga',
    passwordPlaceholder: 'Fungura irindi jambo',
    createAccountButton: 'Fungura konte',
    creating: 'Urakora...',
    haveAccount: 'Ufite konte?',
    signIn: 'Injira',
    backToHome: 'Subira ahabanza',
    agreeToTerms: 'Ukungiriza konte, wobemera',
    terms: 'Amategeko',
    and: 'na',
    privacy: 'Politiki yibanga',
  }
};

type Language = 'en' | 'fr' | 'rw';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });
  const { register, isLoading } = useAuth();
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('en');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) return;
    await register({ ...formData, phone: "", role: 'applicant' as any });
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
                <Link href="/login" className="px-4 py-2 rounded-lg border-2 transition-all" style={{ borderColor: BRAND_COLOR, color: BRAND_COLOR }}>Sign In</Link>
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
                  <Link href="/login" className="px-3 py-2.5 rounded-lg text-center text-sm font-semibold border-2" style={{ borderColor: BRAND_COLOR, color: BRAND_COLOR }}>Sign In</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <AuthSidebar 
        title="Start Your Journey with Umurava"
        subtitle="Join thousands of professionals building their careers through exciting challenges and opportunities."
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
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{t.createAccount}</h1>
            <p className="text-sm text-slate-500">{t.getStarted}</p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm p-5 lg:p-8 rounded-2xl shadow-lg lg:shadow-xl border border-slate-200">
            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{t.fullName}</label>
                <div className="relative">
                  <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input 
                    type="text" 
                    required 
                    placeholder={t.fullNamePlaceholder} 
                    value={formData.fullName} 
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{t.email}</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input 
                    type="email" 
                    required 
                    placeholder={t.emailPlaceholder} 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{t.password}</label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder={t.passwordPlaceholder} 
                    value={formData.password} 
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                {isLoading ? t.creating : t.createAccountButton}
                {!isLoading && <FaArrowRight className="text-xs" />}
              </button>
            </form>

            <p className="mt-4 text-[11px] text-center text-slate-500 leading-relaxed">
              {t.agreeToTerms}{' '}
              <Link href="#" className="font-medium" style={{ color: BRAND_COLOR }}>{t.terms}</Link>
              {' '}{t.and}{' '}
              <Link href="#" className="font-medium" style={{ color: BRAND_COLOR }}>{t.privacy}</Link>.
            </p>

            <div className="mt-5 pt-5 border-t border-slate-100">
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
