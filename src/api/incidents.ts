import { apiClient, fetchWithFallback } from './client';
import { Alert } from '../types/itms';
import { mockAlerts } from '../data/mockData';

export const getAlerts = async (): Promise<Alert[]> => {
  return fetchWithFallback(async () => {
    const response = await apiClient.get<any[]>('/alerts');
    if (!Array.isArray(response.data)) return mockAlerts;
    return response.data.map(alert => ({
      ...alert,
      lat: typeof alert.lat === 'number' ? alert.lat : (typeof alert.latitude === 'number' ? alert.latitude : 26.2183),
      lng: typeof alert.lng === 'number' ? alert.lng : (typeof alert.longitude === 'number' ? alert.longitude : 78.1828),
    }));
  }, mockAlerts);
};

export const updateAlertStatus = async (id: string, status: 'acknowledged' | 'resolved'): Promise<Alert> => {
  const fallbackAlert = mockAlerts.find(a => a.id === id) || mockAlerts[0];
  if (fallbackAlert) fallbackAlert.status = status;

  return fetchWithFallback(async () => {
    const response = await apiClient.patch<Alert>(`/incidents/alerts/${id}`, { status });
    return response.data;
  }, fallbackAlert);
};
