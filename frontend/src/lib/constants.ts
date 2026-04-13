export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  JOBS: {
    LIST: '/jobs',
    CREATE: '/jobs',
    DETAIL: (id: string) => `/jobs/${id}`,
    UPDATE: (id: string) => `/jobs/${id}`,
    DELETE: (id: string) => `/jobs/${id}`,
  },
  APPLICANTS: {
    LIST: '/applicants',
    PROFILE: '/applicants/profile',
    UPLOAD: '/applicants/upload',
  },
  SCREENING: {
    LIST: '/screening',
    RESULTS: '/screening/results',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    SETTINGS: '/admin/settings',
  },
} as const;
