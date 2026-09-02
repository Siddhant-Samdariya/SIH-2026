import React, { useState } from 'react';
import { useLiveTraffic } from '../hooks/useLiveTraffic';
import { MapView } from '../components/MapView';
import { Camera } from '../types/itms';
import { Eye, Inbox } from 'lucide-react';

export const TrafficMapPage: React.FC = () => {
  const { cameras, alerts } = useLiveTraffic();
  const [selectedCam, setSelectedCam] = useState<Camera | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'cameras' | 'incidents'>('all');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
            Metropolitan GIS Traffic Surveillance Map
          </h2>
          <p className="text-sm text-slate-600 font-normal mt-1">
            Spatial monitoring of municipal bus camera locations, incident hotspots, and road condition anomalies.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          {['all', 'cameras', 'incidents'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase transition-colors ${
                activeFilter === f
                  ? 'bg-[#1b365d] text-white'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <MapView
            center={[20.5937, 78.9629]}
            zoom={5}
            height="640px"
          />
        </div>

        {/* Right Inspector */}
        <div className="space-y-4">
          <div className="urbansense-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#1b365d]" /> Node Inspector
              </h3>
            </div>

            {selectedCam ? (
              <div className="space-y-3 font-sans text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-[#1b365d] text-sm">{selectedCam.id}</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px] rounded border border-emerald-200">
                    ● {selectedCam.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">{selectedCam.name}</h4>
                <p className="text-slate-500">{selectedCam.location}</p>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 font-mono">
                  <div className="flex justify-between text-slate-700">
                    <span>Coordinates:</span>
                    <strong className="text-slate-900">{selectedCam.lat.toFixed(4)}, {selectedCam.lng.toFixed(4)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Traffic Density:</span>
                    <strong className="text-amber-700">{selectedCam.currentDensity}%</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Avg Speed:</span>
                    <strong className="text-emerald-700">{selectedCam.avgSpeed} km/h</strong>
                  </div>
                </div>
              </div>
            ) : cameras.length === 0 && alerts.length === 0 ? (
              <div className="py-8 text-center space-y-2 font-sans">
                <Inbox className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No incidents to display</p>
                <p className="text-[11px] text-slate-400">Markers will render automatically when reported by backend services.</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-8 text-center font-sans">
                Select a GIS marker on the map to inspect details.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficMapPage;
