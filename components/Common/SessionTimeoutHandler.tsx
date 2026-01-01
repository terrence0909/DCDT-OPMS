
import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { AlertTriangle, Clock, LogOut } from 'lucide-react';

interface SessionTimeoutHandlerProps {
  onLogout: () => void;
  timeoutMinutes?: number;
  warningMinutes?: number;
}

const SessionTimeoutHandler: React.FC<SessionTimeoutHandlerProps> = ({ 
  onLogout, 
  timeoutMinutes = 30, 
  warningMinutes = 5 
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(warningMinutes * 60);
  const timeoutRef = useRef<any>(null);
  const warningIntervalRef = useRef<any>(null);

  const resetTimer = () => {
    setShowWarning(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);

    const msBeforeWarning = (timeoutMinutes - warningMinutes) * 60 * 1000;
    
    timeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setSecondsRemaining(warningMinutes * 60);
      
      warningIntervalRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(warningIntervalRef.current);
            onLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, msBeforeWarning);
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal 
      isOpen={showWarning} 
      onClose={() => resetTimer()} 
      title="Security Session Timeout"
    >
      <div className="text-center py-4">
        <div className="mx-auto w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center text-warning mb-4">
          <AlertTriangle size={32} />
        </div>
        <h4 className="text-lg font-bold text-dark mb-2">Are you still there?</h4>
        <p className="text-sm text-secondary mb-6 leading-relaxed">
          For security reasons, your session will expire due to inactivity in:
        </p>
        <div className="text-4xl font-mono font-bold text-primary mb-8 tracking-wider bg-light py-4 border border-border">
          {formatTime(secondsRemaining)}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onLogout}
            className="flex-1 px-4 py-2 border border-border text-dark text-sm font-semibold rounded-sm hover:bg-light flex items-center justify-center gap-2"
          >
            <LogOut size={16} /> Logout Now
          </button>
          <button 
            onClick={resetTimer}
            className="flex-1 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-sm hover:bg-[#0f2744] flex items-center justify-center gap-2"
          >
            <Clock size={16} /> Stay Signed In
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SessionTimeoutHandler;
