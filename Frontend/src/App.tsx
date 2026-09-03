import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LiveFleetPage } from './pages/LiveFleetPage';
import { TrafficMapPage } from './pages/TrafficMapPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { RoadConditionsPage } from './pages/RoadConditionsPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { LoginPage } from './pages/LoginPage';

// Protected Route Guard (Requires mock authentication)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Public Route Guard (Redirects to dashboard if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard Layout Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="overview" element={<Navigate to="/" replace />} />
          <Route path="live-fleet" element={<LiveFleetPage />} />
          <Route path="map" element={<TrafficMapPage />} />
          <Route path="incidents" element={<IncidentsPage />} />
          <Route path="road-conditions" element={<Navigate to="/incidents" replace />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="reports" element={<ReportsPage />} />

          {/* Compatibility redirects for legacy routes */}
          <Route path="live-monitoring" element={<Navigate to="/live-fleet" replace />} />
          <Route path="traffic-map" element={<Navigate to="/map" replace />} />
          <Route path="alerts" element={<Navigate to="/incidents" replace />} />
          <Route path="anpr" element={<Navigate to="/vehicles" replace />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

