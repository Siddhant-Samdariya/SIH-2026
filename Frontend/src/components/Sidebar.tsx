import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutGrid, 
  Bus, 
  Map, 
  AlertTriangle, 
  Wrench, 
  Car, 
  BarChart3, 
  FileText,
  Globe
} from 'lucide-react';

interface SidebarProps {
  activeAlertsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutGrid },
    { name: 'Live Fleet', path: '/live-fleet', icon: Bus },
    { name: 'Map', path: '/map', icon: Map },
    { name: 'Incidents', path: '/incidents', icon: AlertTriangle },
    { name: 'Road Conditions', path: '/road-conditions', icon: Wrench },
    { name: 'Vehicles', path: '/vehicles', icon: Car },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-9 h-9 rounded-full bg-[#1b365d] flex items-center justify-center text-white shadow-xs">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-lg leading-tight tracking-tight font-sans">UrbanSense</h1>
          <p className="text-xs text-slate-500 font-medium">Urban Intelligence</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold border-r-4 border-[#1b365d]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                }`
              }
            >
              <Icon className="w-4 h-4 transition-transform group-hover:scale-105" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

    </aside>
  );
};
