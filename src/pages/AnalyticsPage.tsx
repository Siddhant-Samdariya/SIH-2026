import React, { useState, useEffect } from 'react';
import { getTrafficAnalytics } from '../api/analytics';
import { TrafficDataPoint } from '../types/itms';
import { TrafficChart } from '../components/TrafficChart';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Inbox
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [trafficData, setTrafficData] = useState<TrafficDataPoint[]>([]);

  useEffect(() => {
    getTrafficAnalytics().then(data => setTrafficData(data || []));
  }, []);

  const congestionByRoad: { road: string; density: number; delayMinutes: number; status: string }[] = [];

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
            Metropolitan Traffic Analytics
          </h2>
          <p className="text-sm text-slate-600 font-normal mt-1">
            Aggregated traffic volume curves, route performance metrics, and road defect trend analysis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-secondary">
            <Calendar className="w-4 h-4" /> Last 24 Hours
          </button>
          <button className="btn-primary">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Section 1: Vehicle Density */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Vehicle Density</h3>
          <p className="text-xs text-slate-500">24-hour spatial occupancy and speed index across key corridors</p>
        </div>
        <TrafficChart
          data={trafficData}
          type="area"
          title="Hourly Vehicle Density (%) & Corridor Velocity (km/h)"
        />
      </div>

      {/* Section 2: Traffic Congestion by Location */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Traffic Congestion by Location</h3>
          <p className="text-xs text-slate-500">Current corridor density index and average travel delay</p>
        </div>

        <div className="urbansense-card p-6">
          {congestionByRoad.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm">No analytics data available yet</h4>
              <p className="text-xs text-slate-500">Corridor congestion telemetry will populate as live traffic feeds operate.</p>
            </div>
          ) : (
            <div className="space-y-3 font-sans text-xs">
              {congestionByRoad.map((item) => (
                <div key={item.road} className="space-y-1 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-slate-900 font-medium">
                    <span className="font-bold text-slate-900">{item.road}</span>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="text-slate-500">Delay: <strong className="text-slate-900">+{item.delayMinutes} mins</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Road Issues */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Road Defects & Infrastructure Anomalies Over Time</h3>
          <p className="text-xs text-slate-500">Detected road defects logged per 2-hour window</p>
        </div>
        <TrafficChart
          data={trafficData}
          type="line"
          title="Road Defect Detection Volume (24h Trend)"
        />
      </div>
    </div>
  );
};

export default AnalyticsPage;
