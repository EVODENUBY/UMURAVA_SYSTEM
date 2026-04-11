"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  LayoutDashboard,
  Briefcase,
  Users,
  BarChart3,
  Shield,
  FileText,
  Plus
} from 'lucide-react';

const BRAND_COLOR = "#2b71f0";

interface SidebarProps {
  links: { href: string; label: string; icon: ReactNode }[];
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ links, collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className={`
      fixed left-0 top-0 h-screen bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 text-white flex flex-col shadow-2xl transition-all duration-300 z-40 overflow-hidden
      ${collapsed ? '-translate-x-full' : 'translate-x-0'}
      md:relative md:translate-x-0
      ${collapsed ? 'md:w-16' : 'md:w-64'}
    `}>
      <div className="flex-shrink-0 p-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-lg shadow-lg flex-shrink-0">
            U
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="text-lg font-black uppercase tracking-tight whitespace-nowrap">Umurava AI</span>
              <p className="text-[9px] text-blue-200 font-bold uppercase tracking-widest whitespace-nowrap">Recruitment Platform</p>
            </div>
          )}
        </Link>
      </div>

      {!collapsed && (
        <div className="flex-shrink-0 p-3">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-1">Menu</p>
        </div>
      )}

      <nav className={`flex-1 px-2 space-y-1 ${collapsed ? 'px-1' : 'px-3'}`}>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center gap-3 py-3 rounded-xl font-bold text-sm transition-all
                ${collapsed ? 'justify-center px-2' : 'px-3'}
                ${isActive
                  ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/25'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                }
              `}
              title={collapsed ? link.label : undefined}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isActive ? 'bg-blue-100 text-blue-600' : 'bg-white/10'
              }`}>
                {link.icon}
              </span>
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{link.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="flex-shrink-0 p-3 border-t border-white/10">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-1">Account</p>
        </div>
      )}

      <div className={`flex-shrink-0 space-y-1 p-2 ${collapsed ? 'px-1' : ''} ${!collapsed ? 'border-t border-white/10' : ''}`}>
        <button 
          onClick={() => router.push('/applicant/profile')}
          className={`
            w-full flex items-center gap-3 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all
            ${collapsed ? 'justify-center px-2' : 'px-3'}
          `}
          title={collapsed ? 'My Profile' : undefined}
        >
          <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4" />
          </span>
          {!collapsed && <span className="flex-1 text-left truncate">My Profile</span>}
        </button>
        
        <button 
          onClick={() => router.push('/applicant/settings')}
          className={`
            w-full flex items-center gap-3 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all
            ${collapsed ? 'justify-center px-2' : 'px-3'}
          `}
          title={collapsed ? 'Settings' : undefined}
        >
          <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <Settings className="w-4 h-4" />
          </span>
          {!collapsed && <span className="flex-1 text-left truncate">Settings</span>}
        </button>
        
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 py-3 rounded-xl text-red-300 hover:text-red-400 hover:bg-red-500/20 transition-all
            ${collapsed ? 'justify-center px-2' : 'px-3'}
          `}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <span className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <LogOut className="w-4 h-4" />
          </span>
          {!collapsed && <span className="flex-1 text-left truncate">Sign Out</span>}
        </button>
      </div>

      <div className={`flex-shrink-0 p-2 border-t border-white/10 hidden md:block`}>
        <button
          onClick={onToggle}
          className={`
            w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all
          `}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}
