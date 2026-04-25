"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import {
  Menu,
  Settings,
  LogOut,
  UserCircle,
  ChevronDown,
  Search,
  Users,
  Briefcase,
  BarChart3,
  Bell,
  Wifi,
  WifiOff
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

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface NavbarProps {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
  onMobileMenuClick?: () => void;
  isMobileSidebarOpen?: boolean;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function Navbar({
  onToggleSidebar,
  sidebarCollapsed,
  onMobileMenuClick,
  isMobileSidebarOpen,
  breadcrumbs = [],
  pageTitle,
  pageSubtitle
}: NavbarProps) {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
   const { isConnected, notifications, markNotificationRead } = useWebSocket();
   const [showUserMenu, setShowUserMenu] = useState(false);
   const [showNotifications, setShowNotifications] = useState(false);
   const [showCommandPalette, setShowCommandPalette] = useState(false);
   const [globalSearch, setGlobalSearch] = useState('');
   const [userAvatar, setUserAvatar] = useState<string>('');
   const userMenuRef = useRef<HTMLDivElement>(null);
   const notificationsRef = useRef<HTMLDivElement>(null);
   const searchInputRef = useRef<HTMLInputElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';

  useEffect(() => {
    const fetchProfileAvatar = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data?.basicInfo) {
          const avatar = data.data.basicInfo.avatar || data.data.basicInfo.photo || data.data.basicInfo.profileImage || '';
          if (avatar) setUserAvatar(avatar);
        }
      } catch (err) {
        console.error('Error fetching avatar:', err);
      }
    };
    fetchProfileAvatar();
  }, [token, API_BASE]);

   useEffect(() => {
     const handleClickOutside = (event: MouseEvent) => {
       if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
         setShowUserMenu(false);
       }
       if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
         setShowNotifications(false);
       }
     };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open command palette
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setShowCommandPalette(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }

      // Escape to close command palette
      if (event.key === 'Escape') {
        setShowCommandPalette(false);
        setGlobalSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
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

  const defaultMenuItems = [
    { label: 'Profile', icon: UserCircle, href: '/applicant/profile' },
    { label: 'Settings', icon: Settings, href: '/applicant/settings' },
  ];

  const recruiterMenuItems = [
    { label: 'Dashboard', icon: UserCircle, href: '/recruiter' },
    { label: 'Settings', icon: Settings, href: '/recruiter/settings' },
  ];

  const adminMenuItems = [
    { label: 'Dashboard', icon: UserCircle, href: '/admin' },
    { label: 'Users', icon: Users, href: '/admin/users' },
    { label: 'Jobs', icon: Briefcase, href: '/admin/jobs' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : 
                      user?.role === 'recruiter' ? recruiterMenuItems : defaultMenuItems;

  const toggleSidebars = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      // Implement global search functionality
      showToast(`Searching for: ${globalSearch}`, 'info');
      // Could navigate to search results page or open command palette
      setGlobalSearch('');
    }
  };

  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.read).length;
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markNotificationRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
    setShowNotifications(false);
  };

  const handleMarkAllRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        markNotificationRead(notification.id);
      }
    });
  };

  const quickActions = [
    { label: 'New Job Posting', action: () => router.push('/recruiter/jobs'), icon: Briefcase },
    { label: 'View Candidates', action: () => router.push('/recruiter/applicants'), icon: Users },
    { label: 'Run Screening', action: () => router.push('/recruiter/screening'), icon: BarChart3 },
  ];

  return (
    <>
      {/* Main Navbar */}
      <nav className="h-16 bg-white border-b border-gray-200/80 backdrop-blur-sm bg-white/95 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo & Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebars}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-lg hidden sm:block">Umurava</span>
                </div>
                <div className="hidden md:block w-px h-6 bg-gray-300"></div>
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span className="font-medium">Recruitment Platform</span>
                </div>
              </div>
            </div>

            {/* Center Section - Global Search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleGlobalSearch} className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search candidates, jobs, analytics..."
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    onFocus={() => setShowCommandPalette(true)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-400"
                  />
                </div>
              </form>
            </div>

            {/* Right Section - Status & User Menu */}
            <div className="flex items-center gap-3">
              {/* System Status */}
              <div className="hidden lg:flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <Wifi className="w-4 h-4 text-green-600" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-xs font-medium text-gray-700">
                    {isConnected ? 'Connected' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Notifications Bell */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {getUnreadNotifications() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {getUnreadNotifications() > 99 ? '99+' : getUnreadNotifications()}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-14 w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {getUnreadNotifications() > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        <div className="p-2">
                          {notifications.slice(0, 10).map((notification) => (
                            <button
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`w-full p-3 rounded-lg text-left hover:bg-gray-50 transition-colors border-l-4 ${
                                !notification.read
                                  ? 'border-l-blue-500 bg-blue-50/30'
                                  : 'border-l-transparent'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                  notification.type === 'success' ? 'bg-green-500' :
                                  notification.type === 'warning' ? 'bg-yellow-500' :
                                  notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm truncate">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No notifications</p>
                          <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 10 && (
                      <div className="p-3 border-t border-gray-100 text-center">
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {userAvatar ? (
                    <Image src={userAvatar} alt="Profile" width={32} height={32} className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200" />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm ring-2 ring-gray-200">
                      {getInitials()}
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 leading-tight">{user?.fullName || 'User'}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role || 'User'}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform hidden sm:block ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-14 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 text-sm">{user?.fullName || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-xs text-gray-600 capitalize">{user?.role || 'User'} Account</span>
                      </div>
                    </div>
                    <div className="p-2">
                      {menuItems.map((item) => (
                        <button
                          key={item.href}
                          onClick={() => { router.push(item.href); setShowUserMenu(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                        >
                          <item.icon className="w-4 h-4 text-gray-400" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="p-2 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Command Palette */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-16">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mx-4">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Type a command or search..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-lg border-0 focus:outline-none focus:ring-0 placeholder-gray-400"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <div className="p-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                  Quick Actions
                </div>
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.action();
                      setShowCommandPalette(false);
                      setGlobalSearch('');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <action.icon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">{action.label}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-200 p-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                  Recent Searches
                </div>
                <div className="px-3 py-2 text-sm text-gray-500">
                  No recent searches
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span>↑↓ to navigate</span>
                  <span>↵ to select</span>
                </div>
                <button
                  onClick={() => setShowCommandPalette(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  esc to close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Header with Breadcrumbs */}
      {(breadcrumbs.length > 0 || pageTitle) && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <nav className="flex mb-2" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  {breadcrumbs.map((crumb, index) => (
                    <li key={index} className="flex items-center">
                      {index > 0 && <ChevronDown className="w-4 h-4 text-gray-400 mx-2 rotate-[-90deg]" />}
                      {crumb.href ? (
                        <button
                          onClick={() => router.push(crumb.href!)}
                          className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          {crumb.label}
                        </button>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{crumb.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* Page Title */}
            {pageTitle && (
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
                  {pageSubtitle && (
                    <p className="mt-1 text-sm text-gray-600">{pageSubtitle}</p>
                  )}
                </div>
                {/* Optional: Add page-level actions here */}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}