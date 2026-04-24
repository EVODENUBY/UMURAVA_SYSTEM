import { API_BASE_URL, ENDPOINTS } from './constants';

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new ApiError(response.status, error.message || 'Request failed');
  }
  return response.json();
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  
  // Don't set Content-Type for FormData (browser will set it with boundary)
  const isFormData = rest.body instanceof FormData;
  
  const config: RequestInit = {
    ...rest,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return handleResponse<T>(response);
}

export const api = {
  get: <T>(endpoint: string, token?: string) =>
    apiClient<T>(endpoint, { method: 'GET', token }),
  
  post: <T>(endpoint: string, data: unknown, token?: string) =>
    apiClient<T>(endpoint, { 
      method: 'POST', 
      body: data instanceof FormData ? data : JSON.stringify(data), 
      token 
    }),
  
  put: <T>(endpoint: string, data: unknown, token?: string) =>
    apiClient<T>(endpoint, { 
      method: 'PUT', 
      body: data instanceof FormData ? data : JSON.stringify(data), 
      token 
    }),
  
  delete: <T>(endpoint: string, token?: string) =>
    apiClient<T>(endpoint, { method: 'DELETE', token }),
};

export { ApiError };
export { ENDPOINTS };
