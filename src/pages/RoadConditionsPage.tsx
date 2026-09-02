import React, { useState } from 'react';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Download, 
  Calendar, 
  X, 
  ShieldAlert, 
  Droplets,
  Layers,
  Inbox
} from 'lucide-react';

interface RoadIssueItem {
  id: string;
  category: 'Potholes' | 'Road damage' | 'Waterlogging' | 'Traffic signs' | 'Road infrastructure';
  location: string;
  confidence: number;
  detectingBus: string;
  timestamp: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Investigating' | 'Resolved';
  image: string;
  details: string;
}

export const RoadConditionsPage: React.FC = () => {
  const issuesList: RoadIssueItem[] = [];

  const [issues, setIssues] = useState<RoadIssueItem[]>(issuesList);
  const [selectedIssue, setSelectedIssue] = useState<RoadIssueItem | null>(null);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
            City Infrastructure Health
          </h2>
          <p className="text-sm text-slate-600 font-normal mt-1 max-w-2xl">
            Real-time telemetry and historical analysis of road conditions, surface degradation, and structural integrity across the municipal grid.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-secondary">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button className="btn-primary">
            <Calendar className="w-4 h-4 text-cyan-300" /> Schedule Survey
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Surface Degradation */}
        <div className="lg:col-span-2 urbansense-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Surface Degradation</h3>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-mono font-bold rounded border border-emerald-200">
              Optimal
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-1 font-sans border-l-2 border-emerald-600 pl-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">ACTIVE POTHOLES</p>
              <h4 className="text-2xl font-extrabold text-slate-900 mt-0.5">0</h4>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">No active defects</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">REPAIRED (7D)</p>
              <h4 className="text-2xl font-extrabold text-slate-900 mt-0.5">0</h4>
              <p className="text-[11px] font-medium text-emerald-600 mt-0.5">On schedule</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">AVG DEPTH</p>
              <h4 className="text-2xl font-extrabold text-slate-900 mt-0.5">0 cm</h4>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">Severity: Normal</p>
            </div>
          </div>
        </div>

        {/* Card 2: Drainage & Water */}
        <div className="urbansense-card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Drainage & Water</h3>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">CURRENT WATERLOGGING EVENTS</p>
            <h4 className="text-3xl font-extrabold text-slate-900 mt-1">0</h4>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-emerald-500 h-full w-full rounded-full"></div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase">BLOCKED DRAINS REPORTED</p>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-0.5">0</h4>
          </div>
        </div>
      </div>

      {/* Infrastructure & Signage */}
      <div className="urbansense-card p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Infrastructure & Signage</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase">SIGN VISIBILITY SCORE</p>
            <h3 className="text-4xl font-extrabold text-[#1b365d] mt-1">100%</h3>
            <p className="text-[11px] text-slate-500 mt-1">Based on telemetry scans</p>
          </div>

          <div className="md:col-span-3 overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 uppercase text-[10px] font-semibold">
                  <th className="pb-2">Asset Category</th>
                  <th className="pb-2">Total Inspected</th>
                  <th className="pb-2">Requires Maintenance</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">Traffic Lights</td>
                  <td className="py-2.5 text-slate-600">0</td>
                  <td className="py-2.5 text-slate-600">0</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold text-[10px]">GOOD</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">Street Lighting</td>
                  <td className="py-2.5 text-slate-600">0</td>
                  <td className="py-2.5 text-slate-600">0</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold text-[10px]">GOOD</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">Road Markings</td>
                  <td className="py-2.5 text-slate-600">0 km</td>
                  <td className="py-2.5 text-slate-600">0 km</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold text-[10px]">GOOD</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detailed Detected Road Issues Table */}
      <div className="urbansense-card overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">Detected Municipal Road Defect Records</h3>
          <p className="text-xs text-slate-500">Real-time computer vision scans logged by active bus fleet cameras</p>
        </div>

        {issues.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-white">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">No road condition issues detected</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Active computer vision scans logged by municipal cameras will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Location</th>
                  <th className="py-3 px-5">Confidence</th>
                  <th className="py-3 px-5">Detecting Bus</th>
                  <th className="py-3 px-5">Timestamp</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-sans">
                {issues.map((iss) => (
                  <tr
                    key={iss.id}
                    onClick={() => setSelectedIssue(iss)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      <span className="px-2.5 py-1 bg-slate-100 rounded text-xs font-semibold border border-slate-200">
                        {iss.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-700 text-xs font-medium">
                      {iss.location}
                    </td>
                    <td className="py-3.5 px-5 text-xs font-mono font-bold text-emerald-600">
                      {iss.confidence}%
                    </td>
                    <td className="py-3.5 px-5 text-xs font-mono font-semibold text-slate-800">
                      {iss.detectingBus}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-500 font-mono">
                      {iss.timestamp}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                        iss.status === 'Open'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : iss.status === 'Investigating'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        ● {iss.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button className="btn-secondary py-1 px-3 text-xs">
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadConditionsPage;
