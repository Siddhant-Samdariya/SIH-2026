import React, { useState } from 'react';
import { useLiveTraffic } from '../hooks/useLiveTraffic';
import { TrafficChart } from '../components/TrafficChart';
import { MapView } from '../components/MapView';
import { 
  Video, 
  Activity, 
  AlertTriangle, 
  AlertCircle, 
  ShieldAlert, 
  Droplets, 
  Wrench, 
  Eye, 
  ArrowUpRight, 
  Check, 
  Layers, 
  Car, 
  FileText, 
  Cpu, 
  MapPin, 
  Gauge, 
  ShieldCheck, 
  Clock, 
  Radio, 
  CheckCircle2,
  Inbox
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LayerState {
  traffic: boolean;
  incidents: boolean;
  roadIssues: boolean;
  waterlogging: boolean;
  safety: boolean;
  cameras: boolean;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { cameras, alerts } = useLiveTraffic();

  // Layer toggles state for City Intelligence Map
  const [layers, setLayers] = useState<LayerState>({
    traffic: true,
    incidents: true,
    roadIssues: true,
    waterlogging: true,
    safety: true,
    cameras: true
  });

  const toggleLayer = (layerKey: keyof LayerState) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Top 4 Platform-Wide KPI Cards
  const kpiCards = [
    {
      title: 'ACTIVE MONITORING SOURCES',
      value: cameras.length ? `${cameras.length}` : '0',
      supporting: cameras.length ? `${cameras.filter(c => c.status === 'online').length} online` : '0 online',
      border: 'border-[#1b365d]',
      textColor: 'text-slate-900'
    },
    {
      title: 'EVENTS TODAY',
      value: '0',
      supporting: 'No events recorded',
      border: 'border-blue-600',
      textColor: 'text-blue-700'
    },
    {
      title: 'ROAD ISSUES',
      value: '0',
      supporting: '0 require attention',
      border: 'border-amber-600',
      textColor: 'text-amber-700'
    },
    {
      title: 'SAFETY ALERTS',
      value: alerts.length ? `${alerts.length}` : '0',
      supporting: '0 critical',
      border: 'border-red-600',
      textColor: 'text-red-700'
    }
  ];

  // AI Detection Activity Data
  const aiActivityData = [
    { label: 'Vehicles', count: '0', percentage: 0, color: 'bg-[#1b365d]' },
    { label: 'Number Plates', count: '0', percentage: 0, color: 'bg-blue-600' },
    { label: 'Traffic Signs', count: '0', percentage: 0, color: 'bg-cyan-600' },
    { label: 'Potholes', count: '0', percentage: 0, color: 'bg-amber-600' },
    { label: 'Safety Events', count: '0', percentage: 0, color: 'bg-red-600' },
    { label: 'Waterlogging', count: '0', percentage: 0, color: 'bg-sky-600' },
    { label: 'Infrastructure Issues', count: '0', percentage: 0, color: 'bg-purple-600' }
  ];

  // Road & Infrastructure Data
  const roadInfraData = [
    { label: 'Potholes', count: '0', icon: Wrench, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { label: 'Waterlogging', count: '0', icon: Droplets, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'Road Damage', count: '0', icon: AlertTriangle, color: 'text-orange-600 bg-orange-50 border-orange-200' },
    { label: 'Missing Road Dividers', count: '0', icon: ShieldAlert, color: 'text-red-600 bg-red-50 border-red-200' },
    { label: 'Missing Zebra Crossings', count: '0', icon: Eye, color: 'text-slate-600 bg-slate-100 border-slate-200' },
    { label: 'Traffic Sign Issues', count: '0', icon: AlertCircle, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' }
  ];

  // AI System Status Pipelines
  const aiPipelines = [
    { name: 'Vehicle Detection', status: 'Online' },
    { name: 'Vehicle Tracking', status: 'Online' },
    { name: 'ANPR', status: 'Online' },
    { name: 'OCR', status: 'Online' },
    { name: 'Pothole Detection', status: 'Online' },
    { name: 'Traffic Analysis', status: 'Online' },
    { name: 'Waterlogging Detection', status: 'Online' },
    { name: 'Safety Detection', status: 'Online' },
    { name: 'Infrastructure Analysis', status: 'Online' }
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
            Urban Intelligence Overview
          </h2>
          <p className="text-sm text-slate-600 font-normal mt-1">
            Real-time AI-powered intelligence for traffic, roads, infrastructure and public safety.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/live-fleet')}
            className="btn-primary"
          >
            <Video className="w-4 h-4" />
            Launch Live Monitoring
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.title} className={`urbansense-card p-5 border-l-4 ${card.border}`}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
            <h3 className={`text-3xl font-extrabold mt-1 ${card.textColor}`}>{card.value}</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">{card.supporting}</p>
          </div>
        ))}
      </div>

      {/* CITY INTELLIGENCE MAP & LIVE AI EVENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GIS MAP */}
        <div className="lg:col-span-2 urbansense-card p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">GIS MAP</h3>
              <p className="text-xs text-slate-500">GIS spatial view of detected incidents and monitoring nodes</p>
            </div>
          </div>

          {/* Layer Control UI Checkboxes */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-600" /> Layers:
            </span>
            {(['traffic', 'incidents', 'roadIssues', 'waterlogging', 'safety', 'cameras'] as (keyof LayerState)[]).map((key) => {
              const labels: Record<keyof LayerState, string> = {
                traffic: 'Traffic',
                incidents: 'Incidents',
                roadIssues: 'Road Issues',
                waterlogging: 'Waterlogging',
                safety: 'Safety',
                cameras: 'Cameras'
              };
              return (
                <label key={key} className="inline-flex items-center gap-1.5 cursor-pointer hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={layers[key]}
                    onChange={() => toggleLayer(key)}
                    className="rounded border-slate-300 text-[#1b365d] focus:ring-0 cursor-pointer"
                  />
                  <span>{labels[key]}</span>
                </label>
              );
            })}
          </div>

          {/* Interactive GIS Map View */}
          <div className="relative">
            <MapView cameras={cameras} alerts={alerts} height="400px" zoom={6} />
          </div>

          {/* Map Legend */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-sans">
            <span className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">Map Legend:</span>
            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Camera / Monitoring Source
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> Incident Alert
              </span>
            </div>
          </div>
        </div>

        {/* Live Events Card */}
        <div className="urbansense-card p-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Live Events</h3>
              <p className="text-xs text-slate-500">Real-time computer vision alerts</p>
            </div>
            <button
              onClick={() => navigate('/incidents')}
              className="text-xs text-[#1b365d] hover:underline font-semibold flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Vertical Scrollable Feed or Clean Empty State */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] p-6 text-center">
            {alerts && alerts.length > 0 ? (
              <div className="w-full space-y-3">
                {alerts.map((evt) => (
                  <div key={evt.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-left space-y-1">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-red-100 text-red-800 uppercase">
                      {evt.severity}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs mt-1">{evt.title}</h4>
                    <p className="text-xs text-slate-600">{evt.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 py-8">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Inbox className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-700 text-sm">No AI events recorded</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  New detections will appear here automatically when reported by active computer vision pipelines.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI DETECTION ACTIVITY & TRAFFIC INTELLIGENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* AI Detection Activity */}
        <div className="urbansense-card p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">AI Detection Activity</h3>
            <p className="text-xs text-slate-500">Computer vision inference counts across active city pipelines</p>
          </div>

          <div className="space-y-3 pt-1">
            {aiActivityData.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  <span className="font-mono font-bold text-slate-900">{item.count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Intelligence */}
        <div className="urbansense-card p-5 space-y-4 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Traffic Intelligence</h3>
            <p className="text-xs text-slate-500">Macro city traffic density & velocity analytics</p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Vehicles Detected</p>
              <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">0</h4>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Traffic Density</p>
              <h4 className="text-xl font-extrabold text-blue-700 mt-0.5">0%</h4>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Average Speed</p>
              <h4 className="text-xl font-extrabold text-emerald-700 mt-0.5">0 <span className="text-xs font-normal text-slate-500">km/h</span></h4>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Congestion</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded border border-emerald-300">
                OPTIMAL
              </span>
            </div>
          </div>

          {/* Traffic Density Trend Chart */}
          <div className="pt-2">
            <TrafficChart
              data={[]}
              type="area"
              title="Spatial Traffic Density (%) & Velocity Trend"
            />
          </div>
        </div>
      </div>

      {/* ROAD & INFRASTRUCTURE / AI SYSTEM STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Road & Infrastructure */}
        <div className="urbansense-card p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Road & Infrastructure</h3>
            <p className="text-xs text-slate-500">Physical road surface defects & municipal asset status</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {roadInfraData.map((item) => {
              const IconComp = item.icon;
              return (
                <div key={item.label} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.color}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-xl font-extrabold text-slate-900 font-mono">{item.count}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 leading-snug">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI System Status */}
        <div className="urbansense-card p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">AI System Status</h3>
              <p className="text-xs text-slate-500">Health of active computer vision inference pipelines</p>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              9 / 9 Operational
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {aiPipelines.map((pipe) => (
              <div
                key={pipe.name}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <span className="text-xs font-semibold text-slate-800 truncate">{pipe.name}</span>
                <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  {pipe.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardPage;
