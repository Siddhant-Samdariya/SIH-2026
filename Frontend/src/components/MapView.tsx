import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Camera, Alert } from '../types/itms';
import { StatusBadge } from './StatusBadge';

// Fix default Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  cameras?: Camera[];
  alerts?: Alert[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  selectedCameraId?: string;
  onSelectCamera?: (camera: Camera) => void;
}

// Map recenter component with primitive dependency checks to prevent infinite re-renders
const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  const lat = center[0];
  const lng = center[1];

  useEffect(() => {
    if (lat !== undefined && lng !== undefined) {
      map.setView([lat, lng], zoom);
    }
  }, [lat, lng, zoom, map]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  cameras = [],
  alerts = [],
  center = [20.5937, 78.9629], // India Center fallback, or default NCR Delhi
  zoom = 5,
  height = '500px',
  selectedCameraId,
  onSelectCamera
}) => {
  // Center override if cameras available with stable memoization
  const defaultCenter: [number, number] = React.useMemo(() => {
    return cameras && cameras.length > 0 ? [cameras[0].lat, cameras[0].lng] : center;
  }, [cameras, center]);
  const mapZoom = zoom > 5 ? zoom : 6;

  return (
    <div className="rounded-xl overflow-hidden border border-slate-800 shadow-2xl glass-panel relative" style={{ height }}>
      <MapContainer
        center={defaultCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeView center={defaultCenter} zoom={mapZoom} />

        {/* CartoDB Dark Matter map tiles for command center aesthetic */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> ITMS SIH 2026'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Render CCTV Camera markers */}
        {cameras
          .filter((cam) => typeof cam?.lat === 'number' && typeof cam?.lng === 'number' && !isNaN(cam.lat) && !isNaN(cam.lng))
          .map((cam) => {
          const color = cam.status === 'online' ? '#06b6d4' : cam.status === 'degraded' ? '#f59e0b' : '#64748b';

          return (
            <CircleMarker
              key={cam.id}
              center={[cam.lat, cam.lng]}
              radius={cam.id === selectedCameraId ? 12 : 8}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.8,
                weight: cam.id === selectedCameraId ? 4 : 2
              }}
              eventHandlers={{
                click: () => {
                  if (onSelectCamera) onSelectCamera(cam);
                }
              }}
            >
              <Popup>
                <div className="p-1 space-y-2 font-mono text-xs text-slate-100 min-w-[200px]">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                    <span className="font-bold text-cyan-400">{cam.id}</span>
                    <StatusBadge status={cam.status} />
                  </div>
                  <h4 className="font-bold font-sans text-sm text-slate-100">{cam.name}</h4>
                  <p className="text-[11px] text-slate-400 font-sans">{cam.location}</p>
                  
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] border-t border-slate-800">
                    <div>
                      <span className="text-slate-400 block">Density:</span>
                      <strong className="text-cyan-400">{cam.currentDensity}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Avg Speed:</span>
                      <strong className="text-emerald-400">{cam.avgSpeed} km/h</strong>
                    </div>
                  </div>

                  {onSelectCamera && (
                    <button
                      onClick={() => onSelectCamera(cam)}
                      className="w-full mt-2 py-1 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/40 text-[11px] font-bold hover:bg-cyan-500/30 transition-colors"
                    >
                      Inspect Camera CCTV Stream
                    </button>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Render Incident Alerts markers */}
        {alerts
          .filter((alert) => typeof alert?.lat === 'number' && typeof alert?.lng === 'number' && !isNaN(alert.lat) && !isNaN(alert.lng))
          .map((alert) => {
          const alertColor = alert.severity === 'critical' ? '#f43f5e' : alert.severity === 'high' ? '#f59e0b' : '#38bdf8';

          return (
            <CircleMarker
              key={alert.id}
              center={[alert.lat, alert.lng]}
              radius={10}
              pathOptions={{
                color: alertColor,
                fillColor: alertColor,
                fillOpacity: 0.9,
                weight: 3
              }}
            >
              <Popup>
                <div className="p-1 space-y-2 font-mono text-xs text-slate-100 min-w-[220px]">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                    <span className="font-bold text-rose-400">{alert.id}</span>
                    <StatusBadge status={alert.severity} label={alert.severity.toUpperCase()} />
                  </div>
                  <h4 className="font-bold font-sans text-sm text-rose-300">{alert.title}</h4>
                  <p className="text-[11px] text-slate-300 font-sans">{alert.description}</p>
                  <div className="text-[10px] text-slate-400">
                    Location: <strong className="text-slate-200">{alert.location}</strong>
                  </div>
                  {alert.associatedPlate && (
                    <div className="mt-1 px-2 py-0.5 bg-yellow-400 text-black font-bold text-[10px] rounded inline-block">
                      Plate: {alert.associatedPlate}
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Map Tactical Legend Overlay */}
      <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 shadow-2xl backdrop-blur-md font-mono text-[11px] text-slate-300 z-[1000] space-y-1.5 pointer-events-auto">
        <div className="font-bold text-slate-100 border-b border-slate-800 pb-1">Map Telemetry Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span>Online CCTV Node</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span>Critical Incident Alert</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Congestion / Pothole / Flood</span>
        </div>
      </div>
    </div>
  );
};
