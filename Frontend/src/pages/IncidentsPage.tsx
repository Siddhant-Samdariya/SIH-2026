import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Car, 
  Droplets, 
  Inbox, 
  ChevronRight,
  AlertTriangle,
  MapPin,
  Clock,
  Plus,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  badgeColor: string;
}

interface IncidentRecord {
  incident_id: string;
  category: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  severity: string;
  status: string;
}

export const IncidentsPage: React.FC = () => {
  const categories: CategoryInfo[] = [
    {
      id: 'road_damage',
      name: 'Road Damage & Potholes',
      description: 'Detected potholes and road-surface damage.',
      icon: Wrench,
      badgeColor: 'border-amber-600 text-amber-700 bg-amber-50'
    },
    {
      id: 'traffic_congestion',
      name: 'Traffic & Congestion',
      description: 'Vehicle activity, traffic density, and congestion detection.',
      icon: Car,
      badgeColor: 'border-blue-600 text-blue-700 bg-blue-50'
    },
    {
      id: 'waterlogging',
      name: 'Waterlogging',
      description: 'Detected waterlogged road areas.',
      icon: Droplets,
      badgeColor: 'border-sky-600 text-sky-700 bg-sky-50'
    }
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>('road_damage');
  const [backendIncidents, setBackendIncidents] = useState<IncidentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Modal Form State
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [formCategory, setFormCategory] = useState<string>('road_damage');
  const [formSeverity, setFormSeverity] = useState<string>('high');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formLat, setFormLat] = useState<string>('28.6183');
  const [formLng, setFormLng] = useState<string>('77.1828');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const activeCategoryObj = categories.find(c => c.id === selectedCategory) || categories[0];

  const fetchIncidents = () => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/incidents?category=${selectedCategory}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setBackendIncidents(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.warn('Backend incidents fetch fallback:', err);
        setBackendIncidents([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIncidents();
  }, [selectedCategory]);

  const handleReportSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    // Read description from React state or direct DOM element fallback
    const domDesc = (document.getElementById('report_description_textarea') as HTMLTextAreaElement)?.value;
    let finalDescription = (formDescription || domDesc || '').trim();
    if (!finalDescription) {
      finalDescription = 'Manual incident reported from MARGANETRA control center';
    }

    const domLat = (document.getElementById('report_lat_input') as HTMLInputElement)?.value;
    const domLng = (document.getElementById('report_lng_input') as HTMLInputElement)?.value;

    const latVal = parseFloat(formLat || domLat || '28.6183') || 28.6183;
    const lngVal = parseFloat(formLng || domLng || '77.1828') || 77.1828;

    setSubmitting(true);
    const payload = {
      category: formCategory,
      severity: formSeverity,
      description: finalDescription,
      latitude: latVal,
      longitude: lngVal
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/incidents/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setIsReportModalOpen(false);
        setFormDescription('');
        setFormError(null);
        setSelectedCategory(formCategory);
        setSuccessBanner(`Incident ${data.incident?.incident_id || ''} reported successfully to backend!`);
        setTimeout(() => setSuccessBanner(null), 6000);
        fetchIncidents();
      } else {
        setFormError('Server returned an error. Please try again.');
      }
    } catch (err) {
      console.warn('Failed to submit incident to backend:', err);
      setFormError('Could not connect to backend server at http://127.0.0.1:8000');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
            Incidents
          </h2>
          <p className="text-sm text-slate-600 font-normal mt-1">
            Categorized municipal incident registry and detection status.
          </p>
        </div>

        <button
          id="open_report_modal_btn"
          onClick={() => {
            setFormError(null);
            setIsReportModalOpen(true);
          }}
          className="bg-[#1b365d] hover:bg-[#152a4a] text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-cyan-300" />
          <span>Report an Incident</span>
        </button>
      </div>

      {/* Category Selection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const IconComp = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`urbansense-card p-5 text-left transition-all cursor-pointer space-y-3 flex flex-col justify-between ${
                isSelected
                  ? 'ring-2 ring-[#1b365d] border-[#1b365d] shadow-sm bg-slate-50/50'
                  : 'hover:border-slate-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${cat.badgeColor}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-[#1b365d] text-white">
                      Selected
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-base">{cat.name}</h3>
                <p className="text-xs text-slate-600 font-sans leading-relaxed">{cat.description}</p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#1b365d]">
                <span>View Detections</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Category Content Area */}
      <div className="urbansense-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">{activeCategoryObj.name}</h3>
            <p className="text-xs text-slate-500">{activeCategoryObj.description}</p>
          </div>
          {backendIncidents.length > 0 && (
            <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700">
              {backendIncidents.length} Records From Backend
            </span>
          )}
        </div>

        {/* Incidents Table or Clean Empty State */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-mono">
            Loading backend detections...
          </div>
        ) : backendIncidents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Incident ID</th>
                  <th className="py-3 px-5">Title / Details</th>
                  <th className="py-3 px-5">Location</th>
                  <th className="py-3 px-5">Timestamp</th>
                  <th className="py-3 px-5">Confidence</th>
                  <th className="py-3 px-5">Severity</th>
                  <th className="py-3 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-sans">
                {backendIncidents.map((inc) => (
                  <tr key={inc.incident_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs font-bold text-[#1b365d]">
                      {inc.incident_id}
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-slate-900 text-xs">{inc.title}</p>
                      <p className="text-[11px] text-slate-500">{inc.description}</p>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-700">
                      {inc.location?.address || 'Municipal Zone'}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-xs text-slate-600">
                      {inc.timestamp ? inc.timestamp.replace('T', ' ') : '-'}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-xs font-bold text-slate-800">
                      {(inc.confidence * 100).toFixed(0)}%
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        inc.severity === 'high' || inc.severity === 'critical'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : inc.severity === 'medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-xs font-bold text-slate-700">
                      {inc.status || 'Active'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3 bg-white">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">No incidents detected</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Detections for {activeCategoryObj.name.toLowerCase()} will appear here when available from backend pipeline.
            </p>
          </div>
        )}
      </div>

      {/* REPORT INCIDENT MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden my-auto flex flex-col relative z-[101]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-[#f8fafc] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1b365d] text-white flex items-center justify-center font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Report an Incident</h3>
                  <p className="text-xs text-slate-500 font-medium">Submit manual incident report to backend telemetry</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleReportSubmit} className="p-6 space-y-4 text-xs font-sans">
              {/* Form Inline Error */}
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Incident Type */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  INCIDENT TYPE
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#1b365d] rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="road_damage">Road Damage & Potholes</option>
                  <option value="traffic_congestion">Traffic & Congestion</option>
                  <option value="waterlogging">Waterlogging</option>
                </select>
              </div>

              {/* 2. Severity */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  SEVERITY LEVEL
                </label>
                <select
                  value={formSeverity}
                  onChange={(e) => setFormSeverity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#1b365d] rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* 3. Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  DESCRIPTION
                </label>
                <textarea
                  id="report_description_textarea"
                  rows={3}
                  value={formDescription}
                  onChange={(e) => {
                    setFormDescription(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder="Describe the incident details (e.g. Large pothole near the road intersection)"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#1b365d] rounded-lg p-3 text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {/* 4. Location Coordinates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    LATITUDE
                  </label>
                  <input
                    id="report_lat_input"
                    type="number"
                    step="any"
                    value={formLat}
                    onChange={(e) => setFormLat(e.target.value)}
                    placeholder="e.g. 28.6183"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#1b365d] rounded-lg px-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    LONGITUDE
                  </label>
                  <input
                    id="report_lng_input"
                    type="number"
                    step="any"
                    value={formLng}
                    onChange={(e) => setFormLng(e.target.value)}
                    placeholder="e.g. 77.1828"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#1b365d] rounded-lg px-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="report_submit_btn"
                  type="submit"
                  onClick={(e) => handleReportSubmit(e)}
                  disabled={submitting}
                  className="px-5 py-2 bg-[#1b365d] hover:bg-[#152a4a] text-white font-semibold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-70 cursor-pointer relative z-[102]"
                >
                  {submitting ? (
                    <span>Submitting to Backend...</span>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Report Incident</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentsPage;
