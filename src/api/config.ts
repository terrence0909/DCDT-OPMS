// API Configuration for DCDT OPMS Backend
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5002',
  API_PREFIX: '/api',
  TIMEOUT: 10000,
};

// Helper to construct full API URLs
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`;
};

// Helper to get authentication headers
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};
