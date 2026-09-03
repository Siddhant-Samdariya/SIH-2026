import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface GisMarker {
  incident_id: string;
  type: string;
  category?: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  timestamp?: string;
  severity?: string;
  confidence?: number;
  status?: string;
}

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
  gisMarkers?: GisMarker[];
  fetchFromBackend?: boolean;
}

// Map recenter helper component
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
  center = [28.6139, 77.2090], // Default center (Delhi, India)
  zoom = 13,                   // Sensible default zoom level
  height = '500px',
  className = '',
  gisMarkers: initialGisMarkers,
  fetchFromBackend = true
}) => {
  const [markers, setMarkers] = useState<GisMarker[]>(initialGisMarkers || []);

  useEffect(() => {
    if (initialGisMarkers) {
      setMarkers(initialGisMarkers);
      return;
    }

    if (fetchFromBackend) {
      fetch('http://127.0.0.1:8000/api/gis/markers')
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          if (Array.isArray(data)) {
            setMarkers(data);
          }
        })
        .catch(err => console.warn('GIS Markers fetch fallback:', err));
    }
  }, [initialGisMarkers, fetchFromBackend]);

  const mapCenter: [number, number] = markers.length > 0 && markers[0].latitude && markers[0].longitude
    ? [markers[0].latitude, markers[0].longitude]
    : center;

  return (
    <div 
      className={`w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0 ${className}`} 
      style={{ height }}
    >
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        zoomControl={true}
        dragging={true}
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeView center={mapCenter} zoom={zoom} />

        {/* Base OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Render Backend GIS Incident Markers */}
        {markers
          .filter(m => typeof m.latitude === 'number' && typeof m.longitude === 'number' && !isNaN(m.latitude) && !isNaN(m.longitude))
          .map((m) => {
            const markerColor = m.severity === 'high' ? '#dc2626' : m.severity === 'medium' ? '#d97706' : '#2563eb';

            return (
              <CircleMarker
                key={m.incident_id || `${m.latitude}-${m.longitude}`}
                center={[m.latitude, m.longitude]}
                radius={10}
                pathOptions={{
                  color: markerColor,
                  fillColor: markerColor,
                  fillOpacity: 0.85,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 font-sans text-xs min-w-[200px]">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="font-bold font-mono text-[#1b365d]">{m.incident_id}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-slate-100 text-slate-700">
                        {m.severity || 'Normal'}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{m.title}</h4>
                    {m.description && <p className="text-[#475569] text-[11px]">{m.description}</p>}
                    {m.address && <p className="text-slate-400 text-[10px]">📍 {m.address}</p>}
                    <div className="pt-1 text-[10px] text-slate-500 font-mono flex justify-between border-t border-slate-100">
                      <span>Conf: {((m.confidence || 0) * 100).toFixed(0)}%</span>
                      <span>{m.timestamp ? m.timestamp.replace('T', ' ') : ''}</span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
      </MapContainer>
    </div>
  );
};

export const GISMap = MapView;
export default MapView;
