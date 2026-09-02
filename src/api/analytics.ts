import { apiClient, fetchWithFallback } from './client';
import { TrafficDataPoint, ReportItem } from '../types/itms';
import { mockTrafficTimeSeries, mockReports } from '../data/mockData';

export const getTrafficAnalytics = async (): Promise<TrafficDataPoint[]> => {
  return fetchWithFallback(async () => {
    const response = await apiClient.get('/analytics');
    if (response.data && response.data.traffic_trend) {
      return response.data.traffic_trend.map((pt: any) => ({
        timestamp: pt.time,
        vehicleCount: pt.vehicles,
        density: pt.density,
        avgSpeed: 34
      }));
    }
    return mockTrafficTimeSeries;
  }, mockTrafficTimeSeries);
};

export const getReports = async (): Promise<ReportItem[]> => {
  return fetchWithFallback(async () => {
    const response = await apiClient.get<ReportItem[]>('/analytics/reports');
    return response.data;
  }, mockReports);
};
