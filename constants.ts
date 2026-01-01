
import { UserRole, User, KPI, KPIStatus, Report } from './types';

export const COLORS = {
  primary: '#1a365d',
  secondary: '#475569',
  success: '#10b981',
  alert: '#ef4444',
  warning: '#f59e0b',
  white: '#ffffff',
  lightGray: '#f3f4f6',
  darkGray: '#111827',
  border: '#e5e7eb',
};

export const MOCK_USERS: User[] = [
  { id: '1', name: 'John Doe', email: 'john.doe@dcdt.gov.za', username: 'admin', role: UserRole.ADMIN, department: 'ICT Policy', lastLogin: '2024-05-20 08:30', status: 'Active' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@dcdt.gov.za', username: 'manager', role: UserRole.MANAGER, department: 'Broadband', lastLogin: '2024-05-19 14:20', status: 'Active' },
  { id: '3', name: 'Robert Brown', email: 'robert.b@dcdt.gov.za', username: 'officer', role: UserRole.OFFICER, department: 'Digital Economy', lastLogin: '2024-05-20 09:15', status: 'Active' },
  { id: '4', name: 'Sarah Wilson', email: 'sarah.w@dcdt.gov.za', username: 'viewer', role: UserRole.VIEWER, department: 'Governance', lastLogin: '2024-05-18 11:00', status: 'Active' },
];

export const MOCK_KPIS: KPI[] = [
  { id: '1', name: 'Broadband Penetration Rate', target: 80, current: 75, achieved: 93.75, variance: -6.25, status: KPIStatus.ON_TRACK, owner: 'Broadband Dept', lastUpdated: '2024-05-15', program: 'Infrastructure', description: 'Percentage of households with broadband access.' },
  { id: '2', name: 'ICT Small Business Support', target: 500, current: 320, achieved: 64, variance: -36, status: KPIStatus.AT_RISK, owner: 'Digital Economy', lastUpdated: '2024-05-12', program: 'Economic Support', description: 'Number of SMMEs receiving technical support.' },
  { id: '3', name: 'Spectrum Policy Finalization', target: 100, current: 100, achieved: 100, variance: 0, status: KPIStatus.ON_TRACK, owner: 'Policy Dept', lastUpdated: '2024-04-30', program: 'Policy Framework', description: 'Completion status of the National Spectrum Policy.' },
  { id: '4', name: 'Digital Literacy Training', target: 50000, current: 15000, achieved: 30, variance: -70, status: KPIStatus.AT_RISK, owner: 'Human Capital', lastUpdated: '2024-05-18', program: 'Skills Development', description: 'Number of citizens trained in basic digital skills.' },
  { id: '5', name: 'Cybersecurity Response Time', target: 24, current: 28, achieved: 85.7, variance: 4, status: KPIStatus.PENDING, owner: 'Cybersecurity Hub', lastUpdated: '2024-05-10', program: 'Security', description: 'Average response time to critical cybersecurity incidents (hours).' },
  { id: '6', name: 'E-Government Service Integration', target: 15, current: 12, achieved: 80, variance: -20, status: KPIStatus.ON_TRACK, owner: 'E-Gov Unit', lastUpdated: '2024-05-14', program: 'Digital Services', description: 'Number of government services fully integrated online.' },
];

export const MOCK_REPORTS: Report[] = [
  { id: '1', type: 'Monthly', period: 'April 2024', openingDate: '2024-04-01', closingDate: '2024-04-07', status: 'Submitted', submittedBy: 'Jane Smith' },
  { id: '2', type: 'Monthly', period: 'May 2024', openingDate: '2024-05-01', closingDate: '2024-05-07', status: 'Submitted', submittedBy: 'John Doe' },
  { id: '3', type: 'Quarterly', period: 'Q1 2024', openingDate: '2024-04-01', closingDate: '2024-04-15', status: 'Submitted', submittedBy: 'Jane Smith' },
  { id: '4', type: 'Monthly', period: 'June 2024', openingDate: '2024-06-01', closingDate: '2024-06-07', status: 'Pending' },
  { id: '5', type: 'Quarterly', period: 'Q2 2024', openingDate: '2024-07-01', closingDate: '2024-07-15', status: 'Pending' },
];

export const PERFORMANCE_TREND = [
  { month: 'Jan', performance: 65 },
  { month: 'Feb', performance: 72 },
  { month: 'Mar', performance: 68 },
  { month: 'Apr', performance: 75 },
  { month: 'May', performance: 82 },
  { month: 'Jun', performance: 79 },
];
