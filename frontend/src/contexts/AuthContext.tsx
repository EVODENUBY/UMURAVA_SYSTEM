"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthState, UserRole, ROLES, ROUTES } from '@/lib/types';
import { API_BASE_URL } from '@/lib/constants';

const API_BASE = API_BASE_URL;

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role?: UserRole) => Promise<User>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
}

interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'umurava_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const router = useRouter();

  useEffect(() => {
    const initAuth = () => {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const token = parsed?.token;
          const user = parsed?.user;
          if (token && user && typeof token === 'string' && token.length > 10) {
            setState({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
          localStorage.removeItem(AUTH_STORAGE_KEY);
        } catch {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
      setState(prev => ({ ...prev, isLoading: false }));
    };

    initAuth();
  }, []);

  const getRedirectPath = (role: UserRole): string => {
    switch (role) {
      case ROLES.APPLICANT:
        return ROUTES.APPLICANT.DASHBOARD;
      case ROLES.RECRUITER:
        return ROUTES.RECRUITER.DASHBOARD;
      case ROLES.ADMIN:
        return ROUTES.ADMIN.DASHBOARD;
      default:
        return ROUTES.LANDING;
    }
  };

  const login = async (email: string, password: string, role?: UserRole): Promise<User> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (!data.success) {
        setState(prev => ({ ...prev, isLoading: false }));
        throw new Error(data.message || 'Login failed');
      }
      
      const apiUser = data.data.user as ApiUser;
      const token = data.data.token;
      
      const backendBase = API_BASE_URL.replace(/\/api$/, '');
      const avatarFullUrl = apiUser.avatar ? `${backendBase}${apiUser.avatar}` : undefined;
      
      const user: User = {
        id: apiUser.id,
        email: apiUser.email,
        fullName: `${apiUser.firstName} ${apiUser.lastName}`.trim(),
        role: apiUser.role as UserRole,
        avatar: avatarFullUrl,
      };
      
      const authData = { user, token };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return user;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.fullName.split(' ')[0],
          lastName: data.fullName.split(' ').slice(1).join(' ') || '',
          email: data.email,
          phone: data.phone,
          password: data.password,
          role: data.role || ROLES.APPLICANT,
        }),
      });
      const response = await res.json();
      
      if (!response.success) {
        setState(prev => ({ ...prev, isLoading: false }));
        throw new Error(response.message || 'Registration failed');
      }
      
      // Don't auto-login on registration - user must sign in manually
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    window.location.href = ROUTES.LOGIN;
  };

  const setUser = (user: User | null) => {
    setState(prev => ({ ...prev, user }));
  };

  const refreshUser = async () => {
    if (!state.token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${state.token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        const apiUser = data.data;
        const backendBase = API_BASE_URL.replace(/\/api$/, '');
        const avatarFullUrl = apiUser.avatar ? `${backendBase}${apiUser.avatar}` : undefined;
        const user: User = {
          id: apiUser.id,
          email: apiUser.email,
          fullName: `${apiUser.firstName} ${apiUser.lastName}`.trim(),
          role: apiUser.role as UserRole,
          avatar: avatarFullUrl,
        };
        setState(prev => ({ ...prev, user }));
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token: state.token }));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    setUser,
    refreshUser,
    token: state.token,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}