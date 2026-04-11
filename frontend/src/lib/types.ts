export const ROLES = {
  APPLICANT: 'applicant',
  RECRUITER: 'recruiter',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  APPLICANT: {
    DASHBOARD: '/applicant',
    PROFILE: '/applicant/profile',
    JOBS: '/applicant/jobs',
    APPLICATIONS: '/applicant/applications',
    SETTINGS: '/applicant/settings',
  },
  RECRUITER: {
    DASHBOARD: '/recruiter',
    JOBS: '/recruiter/jobs',
    CREATE_JOB: '/recruiter/jobs/create',
    APPLICANTS: '/recruiter/applicants',
    SCREENING: '/recruiter/screening',
    RESULTS: '/recruiter/results',
    SETTINGS: '/recruiter/settings',
  },
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    JOBS: '/admin/jobs',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
  },
} as const;
