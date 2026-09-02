import React from 'react';
import { AiModuleStatus } from '../types/itms';
import { StatusBadge } from './StatusBadge';
import { Cpu, Activity, Clock, Zap } from 'lucide-react';

interface DetectionCardProps {
  module: AiModuleStatus;
  onToggleStatus?: (id: string) => void;
}

export const DetectionCard: React.FC<DetectionCardProps> = ({ module, onToggleStatus }) => {
  return (
    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 glass-panel">
      {/* Module Title & Category */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-100 text-sm font-sans tracking-wide">{module.name}</h4>
            <span className="text-[10px] font-mono text-slate-400">{module.category} Engine</span>
          </div>
        </div>
        <StatusBadge status={module.status === 'optimal' ? 'online' : module.status === 'degraded' ? 'degraded' : 'offline'} label={module.status.toUpperCase()} />
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-2">
        {module.description}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs font-mono">
        <div>
          <span className="text-[10px] text-slate-400 block">Detections</span>
          <strong className="text-slate-100 font-bold text-sm">{(module.detectionsToday / 1000).toFixed(1)}k</strong>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Confidence</span>
          <strong className="text-emerald-400 font-bold text-sm">{module.avgConfidence}%</strong>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Latency</span>
          <strong className="text-amber-400 font-bold text-sm">{module.latencyMs}ms</strong>
        </div>
      </div>

      {/* Recent Event Snippet */}
      <div className="p-2 rounded bg-slate-950/40 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <span className="truncate text-slate-300">Latest: {module.recentEvent}</span>
        <span className="text-cyan-400 font-semibold">{module.fps} FPS</span>
      </div>
    </div>
  );
};
