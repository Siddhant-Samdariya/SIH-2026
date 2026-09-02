import React, { useState } from 'react';
import { 
  Wrench, 
  Car, 
  Droplets, 
  Inbox, 
  ChevronRight
} from 'lucide-react';

interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  badgeColor: string;
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
  const activeCategoryObj = categories.find(c => c.id === selectedCategory) || categories[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
          Incidents
        </h2>
        <p className="text-sm text-slate-600 font-normal mt-1">
          Categorized municipal incident registry and detection status.
        </p>
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
        </div>

        {/* Clean Empty State */}
        <div className="p-12 text-center space-y-3 bg-white">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Inbox className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-base">No incidents detected</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Detections for {activeCategoryObj.name.toLowerCase()} will appear here when available.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IncidentsPage;
