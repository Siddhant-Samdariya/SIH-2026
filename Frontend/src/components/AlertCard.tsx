import React from 'react';
import { Alert } from '../types/itms';
import { StatusBadge } from './StatusBadge';
import { 
  AlertTriangle, 
  MapPin, 
  Camera, 
  Clock, 
  ShieldAlert, 
  CheckCircle, 
  Send,
  ExternalLink
} from 'lucide-react';

interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: (id: string) => void;
  onDispatch?: (id: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onAcknowledge, onDispatch }) => {
  const getSeverityBorder = () => {
    switch (alert.severity) {
      case 'critical':
        return 'border-rose-500/50 bg-rose-950/20 shadow-rose-950/40 glow-rose';
      case 'high':
        return 'border-amber-500/50 bg-amber-950/20 shadow-amber-950/40 glow-amber';
      case 'medium':
        return 'border-cyan-500/40 bg-slate-900/90 shadow-cyan-950/30';
      case 'low':
      default:
        return 'border-slate-800 bg-slate-900/90';
    }
  };

  return (
    <div className={`p-4 rounded-xl border ${getSeverityBorder()} backdrop-blur-md shadow-xl transition-all hover:scale-[1.01] flex flex-col justify-between space-y-3`}>
      {/* Top Title & Severity Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${alert.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-100 text-sm tracking-wide">{alert.title}</h4>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{alert.id} • {alert.timestamp}</p>
          </div>
        </div>
        <StatusBadge status={alert.severity} label={`${alert.severity.toUpperCase()} PRIORITY`} />
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
        {alert.description}
      </p>

      {/* Associated Meta Info */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          <span className="truncate">{alert.cameraName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          <span className="truncate">{alert.location}</span>
        </div>

        {alert.associatedPlate && (
          <div className="col-span-2 mt-1 p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-between">
            <span>Associated Plate Tag:</span>
            <span className="px-2 py-0.5 bg-yellow-400 text-black font-extrabold rounded text-[11px]">
              {alert.associatedPlate}
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="text-[11px] font-mono text-slate-400">
          AI Confidence: <strong className="text-cyan-400">{alert.confidence}%</strong>
        </div>

        <div className="flex items-center gap-2">
          {alert.status === 'active' ? (
            <>
              {onAcknowledge && (
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Ack
                </button>
              )}
              {onDispatch && (
                <button
                  onClick={() => onDispatch(alert.id)}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-mono border border-rose-500/40 transition-colors flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Patrol
                </button>
              )}
            </>
          ) : (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              {alert.status.toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
