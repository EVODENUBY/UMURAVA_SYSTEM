"use client";

import { useState, useEffect, ReactNode, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaHome, FaBriefcase, FaFileAlt, FaCog, FaUser, FaArrowRight, FaTimes, FaLightbulb } from 'react-icons/fa';
import Sidebar from '@/components/ui/Sidebar';
import Navbar from '@/components/ui/Navbar';
import ProtectedRoute from '@/components/ui/ProtectedRoute';
import { ROLES } from '@/lib/types';
import JobDetailPopup from '@/components/JobDetailPopup';
import { Sparkles } from 'lucide-react';

interface Job {
  _id: string;
  title: string;
  location?: string;
  createdAt?: string;
  experience?: { level: string };
  salary?: { min: number; max: number; currency: string };
  requiredSkills?: string[];
  description?: string;
  company?: string;
  employmentType?: string;
}

const applicantLinks = [
  { href: '/applicant', label: 'Dashboard', icon: <FaHome /> },
  { href: '/applicant/jobs', label: 'Find Jobs', icon: <FaBriefcase /> },
  { href: '/applicant/applications', label: 'Applications', icon: <FaFileAlt /> },
  { href: '/applicant/profile', label: 'Profile', icon: <FaUser /> },

  { href: '/applicant/recommendations', label: 'AI Recommendations', icon:<Sparkles className="w-5 h-5"/>},
];

function ApplicantLayoutInner({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showApplyPopup, setShowApplyPopup] = useState(false);

  useEffect(() => {
    const applyJobId = searchParams.get('apply');
    if (applyJobId) {
      router.replace(`/applicant/jobs/${applyJobId}`);
    }
  }, [searchParams, router]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
        setMobileSidebarOpen(false);
      } else {
        setSidebarCollapsed(false);
        setMobileSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.APPLICANT]}>
      <div className="m-0 p-0 min-h-screen bg-slate-50">
        <Sidebar 
          links={applicantLinks} 
          collapsed={isMobile ? !mobileSidebarOpen : sidebarCollapsed}
          onToggle={() => {
            if (isMobile) {
              setMobileSidebarOpen(!mobileSidebarOpen);
            } else {
              setSidebarCollapsed(!sidebarCollapsed);
            }
          }}
        />

        {isMobile && mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <div className={`
          fixed top-0 right-0 bottom-0
          m-0 p-0 transition-all duration-300 ease-in-out
          ${isMobile 
            ? (mobileSidebarOpen ? 'left-64' : 'left-0')
            : (sidebarCollapsed ? 'left-16' : 'left-64')
          }
        `}>
          <Navbar 
            onToggleSidebar={toggleSidebar}
            sidebarCollapsed={isMobile ? !mobileSidebarOpen : sidebarCollapsed}
            onMobileMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            isMobileSidebarOpen={mobileSidebarOpen}
          />
          <main className="h-[calc(100vh-57px)] overflow-y-auto">{children}</main>
        </div>

        {showApplyPopup && selectedJobId && (
          <JobDetailPopup 
            job={{ _id: selectedJobId, title: '', location: {}, experience: '', requiredSkills: [] }}
            isOpen={showApplyPopup}
            onClose={() => { setShowApplyPopup(false); setSelectedJobId(null); }}
            onApply={() => { setShowApplyPopup(false); router.push(`/applicant/jobs/${selectedJobId}`); }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

export default function ApplicantLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ApplicantLayoutInner>{children}</ApplicantLayoutInner>
    </Suspense>
  );
}
