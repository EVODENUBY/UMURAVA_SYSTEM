"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  links: { href: string; label: string; icon: ReactNode }[];
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ links, collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const router = useRouter();

  const getSettingsHref = () => {
    if (user?.role === 'recruiter' || user?.role === 'admin') {
      return '/recruiter/settings';
    }
    return '/applicant/settings';
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className={`
      fixed left-0 top-0 h-screen bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 text-white flex flex-col shadow-2xl transition-all duration-300 z-40 overflow-hidden
      ${collapsed ? '-translate-x-full' : 'translate-x-0'}
      md:relative md:translate-x-0
      ${collapsed ? 'md:w-20' : 'md:w-64'}
    `}>
      {/* Logo Section */}
      <div className="flex-shrink-0 p-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Image src="/hire me.png" alt="Hire Me" width={24} height={24} className="object-contain filter brightness-0 invert" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="text-lg font-bold tracking-tight whitespace-nowrap">Umurava AI</span>
              <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider whitespace-nowrap">Recruitment</p>
            </div>
          )}
        </Link>
      </div>

      {/* User Info */}
      {!collapsed && user && (
        <div className="flex-shrink-0 p-4 mx-3 mt-4 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-sm font-bold">
              {user.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.fullName}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {!collapsed && (
        <div className="flex-shrink-0 px-5 pt-5 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Menu</p>
        </div>
      )}

      {/* Navigation Links */}
      <nav className={`flex-1 px-2 space-y-0.5 ${collapsed ? 'px-1' : 'px-3'}`}>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center gap-3 py-2.5 rounded-xl font-medium text-sm transition-all
                ${collapsed ? 'justify-center px-2' : 'px-3'}
                ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
                }
              `}
              title={collapsed ? link.label : undefined}
            >
              <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {link.icon}
              </span>
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{link.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions - Only Logout */}
      <div className={`flex-shrink-0 space-y-1 p-2 ${collapsed ? 'px-1' : ''} ${!collapsed ? 'border-t border-white/5' : ''}`}>
        <button 
          onClick={() => router.push(getSettingsHref())}
          className={`
            w-full flex items-center gap-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all
            ${collapsed ? 'justify-center px-2' : 'px-3'}
          `}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="flex-1 text-left text-sm">Settings</span>}
        </button>
        
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all
            ${collapsed ? 'justify-center px-2' : 'px-3'}
          `}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="flex-1 text-left text-sm">Sign Out</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <div className={`flex-shrink-0 p-2 border-t border-white/5 hidden md:flex`}>
        <button
          onClick={onToggle}
          className={`
            w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all
          `}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}