import React from 'react';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'degraded' | 'verified' | 'flagged' | 'blacklisted' | 'stolen' | 'vip' | 'critical' | 'high' | 'medium' | 'low';
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'sm' }) => {
  const getStyles = () => {
    switch (status) {
      case 'online':
      case 'verified':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-emerald';
      case 'degraded':
      case 'flagged':
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 glow-amber';
      case 'critical':
      case 'stolen':
      case 'blacklisted':
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 glow-rose';
      case 'offline':
      case 'low':
        return 'bg-slate-700/30 text-slate-400 border-slate-700';
      case 'vip':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 glow-cyan';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const displayText = label || status.toUpperCase();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-medium tracking-wide ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      } ${getStyles()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
      {displayText}
    </span>
  );
};
