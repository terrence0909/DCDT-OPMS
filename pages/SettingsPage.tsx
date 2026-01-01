
import React from 'react';
import { UserRole } from '../types';
import { 
  ShieldCheck, 
  Settings2, 
  Calendar, 
  Database, 
  HelpCircle, 
  ChevronRight,
  Info,
  Smartphone,
  CheckCircle
} from 'lucide-react';

interface SettingsPageProps {
  userRole?: UserRole;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ userRole }) => {
  const sections = [
    { title: 'Strategic Planning', icon: Settings2, desc: 'Update Strategic Outcome targets and APP frameworks.' },
    { title: 'System Configuration', icon: Database, desc: 'Manage system parameters, license usage and database backups.' },
    { title: 'Security & POPI', icon: ShieldCheck, desc: 'Configure multi-factor authentication and data privacy controls.' },
    { title: 'Reporting Schedule', icon: Calendar, desc: 'Adjust monthly and quarterly submission windows for the current FY.' },
    { title: 'Mobile Integration', icon: Smartphone, desc: 'Settings for field officers using the OPMS mobile capture app.' },
    { title: 'Support & Docs', icon: HelpCircle, desc: 'Access system user manuals, training videos and helpdesk tickets.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">System Settings</h1>
          <p className="text-secondary">Configure the environment and strategic frameworks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((sec, i) => (
          <button 
            key={i} 
            className="text-left bg-white border border-border p-5 rounded-sm hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-light rounded-sm text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <sec.icon size={20} />
                </div>
                <ChevronRight size={18} className="text-border group-hover:text-primary transition-transform group-hover:translate-x-1" />
              </div>
              <h3 className="font-bold text-dark">{sec.title}</h3>
              <p className="text-xs text-secondary mt-2 leading-relaxed">{sec.desc}</p>
            </div>
            {userRole !== UserRole.ADMIN && i < 4 && (
              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-warning uppercase">
                <ShieldCheck size={12} /> Admin Access Required
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white border border-border rounded-sm shadow-sm">
        <div className="p-4 border-b border-border bg-light/30 flex items-center gap-2">
          <Info size={18} className="text-primary" />
          <h2 className="font-semibold text-primary uppercase text-xs tracking-widest">About System Environment</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <p className="text-xs font-semibold text-secondary uppercase mb-2">Build Version</p>
            <p className="font-mono text-sm text-dark font-bold">1.0.4-stable-2025</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-secondary uppercase mb-2">Hosting Environment</p>
            <p className="text-sm text-dark font-bold">SITA Govt Private Cloud (Primary)</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-secondary uppercase mb-2">License Status</p>
            <p className="text-sm text-dark font-bold flex items-center gap-2">
              142 / 150 <span className="text-[10px] text-success px-1 bg-success/10 border border-success/20 rounded">VALID</span>
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-secondary uppercase mb-2">POPI Compliance</p>
            <p className="text-sm text-success font-bold flex items-center gap-1">
              <CheckCircle size={14} /> Certified Compliant
            </p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border bg-light/10 text-[10px] text-secondary flex justify-between">
          <span>Last System Backup: 20 May 2024 02:00 SAST</span>
          <span>DCDT Bid Number: DCDT/04/2025/26</span>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 p-6 rounded-sm flex items-start gap-4">
        <ShieldCheck size={24} className="text-primary mt-1" />
        <div>
          <h3 className="font-bold text-primary">Strategic Plan 2025-2030</h3>
          <p className="text-sm text-secondary mt-1 max-w-2xl">
            The system is currently configured based on the National Development Plan (NDP) and the DCDT 5-year strategic framework. Modifying high-level outcomes requires Director-General level approval signatures.
          </p>
          <div className="mt-4 flex gap-4">
            <button className="text-xs font-bold text-primary hover:underline">Download Current Plan</button>
            <button className="text-xs font-bold text-primary hover:underline">View Audit Log</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
