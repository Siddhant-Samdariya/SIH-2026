import React, { useState } from 'react';
import { 
  Car, 
  Search, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Activity, 
  ChevronRight, 
  ExternalLink,
  Bus,
  Inbox
} from 'lucide-react';
import { MapView } from '../components/MapView';

interface VehicleObservation {
  id: string;
  timestamp: string;
  location: string;
  busCamera: string;
  confidence: number;
  speed: string;
  lat: number;
  lng: number;
}

export const VehiclesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchedPlate, setSearchedPlate] = useState<string>('');

  const observations: VehicleObservation[] = [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchedPlate(searchQuery.trim());
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Top Search Bar Header */}
      <div className="urbansense-card p-6 space-y-3">
        <h2 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
          Vehicle Intelligence & Trajectory Search
        </h2>
        <p className="text-xs text-slate-500 font-sans">
          Search municipal bus fleet ANPR database to reconstruct vehicle trajectory and timeline observations.
        </p>

        <form onSubmit={handleSearch} className="flex items-center gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vehicle registration..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:border-[#1b365d] focus:bg-white"
            />
          </div>
          <button type="submit" className="btn-primary py-2.5 px-6">
            Search Registration
          </button>
        </form>
      </div>

      {/* Target Vehicle Summary / Clean Empty State */}
      {!searchedPlate ? (
        <div className="urbansense-card p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Inbox className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-base">No ANPR records yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Enter a license plate registration above or connect active camera pipelines to view vehicle observations.
          </p>
        </div>
      ) : (
        <div className="urbansense-card p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-[#1b365d] text-white font-mono font-extrabold text-lg rounded border border-slate-700 shadow-xs">
                {searchedPlate.toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Searched Registration</h3>
                <p className="text-xs text-slate-500 font-mono">ANPR Query</p>
              </div>
            </div>

            <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded font-mono font-bold text-xs">
              ● Query Active
            </span>
          </div>

          {observations.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <h4 className="font-bold text-slate-700 text-sm">No vehicle detections yet</h4>
              <p className="text-xs text-slate-500">
                No sightings recorded for registration "{searchedPlate.toUpperCase()}".
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Trajectory Map & Observation Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Vehicle Trajectory Map */}
        <div className="urbansense-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Vehicle Trajectory Map</h3>
            <span className="text-xs text-slate-500 font-mono">0 Sightings</span>
          </div>

          <div className="rounded-lg overflow-hidden h-[300px] border border-slate-200">
            <MapView
              cameras={[]}
              alerts={[]}
              height="100%"
              zoom={13}
            />
          </div>
        </div>

        {/* Right: Timeline Observations */}
        <div className="urbansense-card p-5 space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Vehicle Sighting Observations</h3>
            <p className="text-xs text-slate-500">Historical timeline logged by urban bus cameras</p>
          </div>

          <div className="p-12 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Car className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-700 text-xs">No vehicle detections yet</h4>
            <p className="text-[11px] text-slate-400">ANPR timeline observations will appear here when recorded.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiclesPage;
