export enum UserRole {
  ADMIN = 'Administrator',
  MANAGER = 'Manager',
  OFFICER = 'Officer',
  VIEWER = 'Viewer'
}

export enum KPIStatus {
  ON_TRACK = 'OnTrack',
  AT_RISK = 'AtRisk',
  PENDING = 'Pending',
  COMPLETED = 'Completed'
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  department: string;
  lastLogin: string;
  status: string;
  employee_number?: string;
}

export interface KPI {
  id: string;
  name: string;
  code?: string;
  description: string;
  target: number;
  current: number;
  achieved: number;
  variance: number;
  status: KPIStatus;
  owner: string;
  lastUpdated: string;
  program: string;
  measurement_unit?: string;
  department?: string;
}

export interface Report {
  id: string;
  type: string;
  period: string;
  openingDate: string;
  closingDate: string;
  status: string;
  submittedBy?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}
