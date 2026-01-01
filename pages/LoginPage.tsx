import React, { useState, useEffect } from 'react';
import { Lock, User, ShieldCheck, AlertCircle, Wifi, WifiOff, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  error: string | null;
  backendHealthy: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error: propError, backendHealthy }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Combine prop error and local error
  const error = propError || localError;

  useEffect(() => {
    let timer: any;
    if (lockoutTime > 0) {
      timer = setInterval(() => {
        setLockoutTime(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTime > 0 || isLoading || !backendHealthy) return;

    setLocalError(null);
    setIsLoading(true);

    try {
      const success = await onLogin(username, password);
      
      if (success) {
        setAttempts(0);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 4) {
          setLockoutTime(60);
          setLocalError('Account locked due to too many failed attempts. Please try again in 60 seconds.');
        } else {
          setLocalError(`Invalid credentials. Attempt ${newAttempts} of 4.`);
        }
      }
    } catch (err: any) {
      setLocalError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light px-4">
      <div className="max-w-md w-full">
        {/* Backend Status Banner */}
        {!backendHealthy && (
          <div className="mb-4 p-3 bg-red-500 text-white rounded-sm flex items-center justify-center gap-2">
            <WifiOff size={18} />
            <span className="text-sm font-medium">Backend server not connected</span>
          </div>
        )}
        
        <div className="bg-white p-8 rounded-sm border border-border shadow-sm">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary rounded-md text-white">
                <ShieldCheck size={40} />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-primary uppercase tracking-tight">DCDT OPMS</h1>
            <p className="text-secondary mt-2">Organisational Performance Management</p>
            
            {/* Backend Connection Status */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm">
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${backendHealthy ? 'bg-success/10 text-success' : 'bg-alert/10 text-alert'}`}>
                {backendHealthy ? <Wifi size={14} /> : <WifiOff size={14} />}
                <span>{backendHealthy ? 'Backend Connected' : 'Backend Offline'}</span>
              </div>
              {backendHealthy && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success">
                  <span>Port: 5002</span>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-dark mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-sm focus:outline-none focus:border-primary disabled:opacity-50"
                  placeholder="Enter your username"
                  disabled={!backendHealthy || isLoading || lockoutTime > 0}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-semibold text-dark">Password</label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-sm focus:outline-none focus:border-primary disabled:opacity-50"
                  placeholder="••••••••"
                  disabled={!backendHealthy || isLoading || lockoutTime > 0}
                />
              </div>
            </div>

            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="remember" 
                className="mr-2 rounded border-border text-primary focus:ring-primary disabled:opacity-50" 
                disabled={!backendHealthy || isLoading || lockoutTime > 0}
              />
              <label htmlFor="remember" className="text-sm text-secondary">Remember me on this device</label>
            </div>

            {error && (
              <div className={`p-3 rounded-sm text-sm flex items-start gap-2 ${lockoutTime > 0 ? 'bg-alert/10 text-alert' : 'bg-warning/10 text-warning'}`}>
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error} {lockoutTime > 0 && `(Lockout active: ${lockoutTime}s)`}</span>
              </div>
            )}

            {/* Demo Credentials Hint */}
            <div className="p-3 bg-light rounded-sm border border-border">
              <p className="text-sm text-secondary text-center">
                <strong>Demo Credentials:</strong> Use <code className="bg-gray-100 px-1 rounded">admin</code> / <code className="bg-gray-100 px-1 rounded">admin123</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={lockoutTime > 0 || isLoading || !backendHealthy}
              className="w-full bg-primary hover:bg-[#0f2744] text-white font-semibold py-2.5 rounded-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to System</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-secondary leading-relaxed">
            Authorized access only. By logging in, you agree to the DCDT ICT Governance Policy and POPIA compliance requirements.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
