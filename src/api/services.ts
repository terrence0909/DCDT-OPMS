import { getApiUrl, getAuthHeaders } from './config';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    lastLogin: string;
  };
  expiresIn: number;
}

export interface KPI {
  id: string;
  code: string;
  name: string;
  description: string;
  target_value: number;
  current_value: number;
  achieved_percentage: number;
  status: string;
  measurement_unit: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

export interface KPIsResponse {
  success: boolean;
  data: KPI[];
}

class ApiService {
  // Health check
  async checkHealth() {
    const response = await fetch('http://localhost:5002/health');
    return response.json();
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(getApiUrl('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response.json();
  }

  // KPIs
  async getKPIs(): Promise<KPIsResponse> {
    const response = await fetch(getApiUrl('/kpis'), {
      headers: getAuthHeaders(),
    });
    return response.json();
  }

  // Dashboard
  async getDashboardOverview() {
    const response = await fetch(getApiUrl('/dashboard/overview'), {
      headers: getAuthHeaders(),
    });
    return response.json();
  }

  // Logout (client-side only)
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const apiService = new ApiService();
export default apiService;
