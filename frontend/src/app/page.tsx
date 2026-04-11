"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  MapPin, 
  Briefcase, 
  Menu, 
  X, 
  Search,
  Globe,
  Code2,
  UserCheck,
  Handshake,
  TrendingUp,
  Lightbulb
} from 'lucide-react';

const BRAND_COLOR = "#2b71f0";

interface Job {
  _id: string;
  title: string;
  location: string;
  createdAt: string;
  experience: { level: string };
  salary: { min: number; max: number; currency: string };
  requiredSkills: string[];
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

  const fetchJobs = async (query = "") => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:10000/api/jobs?page=1&limit=10&search=${query}`);
      const result = await res.json();
      if (result.success) setJobs(result.data.jobs);
    } catch (error) {
      console.error("Fetch error:", error);
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
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-lg" style={{ backgroundColor: BRAND_COLOR }}>U</div>
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
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black shadow-lg" style={{ backgroundColor: BRAND_COLOR }}>U</div>
            <span className="text-lg sm:text-xl font-black tracking-tight">Umurava <span style={{ color: BRAND_COLOR }}>AI</span></span>
          </Link>
          <div className="hidden lg:flex items-center gap-8 font-semibold text-sm text-slate-600">
            <Link href="#jobs" className="hover:text-slate-900 transition-colors">{t.findJob}</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">{t.ourProcess}</Link>
            <Link href="/login" className="px-6 py-2.5 rounded-xl border-2 transition-all hover:shadow-md" style={{ borderColor: BRAND_COLOR, color: BRAND_COLOR }}>{t.signIn}</Link>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                <Globe className="w-4 h-4" />
                <span className="font-medium uppercase">{language}</span>
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
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors ${language === lang.code ? 'text-blue-500 font-semibold bg-blue-50' : 'text-slate-600'}`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
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
          <motion.div 
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 md:left-20 text-blue-200 opacity-30"
          >
            <Code2 className="w-16 h-16 md:w-24 md:h-24" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-32 right-10 md:right-32 text-blue-200 opacity-30"
          >
            <UserCheck className="w-14 h-14 md:w-20 md:h-20" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 15, 0], x: [0, 10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 left-1/4 text-blue-200 opacity-25"
          >
            <Handshake className="w-12 h-12 md:w-16 md:h-16" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, -25, 0], x: [0, -10, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-32 right-1/4 text-blue-200 opacity-25"
          >
            <TrendingUp className="w-14 h-14 md:w-18 md:h-18" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 10, 0], x: [0, 15, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 left-10 md:left-40 text-blue-200 opacity-20"
          >
            <Briefcase className="w-10 h-10 md:w-14 md:h-14" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, -15, 0], x: [0, -10, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 right-20 md:right-40 text-blue-200 opacity-20"
          >
            <Lightbulb className="w-12 h-12 md:w-16 md:h-16" />
          </motion.div>
        </motion.div>

        <div className="max-w-4xl mx-auto text-center px-2 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-blue-50 border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">AI-Powered Hiring</span>
            </div>
             <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-[1.15] mb-6 sm:mb-8 uppercase">
              Umurava <br/><span className="sm:mt-2 block sm:inline" style={{ color: BRAND_COLOR }}>{t.africanTalent}</span>
            </h1>
            <div className="flex items-center justify-center gap-8 mb-6 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-px h-8 bg-gradient-to-b from-blue-400 to-transparent" />
                <span>10K+ Jobs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-px h-8 bg-gradient-to-b from-blue-400 to-transparent" />
                <span>5K+ Talent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-px h-8 bg-gradient-to-b from-blue-400 to-transparent" />
                <span>200+ Companies</span>
              </div>
            </div>
            <p className="text-sm sm:text-base text-slate-600 mb-8 sm:mb-10 max-w-xl mx-auto font-medium leading-relaxed">
              {t.welcomeText}
            </p>
            <div className="max-w-xl mx-auto relative group px-4 sm:px-0">
              <input 
                type="text"
                placeholder={t.searchPlaceholder}
                className="w-full pl-5 sm:pl-6 pr-14 sm:pr-16 py-4 sm:py-5 rounded-full sm:rounded-[2rem] bg-white border-2 border-slate-200 shadow-lg sm:shadow-xl shadow-blue-900/10 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-slate-900 placeholder-slate-400 text-sm sm:text-base"
                onChange={(e) => fetchJobs(e.target.value)}
              />
              <button 
                className="absolute right-1.5 sm:right-3 top-1.5 sm:top-3 bottom-1.5 sm:bottom-3 w-10 sm:w-auto aspect-square sm:aspect-auto sm:px-4 rounded-full sm:rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition-all"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
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
      

<main id="jobs" className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 sm:pb-32 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
             <div className="w-1 h-8 sm:h-10 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
             <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-wide">{t.latestJobs}</h2>
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-white bg-blue-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
            {jobs.length} {t.positionsAvailable}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {loading ? (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 sm:py-20">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-600 font-semibold">Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16">
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
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md" style={{ backgroundColor: BRAND_COLOR }}>
                        {job.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 truncate">{job.title}</h3>
                        <p className="text-sm text-slate-500 font-medium">Umurava</p>
                      </div>
                    </div>
                    
                    <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-4">
                      Active
                    </span>

                    <div className="space-y-2 text-sm text-slate-600 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" style={{ color: BRAND_COLOR }} />
                        <span className="truncate">{job.location || 'Remote'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" style={{ color: BRAND_COLOR }} />
                        <span>{job.experience?.level || 'Entry Level'}</span>
                      </div>
                      {job.salary?.min && job.salary?.max && (
                        <div className="flex items-center gap-2">
                          <span className="font-bold" style={{ color: BRAND_COLOR }}>$</span>
                          <span>${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills?.slice(0, 3).map((skill: string) => (
                        <span key={skill} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills?.length > 3 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-medium">
                          +{job.requiredSkills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <Link 
                      href={`/login?apply=${job._id}`}
                      className="px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg hover:brightness-110 transition-all"
                      style={{ backgroundColor: BRAND_COLOR }}
                    >
Apply Now
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
        </div>
      </main>

      <footer className="bg-slate-900 text-white pt-12 sm:pt-16 pb-6 sm:pb-8 px-4 sm:px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12 mb-10 sm:mb-16">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-black shadow-lg" style={{ backgroundColor: BRAND_COLOR }}>U</div>
                <span className="text-lg sm:text-xl font-bold tracking-tight">Umurava <span style={{ color: BRAND_COLOR }}>AI</span></span>
              </div>
              <p className="text-slate-400 max-w-sm text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                Africa&apos;s premier platform for modern recruitment. We connect high-impact talent with high-growth companies.
              </p>
              <div className="flex gap-3 sm:gap-4">
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-blue-500 transition-all duration-300">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-blue-500 transition-all duration-300">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-blue-500 transition-all duration-300">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-blue-500 transition-all duration-300">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-xs sm:text-sm mb-3 sm:mb-4 text-slate-200">{t.platform}</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-400">
                <li><Link href="#" className="hover:text-white transition-all">{t.browseJobsLink}</Link></li>
                <li><Link href="#" className="hover:text-white transition-all">{t.findTalent}</Link></li>
                <li><Link href="#" className="hover:text-white transition-all">{t.challenges}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-xs sm:text-sm mb-3 sm:mb-4 text-slate-200">{t.company}</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-400">
                <li><Link href="#" className="hover:text-white transition-all">{t.aboutUsLink}</Link></li>
                <li><Link href="#" className="hover:text-white transition-all">{t.careers}</Link></li>
                <li><Link href="#" className="hover:text-white transition-all">{t.contact}</Link></li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-semibold text-xs sm:text-sm mb-3 sm:mb-4 text-slate-200">{t.legal}</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-400">
                <li><Link href="#" className="hover:text-white transition-all">{t.privacyPolicy}</Link></li>
                <li><Link href="#" className="hover:text-white transition-all">{t.termsOfService}</Link></li>
                <li><Link href="#" className="hover:text-white transition-all">{t.helpCenter}</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-6 sm:pt-8 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <p className="text-[10px] sm:text-xs text-slate-500">
                  © 2026 Umurava AI. {t.allRightsReserved}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1">
                  {t.madeWith} <span className="text-red-400">❤</span> {t.inRwanda}
                </p>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-slate-500">
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
