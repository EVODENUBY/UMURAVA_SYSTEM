"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, SlidersHorizontal, MapPin, Briefcase, ChevronDown, Building2, Clock, ArrowRight, Globe, ChevronRight, X, Filter } from 'lucide-react';
import JobCard from '@/components/JobCard';
import JobDetailPopup from '@/components/JobDetailPopup';

interface Job {
  _id: string;
  title: string;
  location: string;
  experience: { level: string };
  salary: { min: number; max: number; currency: string };
  requiredSkills: string[];
  createdAt: string;
  description: string;
  company: string;
  employmentType: string;
}

const mockJobs: Job[] = [
  {
    _id: '1',
    title: 'Senior Frontend Developer',
    location: 'Kigali, Rwanda',
    experience: { level: 'Senior' },
    salary: { min: 200000, max: 350000, currency: 'RWF' },
    requiredSkills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Node.js'],
    createdAt: new Date().toISOString(),
    description: 'Join our team to build cutting-edge web applications using modern technologies.',
    company: 'TechCorp Rwanda',
    employmentType: 'Full-time'
  },
  {
    _id: '2',
    title: 'Backend Engineer',
    location: 'Remote',
    experience: { level: 'Mid-Level' },
    salary: { min: 180000, max: 280000, currency: 'RWF' },
    requiredSkills: ['Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    description: 'We need a skilled backend engineer to build scalable APIs and microservices.',
    company: 'StartupHub Africa',
    employmentType: 'Full-time'
  },
  {
    _id: '3',
    title: 'UI/UX Designer',
    location: 'Nairobi, Kenya',
    experience: { level: 'Mid-Level' },
    salary: { min: 150000, max: 250000, currency: 'USD' },
    requiredSkills: ['Figma', 'Adobe XD', 'UI Design', 'User Research', 'Prototyping'],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    description: 'Design beautiful and intuitive user interfaces for our mobile and web applications.',
    company: 'DesignStudio',
    employmentType: 'Contract'
  },
  {
    _id: '4',
    title: 'Product Manager',
    location: 'Kigali, Rwanda',
    experience: { level: 'Senior' },
    salary: { min: 250000, max: 400000, currency: 'RWF' },
    requiredSkills: ['Product Strategy', 'Agile', 'Analytics', 'Leadership', 'Communication'],
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    description: 'Lead product development from ideation to launch. Work with cross-functional teams.',
    company: 'Innovation Labs',
    employmentType: 'Full-time'
  },
  {
    _id: '5',
    title: 'Data Scientist',
    location: 'Lagos, Nigeria',
    experience: { level: 'Senior' },
    salary: { min: 300000, max: 500000, currency: 'USD' },
    requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics'],
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    description: 'Apply machine learning and statistical analysis to solve complex business problems.',
    company: 'DataMind AI',
    employmentType: 'Full-time'
  },
  {
    _id: '6',
    title: 'DevOps Engineer',
    location: 'Remote',
    experience: { level: 'Mid-Level' },
    salary: { min: 200000, max: 320000, currency: 'USD' },
    requiredSkills: ['Kubernetes', 'Docker', 'CI/CD', 'AWS', 'Terraform'],
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    description: 'Build and maintain our cloud infrastructure and deployment pipelines.',
    company: 'CloudScale',
    employmentType: 'Full-time'
  },
  {
    _id: '7',
    title: 'Marketing Manager',
    location: 'Kigali, Rwanda',
    experience: { level: 'Senior' },
    salary: { min: 180000, max: 300000, currency: 'RWF' },
    requiredSkills: ['Digital Marketing', 'SEO', 'Analytics', 'Content Strategy'],
    createdAt: new Date(Date.now() - 500000000).toISOString(),
    description: 'Lead marketing initiatives and grow brand presence across Africa.',
    company: 'GrowthAfrica',
    employmentType: 'Full-time'
  },
  {
    _id: '8',
    title: 'Sales Representative',
    location: 'Nairobi, Kenya',
    experience: { level: 'Entry-Level' },
    salary: { min: 80000, max: 150000, currency: 'USD' },
    requiredSkills: ['Sales', 'Communication', 'Negotiation', 'CRM'],
    createdAt: new Date(Date.now() - 600000000).toISOString(),
    description: 'Drive sales growth and build relationships with clients.',
    company: 'SalesPro Kenya',
    employmentType: 'Full-time'
  },
];

const categories = [
  { id: 'all', label: 'All Categories' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'design', label: 'Design' },
  { id: 'product', label: 'Product' },
  { id: 'data', label: 'Data & Analytics' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'sales', label: 'Sales' },
];

const locations = [
  { id: 'all', label: 'All Locations' },
  { id: 'kigali', label: 'Kigali, Rwanda' },
  { id: 'nairobi', label: 'Nairobi, Kenya' },
  { id: 'lagos', label: 'Lagos, Nigeria' },
  { id: 'remote', label: 'Remote' },
];

const jobTypes = [
  { id: 'all', label: 'All Types' },
  { id: 'full-time', label: 'Full-time' },
  { id: 'part-time', label: 'Part-time' },
  { id: 'contract', label: 'Contract' },
  { id: 'internship', label: 'Internship' },
];

const experienceLevels = [
  { id: 'all', label: 'All Levels' },
  { id: 'entry', label: 'Entry Level' },
  { id: 'mid', label: 'Mid Level' },
  { id: 'senior', label: 'Senior' },
  { id: 'lead', label: 'Lead / Manager' },
];

const sortOptions = [
  { id: 'recent', label: 'Most Recent' },
  { id: 'salary_high', label: 'Highest Salary' },
  { id: 'salary_low', label: 'Lowest Salary' },
];

export default function PublicJobsPage() {
  const [allJobs, setAllJobs] = useState<Job[]>(mockJobs);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(mockJobs);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('all');
  const [jobType, setJobType] = useState('all');
  const [experience, setExperience] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchJobs = async () => {
      try {
        const params = new URLSearchParams();
        params.append('page', '1');
        params.append('limit', '50');
        if (search) params.append('search', search);
        if (searchLocation) params.append('location', searchLocation);
        
        const res = await fetch(`https://recruiter-ai-platform.onrender.com/api/jobs?${params.toString()}`);
        const result = await res.json();
        if (result.success && result.data?.jobs?.length > 0) {
          setAllJobs(result.data.jobs);
        } else {
          setAllJobs(mockJobs);
        }
      } catch (error) {
        console.log('Using mock data');
        setAllJobs(mockJobs);
      } finally {
        setLoading(false);
      }
    };
    
    const timer = setTimeout(fetchJobs, 500);
    return () => clearTimeout(timer);
  }, [search, searchLocation]);

  const activeFilters = useMemo(() => {
    const filters = [];
    if (category !== 'all') filters.push({ key: 'category', value: category });
    if (location !== 'all') filters.push({ key: 'location', value: location });
    if (jobType !== 'all') filters.push({ key: 'jobType', value: jobType });
    if (experience !== 'all') filters.push({ key: 'experience', value: experience });
    return filters;
  }, [category, location, jobType, experience]);

  useEffect(() => {
    let result = [...allJobs];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.requiredSkills.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }

    if (category !== 'all') {
      result = result.filter(job => {
        const titleLower = job.title.toLowerCase();
        const skillsLower = job.requiredSkills.map(s => s.toLowerCase()).join(' ');
        if (category === 'engineering') {
          return titleLower.includes('engineer') || titleLower.includes('developer') || titleLower.includes('devops');
        }
        if (category === 'design') {
          return titleLower.includes('designer') || titleLower.includes('design') || skillsLower.includes('figma');
        }
        if (category === 'product') {
          return titleLower.includes('product') || titleLower.includes('manager');
        }
        if (category === 'data') {
          return titleLower.includes('data') || titleLower.includes('scientist') || skillsLower.includes('machine learning');
        }
        if (category === 'marketing') {
          return titleLower.includes('marketing') || titleLower.includes('growth');
        }
        if (category === 'sales') {
          return titleLower.includes('sales') || titleLower.includes('representative');
        }
        return true;
      });
    }

    if (location !== 'all') {
      result = result.filter(job => {
        const locationLower = job.location.toLowerCase();
        if (location === 'kigali') return locationLower.includes('kigali');
        if (location === 'nairobi') return locationLower.includes('nairobi');
        if (location === 'lagos') return locationLower.includes('lagos');
        if (location === 'remote') return locationLower.includes('remote');
        return true;
      });
    }

    if (jobType !== 'all') {
      result = result.filter(job => 
        job.employmentType.toLowerCase().replace('-', ' ').includes(jobType.replace('-', ' '))
      );
    }

    if (experience !== 'all') {
      result = result.filter(job => {
        const levelLower = job.experience.level.toLowerCase();
        if (experience === 'entry') return levelLower.includes('entry') || levelLower.includes('junior');
        if (experience === 'mid') return levelLower.includes('mid') || levelLower.includes('intermediate');
        if (experience === 'senior') return levelLower.includes('senior');
        if (experience === 'lead') return levelLower.includes('lead') || levelLower.includes('manager');
        return true;
      });
    }

    if (sortBy === 'salary_high') {
      result.sort((a, b) => b.salary.max - a.salary.max);
    } else if (sortBy === 'salary_low') {
      result.sort((a, b) => a.salary.min - b.salary.min);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setFilteredJobs(result);
  }, [allJobs, search, category, location, jobType, experience, sortBy]);

  const clearAllFilters = () => {
    setCategory('all');
    setLocation('all');
    setJobType('all');
    setExperience('all');
    setSearch('');
    setSearchLocation('');
  };

  const removeFilter = (key: string) => {
    if (key === 'category') setCategory('all');
    if (key === 'location') setLocation('all');
    if (key === 'jobType') setJobType('all');
    if (key === 'experience') setExperience('all');
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(false);
    setApplyModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center font-black text-white">U</div>
              <span className="text-lg font-black uppercase tracking-tight">Umurava AI</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/jobs" className="font-bold text-sm uppercase tracking-wider text-blue-500">Jobs</Link>
              <Link href="#" className="font-bold text-sm uppercase tracking-wider text-slate-500 hover:text-slate-700">Companies</Link>
              <Link href="#" className="font-bold text-sm uppercase tracking-wider text-slate-500 hover:text-slate-700">Resources</Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/login" className="px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="px-6 py-3 rounded-xl text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all" style={{ backgroundColor: '#2b71f0' }}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-6">
              Find Your Dream Job in Africa
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Discover opportunities at top companies across the continent. AI-powered matching helps you find the perfect role.
            </p>
            
            <div className="bg-white rounded-2xl p-2 shadow-2xl">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Job title, keywords, or company..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-slate-900 outline-none"
                  />
                </div>
                <div className="relative flex-1 sm:border-l sm:border-slate-200 sm:pl-2">
                  <MapPin className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Location..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full pl-12 sm:pl-12 pr-4 py-4 rounded-xl text-slate-900 outline-none"
                  />
                </div>
                <button 
                  className="px-8 py-4 rounded-xl text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all"
                  style={{ backgroundColor: '#2b71f0' }}
                >
                  Search Jobs
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-8 text-sm text-blue-100">
              <span>Popular:</span>
              {['Frontend Developer', 'Data Scientist', 'Product Manager', 'UI Designer'].map((tag) => (
                <button 
                  key={tag} 
                  onClick={() => setSearch(tag)}
                  className="hover:text-white underline"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <Card className="p-6">
                <h3 className="text-sm font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filters
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Category</label>
                    <div className="space-y-1">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setCategory(cat.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${category === cat.id ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Location</label>
                    <select 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>{loc.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Job Type</label>
                    <select 
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                    >
                      {jobTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Experience</label>
                    <select 
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                    >
                      {experienceLevels.map((level) => (
                        <option key={level.id} value={level.id}>{level.label}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    onClick={clearAllFilters}
                    className="w-full py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <h3 className="text-lg font-black mb-2">Recruiter?</h3>
                <p className="text-sm text-blue-100 mb-4">Post jobs and find top talent with AI-powered screening.</p>
                <Link href="/register?role=recruiter" className="block w-full py-3 rounded-xl bg-white text-blue-600 font-bold text-sm uppercase text-center hover:bg-blue-50 transition-colors">
                  Post a Job
                </Link>
              </Card>
            </div>
          </aside>

          <main className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">{filteredJobs.length} Jobs Found</h2>
                <p className="text-sm text-slate-500">
                  {activeFilters.length > 0 ? `${activeFilters.length} filter${activeFilters.length > 1 ? 's' : ''} active` : 'All jobs'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium flex items-center gap-2 bg-white"
                >
                  <Filter className="w-4 h-4" /> Filters
                </button>
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-500">Active filters:</span>
                {activeFilters.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => removeFilter(filter.key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    {filter.value}
                    <X className="w-3 h-3" />
                  </button>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-slate-500 hover:text-slate-700 underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredJobs.map((job) => (
                  <JobCard key={job._id} job={job} onViewDetails={handleViewDetails} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">No jobs found</h3>
                <p className="text-slate-500 mb-4">Try adjusting your filters or search terms</p>
                <button 
                  onClick={clearAllFilters}
                  className="px-6 py-2 rounded-xl text-white text-sm font-bold"
                  style={{ backgroundColor: '#2b71f0' }}
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {filteredJobs.length > 0 && (
              <div className="flex justify-center pt-8">
                <button className="flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-slate-200 font-bold text-sm uppercase tracking-wider hover:bg-slate-50 transition-colors">
                  Load More Jobs <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </section>

      <JobDetailPopup 
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={closeModal}
        onApply={() => selectedJob && handleApply(selectedJob)}
      />

      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center font-black">U</div>
                <span className="text-lg font-black uppercase tracking-tight">Umurava AI</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                AI-powered recruitment platform connecting top talent with leading companies across Africa.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4">For Candidates</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Companies</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Salary Guide</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Career Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4">For Recruiters</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/register?role=recruiter" className="hover:text-white transition-colors">Post a Job</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">AI Screening</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400 text-sm">
            2024 Umurava AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
