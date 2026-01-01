
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { User, UserRole } from '../../types';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  user: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, user, onLogout }) => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'KPIs & Targets', icon: BarChart3, path: '/kpis' },
    { name: 'Performance Reports', icon: FileText, path: '/reports' },
    ...(user?.role === UserRole.ADMIN ? [{ name: 'User Management', icon: Users, path: '/users' }] : []),
    { name: 'System Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside 
      className={`bg-primary text-white transition-all duration-300 flex flex-col h-screen shrink-0 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      <div className="h-16 flex items-center px-4 border-b border-white/10 overflow-hidden shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-success" />
            <span className="font-bold text-xl tracking-tight">DCDT OPMS</span>
          </div>
        )}
        {collapsed && <ShieldCheck className="mx-auto text-success" />}
      </div>

      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 transition-colors
                  ${isActive ? 'bg-white/10 border-l-4 border-success' : 'hover:bg-white/5 border-l-4 border-transparent'}
                  ${collapsed ? 'justify-center' : 'gap-4'}
                `}
                title={collapsed ? item.name : ''}
              >
                <item.icon size={20} className={collapsed ? '' : 'shrink-0'} />
                {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10 shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center gap-4 w-full p-2 hover:bg-white/5 rounded transition-colors text-white/70 hover:text-white ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed ? <ChevronRight size={20} /> : <><ChevronLeft size={20} /> <span className="text-sm">Collapse Menu</span></>}
        </button>

        <button
          onClick={onLogout}
          className={`flex items-center gap-4 w-full mt-2 p-2 hover:bg-alert/20 rounded transition-colors text-white/70 hover:text-alert ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} className={collapsed ? '' : 'shrink-0'} />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>

      {!collapsed && (
        <div className="p-4 bg-black/20 text-[10px] text-white/50 text-center shrink-0 uppercase tracking-widest">
          v1.0.4 • DCDT 2025
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
