import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Car, 
  Printer, 
  ShieldCheck, 
  ExternalLink, 
  X, 
  Clock, 
  Search,
  ChevronRight,
  Filter,
  FileText,
  Inbox
} from 'lucide-react';
import { MapView } from '../components/MapView';

interface IncidentItem {
  id: string;
  type: string;
  vehicle?: string;
  location: string;
  time: string;
  date: string;
  confidence: number;
  plateConfidence?: number;
  status: 'Open' | 'Investigating' | 'Resolved';
  detectingBus: string;
  lat: number;
  lng: number;
  speed: string;
  makeModel?: string;
  color?: string;
  registeredOwner?: string;
  timeline: { time: string; event: string }[];
  priorWarning?: string;
}

export const IncidentsPage: React.FC = () => {
  const incidentsList: IncidentItem[] = [];

  const [incidents, setIncidents] = useState<IncidentItem[]>(incidentsList);
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const activeCount = incidents.filter(i => i.status === 'Open').length;
  const investigatingCount = incidents.filter(i => i.status === 'Investigating').length;
  const resolvedCount = incidents.filter(i => i.status === 'Resolved').length;

  const handleMarkResolved = (id: string) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: 'Resolved' } : i));
    if (selectedIncident && selectedIncident.id === id) {
      setSelectedIncident(prev => prev ? { ...prev, status: 'Resolved' } : null);
    }
  };

  const filteredIncidents = incidents.filter(i => {
    if (filterStatus === 'All') return true;
    return i.status === filterStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="urbansense-card p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active</p>
          <h3 className="text-3xl font-extrabold text-red-600 mt-1">{activeCount}</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Require immediate dispatch / action</p>
        </div>

        <div className="urbansense-card p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Investigating</p>
          <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{investigatingCount}</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium font-sans">Assigned to patrol units</p>
        </div>

        <div className="urbansense-card p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved</p>
          <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{resolvedCount}</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Audited & closed today</p>
        </div>
      </div>

      {/* Incident List Table */}
      <div className="urbansense-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Incident Investigation Registry</h3>
            <p className="text-xs text-slate-500 font-sans">Real-time incident detection telemetry logs</p>
          </div>

          <div className="flex items-center gap-2">
            {['All', 'Open', 'Investigating', 'Resolved'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  filterStatus === st
                    ? 'bg-[#1b365d] text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {filteredIncidents.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-white">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">No incidents yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no active or historical incidents logged by the computer vision network.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Vehicle</th>
                  <th className="py-3 px-5">Location</th>
                  <th className="py-3 px-5">Time</th>
                  <th className="py-3 px-5">Confidence</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-sans">
                {filteredIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${
                          inc.status === 'Open' ? 'text-red-600' : inc.status === 'Investigating' ? 'text-amber-600' : 'text-emerald-600'
                        }`} />
                        <span>{inc.type}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 font-mono text-xs">
                      {inc.vehicle ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-slate-900 font-extrabold rounded border border-amber-300">
                          {inc.vehicle}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-slate-700 text-xs">
                      {inc.location}
                    </td>

                    <td className="py-3.5 px-5 text-slate-600 text-xs font-mono">
                      {inc.time}
                    </td>

                    <td className="py-3.5 px-5 text-xs font-mono font-bold text-slate-800">
                      {inc.confidence}%
                    </td>

                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                        inc.status === 'Open'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : inc.status === 'Investigating'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        ● {inc.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIncident(inc);
                        }}
                        className="btn-secondary py-1 px-3 text-xs"
                      >
                        Investigate →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Incident Detail Full View / Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl overflow-hidden max-h-[92vh] flex flex-col my-auto">
            {/* Modal Header Bar */}
            <div className="p-6 border-b border-slate-100 bg-[#f8fafc] flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  INCIDENT #{selectedIncident.id}
                </p>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5 font-sans tracking-tight">
                  {selectedIncident.type} Investigation
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => alert(`Report generated for ${selectedIncident.id}`)}
                  className="btn-secondary"
                >
                  <Printer className="w-4 h-4" />
                  Generate Report
                </button>
                {selectedIncident.status !== 'Resolved' ? (
                  <button
                    onClick={() => handleMarkResolved(selectedIncident.id)}
                    className="btn-primary"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Mark Resolved
                  </button>
                ) : (
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-300">
                    ✓ Resolved
                  </span>
                )}
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 bg-[#f8fafc]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 urbansense-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-red-600 text-white font-mono text-[10px] font-bold rounded flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                      LIVE FEED SNIPPET
                    </span>
                    <span className="text-xs font-mono text-slate-500">VELOCITY: {selectedIncident.speed}</span>
                  </div>

                  <div className="relative rounded-lg overflow-hidden bg-slate-950 aspect-[16/9] shadow-inner flex items-center justify-center text-slate-400">
                    <p className="text-xs font-mono">Captured Incident Stream Frame</p>
                  </div>
                </div>

                <div className="urbansense-card p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">INCIDENT LOCATION</h4>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                    <div>
                      <p className="text-slate-500">LAT: {selectedIncident.lat.toFixed(4)}</p>
                      <p className="text-slate-500">LNG: {selectedIncident.lng.toFixed(4)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentsPage;
