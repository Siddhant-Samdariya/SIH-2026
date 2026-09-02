import { apiClient, fetchWithFallback } from './client';
import { ANPRRecord } from '../types/itms';
import { mockANPRRecords } from '../data/mockData';

export const getANPRRecords = async (): Promise<ANPRRecord[]> => {
  return fetchWithFallback(async () => {
    const response = await apiClient.get<ANPRRecord[]>('/anpr/records');
    return response.data;
  }, mockANPRRecords);
};

export const searchANPRRecords = async (query: string): Promise<ANPRRecord[]> => {
  const q = query.toLowerCase();
  const fallback = mockANPRRecords.filter(r => 
    r.plateNumber.toLowerCase().includes(q) ||
    r.vehicleType.toLowerCase().includes(q) ||
    r.cameraName.toLowerCase().includes(q) ||
    r.status.toLowerCase().includes(q)
  );

  return fetchWithFallback(async () => {
    const response = await apiClient.get<ANPRRecord[]>('/anpr/search', { params: { q: query } });
    return response.data;
  }, fallback);
};
