import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />
        
        {/* Page Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
