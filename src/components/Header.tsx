import React from 'react';
import { Radio, Bell, UserCircle, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle = 'Urban Intelligence' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const getBreadcrumb = () => {
    if (title) return { title, subtitle };
    switch (location.pathname) {
      case '/': return { title: 'UrbanSense', subtitle: 'Urban Intelligence' };
      case '/live-fleet': return { title: 'Urban Intelligence', subtitle: 'Live Fleet' };
      case '/map': return { title: 'Urban Intelligence', subtitle: 'GIS Traffic Map' };
      case '/incidents': return { title: 'Urban Intelligence', subtitle: 'Incident Investigation' };
      case '/road-conditions': return { title: 'Road Conditions', subtitle: 'Urban Intelligence' };
      case '/vehicles': return { title: 'Vehicle Intelligence', subtitle: 'Urban Intelligence' };
      case '/analytics': return { title: 'Analytics', subtitle: 'Urban Intelligence' };
      case '/reports': return { title: 'Reports', subtitle: 'Urban Intelligence' };
      default: return { title: 'UrbanSense', subtitle: 'Urban Intelligence' };
    }
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="h-16 bg-[#f8fafc] border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Breadcrumb Title */}
      <div className="flex items-center gap-3 text-sm">
        <span className="font-semibold text-slate-900">{breadcrumb.title}</span>
        {breadcrumb.subtitle && (
          <>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500 font-medium">{breadcrumb.subtitle}</span>
          </>
        )}
      </div>

      {/* Header Right Actions */}
      <div className="flex items-center gap-4 text-slate-600">
        <button className="hover:text-slate-900 transition-colors" title="Signal Connected">
          <Radio className="w-4 h-4 text-slate-700" />
        </button>

        <button className="relative hover:text-slate-900 transition-colors" title="Notifications">
          <Bell className="w-4.5 h-4.5 text-slate-700" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white"></span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <button className="hover:text-slate-900 transition-colors flex items-center gap-1.5" title="User Profile (admin)">
            <UserCircle className="w-6 h-6 text-slate-700" />
            <span className="text-xs font-semibold text-slate-700 hidden sm:inline">admin</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-700 rounded-md transition-colors"
            title="Logout of UrbanSense"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

