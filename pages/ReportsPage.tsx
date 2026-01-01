
import React, { useState } from 'react';
import { MOCK_REPORTS } from '../constants';
import { FileText, Download, Calendar, ExternalLink, Plus, CheckCircle2, Clock } from 'lucide-react';
import Modal from '../components/Common/Modal';
import Badge from '../components/Common/Badge';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'schedule'>('submissions');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  const timelineSteps = [
    { name: 'April Monthly', status: 'Completed', date: '7 Apr 2024' },
    { name: 'May Monthly', status: 'Completed', date: '7 May 2024' },
    { name: 'Q1 Quarterly', status: 'Completed', date: '15 Apr 2024' },
    { name: 'June Monthly', status: 'In Progress', date: 'Due 7 Jun 2024' },
    { name: 'July Monthly', status: 'Upcoming', date: 'Opens 1 Jul 2024' },
    { name: 'Q2 Quarterly', status: 'Upcoming', date: 'Opens 1 Jul 2024' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Performance Reports</h1>
          <p className="text-secondary">Official monthly, quarterly, and annual performance submissions.</p>
        </div>
        <button 
          onClick={() => setIsGenerateModalOpen(true)}
          className="bg-primary text-white px-6 py-2.5 text-sm font-semibold rounded-sm hover:bg-[#0f2744] flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Generate New Report
        </button>
      </div>

      <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
        <div className="flex border-b border-border bg-light/30">
          <button 
            onClick={() => setActiveTab('submissions')}
            className={`px-6 py-4 text-sm font-bold uppercase tracking-tight border-b-2 transition-colors ${activeTab === 'submissions' ? 'border-primary text-primary bg-white' : 'border-transparent text-secondary hover:text-primary'}`}
          >
            Submissions
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`px-6 py-4 text-sm font-bold uppercase tracking-tight border-b-2 transition-colors ${activeTab === 'schedule' ? 'border-primary text-primary bg-white' : 'border-transparent text-secondary hover:text-primary'}`}
          >
            Reporting Window
          </button>
        </div>

        <div>
          {activeTab === 'submissions' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-light/50 border-b border-border text-secondary font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Report Type</th>
                    <th className="px-6 py-3">Reporting Period</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Submitted By</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MOCK_REPORTS.map((report) => (
                    <tr key={report.id} className="hover:bg-light/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-primary" />
                          <span className="font-semibold text-dark">{report.type} Performance</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-secondary">{report.period}</td>
                      <td className="px-6 py-4">
                        <Badge variant={report.status === 'Submitted' ? 'success' : report.status === 'Overdue' ? 'alert' : 'warning'}>
                          {report.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-secondary">{report.submittedBy || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button className="text-secondary hover:text-primary" title="Preview"><ExternalLink size={16} /></button>
                          <button className="text-secondary hover:text-primary" title="Download"><Download size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {timelineSteps.map((step, idx) => (
                  <div key={idx} className="bg-white border border-border p-5 rounded-sm flex flex-col justify-between h-36 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-primary">{step.name}</h4>
                      {step.status === 'Completed' ? (
                        <CheckCircle2 size={16} className="text-success" />
                      ) : step.status === 'In Progress' ? (
                        <Clock size={16} className="text-warning animate-pulse" />
                      ) : (
                        <Calendar size={16} className="text-secondary" />
                      )}
                    </div>
                    <div className="mt-auto">
                      <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mb-1">{step.status}</p>
                      <p className="text-sm font-mono text-dark font-semibold">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isGenerateModalOpen} onClose={() => setIsGenerateModalOpen(false)} title="Generate Performance Report">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsGenerateModalOpen(false); }}>
          <div>
            <label className="block text-xs font-bold text-secondary uppercase mb-1">Report Type</label>
            <select className="w-full p-2 border border-border rounded-sm text-sm">
              <option>Monthly Performance Report</option>
              <option>Quarterly Performance Review</option>
              <option>Annual Performance Plan (APP) Report</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-secondary uppercase mb-1">Reporting Period</label>
            <select className="w-full p-2 border border-border rounded-sm text-sm">
              <option>June 2024</option>
              <option>Q1 (Apr - Jun 2024)</option>
              <option>FY 2024/25 Mid-Year</option>
            </select>
          </div>
          <div className="p-3 bg-light border border-border rounded-sm text-xs text-secondary leading-relaxed italic">
            Note: This action will pull all validated KPI achievements for the selected period. Any unvalidated data will be excluded.
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsGenerateModalOpen(false)} className="flex-1 px-4 py-2 border border-border text-dark text-sm font-semibold rounded-sm hover:bg-light">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-sm hover:bg-[#0f2744]">Generate PDF</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReportsPage;
