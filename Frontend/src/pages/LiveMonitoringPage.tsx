import React, { useState } from 'react';
import { useLiveTraffic } from '../hooks/useLiveTraffic';
import { VideoPlayer } from '../components/VideoPlayer';
import { ANPRPipeline } from '../components/ANPRPipeline';
import { ANPRTable } from '../components/ANPRTable';
import { Camera } from '../types/itms';
import { 
  Video, 
  Target, 
  Layers, 
  Activity, 
  Cpu, 
  CheckCircle,
  Clock,
  Car,
  Truck,
  Bus,
  Scan
} from 'lucide-react';

export const LiveMonitoringPage: React.FC = () => {
  const { cameras, anprList } = useLiveTraffic();
  const [selectedCam, setSelectedCam] = useState<Camera>(
    cameras[0] || {
      id: 'CAM-01',
      name: 'Connaught Place Outer Ring',
      location: 'CP Radial 3, New Delhi',
      junction: 'Radial Road Junction',
      city: 'New Delhi',
      lat: 28.6315,
      lng: 77.2167,
      status: 'online',
      streamUrl: '',
      resolution: '3840x2160 (4K)',
      fps: 30,
      currentDensity: 74,
      avgSpeed: 38,
      activeAlerts: 2,
      lastPing: 'Just now'
    }
  );

  // Live real-time detections stream for right panel
  const liveDetections = [
    { id: '#42', class: 'Car', confidence: 94, plate: 'MP04AB1234', speed: 52, status: 'Tracking Active' },
    { id: '#108', class: 'Bus', confidence: 98, plate: 'DL01CA4589', speed: 38, status: 'OCR Verified' },
    { id: '#215', class: 'Truck', confidence: 91, plate: 'MH12DE5678', status: 'Flagged Fleet' },
    { id: '#89', class: 'Motorcycle', confidence: 89, plate: 'KA05HA9911', speed: 64, status: 'Normal' },
    { id: '#312', class: 'Auto-Rickshaw', confidence: 95, plate: 'UP32EA4321', speed: 28, status: 'Alert Stolen' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-panel">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-mono tracking-wide flex items-center gap-2">
            <Video className="w-5 h-5 text-cyan-400" />
            CCTV Video Analysis & Real-Time Computer Vision Matrix
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            4K Multi-Stream YOLOv8x Bounding Box Localization, DeepSORT Tracking & License Plate OCR Pipeline.
          </p>
        </div>

        {/* Camera Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
          {cameras.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCam(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                selectedCam.id === c.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {c.id}
            </button>
          ))}
        </div>
      </div>

      {/* Main Video & Detection Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Central Video Player */}
        <div className="lg:col-span-2 space-y-4">
          <VideoPlayer
            camera={selectedCam}
            camerasList={cameras}
            onSelectCamera={(c) => setSelectedCam(c)}
          />

          {/* Bottom Telemetry Statistics Bar */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 glass-panel grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Frame Rate</span>
              <strong className="text-cyan-400 text-sm font-bold">{selectedCam.fps} FPS</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Current Density</span>
              <strong className="text-amber-400 text-sm font-bold">{selectedCam.currentDensity}%</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Average Speed</span>
              <strong className="text-emerald-400 text-sm font-bold">{selectedCam.avgSpeed} km/h</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Node Location</span>
              <strong className="text-slate-200 text-xs truncate block">{selectedCam.city}</strong>
            </div>
          </div>
        </div>

        {/* Right Col: Real-time Detections Stream Panel */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 glass-panel space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-100 font-mono text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Live Object Detection Telemetry
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            {/* Live Detection Item Cards */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {liveDetections.map((det) => (
                <div
                  key={det.id}
                  className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all font-mono space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-400">{det.class} {det.id}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                      Conf: {det.confidence}%
                    </span>
                  </div>

                  {det.plate && (
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400 text-[11px]">Plate OCR:</span>
                      <span className="px-2 py-0.5 bg-yellow-400 text-black font-extrabold rounded text-[11px]">
                        {det.plate}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Speed: {det.speed || 40} km/h</span>
                    <span className="text-slate-300 font-semibold">{det.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ANPR Pipeline Flowchart */}
      <ANPRPipeline latestRecord={anprList[0]} />

      {/* ANPR Historical Records Table */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-100 font-mono text-base tracking-wide flex items-center gap-2">
          <Scan className="w-5 h-5 text-amber-400" />
          ANPR Vehicle Detection Records
        </h3>
        <ANPRTable records={anprList} />
      </div>
    </div>
  );
};
