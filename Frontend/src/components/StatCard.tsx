import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'violet';
  borderGlow?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'cyan',
  borderGlow = false
}) => {
  const getColorTheme = () => {
    switch (color) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          accent: 'text-emerald-400',
          glow: 'border-emerald-500/30 shadow-emerald-500/10',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          accent: 'text-amber-400',
          glow: 'border-amber-500/30 shadow-amber-500/10',
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          accent: 'text-rose-400',
          glow: 'border-rose-500/30 shadow-rose-500/10',
        };
      case 'indigo':
        return {
          iconBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
          accent: 'text-indigo-400',
          glow: 'border-indigo-500/30 shadow-indigo-500/10',
        };
      case 'violet':
        return {
          iconBg: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
          accent: 'text-violet-400',
          glow: 'border-violet-500/30 shadow-violet-500/10',
        };
      case 'cyan':
      default:
        return {
          iconBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
          accent: 'text-cyan-400',
          glow: 'border-cyan-500/30 shadow-cyan-500/10',
        };
    }
  };

  const theme = getColorTheme();

  return (
    <div className={`p-4 rounded-xl bg-slate-900/80 border ${borderGlow ? theme.glow : 'border-slate-800'} backdrop-blur-md transition-all hover:border-slate-700 shadow-xl relative overflow-hidden group`}>
      {/* Decorative subtle background gradient blur */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-slate-800/40 blur-2xl group-hover:bg-slate-700/50 transition-colors"></div>

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-medium text-slate-400 tracking-wide font-sans">{title}</p>
          <h3 className="text-2xl font-bold text-slate-100 font-mono mt-1 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-[11px] text-slate-400 mt-1 font-mono">{subtitle}</p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg border ${theme.iconBg} transition-transform group-hover:scale-105`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono relative z-10">
          <span className="text-slate-400">Vs previous hour</span>
          <span className={`flex items-center gap-1 font-semibold ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
};
