import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
  cameras?: any[];
  alerts?: any[];
  selectedCameraId?: string;
  onSelectCamera?: (camera: any) => void;
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
  center = [20.5937, 78.9629], // Default center for Indian deployment context
  zoom = 5,                    // Default zoom level
  height = '500px',
  className = ''
}) => {
  return (
    <div 
      className={`w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0 ${className}`} 
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        zoomControl={true}
        dragging={true}
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeView center={center} zoom={zoom} />

        {/* Base OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
      </MapContainer>
    </div>
  );
};

export const GISMap = MapView;
export default MapView;
