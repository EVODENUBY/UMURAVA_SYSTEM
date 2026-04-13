
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPin, 
  Briefcase, 
  Menu, 
  X, 
  Search,
  Code2,
  UserCheck,
  Handshake,
  TrendingUp,
  Lightbulb,
  Clock
} from 'lucide-react';

const BRAND_COLOR = "#2b71f0";

interface Job {
  _id: string;
  title: string;
  description?: string;
  employmentType?: string;
  jobLevel?: string;
  requiredSkills?: string[];
  responsibilities?: string[];
  experience?: string;
  education?: { degree: string; field: string }[];
  certifications?: string[];
  languages?: string[];
  location?: { address?: string; city?: string; country?: string; remote?: boolean };
  salary?: { min: number; max: number; currency: string };
  benefits?: string[];
  applicationProcess?: object;
  tags?: string[];
  status?: string;
  applicationDeadline?: string;
  expirationDate?: string;
  analytics?: object;
  createdAt?: string;
  updatedAt?: string;
}

const translations = {
  en: {
    findJob: 'Find a Job',
    ourProcess: 'Our Process',
    signIn: 'Sign In',
    browseJobs: 'Browse Jobs',
    aboutUs: 'About Us',
    login: 'Login',
    africanTalent: 'African Talent.',
    welcomeText: 'The premium recruitment platform bridging the gap between skilled professionals in Rwanda and global opportunities.',
    searchPlaceholder: 'Search by job title, skills, or location...',
    latestJobs: 'Latest Jobs',
    positionsAvailable: 'Positions Available',
    active: 'Active',
    applyNow: 'Apply Now',
    posted: 'Posted',
    platform: 'Platform',
    company: 'Company',
    legal: 'Legal',
    browseJobsLink: 'Browse Jobs',
    findTalent: 'Find Talent',
    challenges: 'Challenges',
    successStories: 'Success Stories',
    aboutUsLink: 'About Us',
    careers: 'Careers',
    blog: 'Blog',
    contact: 'Contact',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    cookiePolicy: 'Cookie Policy',
    helpCenter: 'Help Center',
    allRightsReserved: 'All rights reserved.',
    madeWith: 'Made with',
    inRwanda: 'in Kigali, Rwanda',
    menuFindJob: 'Find a Job',
    menuOurProcess: 'Our Process',
    menuLogin: 'Login',
    jobCardCompany: 'Umurava AI',
    jobCardLocation: 'Location',
    jobCardExperience: 'Experience',
    jobCardSalary: 'Salary',
  },
  fr: {
    findJob: 'Trouver un emploi',
    ourProcess: 'Notre processus',
    signIn: 'Se connecter',
    browseJobs: 'Parcourir',
    aboutUs: 'À propos',
    login: 'Connexion',
    africanTalent: 'Talents Africains.',
    welcomeText: 'La plateforme de recrutement premium qui comble le fossé entre les professionnels qualifiés au Rwanda et les opportunités mondiales.',
    searchPlaceholder: 'Rechercher par titre, compétences ou lieu...',
    latestJobs: 'Dernières offres',
    positionsAvailable: 'Postes disponibles',
    active: 'Actif',
    applyNow: 'Postuler',
    posted: 'Publié',
    platform: 'Plateforme',
    company: 'Entreprise',
    legal: 'Légal',
    browseJobsLink: 'Offres d\'emploi',
    findTalent: 'Trouver des talents',
    challenges: 'Défis',
    successStories: 'Témoignages',
    aboutUsLink: 'À propos de nous',
    careers: 'Carrières',
    blog: 'Blog',
    contact: 'Contact',
    privacyPolicy: 'Politique de confidentialité',
    termsOfService: 'Conditions d\'utilisation',
    cookiePolicy: 'Politique des cookies',
    helpCenter: 'Centre d\'aide',
    allRightsReserved: 'Tous droits réservés.',
    madeWith: 'Fait avec',
    inRwanda: 'à Kigali, Rwanda',
    menuFindJob: 'Trouver un emploi',
    menuOurProcess: 'Notre processus',
    menuLogin: 'Connexion',
    jobCardCompany: 'Umurava AI',
    jobCardLocation: 'Lieu',
    jobCardExperience: 'Expérience',
    jobCardSalary: 'Salaire',
  },
  rw: {
    findJob: 'Shakisha akazi',
    ourProcess: 'Inzira yacu',
    signIn: 'Injira',
    browseJobs: 'Shakisha',
    aboutUs: 'Ibyerekeye',
    login: 'Injira',
    africanTalent: 'Abahangazi ba Afrika.',
    welcomeText: 'Urubuga rwo gushaka abakozi ruganira abahanga n\'amashuri ndetse n\'ibikorwa by\'isi yose.',
    searchPlaceholder: 'Shakisha akazi, ubuhizi, cyangwa aho bishoboka...',
    latestJobs: 'Akazi mashya',
    positionsAvailable: 'Aka kazi gafite',
    active: 'Arakora',
    applyNow: 'Saba',
    posted: 'Wamaze',
    platform: 'Urubuga',
    company: 'Ibigo',
    legal: 'Amategeko',
    browseJobsLink: 'Shakisha akazi',
    findTalent: 'Shakisha abahanga',
    challenges: 'Ibikorwa',
    successStories: 'Ibitekerezo',
    aboutUsLink: 'Ibyerekeye',
    careers: 'Imirimo',
    blog: 'Blog',
    contact: 'Twandikire',
    privacyPolicy: 'Politiki y\'ubugarukiro',
    termsOfService: 'Amategeko y\'usages',
    cookiePolicy: 'Politiki y\'cookies',
    helpCenter: 'Interuro z\'agaciro',
    allRightsReserved: 'Rights zose zirakwiye.',
    madeWith: 'Wiringaniye',
    inRwanda: 'i Kigali, Rwanda',
    menuFindJob: 'Shakisha akazi',
    menuOurProcess: 'Inzira yacu',
    menuLogin: 'Injira',
    jobCardCompany: 'Umurava AI',
    jobCardLocation: 'Aho',
    jobCardExperience: 'Ubushakashatsi',
    jobCardSalary: 'Igiciro',
  }
};

type Language = 'en' | 'fr' | 'rw';

export default function LandingPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState<Language>('en');
  const [isLangOpen, setIsLangOpen] = useState(false);

  const t = translations[language];

  const getLocation = (loc: { address?: string; city?: string; country?: string; remote?: boolean } | undefined) => {
    if (loc?.city) return loc.city;
    if (loc?.address) return loc.address;
    if (loc?.country) return loc.country;
    return 'Remote';
  };

  const getCountdown = (date: string | undefined) => {
    if (!date) return '';
    const posted = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - posted.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  const fetchJobs = async (query = "") => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?page=1&limit=10${query ? `&search=${query}` : ''}`);
      const result = await res.json();
      if (result.success && result.data?.jobs) {
        setJobs(result.data.jobs);
      } else if (Array.isArray(result.data)) {
        setJobs(result.data);
      } else if (Array.isArray(result)) {
        setJobs(result);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-blue-100">
      <div 
        className="fixed inset-0 -z-10 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/bg-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px]" />
      </div>
      
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] md:hidden"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Image src="/hire me.png" alt="Hire Me" width={40} height={40} className="object-contain" />
                    <span className="text-lg font-bold">Umurava <span style={{ color: BRAND_COLOR }}>AI</span></span>
                  </div>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
                
                <div className="flex-1 p-6">
                  <nav className="space-y-2">
                    <Link 
                      href="#jobs" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-4 px-4 py-4 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Search className="w-5 h-5" style={{ color: BRAND_COLOR }} />
                      <span className="font-semibold">{t.menuFindJob}</span>
                    </Link>
                    <Link 
                      href="#" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-4 px-4 py-4 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Briefcase className="w-5 h-5" style={{ color: BRAND_COLOR }} />
                      <span className="font-semibold">{t.menuOurProcess}</span>
                    </Link>
                  </nav>
                </div>
                
                <div className="p-6 border-t border-slate-100">
                  <Link 
                    href="/login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full py-4 rounded-xl text-white text-center font-bold text-sm"
                    style={{ backgroundColor: BRAND_COLOR }}
                  >
                    {t.menuLogin}
                  </Link>
                  
                  <div className="mt-4 flex items-center justify-center gap-4 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => setLanguage('en')}
                      className={`text-xs font-medium px-3 py-1 rounded-full ${language === 'en' ? 'bg-blue-100 text-blue-600' : 'text-slate-500'}`}
                    >
                      EN
                    </button>
                    <button 
                      onClick={() => setLanguage('fr')}
                      className={`text-xs font-medium px-3 py-1 rounded-full ${language === 'fr' ? 'bg-blue-100 text-blue-600' : 'text-slate-500'}`}
                    >
                      FR
                    </button>
                    <button 
                      onClick={() => setLanguage('rw')}
                      className={`text-xs font-medium px-3 py-1 rounded-full ${language === 'rw' ? 'bg-blue-100 text-blue-600' : 'text-slate-500'}`}
                    >
                      RW
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-sm px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/hire me.png" alt="Hire Me" width={40} height={40} className="object-contain" />
            <span className="text-lg sm:text-xl font-black tracking-tight">Umurava <span style={{ color: BRAND_COLOR }}>AI</span></span>
          </Link>
          <div className="hidden lg:flex items-center gap-8 font-semibold text-sm text-slate-600">
            <Link href="#jobs" className="hover:text-slate-900 transition-colors">{t.findJob}</Link>
            <Link href="/login" className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold transition-all hover:shadow-md hover:bg-blue-700">Get Started</Link>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="px-3 py-2 rounded-lg text-sm text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="rw">Kinyarwanda</option>
            </select>
          </div>
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between gap-[5px]">
              <span className="block h-[3px] w-full bg-slate-700 rounded-full" />
              <span className="block h-[3px] w-full bg-slate-700 rounded-full" />
              <span className="block h-[3px] w-full bg-slate-700 rounded-full" />
            </div>
          </button>
        </div>
      </nav>

      <section className="relative pt-12 md:pt-20 pb-12 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white" />
        
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 1 }}
          className="absolute inset-0 overflow-hidden pointer-events-none"
        >
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2b71f0" stopOpacity="0"/>
                <stop offset="50%" stopColor="#2b71f0" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#2b71f0" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <motion.polyline points="60,80 200,60 380,100 520,40 480,160 300,180 140,140" fill="none" stroke="url(#lineGradient)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
            <motion.polyline points="80,180 220,160 400,200 480,140 440,220 280,240 160,200" fill="none" stroke="url(#lineGradient)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
            <motion.polyline points="100,100 180,80 280,120 360,80 340,160 240,180 160,160" fill="none" stroke="url(#lineGradient)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
          </svg>
          <motion.div 
            animate={{ y: [0, -15, 0], x: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-16 left-[15%] md:left-[12%] text-blue-200/40"
          >
            <Code2 className="w-12 h-12 md:w-16 md:h-16" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-24 right-[15%] md:right-[12%] text-blue-200/40"
          >
            <UserCheck className="w-10 h-10 md:w-14 md:h-14" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 12, 0], x: [0, 10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-32 left-[25%] text-blue-200/40 hidden md:block"
          >
            <Handshake className="w-10 h-10" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, -18, 0], x: [0, -8, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-24 right-[20%] text-blue-200/40 hidden md:block"
          >
            <TrendingUp className="w-12 h-12" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 10, 0], x: [0, 12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[40%] left-[8%] text-blue-200/35 hidden md:block"
          >
            <Briefcase className="w-9 h-9" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, -12, 0], x: [0, -8, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[35%] right-[10%] text-blue-200/35 hidden md:block"
          >
            <Lightbulb className="w-10 h-10" />
          </motion.div>
        </motion.div>

        <div className="max-w-4xl mx-auto text-center px-2 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
             <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-[1.15] mb-3 uppercase">
              Umurava <span className="sm:ml-2" style={{ color: BRAND_COLOR }}>{t.africanTalent}</span>
            </h1>
            <p className="text-sm text-slate-600 mb-4 max-w-xl mx-auto">
              {t.welcomeText}
            </p>
            <div className="max-w-lg mx-auto relative">
              <input 
                type="text"
                placeholder={t.searchPlaceholder}
                className="w-full pl-4 pr-24 py-3 rounded-full bg-white border-2 border-slate-200 shadow-md outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm"
                onChange={(e) => fetchJobs(e.target.value)}
              />
              <button 
                className="absolute right-1 top-1 bottom-1 w-10 rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition-all"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"
        />
      </section>
      

<main id="jobs" className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 sm:h-8 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">{t.latestJobs}</h2>
          </div>
          <span className="text-xs font-semibold text-white bg-blue-600 px-2 py-1 rounded-full">
             {jobs.length} {t.positionsAvailable}
           </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {loading ? (
               <div className="col-span-full text-center py-8">
                 <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
               </div>
              ) : jobs.length === 0 ? (
               <div className="col-span-full text-center py-16">
                 <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                 <p className="text-slate-600 font-semibold">No jobs available yet</p>
                 <p className="text-slate-400 text-sm">Check back soon for new opportunities</p>
               </div>
              ) : (
                jobs.map((job, index) => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -3 }}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0" style={{ backgroundColor: BRAND_COLOR }}>
                            {job.title.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-slate-900 truncate">{job.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span className="text-xs text-slate-500 truncate">{getLocation(job.location)}</span>
                            </div>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold shrink-0 border border-emerald-100">
                          {job.status === 'published' ? 'ACTIVE' : job.status?.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-semibold">
                          {job.employmentType?.replace('-', ' ').toUpperCase() || 'FULL-TIME'}
                        </span>
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-[11px] font-semibold">
                          {job.jobLevel?.toUpperCase() || 'MID LEVEL'}
                        </span>
                        {job.experience && (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[11px] font-semibold">
                            {job.experience}
                          </span>
                        )}
                      </div>

                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {job.requiredSkills.slice(0, 4).map((skill: string) => (
                            <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-medium">
                              {skill}
                            </span>
                          ))}
                          {job.requiredSkills.length > 4 && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[11px] font-medium">
                              +{job.requiredSkills.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-[11px] text-slate-400 font-medium">
                            {getCountdown(job.createdAt)}
                          </span>
                        </div>
                        {job.salary?.min && job.salary?.max && (
                          <span className="text-xs font-bold" style={{ color: BRAND_COLOR }}>
                            {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link 
                      href={`/login?apply=${job._id}`}
                      className="block w-full py-2.5 text-center text-white text-xs font-bold uppercase tracking-wider"
                      style={{ backgroundColor: BRAND_COLOR }}
                    >
                      Apply Now
                    </Link>
                  </motion.div>
                ))
              )}
        </div>
      </main>

      <footer className="bg-slate-900 text-white pt-12 sm:pt-16 pb-6 sm:pb-8 px-4 sm:px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg">TALENT HUNTERS LAB</h3>
                  <p className="text-xs text-slate-400">Building the future of recruitment</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                We are a passionate team of developers dedicated to revolutionizing how talent meets opportunity across Africa.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-blue-500 transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-blue-500 transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-blue-500 transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300 mb-4">Meet Our Team</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">EM</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">Evode Muyisingize</h4>
                    <p className="text-xs text-blue-400">AI Engineer & Backend Developer</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-medium rounded-full">Team Lead</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">AN</div>
                  <div>
                    <h4 className="font-semibold text-sm">Adolphe Nayituriki</h4>
                    <p className="text-xs text-slate-400">Frontend Developer</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">SB</div>
                  <div>
                    <h4 className="font-semibold text-sm">Steven Byiringiro</h4>
                    <p className="text-xs text-slate-400">Frontend Developer</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">BH</div>
                  <div>
                    <h4 className="font-semibold text-sm">Bahati Hakizimana</h4>
                    <p className="text-xs text-slate-400">Backend Developer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-xs text-slate-500">
                © 2026 Umurava AI. All rights reserved.
              </p>
              <div className="flex items-center gap-3 text-[10px] sm:text-xs text-slate-500">
                <button 
                  onClick={() => setLanguage('en')} 
                  className={`hover:text-white transition-colors ${language === 'en' ? 'text-white font-semibold' : ''}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLanguage('fr')} 
                  className={`hover:text-white transition-colors ${language === 'fr' ? 'text-white font-semibold' : ''}`}
                >
                  FR
                </button>
                <button 
                  onClick={() => setLanguage('rw')} 
                  className={`hover:text-white transition-colors ${language === 'rw' ? 'text-white font-semibold' : ''}`}
                >
                  RW
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}