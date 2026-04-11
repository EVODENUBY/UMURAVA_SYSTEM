"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthState, UserRole, ROLES, ROUTES } from '@/lib/types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
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
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const { user, token } = JSON.parse(stored);
        setState({
          user,
          token,
          isAuthenticated: !!user && !!token,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
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

  const login = async (email: string, password: string, role?: UserRole) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    const determinedRole = role || ROLES.APPLICANT;
    const mockUser: User = {
      id: `user_${Date.now()}`,
      email,
      fullName: email.split('@')[0],
      role: determinedRole,
    };
    const mockToken = `token_${Date.now()}_${determinedRole}`;

    const authData = { user: mockUser, token: mockToken };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

    setState({
      user: mockUser,
      token: mockToken,
      isAuthenticated: true,
      isLoading: false,
    });

    router.push(getRedirectPath(determinedRole));
  };

  const register = async (data: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    const role = data.role || ROLES.APPLICANT;
    const mockUser: User = {
      id: `user_${Date.now()}`,
      email: data.email,
      fullName: data.fullName,
      role,
    };
    const mockToken = `token_${Date.now()}_${role}`;

    const authData = { user: mockUser, token: mockToken };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

    setState({
      user: mockUser,
      token: mockToken,
      isAuthenticated: true,
      isLoading: false,
    });

    router.push(getRedirectPath(role));
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.push(ROUTES.LOGIN);
  };

  const setUser = (user: User | null) => {
    setState(prev => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, setUser }}>
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
