import React, { useState, useEffect } from 'react';
import { getAiModuleStatuses, toggleModuleStatus } from '../api/detection';
import { AiModuleStatus } from '../types/itms';
import { DetectionCard } from '../components/DetectionCard';
import { Cpu, Zap, Activity, CheckCircle, RefreshCw } from 'lucide-react';

export const AiDetectionPage: React.FC = () => {
  const [modules, setModules] = useState<AiModuleStatus[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    getAiModuleStatuses().then(data => setModules(data));
  }, []);

  const handleToggle = (id: string) => {
    const target = modules.find(m => m.id === id);
    if (!target) return;
    const nextStatus = target.status === 'optimal' ? 'degraded' : 'optimal';
    toggleModuleStatus(id, nextStatus).then(updated => {
      setModules(prev => prev.map(m => m.id === id ? updated : m));
    });
  };

  const categories = ['All', 'Detection', 'Tracking', 'ANPR', 'Safety', 'Infrastructure'];

  const filteredModules = modules.filter(m => 
    activeCategory === 'All' || m.category === activeCategory
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-panel">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-mono tracking-wide flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            AI Computer Vision Model Architecture Matrix
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Overview of 13 deep-learning computer vision microservices running on FastAPI backend inference servers.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                activeCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 glass-panel font-mono text-xs">
        <div>
          <span className="text-slate-400 text-[10px] block">Active AI Models</span>
          <strong className="text-cyan-400 text-lg font-bold">{modules.length} / 13 Models</strong>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block font-sans font-normal">System Status</span>
          <strong className="text-emerald-400 text-lg font-bold">Ready</strong>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">Average Latency</span>
          <strong className="text-amber-400 text-lg font-bold">0 ms / Frame</strong>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">Pipeline Frame Rate</span>
          <strong className="text-slate-100 text-lg font-bold">0.0 FPS</strong>
        </div>
      </div>

      {/* Grid of 13 AI Capability Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredModules.map((mod) => (
          <DetectionCard key={mod.id} module={mod} onToggleStatus={handleToggle} />
        ))}
      </div>
    </div>
  );
};

export default AiDetectionPage;
