"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { 
  Menu,
  Bell,
  Settings,
  LogOut,
  UserCircle,
  ChevronDown,
  X,
  CheckCheck,
  Trash2,
  Briefcase,
  Zap,
  FileText,
  CheckCircle,
  CircleDot,
  Search
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'job' | 'screening' | 'application' | 'interview' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

interface NavbarProps {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
  onMobileMenuClick?: () => void;
  isMobileSidebarOpen?: boolean;
}

export default function Navbar({ onToggleSidebar, sidebarCollapsed, onMobileMenuClick, isMobileSidebarOpen }: NavbarProps) {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserNames = () => {
    if (!user?.fullName) return { firstName: 'User', lastName: '' };
    const parts = user.fullName.trim().split(' ');
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
  };

  const getInitials = () => {
    const { firstName, lastName } = getUserNames();
    if (lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    return firstName.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem('umurava_auth');
    logout();
    showToast('Logged out successfully', 'info');
    window.location.href = '/login';
  };

  const menuItems = [
    { label: 'Profile', icon: UserCircle, href: '/applicant/profile' },
    { label: 'Settings', icon: Settings, href: '/applicant/settings' },
  ];

  const toggleSidebars = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  return (
    <nav className="h-14 bg-white border-b border-slate-200/80 flex items-center justify-between px-3 sm:px-4 sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-3">
        <button 
          onClick={toggleSidebars}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        
        <div className="flex items-center gap-2">
          <Image src="/hire me.png" alt="Hire Me" width={32} height={32} className="object-contain" />
          <span className="font-bold text-slate-800 text-sm hidden md:block">Umurava</span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <div className="relative hidden md:block" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-slate-500" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                <button onClick={() => setShowNotifications(false)}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                      <p className="text-sm font-medium text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-500">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs">
              {getInitials()}
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform hidden sm:block ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-3 border-b border-slate-100">
                <p className="font-semibold text-slate-900 text-sm">{user?.fullName || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <div className="p-1.5">
                {menuItems.map((item) => (
                  <button 
                    key={item.href}
                    onClick={() => { router.push(item.href); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-sm"
                  >
                    <item.icon className="w-4 h-4 text-slate-400" />
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="p-1.5 border-t border-slate-100">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}