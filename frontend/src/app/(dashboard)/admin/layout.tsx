"use client";

import { useState, useEffect } from 'react';
import { ReactNode } from 'react';
import { FaHome, FaUsers, FaBriefcase, FaChartBar, FaCog, FaShieldAlt, FaArrowRight, FaArrowLeft, FaSignOutAlt } from 'react-icons/fa';
import Navbar from '@/components/ui/Navbar';
import ProtectedRoute from '@/components/ui/ProtectedRoute';
import { ROLES } from '@/lib/types';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: <FaHome /> },
  { href: '/admin/users', label: 'Users', icon: <FaUsers /> },
  { href: '/admin/jobs', label: 'Jobs', icon: <FaBriefcase /> },
  { href: '/admin/analytics', label: 'Analytics', icon: <FaChartBar /> },
  { href: '/admin/settings', label: 'Settings', icon: <FaCog /> },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
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
    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
      <div className="m-0 p-0 min-h-screen bg-slate-50">
        <aside className={`
          fixed left-0 top-0 h-screen bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 text-white flex flex-col shadow-2xl transition-all duration-300 z-40 overflow-hidden
          ${isMobile ? (mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full') : (sidebarCollapsed ? 'md:w-16 md:-translate-x-0 -translate-x-full' : 'md:w-64 translate-x-0')}
        `}>
          <div className="flex-shrink-0 p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shadow-lg flex-shrink-0">
                <FaShieldAlt />
              </div>
              <div className={`overflow-hidden transition-all duration-300 ${isMobile ? (mobileSidebarOpen ? 'w-auto' : 'w-0') : (sidebarCollapsed ? 'w-0 md:opacity-0' : 'w-auto md:opacity-100 opacity-100')}`}>
                <span className="text-lg font-black uppercase tracking-tight whitespace-nowrap">Umurava AI</span>
                <p className="text-[9px] text-red-200 font-bold uppercase tracking-widest whitespace-nowrap">Admin Panel</p>
              </div>
            </div>
          </div>

          <div className={`flex-shrink-0 p-3 ${isMobile ? (mobileSidebarOpen ? '' : 'hidden') : (sidebarCollapsed ? 'md:hidden' : '')}`}>
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-1">Menu</p>
          </div>

          <nav className={`flex-1 px-3 space-y-1 ${isMobile ? (mobileSidebarOpen ? '' : 'hidden') : (sidebarCollapsed ? 'md:px-1' : '')}`}>
            {adminLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all ${isMobile ? (mobileSidebarOpen ? '' : 'hidden') : (sidebarCollapsed ? 'md:justify-center md:px-2' : '')}`}
              >
                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  {link.icon}
                </span>
                <span className={`flex-1 ${isMobile ? (mobileSidebarOpen ? '' : 'hidden') : (sidebarCollapsed ? 'md:hidden' : '')}`}>{link.label}</span>
              </a>
            ))}
          </nav>

          <div className={`flex-shrink-0 p-3 border-t border-white/10 ${isMobile ? (mobileSidebarOpen ? '' : 'hidden') : (sidebarCollapsed ? 'md:hidden' : '')}`}>
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-1">Account</p>
          </div>

          <div className={`flex-shrink-0 px-2 pb-2 space-y-1 ${isMobile ? (mobileSidebarOpen ? '' : 'hidden') : (sidebarCollapsed ? 'md:hidden' : '')}`}>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-300 hover:text-red-400 hover:bg-red-500/20 transition-all"
            >
              <span className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <FaSignOutAlt className="w-4 h-4" />
              </span>
              <span className="flex-1 text-left">Sign Out</span>
            </button>
          </div>

          <div className={`flex-shrink-0 p-2 border-t border-white/10 hidden md:block`}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              {sidebarCollapsed ? <FaArrowRight /> : <FaArrowLeft />}
            </button>
          </div>
        </aside>

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
