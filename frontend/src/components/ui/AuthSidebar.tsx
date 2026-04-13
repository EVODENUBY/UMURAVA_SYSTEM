"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Rocket, CheckCircle2, ArrowRight, Briefcase, Users, TrendingUp, Star, User, Trophy, Sparkles } from 'lucide-react';
import { FaGlobe } from 'react-icons/fa';

interface AuthSidebarProps {
  title: string;
  subtitle: string;
  onLanguageChange?: (lang: 'en' | 'fr' | 'rw') => void;
}

const languages = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'rw', label: 'Kinyarwanda' },
];

export default function AuthSidebar({ title, subtitle, onLanguageChange }: AuthSidebarProps) {
  const [currentLang, setCurrentLang] = useState('en');

  const handleLangChange = (code: string) => {
    setCurrentLang(code);
    onLanguageChange?.(code as 'en' | 'fr' | 'rw');
  };

  const benefits = [
    { icon: <Briefcase className="w-4 h-4" />, text: 'Access 10,000+ job opportunities' },
    { icon: <Trophy className="w-4 h-4" />, text: 'Join exclusive challenges & win prizes' },
    { icon: <Users className="w-4 h-4" />, text: 'Connect with industry professionals' },
    { icon: <TrendingUp className="w-4 h-4" />, text: 'Track your career growth' },
  ];

  const stats = [
    { value: '10K+', label: 'Active Members' },
    { value: '500+', label: 'Challenges' },
    { value: '95%', label: 'Success Rate' },
  ];

  return (
    <div className="hidden lg:block fixed left-0 top-0 h-screen w-[30%] xl:w-[32%] bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 overflow-hidden z-30">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/50 to-blue-800/50" />

      <div className="relative z-10 flex flex-col h-full p-6 xl:p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
              <Image src="/hire me.png" alt="Hire Me" width={32} height={32} className="object-contain filter brightness-0 invert" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">Umurava</span>
              <span className="text-lg font-bold" style={{ color: '#bfdbfe' }}> AI</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                <FaGlobe className="w-3 h-3" />
                <span className="text-[10px] font-semibold uppercase">{currentLang}</span>
              </button>
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg py-1 min-w-[120px]"
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLangChange(lang.code)}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-slate-50 flex items-center justify-between ${currentLang === lang.code ? 'text-blue-600 font-semibold' : 'text-slate-600'}`}
                  >
                    {lang.label}
                    {currentLang === lang.code && <Star className="w-2.5 h-2.5 text-yellow-300" />}
                  </button>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-2xl xl:text-3xl font-bold leading-tight mb-2">
            {title}
          </h1>
          <p className="text-blue-100 text-sm opacity-90 leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="grid grid-cols-3 gap-2 mb-5">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10"
              >
                <div className="text-lg xl:text-xl font-bold">{stat.value}</div>
                <div className="text-[9px] xl:text-[10px] text-blue-100 mt-0.5 opacity-80">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <h2 className="text-xs font-bold text-blue-100 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            <span>Why Join Us</span>
          </h2>
          <div className="space-y-2.5">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  {benefit.icon}
                </div>
                <span className="text-xs xl:text-sm text-white/95 leading-snug">{benefit.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-auto"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.05, type: "spring" }}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-300 to-blue-400 border-2 border-white/30 flex items-center justify-center text-xs font-bold shadow-md"
                  >
                    <User className="w-3 h-3" />
                  </motion.div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 text-yellow-300" />
                  ))}
                </div>
                <div className="font-bold text-xs mt-0.5">10,000+ Happy Members</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-[10px] text-blue-100">500+ joined this month</span>
              <button className="flex items-center gap-1.5 text-xs font-semibold hover:gap-2.5 transition-all">
                <span>Join Now</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-800/60 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
