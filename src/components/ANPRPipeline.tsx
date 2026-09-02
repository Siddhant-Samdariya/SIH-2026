import React from 'react';
import { 
  Video, 
  Car, 
  Crop, 
  FileCode2, 
  CheckCircle2, 
  ArrowRight, 
  Scan,
  ShieldCheck
} from 'lucide-react';
import { ANPRRecord } from '../types/itms';

interface ANPRPipelineProps {
  latestRecord?: ANPRRecord;
}

export const ANPRPipeline: React.FC<ANPRPipelineProps> = ({ latestRecord }) => {
  const current = latestRecord || {
    id: 'ANPR-901',
    plateNumber: 'MP04AB1234',
    vehicleType: 'Car',
    cameraId: 'CAM-04',
    cameraName: 'HITECH City Mindspace',
    location: 'Cyber Towers Junction',
    timestamp: '20:41:32',
    confidence: 96.8,
    status: 'verified',
    speed: 48,
    ownerName: 'Ramesh Sharma'
  };

  const steps = [
    { id: 1, name: 'Video Frame', desc: '4K CCTV Raw Stream', icon: Video, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
    { id: 2, name: 'Vehicle Detection', desc: 'YOLOv8x Bounding Box', icon: Car, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
    { id: 3, name: 'Plate Detection', desc: 'Plate ROI Localization', icon: Scan, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    { id: 4, name: 'Plate Crop', desc: 'Bilinear Upscale & Deskew', icon: Crop, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/30' },
    { id: 5, name: 'OCR Engine', desc: 'CRNN Text Extraction', icon: FileCode2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  ];

  return (
    <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5 glass-panel">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Scan className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-slate-100 font-mono text-sm tracking-wide">
            ANPR Computer Vision Inference Pipeline
          </h3>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Latency: 45ms
        </span>
      </div>

      {/* 5-Step Pipeline Flowchart */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative flex flex-col">
              <div className={`p-3 rounded-lg border ${step.bg} transition-all hover:scale-105 flex flex-col items-center text-center space-y-2 relative z-10 shadow-lg`}>
                <div className="w-8 h-8 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center font-mono text-xs font-bold text-slate-200">
                  {step.id}
                </div>
                <Icon className={`w-6 h-6 ${step.color}`} />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{step.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{step.desc}</p>
                </div>
              </div>

              {/* Arrow Connector for Desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-slate-600">
                  <ArrowRight className="w-4 h-4 text-cyan-500 animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recognized ANPR Panel Box */}
      <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-center">
        {/* Crop Simulated License Plate Box */}
        <div className="p-3 rounded-lg bg-slate-900 border border-amber-500/40 flex flex-col items-center justify-center shadow-inner font-mono text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">OCR Plate Crop</span>
          <div className="px-3 py-1.5 bg-yellow-400 text-black font-extrabold text-base tracking-widest rounded border border-black shadow">
            {current.plateNumber}
          </div>
          <span className="text-[9px] text-amber-400 mt-1 font-semibold">IND - High Security Plate</span>
        </div>

        <div>
          <p className="text-[10px] text-slate-400 font-mono uppercase">Recognized Plate</p>
          <p className="text-lg font-bold font-mono text-cyan-400 mt-0.5">{current.plateNumber}</p>
        </div>

        <div>
          <p className="text-[10px] text-slate-400 font-mono uppercase">Confidence Score</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${current.confidence}%` }}></div>
            </div>
            <span className="text-sm font-bold font-mono text-emerald-400">{current.confidence}%</span>
          </div>
        </div>

        <div>
          <p className="text-[10px] text-slate-400 font-mono uppercase">Vehicle & Speed</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5 font-mono">{current.vehicleType} • {current.speed} km/h</p>
        </div>

        <div>
          <p className="text-[10px] text-slate-400 font-mono uppercase">Timestamp & Cam</p>
          <p className="text-xs text-slate-300 font-mono mt-0.5">{current.timestamp} • {current.cameraId}</p>
        </div>
      </div>
    </div>
  );
};
