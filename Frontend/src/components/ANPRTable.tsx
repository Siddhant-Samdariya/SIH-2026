import React, { useState } from 'react';
import { ANPRRecord } from '../types/itms';
import { StatusBadge } from './StatusBadge';
import { Search, Filter, Download, Car, Truck, Bus, Bike } from 'lucide-react';

interface ANPRTableProps {
  records: ANPRRecord[];
}

export const ANPRTable: React.FC<ANPRTableProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');

  const filtered = records.filter(r => {
    const matchesSearch = 
      r.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cameraName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.ownerName && r.ownerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
    const matchesVehicle = selectedVehicle === 'all' || r.vehicleType === selectedVehicle;

    return matchesSearch && matchesStatus && matchesVehicle;
  });

  const exportCSV = () => {
    const headers = ['ID,Plate Number,Vehicle Type,Camera,Location,Timestamp,Confidence %,Status,Speed km/h'];
    const rows = filtered.map(r => 
      `${r.id},${r.plateNumber},${r.vehicleType},"${r.cameraName}","${r.location}",${r.timestamp},${r.confidence},${r.status},${r.speed}`
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ANPR_Vehicle_Records_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'Truck': return <Truck className="w-4 h-4 text-amber-400" />;
      case 'Bus': return <Bus className="w-4 h-4 text-emerald-400" />;
      case 'Motorcycle': return <Bike className="w-4 h-4 text-violet-400" />;
      case 'Car':
      default: return <Car className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden glass-panel">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by plate, camera, location or owner..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 text-slate-300 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="flagged">Flagged</option>
            <option value="blacklisted">Blacklisted</option>
            <option value="stolen">Stolen</option>
            <option value="vip">VIP Protocol</option>
          </select>

          {/* Vehicle Type Filter */}
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="bg-slate-900 text-slate-300 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Vehicles</option>
            <option value="Car">Car</option>
            <option value="Bus">Bus</option>
            <option value="Truck">Truck</option>
            <option value="Motorcycle">Motorcycle</option>
            <option value="Auto-Rickshaw">Auto-Rickshaw</option>
          </select>

          {/* Export CSV Button */}
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Plate Number</th>
              <th className="py-3 px-4">Vehicle Type</th>
              <th className="py-3 px-4">Camera & Location</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4">Speed</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No license plate records found matching current query filters.
                </td>
              </tr>
            ) : (
              filtered.map((record) => (
                <tr key={record.id} className="hover:bg-slate-800/40 transition-colors group">
                  {/* Plate Number with styled Indian plate card */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-0.5 bg-yellow-400 text-black font-extrabold text-xs rounded border border-black shadow-sm tracking-wider">
                        {record.plateNumber}
                      </div>
                      {record.ownerName && (
                        <span className="text-[10px] text-slate-400 font-sans hidden xl:inline">
                          ({record.ownerName})
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Vehicle Type */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-slate-200">
                      {getVehicleIcon(record.vehicleType)}
                      <span>{record.vehicleType}</span>
                    </div>
                  </td>

                  {/* Camera & Location */}
                  <td className="py-3 px-4">
                    <div className="text-slate-200 font-semibold">{record.cameraName}</div>
                    <div className="text-[10px] text-slate-400">{record.location}</div>
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-4 text-slate-300">
                    {record.timestamp}
                  </td>

                  {/* Confidence */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            record.confidence > 95 ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                          style={{ width: `${record.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-slate-300 font-mono text-[11px]">{record.confidence}%</span>
                    </div>
                  </td>

                  {/* Speed */}
                  <td className="py-3 px-4 text-slate-300">
                    {record.speed} km/h
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-right">
                    <StatusBadge status={record.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
