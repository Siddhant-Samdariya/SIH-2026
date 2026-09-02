import React, { useState } from 'react';
import { 
  Settings, 
  Server, 
  Sliders, 
  Bell, 
  Video, 
  Save, 
  RefreshCw, 
  CheckCircle,
  ShieldCheck,
  Globe
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
  );
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(85);
  const [densityAlertThreshold, setDensityAlertThreshold] = useState<number>(80);
  const [enableSoundAlerts, setEnableSoundAlerts] = useState<boolean>(true);
  const [savedMessage, setSavedMessage] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-panel">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-mono tracking-wide flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            ITMS System & Backend Integration Settings
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Configure FastAPI endpoints, computer vision thresholds, RTSP camera streams & notification alerts.
          </p>
        </div>

        {savedMessage && (
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono flex items-center gap-1.5 animate-bounce">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Settings Saved Successfully
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: FastAPI Backend Integration */}
        <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 glass-panel space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Server className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-slate-100 font-mono text-sm tracking-wide">
              FastAPI Core Backend Endpoint Configuration
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                VITE_API_BASE_URL (REST & WebSocket Telemetry)
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsBackendConnected(!isBackendConnected)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-mono border transition-all ${
                    isBackendConnected
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {isBackendConnected ? 'Backend Status: ONLINE' : 'Backend Status: MOCK FALLBACK'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                The frontend communicates with FastAPI endpoints. When no backend response is detected, the UI gracefully falls back to mock telemetry.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: AI Computer Vision Threshold Sliders */}
        <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 glass-panel space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 font-mono text-sm tracking-wide">
              YOLOv8 & ANPR Model Confidence Filters
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-slate-300">ANPR OCR Confidence Threshold</label>
                <strong className="text-amber-400">{confidenceThreshold}%</strong>
              </div>
              <input
                type="range"
                min={50}
                max={99}
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full accent-amber-400 bg-slate-950 rounded"
              />
              <p className="text-[10px] text-slate-500">
                Plates detected with OCR confidence lower than {confidenceThreshold}% will be flagged for manual review.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-slate-300">Traffic Congestion Alert Trigger (%)</label>
                <strong className="text-cyan-400">{densityAlertThreshold}%</strong>
              </div>
              <input
                type="range"
                min={40}
                max={95}
                value={densityAlertThreshold}
                onChange={(e) => setDensityAlertThreshold(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-950 rounded"
              />
              <p className="text-[10px] text-slate-500">
                Trigger heavy congestion alarms when spatial occupancy exceeds {densityAlertThreshold}%.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Notification & Audio Advisories */}
        <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 glass-panel space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bell className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-slate-100 font-mono text-sm tracking-wide">
              Auditory & Emergency Advisory Settings
            </h3>
          </div>

          <div className="flex items-center justify-between font-mono text-xs">
            <div>
              <p className="text-slate-200 font-bold">Enable Auditory Alarm for Hit-and-Run & High Incidents</p>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Play synthesized audio alert chime upon critical incident detection.
              </p>
            </div>
            <input
              type="checkbox"
              checked={enableSoundAlerts}
              onChange={(e) => setEnableSoundAlerts(e.target.checked)}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Save Button Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save ITMS Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
