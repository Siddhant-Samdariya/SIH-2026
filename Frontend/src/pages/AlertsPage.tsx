import React, { useState, useEffect } from 'react';
import { getAlerts, updateAlertStatus } from '../api/incidents';
import { Alert } from '../types/itms';
import { AlertCard } from '../components/AlertCard';
import { StatusBadge } from '../components/StatusBadge';
import { 
  AlertTriangle, 
  Filter, 
  ShieldAlert, 
  CheckCircle, 
  Send, 
  Clock,
  Search,
  Radio
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    getAlerts().then(data => setAlerts(data));
  }, []);

  const handleAcknowledge = (id: string) => {
    updateAlertStatus(id, 'acknowledged').then(updated => {
      setAlerts(prev => prev.map(a => a.id === id ? updated : a));
    });
  };

  const handleDispatch = (id: string) => {
    updateAlertStatus(id, 'acknowledged').then(updated => {
      alert(`[COMMAND CENTER BROADCAST]: Police patrol dispatch unit assigned to incident ${id}. Alert state updated.`);
      setAlerts(prev => prev.map(a => a.id === id ? updated : a));
    });
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSearch = 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.cameraName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.associatedPlate && a.associatedPlate.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSeverity && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-panel">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-mono tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            Real-Time Incidents & Safety Alert Dispatch Desk
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Automated anomaly detection triggering patrol dispatches, traffic advisory broadcasts, and incident audits.
          </p>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-all border ${
                severityFilter === sev
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-lg shadow-rose-950/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar Search & Status Tabs */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 glass-panel flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident title, plate number, camera or location..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg border ${statusFilter === 'active' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-slate-950 text-slate-400 border-slate-800'}`}
          >
            Active ({alerts.filter(a => a.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('acknowledged')}
            className={`px-3 py-1.5 rounded-lg border ${statusFilter === 'acknowledged' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-950 text-slate-400 border-slate-800'}`}
          >
            Acknowledged / Responded
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg border ${statusFilter === 'all' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-950 text-slate-400 border-slate-800'}`}
          >
            Show All Logs
          </button>
        </div>
      </div>

      {/* Grid of Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlerts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 font-mono text-sm">
            No active incidents matching the selected filter criteria.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={handleAcknowledge}
              onDispatch={handleDispatch}
            />
          ))
        )}
      </div>
    </div>
  );
};
