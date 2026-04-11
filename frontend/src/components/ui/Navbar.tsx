"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Menu, 
  Bell, 
  Search, 
  Loader2, 
  User, 
  Settings, 
  LogOut, 
  Briefcase, 
  Bot, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Home,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  MapPin,
  DollarSign,
  Building2,
  Globe,
  Users,
  FileText,
  Plus,
  TrendingUp,
  Zap
} from 'lucide-react';

const BRAND_COLOR = "#2b71f0";

interface Notification {
  id: string;
  type: 'job' | 'screening' | 'application' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: JSX.Element;
}

const mockNotifications: Notification[] = [
  { id: '1', type: 'job', title: 'New Job Posted', message: 'Senior Frontend Developer role just posted by TechCorp Rwanda', time: '2 hours ago', read: false, icon: <Briefcase className="w-5 h-5 text-blue-500" /> },
  { id: '2', type: 'screening', title: 'Screening Complete', message: 'Your application for UI/UX Designer has been screened', time: '4 hours ago', read: false, icon: <Sparkles className="w-5 h-5 text-purple-500" /> },
  { id: '3', type: 'application', title: 'Interview Scheduled', message: 'Interview scheduled for Senior Frontend Developer position', time: '1 day ago', read: true, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> },
  { id: '4', type: 'job', title: 'Job Match Found', message: '3 new jobs match your profile skills', time: '1 day ago', read: true, icon: <Briefcase className="w-5 h-5 text-blue-500" /> },
  { id: '5', type: 'screening', title: 'Application Screened', message: 'Your Backend Engineer application has been reviewed', time: '2 days ago', read: true, icon: <Sparkles className="w-5 h-5 text-purple-500" /> },
];

interface NavbarProps {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
  onMobileMenuClick?: () => void;
  isMobileSidebarOpen?: boolean;
}

export default function Navbar({ onToggleSidebar, sidebarCollapsed, onMobileMenuClick, isMobileSidebarOpen }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job': return 'bg-blue-50 border-blue-100';
      case 'screening': return 'bg-purple-50 border-purple-100';
      case 'application': return 'bg-emerald-50 border-emerald-100';
      default: return 'bg-slate-50 border-slate-100';
    }
  };

  return (
    <nav className="top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 py-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button 
            onClick={onMobileMenuClick}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors md:hidden"
            title={isMobileSidebarOpen ? 'Close Menu' : 'Open Menu'}
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={onToggleSidebar}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors hidden md:block"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>
          
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-full px-3 py-2 w-48 lg:w-64">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {isLoading && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
              <div className="w-4 h-4 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
              <span className="text-xs font-bold text-blue-600 hidden sm:inline">Loading...</span>
            </div>
          )}

          <div className="relative">
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
              className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                  <div className="p-3 sm:p-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm sm:text-base text-slate-900">Notifications</h3>
                          <p className="text-[10px] sm:text-xs text-slate-500">{unreadCount} unread</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllAsRead}
                            className="text-[10px] sm:text-xs font-bold text-blue-500 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                        <button 
                          onClick={() => setShowNotifications(false)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg"
                        >
                          <X className="text-slate-400 w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 sm:p-8 text-center">
                        <Bell className="w-12 h-12 sm:w-16 sm:h-16 text-slate-200 mx-auto mb-2 sm:mb-3" />
                        <p className="text-slate-500 font-medium text-sm">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={`p-3 sm:p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''} ${getTypeColor(notification.type)}`}
                        >
                          <div className="flex gap-2 sm:gap-3">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!notification.read ? 'bg-white shadow-sm' : 'bg-white/50'}`}>
                              {notification.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={`font-bold text-xs sm:text-sm ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 line-clamp-2">{notification.message}</p>
                              <p className="text-[9px] sm:text-[10px] text-slate-400 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 sm:p-3 border-t border-slate-100 bg-slate-50">
                    <button className="w-full py-2 text-center text-xs sm:text-sm font-bold text-blue-500 hover:underline">
                      View All Notifications
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button 
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
              className="flex items-center gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/25 text-sm sm:text-base">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="hidden lg:flex items-center gap-1">
                <span className="text-sm font-bold text-slate-900 max-w-24 truncate">{user?.fullName?.split(' ')[0] || 'User'}</span>
                {showUserMenu ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25">
                        {user?.fullName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{user?.fullName || 'User'}</h3>
                        <p className="text-sm text-slate-500">{user?.email || 'user@email.com'}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-bold rounded-full capitalize">
                          {user?.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button 
                      onClick={() => { router.push('/applicant/profile'); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-500">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-sm">My Profile</p>
                        <p className="text-xs text-slate-400">View and edit profile</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => { router.push('/applicant/settings'); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-sm">Settings</p>
                        <p className="text-xs text-slate-400">Account preferences</p>
                      </div>
                    </button>
                  </div>

                  <div className="p-2 border-t border-slate-100">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-500">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-sm">Sign Out</p>
                        <p className="text-xs text-red-400">Log out of your account</p>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mt-3 pt-3 border-t border-slate-100 md:hidden">
          <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-2 mb-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => { router.push('/applicant'); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium"
            >
              <Home className="w-4 h-4" /> Dashboard
            </button>
            <button 
              onClick={() => { router.push('/applicant/profile'); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium"
            >
              <User className="w-4 h-4" /> Profile
            </button>
            <button 
              onClick={() => { router.push('/applicant/settings'); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium"
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
