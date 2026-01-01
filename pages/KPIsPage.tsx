import React, { useState, useEffect } from 'react';
import { kpiAPI } from '../src/services/api';
import { KPI, KPIStatus, UserRole } from '../types';
import { Plus, Download, Search, ChevronRight, X, FileText, AlertTriangle, CheckCircle2, Loader2, RefreshCw, Eye, Edit, Filter, BarChart3, Users } from 'lucide-react';
import Modal from '../components/Common/Modal';
import Badge from '../components/Common/Badge';
import WordCountField from '../components/Common/WordCountField';
import FileUpload from '../components/Common/FileUpload';

interface KPIsPageProps {
  userRole?: UserRole;
}

const KPIsPage: React.FC<KPIsPageProps> = ({ userRole }) => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [newKPI, setNewKPI] = useState({
    name: '',
    description: '',
    target: '',
    measurement_unit: '%',
    program: 'OP-2025-01'
  });

  // Progress Update State
  const [updateValue, setUpdateValue] = useState('');
  const [challenges, setChallenges] = useState('');
  const [mitigation, setMitigation] = useState('');

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    const isRefreshing = refreshing;
    if (!isRefreshing) setLoading(true);
    setError(null);

    try {
      const data = await kpiAPI.getAll();
      setKpis(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load KPIs from backend');
      console.error('KPI fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchKPIs();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKPI || !updateValue) return;

    try {
      const updatedKPI = await kpiAPI.update(selectedKPI.id, {
        current: parseFloat(updateValue),
        achieved: (parseFloat(updateValue) / selectedKPI.target) * 100
      });
      
      alert("Performance update submitted successfully!");
      setSelectedKPI(null);
      setUpdateValue('');
      setChallenges('');
      setMitigation('');
      
      // Refresh KPI list
      fetchKPIs();
    } catch (err: any) {
      alert(`Failed to update KPI: ${err.message}`);
    }
  };

  const handleCreateKPI = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const kpiData = {
        name: newKPI.name,
        description: newKPI.description,
        target: parseFloat(newKPI.target),
        measurement_unit: newKPI.measurement_unit,
        program: newKPI.program
      };

      await kpiAPI.create(kpiData);
      alert("KPI created successfully!");
      setIsAddModalOpen(false);
      setNewKPI({
        name: '',
        description: '',
        target: '',
        measurement_unit: '%',
        program: 'OP-2025-01'
      });
      
      // Refresh KPI list
      fetchKPIs();
    } catch (err: any) {
      alert(`Failed to create KPI: ${err.message}`);
    }
  };

  const filteredKPIs = kpis.filter(kpi => {
    const matchesStatus = filterStatus === 'All' || kpi.status === filterStatus;
    const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         kpi.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: KPIStatus) => {
    switch (status) {
      case KPIStatus.ON_TRACK: return 'bg-success/10 text-success';
      case KPIStatus.AT_RISK: return 'bg-alert/10 text-alert';
      case KPIStatus.COMPLETED: return 'bg-success/10 text-success';
      default: return 'bg-warning/10 text-warning';
    }
  };

  const formatStatusText = (status: KPIStatus) => {
    switch (status) {
      case KPIStatus.ON_TRACK: return 'On Track';
      case KPIStatus.AT_RISK: return 'At Risk';
      case KPIStatus.COMPLETED: return 'Completed';
      default: return 'Pending';
    }
  };

  const getStatusCount = (status: KPIStatus) => {
    return kpis.filter(k => k.status === status).length;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">KPIs & Performance Targets</h1>
            <p className="text-secondary">Loading data from backend...</p>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-secondary">Fetching KPIs from backend API...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">KPIs & Performance Targets</h1>
          <p className="text-secondary">Real-time data from DCDT OPMS Backend</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white border border-border px-4 py-2 text-sm font-semibold rounded-sm hover:bg-light flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="bg-white border border-border px-4 py-2 text-sm font-semibold rounded-sm hover:bg-light flex items-center gap-2">
            <Download size={16} /> Export
          </button>
          {userRole === UserRole.ADMIN && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary text-white px-4 py-2 text-sm font-semibold rounded-sm hover:bg-[#0f2744] flex items-center gap-2"
            >
              <Plus size={16} /> Add KPI
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-alert/10 border border-alert rounded-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-alert mt-0.5" size={18} />
            <div>
              <p className="font-semibold text-alert">Error Loading KPIs</p>
              <p className="text-sm text-secondary mt-1">{error}</p>
              <button 
                onClick={fetchKPIs}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-border rounded-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-secondary uppercase">Total KPIs</p>
              <h3 className="text-2xl font-bold text-dark mt-1">{kpis.length}</h3>
            </div>
            <div className="p-2 bg-primary/10 rounded-sm">
              <BarChart3 size={20} className="text-primary" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border border-border rounded-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-secondary uppercase">On Track</p>
              <h3 className="text-2xl font-bold text-success mt-1">{getStatusCount(KPIStatus.ON_TRACK)}</h3>
            </div>
            <div className="p-2 bg-success/10 rounded-sm">
              <CheckCircle2 size={20} className="text-success" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border border-border rounded-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-secondary uppercase">At Risk</p>
              <h3 className="text-2xl font-bold text-alert mt-1">{getStatusCount(KPIStatus.AT_RISK)}</h3>
            </div>
            <div className="p-2 bg-alert/10 rounded-sm">
              <AlertTriangle size={20} className="text-alert" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border border-border rounded-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-secondary uppercase">Avg. Achievement</p>
              <h3 className="text-2xl font-bold text-primary mt-1">
                {kpis.length > 0 
                  ? `${(kpis.reduce((sum, k) => sum + k.achieved, 0) / kpis.length).toFixed(1)}%`
                  : '0%'
                }
              </h3>
            </div>
            <div className="p-2 bg-primary/10 rounded-sm">
              <Users size={20} className="text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border border-border rounded-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-secondary" />
              <span className="text-sm font-semibold text-secondary">Filter:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['All', KPIStatus.ON_TRACK, KPIStatus.AT_RISK, KPIStatus.PENDING, KPIStatus.COMPLETED].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                    filterStatus === status 
                      ? 'bg-primary text-white' 
                      : 'bg-light text-secondary hover:bg-border'
                  }`}
                >
                  {status === 'All' ? 'All KPIs' : formatStatusText(status as KPIStatus)}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
            <input
              type="text"
              placeholder="Search KPIs..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-border rounded-sm w-full md:w-64 focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* KPI Table */}
      <div className="bg-white border border-border rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">KPI Details</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Current</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Achievement</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredKPIs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-secondary">
                    {kpis.length === 0 ? 'No KPIs found in backend' : 'No KPIs match your filters'}
                  </td>
                </tr>
              ) : (
                filteredKPIs.map((kpi) => {
                  const progressPercent = Math.min(100, (kpi.current / kpi.target) * 100);
                  return (
                    <tr key={kpi.id} className="hover:bg-light/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-dark">{kpi.name}</div>
                        <div className="text-sm text-secondary mt-1 line-clamp-2">{kpi.description}</div>
                        <div className="text-xs text-secondary mt-2">
                          <span className="font-medium">Program:</span> {kpi.program} • <span className="font-medium">Owner:</span> {kpi.owner}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-dark">{kpi.target}{kpi.measurement_unit || ''}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-dark">{kpi.current}{kpi.measurement_unit || ''}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="w-full bg-light rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full ${
                                  kpi.status === KPIStatus.ON_TRACK || kpi.status === KPIStatus.COMPLETED 
                                    ? 'bg-success' 
                                    : 'bg-alert'
                                }`}
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="font-bold text-dark min-w-[50px] text-right">{kpi.achieved}%</span>
                        </div>
                        <div className="text-xs text-secondary mt-1">
                          Variance: {kpi.variance > 0 ? '+' : ''}{kpi.variance}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(kpi.status)}`}>
                          {formatStatusText(kpi.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedKPI(kpi)}
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-sm transition-colors"
                            title="Update Progress"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setSelectedKPI(kpi)}
                            className="p-1.5 text-secondary hover:bg-light rounded-sm transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KPI Details/Update Modal */}
      {selectedKPI && (
        <Modal isOpen={!!selectedKPI} onClose={() => setSelectedKPI(null)} title={`Update: ${selectedKPI.name}`}>
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Current Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-light rounded-sm">
              <div className="text-center">
                <div className="text-xs font-semibold text-secondary uppercase">Target</div>
                <div className="text-xl font-bold text-dark mt-1">{selectedKPI.target}{selectedKPI.measurement_unit || ''}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold text-secondary uppercase">Current</div>
                <div className="text-xl font-bold text-dark mt-1">{selectedKPI.current}{selectedKPI.measurement_unit || ''}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold text-secondary uppercase">Achieved</div>
                <div className="text-xl font-bold text-dark mt-1">{selectedKPI.achieved}%</div>
              </div>
            </div>

            {/* Update Form */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                New Current Value ({selectedKPI.measurement_unit || 'units'})
              </label>
              <input
                type="number"
                required
                value={updateValue}
                onChange={e => setUpdateValue(e.target.value)}
                className="w-full p-3 border border-border rounded-sm focus:outline-none focus:border-primary"
                placeholder={`Enter new value (target: ${selectedKPI.target})`}
                step="0.01"
                min="0"
              />
            </div>

            {selectedKPI.status === KPIStatus.AT_RISK && (
              <div className="space-y-4 p-4 bg-alert/5 border border-alert/20 rounded-sm">
                <div className="flex items-center gap-2 text-alert">
                  <AlertTriangle size={18} />
                  <h4 className="text-sm font-bold">Catch-Up Plan Required</h4>
                </div>
                
                <WordCountField 
                  label="Key Challenges (Why target missed?)" 
                  value={challenges} 
                  onChange={setChallenges} 
                  maxWords={50}
                  required
                />
                
                <WordCountField 
                  label="Mitigation / Corrective Action Plan" 
                  value={mitigation} 
                  onChange={setMitigation} 
                  maxWords={50}
                  required
                />
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={() => setSelectedKPI(null)} 
                className="flex-1 px-4 py-3 border border-border text-dark text-sm font-semibold rounded-sm hover:bg-light"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 px-4 py-3 bg-primary text-white text-sm font-semibold rounded-sm hover:bg-[#0f2744]"
              >
                Submit Update
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add KPI Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New KPI">
        <form onSubmit={handleCreateKPI} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-secondary uppercase mb-1">KPI Name *</label>
            <input 
              type="text" 
              required 
              value={newKPI.name}
              onChange={e => setNewKPI({...newKPI, name: e.target.value})}
              className="w-full p-2 border border-border rounded-sm text-sm focus:border-primary focus:outline-none" 
              placeholder="e.g. Employee Training Completion Rate" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase mb-1">Target Value *</label>
              <input 
                type="number" 
                required 
                value={newKPI.target}
                onChange={e => setNewKPI({...newKPI, target: e.target.value})}
                className="w-full p-2 border border-border rounded-sm text-sm" 
                placeholder="95" 
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase mb-1">Unit *</label>
              <select 
                value={newKPI.measurement_unit}
                onChange={e => setNewKPI({...newKPI, measurement_unit: e.target.value})}
                className="w-full p-2 border border-border rounded-sm text-sm"
              >
                <option value="%">Percentage (%)</option>
                <option value="stars">Stars</option>
                <option value="days">Days</option>
                <option value="units">Units</option>
                <option value="people">People</option>
                <option value="projects">Projects</option>
              </select>
            </div>
          </div>
          <WordCountField 
            label="Description *" 
            value={newKPI.description} 
            onChange={(value) => setNewKPI({...newKPI, description: value})} 
            maxWords={50} 
            placeholder="Describe the KPI objective and measurement criteria..." 
            required
          />
          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={() => setIsAddModalOpen(false)} 
              className="flex-1 px-4 py-2 border border-border text-dark text-sm font-semibold rounded-sm hover:bg-light"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-sm hover:bg-[#0f2744]"
            >
              Create KPI
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default KPIsPage;
