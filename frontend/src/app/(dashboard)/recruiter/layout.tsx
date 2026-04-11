"use client";

import { useState, useEffect } from 'react';
import { ReactNode } from 'react';
import { FaHome, FaBriefcase, FaUsers, FaRobot, FaChartBar, FaCog, FaPlus } from 'react-icons/fa';
import Sidebar from '@/components/ui/Sidebar';
import Navbar from '@/components/ui/Navbar';
import ProtectedRoute from '@/components/ui/ProtectedRoute';
import { ROLES } from '@/lib/types';

const recruiterLinks = [
  { href: '/recruiter', label: 'Dashboard', icon: <FaHome /> },
  { href: '/recruiter/jobs', label: 'Jobs', icon: <FaBriefcase /> },
  { href: '/recruiter/jobs/create', label: 'Post Job', icon: <FaPlus /> },
  { href: '/recruiter/applicants', label: 'Applicants', icon: <FaUsers /> },
  { href: '/recruiter/screening', label: 'Screening', icon: <FaRobot /> },
  { href: '/recruiter/results', label: 'Results', icon: <FaChartBar /> },
  { href: '/recruiter/settings', label: 'Settings', icon: <FaCog /> },
];

export default function RecruiterLayout({ children }: { children: ReactNode }) {
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
    <ProtectedRoute allowedRoles={[ROLES.RECRUITER]}>
      <div className="m-0 p-0 min-h-screen bg-slate-50">
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
          m-0 p-0 md:transition-all md:duration-300 md:ease-in-out
          ${sidebarCollapsed && !isMobile ? 'md:left-16' : 'md:left-64'}
          ${mobileSidebarOpen && isMobile ? 'left-64' : 'left-0'}
          ml-5
        `}>
          <Navbar 
            onToggleSidebar={toggleSidebar}
            sidebarCollapsed={isMobile ? !mobileSidebarOpen : sidebarCollapsed}
            onMobileMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            isMobileSidebarOpen={mobileSidebarOpen}
          />
          <main className="h-[calc(100vh-57px)] overflow-y-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
