"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import AuthSidebar from '@/components/ui/AuthSidebar';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const BRAND_COLOR = "#2b71f0";

type Language = 'en' | 'fr' | 'rw';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [language, setLanguage] = useState<Language>('en');
  const [isLangOpen, setIsLangOpen] = useState(false);

  return (
    <div className="min-h-screen text-slate-900 font-sans">
      <div 
        className="fixed inset-0 -z-10 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/bg-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-white/90 lg:bg-white/40" />
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
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
                    {language === lang.code && <svg className="w-3 h-3 ml-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </header>

      <AuthSidebar 
        title={activeTab === 'login' ? "Welcome Back to Umurava" : "Start Your Journey with Umurava"}
        subtitle={activeTab === 'login' 
          ? "Continue your journey to success. Sign in to access exclusive opportunities and connect with top recruiters."
          : "Join thousands of professionals building their careers through exciting challenges and opportunities."
        }
        className="hidden lg:flex"
      />
         
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-8 pointer-events-none py-6 sm:py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="w-full max-w-[360px] sm:max-w-[380px] pointer-events-auto"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-4 sm:p-6">
            {/* Tabs */}
            <div className="flex gap-1 mb-4 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all ${activeTab === 'login' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all ${activeTab === 'signup' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign Up
              </button>
            </div>
            
            {/* Back Button - Mobile */}
            <Link href="/" className="inline-flex items-center gap-1 mb-3 px-2 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-700 transition-all text-xs font-medium sm:hidden">
              <svg className="text-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              <span>Back</span>
            </Link>

            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <LoginForm language={language} />
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <SignupForm language={language} onSwitchTab={() => setActiveTab('login')} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}