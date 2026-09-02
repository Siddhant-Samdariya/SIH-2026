import { apiClient, fetchWithFallback } from './client';
import { Camera, DashboardMetrics } from '../types/itms';
import { mockCameras, mockDashboardMetrics } from '../data/mockData';

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  return fetchWithFallback(async () => {
    const response = await apiClient.get('/overview');
    const data = response.data;
    return {
      totalVehiclesDetected: data.traffic?.vehicles_detected ?? mockDashboardMetrics.totalVehiclesDetected,
      currentTrafficDensity: data.traffic?.density ?? mockDashboardMetrics.currentTrafficDensity,
      averageVehicleSpeed: data.traffic?.average_speed ?? mockDashboardMetrics.averageVehicleSpeed,
      anprAccurateRate: 98.4,
      activeIncidentsCount: data.safety_alerts?.total ?? mockDashboardMetrics.activeIncidentsCount,
      activeCamerasCount: data.monitoring_sources?.online ?? mockDashboardMetrics.activeCamerasCount,
    };
  }, mockDashboardMetrics);
};

export const getCameras = async (): Promise<Camera[]> => {
  return fetchWithFallback(async () => {
    const response = await apiClient.get<any[]>('/cameras');
    if (!Array.isArray(response.data)) return mockCameras;
    return response.data.map(cam => ({
      ...cam,
      lat: typeof cam.lat === 'number' ? cam.lat : (typeof cam.latitude === 'number' ? cam.latitude : 26.2183),
      lng: typeof cam.lng === 'number' ? cam.lng : (typeof cam.longitude === 'number' ? cam.longitude : 78.1828),
    }));
  }, mockCameras);
};

export const getCameraById = async (id: string): Promise<Camera | undefined> => {
  return fetchWithFallback(async () => {
    const response = await apiClient.get<any>(`/cameras/${id}`);
    const cam = response.data;
    if (!cam) return mockCameras.find(c => c.id === id);
    return {
      ...cam,
      lat: typeof cam.lat === 'number' ? cam.lat : (typeof cam.latitude === 'number' ? cam.latitude : 26.2183),
      lng: typeof cam.lng === 'number' ? cam.lng : (typeof cam.longitude === 'number' ? cam.longitude : 78.1828),
    };
  }, mockCameras.find(c => c.id === id));
};
