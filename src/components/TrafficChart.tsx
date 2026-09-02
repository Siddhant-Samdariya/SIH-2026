import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { TrafficDataPoint } from '../types/itms';
import { BarChart3 } from 'lucide-react';

interface TrafficChartProps {
  data: TrafficDataPoint[];
  type?: 'area' | 'bar' | 'pie' | 'line';
  title?: string;
}

export const TrafficChart: React.FC<TrafficChartProps> = ({
  data = [],
  type = 'area',
  title = 'Traffic Density & Volume Telemetry'
}) => {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="urbansense-card p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-900 text-sm tracking-wide">{title}</h3>
        <span className="text-xs text-slate-500 font-mono">Real-time Telemetry</span>
      </div>

      <div className="h-64 w-full">
        {!hasData ? (
          <div className="h-full w-full flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-lg text-slate-400 space-y-2 bg-slate-50/50">
            <BarChart3 className="w-8 h-8 text-slate-300" />
            <p className="text-xs font-semibold text-slate-500 font-sans">No analytics data available yet</p>
          </div>
        ) : (
          <>
            {type === 'area' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDensityLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1b365d" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1b365d" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorSpeedLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                  <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="density" name="Density %" stroke="#1b365d" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDensityLight)" />
                  <Area type="monotone" dataKey="avgSpeed" name="Avg Speed (km/h)" stroke="#16a34a" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSpeedLight)" />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {type === 'bar' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                  <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="vehiclesCount" name="Vehicles/hr" fill="#1b365d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {type === 'line' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                  <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="congestionLevel" name="Defects / Anomalies" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 4, fill: '#dc2626' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </div>
    </div>
  );
};
