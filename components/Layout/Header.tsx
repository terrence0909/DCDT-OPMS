
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { Bell, Search, Clock, HelpCircle } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  collapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, collapsed }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSAST = (date: Date) => {
    return date.toLocaleString('en-ZA', { 
      timeZone: 'Africa/Johannesburg',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-primary truncate max-w-[200px] md:max-w-none">
          {window.location.hash.split('/')[1]?.toUpperCase() || 'DASHBOARD'}
        </h2>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-light rounded-sm text-sm text-secondary border border-border">
          <Clock size={14} />
          <span className="font-mono">{formatSAST(currentTime)} SAST</span>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden lg:flex items-center relative">
          <Search className="absolute left-3 text-secondary" size={16} />
          <input 
            type="text" 
            placeholder="Search KPIs, reports..." 
            className="pl-10 pr-4 py-2 bg-light border border-border rounded-sm text-sm focus:outline-none focus:border-primary w-64"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-light rounded-full text-secondary relative" title="Notifications">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-alert rounded-full"></span>
          </button>
          <button className="p-2 hover:bg-light rounded-full text-secondary hidden sm:block" title="Help">
            <HelpCircle size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-dark leading-none">{user?.name}</p>
            <p className="text-xs text-secondary mt-1">{user?.role}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
            {user?.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
