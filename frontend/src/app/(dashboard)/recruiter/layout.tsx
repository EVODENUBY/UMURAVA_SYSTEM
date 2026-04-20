"use client";

import { useState, useEffect, ReactNode, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaHome, FaBriefcase, FaUsers, FaFileAlt, FaChartLine, FaComments, FaCog, FaChartBar } from 'react-icons/fa';
import Sidebar from '@/components/ui/Sidebar';
import Navbar from '@/components/ui/Navbar';
import ProtectedRoute from '@/components/ui/ProtectedRoute';
import { ROLES } from '@/lib/types';

const recruiterLinks = [
  { href: '/recruiter', label: 'Dashboard', icon: <FaHome /> },
  { href: '/recruiter/jobs', label: 'Jobs', icon: <FaBriefcase /> },
  { href: '/recruiter/applicants', label: 'Applicants', icon: <FaUsers /> },
  { href: '/recruiter/screening', label: 'Screening', icon: <FaFileAlt /> },
  { href: '/recruiter/analytics', label: 'Analytics', icon: <FaChartBar /> },
  { href: '/recruiter/shortlist', label: 'Shortlist', icon: <FaChartLine /> },
  { href: '/recruiter/chat', label: 'AI Chat', icon: <FaComments /> },
];

function RecruiterLayoutInner({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
    <ProtectedRoute allowedRoles={[ROLES.RECRUITER, ROLES.ADMIN]}>
      <div className="m-0 p-0 h-screen bg-slate-50 overflow-hidden">
        <Sidebar 
          links={recruiterLinks} 
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
        `} style={{ width: isMobile ? '100%' : (sidebarCollapsed ? 'calc(100% - 4rem)' : 'calc(100% - 16rem)') }}>
          <Navbar 
            onToggleSidebar={toggleSidebar}
            sidebarCollapsed={isMobile ? !mobileSidebarOpen : sidebarCollapsed}
            onMobileMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            isMobileSidebarOpen={mobileSidebarOpen}
          />
          <main className="h-[calc(100vh-57px)] overflow-y-auto overflow-x-hidden">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function RecruiterLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <RecruiterLayoutInner>{children}</RecruiterLayoutInner>
    </Suspense>
  );
}