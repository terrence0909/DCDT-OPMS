import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import KPIsPage from './pages/KPIsPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Breadcrumbs from './components/Common/Breadcrumbs';
import SessionTimeoutHandler from './components/Common/SessionTimeoutHandler';
import { AuthState, UserRole } from './types';
import { authAPI } from './src/services/api';

// Backend status component
const BackendStatus: React.FC<{ isHealthy: boolean }> = ({ isHealthy }) => {
  if (isHealthy) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
      ⚠️ Backend server is not reachable. Make sure it's running on port 5002.
    </div>
  );
};

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [backendHealth, setBackendHealth] = useState<boolean>(true);

  useEffect(() => {
    // Check backend health
    const checkBackend = async () => {
      try {
        await authAPI.checkHealth();
        setBackendHealth(true);
      } catch (error) {
        console.error('Backend is not available:', error);
        setBackendHealth(false);
      }
    };

    // Check if user is already logged in
    const savedUser = localStorage.getItem('opms_user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      setAuthState({
        isAuthenticated: true,
        user: JSON.parse(savedUser),
        loading: false,
        error: null,
      });
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }

    checkBackend();
    
    // Check backend health every 30 seconds
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { user } = await authAPI.login(username, password);
      
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
      });
      
      setBackendHealth(true);
      return true;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Login failed. Please check credentials.',
      }));
      return false;
    }
  };

  const logout = () => {
    authAPI.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });
  };

  if (authState.loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-light">
        <BackendStatus isHealthy={backendHealth} />
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-secondary font-semibold animate-pulse uppercase tracking-widest text-[10px]">
          {backendHealth ? 'Initializing Secure Environment...' : 'Connecting to Backend...'}
        </p>
        {!backendHealth && (
          <p className="text-red-500 text-sm mt-2 max-w-md text-center">
            Backend server at localhost:5002 is not responding. Please start the backend server.
          </p>
        )}
      </div>
    );
  }

  return (
    <Router>
      <BackendStatus isHealthy={backendHealth} />
      <Routes>
        <Route 
          path="/login" 
          element={
            authState.isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <LoginPage 
                onLogin={login} 
                error={authState.error}
                backendHealthy={backendHealth}
              />
            )
          } 
        />
        <Route
          path="/*"
          element={
            authState.isAuthenticated ? (
              <div className="flex h-screen overflow-hidden bg-light">
                <SessionTimeoutHandler onLogout={logout} />
                <Sidebar 
                  collapsed={sidebarCollapsed} 
                  setCollapsed={setSidebarCollapsed} 
                  user={authState.user} 
                  onLogout={logout} 
                />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                  <Header 
                    user={authState.user} 
                    collapsed={sidebarCollapsed} 
                  />
                  <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                      <Breadcrumbs />
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/kpis" element={<KPIsPage userRole={authState.user?.role} />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="/users" element={authState.user?.role === UserRole.ADMIN ? <UsersPage /> : <Navigate to="/dashboard" />} />
                        <Route path="/settings" element={<SettingsPage userRole={authState.user?.role} />} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                      </Routes>
                    </div>
                  </main>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
