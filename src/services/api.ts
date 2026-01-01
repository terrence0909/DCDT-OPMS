import { User, KPI, UserRole, KPIStatus } from '../../types';

const API_BASE_URL = 'http://localhost:5002';

// Helper function for API requests
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `API Error: ${response.statusText}`);
  }
  
  return response.json() as Promise<T>;
}

// Convert backend KPI to frontend KPI type
const convertBackendKPI = (backendKpi: any): KPI => ({
  id: backendKpi.id,
  name: backendKpi.name,
  code: backendKpi.code,
  description: backendKpi.description,
  target: backendKpi.target_value,
  current: backendKpi.current_value,
  achieved: backendKpi.achieved_percentage,
  variance: backendKpi.variance || 0,
  status: mapKPIStatus(backendKpi.status),
  owner: backendKpi.owner?.name || 'System',
  lastUpdated: backendKpi.last_updated ? new Date(backendKpi.last_updated).toLocaleDateString() : new Date().toLocaleDateString(),
  program: backendKpi.operational_plan_id || 'General',
  measurement_unit: backendKpi.measurement_unit,
  department: backendKpi.owner?.department || 'ICT',
});

// Map backend status to frontend status
const mapKPIStatus = (status: string): KPIStatus => {
  switch (status?.toLowerCase()) {
    case 'ontrack':
    case 'on_track':
      return KPIStatus.ON_TRACK;
    case 'atrisk':
    case 'at_risk':
      return KPIStatus.AT_RISK;
    case 'pending':
      return KPIStatus.PENDING;
    case 'completed':
      return KPIStatus.COMPLETED;
    default:
      return KPIStatus.PENDING;
  }
};

// Convert backend user to frontend user type
const convertBackendUser = (backendUser: any): User => ({
  id: backendUser.id,
  name: backendUser.name,
  email: backendUser.email,
  username: backendUser.username,
  role: mapUserRole(backendUser.role),
  department: backendUser.department,
  lastLogin: backendUser.last_login ? new Date(backendUser.last_login).toLocaleString() : 'Never',
  status: backendUser.is_active ? 'Active' : 'Inactive',
  employee_number: backendUser.employee_number,
});

// Map backend role to frontend role
const mapUserRole = (role: string): UserRole => {
  switch (role?.toLowerCase()) {
    case 'administrator':
    case 'admin':
      return UserRole.ADMIN;
    case 'manager':
      return UserRole.MANAGER;
    case 'officer':
      return UserRole.OFFICER;
    case 'viewer':
      return UserRole.VIEWER;
    default:
      return UserRole.VIEWER;
  }
};

// Authentication API
export const authAPI = {
  async login(username: string, password: string): Promise<{token: string; user: User}> {
    const data = await apiRequest<{token: string; user: any}>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    const frontendUser = convertBackendUser(data.user);
    
    // Store in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('opms_user', JSON.stringify(frontendUser));
    
    return {
      token: data.token,
      user: frontendUser,
    };
  },
  
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('opms_user');
  },
  
  async checkHealth(): Promise<{status: string}> {
    return apiRequest<{status: string}>('/health');
  },
};

// KPI API
export const kpiAPI = {
  async getAll(): Promise<KPI[]> {
    const response = await apiRequest<{success: boolean; data: any[]}>('/api/kpis');
    
    if (response.success && response.data) {
      return response.data.map(convertBackendKPI);
    }
    
    return [];
  },
  
  async getById(id: string): Promise<KPI> {
    const response = await apiRequest<any>(`/api/kpis/${id}`);
    return convertBackendKPI(response);
  },
};

// Dashboard API
export const dashboardAPI = {
  async getOverview(): Promise<any> {
    try {
      const response = await apiRequest<any>('/api/dashboard/overview');
      return response;
    } catch (error) {
      // Fallback to mock data if endpoint not ready
      return {
        totalKPIs: 0,
        completedKPIs: 0,
        pendingApprovals: 0,
        departmentPerformance: 0,
        recentActivities: [],
      };
    }
  },
  
  async getPerformanceTrends(): Promise<any[]> {
    try {
      const response = await apiRequest<any[]>('/api/dashboard/performance-trends');
      return response;
    } catch (error) {
      // Fallback data - FIXED: return array directly
      return [
        { month: 'Jan', performance: 65 },
        { month: 'Feb', performance: 72 },
        { month: 'Mar', performance: 68 },
        { month: 'Apr', performance: 75 },
        { month: 'May', performance: 82 },
        { month: 'Jun', performance: 79 },
      ];
    }
  },
};

// Users API
export const usersAPI = {
  async getAll(): Promise<User[]> {
    try {
      const response = await apiRequest<User[]>('/api/users');
      return response;
    } catch (error) {
      // Fallback to empty array
      return [];
    }
  },
};
