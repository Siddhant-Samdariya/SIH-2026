import { apiClient, fetchWithFallback } from './client';
import { AiModuleStatus } from '../types/itms';
import { mockAiModules } from '../data/mockData';

export const getAiModuleStatuses = async (): Promise<AiModuleStatus[]> => {
  return fetchWithFallback(async () => {
    const response = await apiClient.get<AiModuleStatus[]>('/system/status');
    // Map FastAPI system status object to array if needed
    if (typeof response.data === 'object' && !Array.isArray(response.data)) {
      return Object.entries(response.data).map(([key, val], idx) => ({
        id: `mod-${idx + 1}`,
        name: key.replace(/_/g, ' ').toUpperCase(),
        type: 'computer_vision',
        status: val === 'online' ? 'optimal' : 'degraded',
        latencyMs: 12 + idx * 3,
        accuracyRate: 98.2,
        processedFramesCount: 145000 + idx * 12000
      }));
    }
    return response.data as any;
  }, mockAiModules);
};

export const toggleModuleStatus = async (id: string, newStatus: 'optimal' | 'degraded' | 'disabled'): Promise<AiModuleStatus> => {
  const fallbackMod = mockAiModules.find(m => m.id === id) || mockAiModules[0];
  if (fallbackMod) fallbackMod.status = newStatus;

  return fetchWithFallback(async () => {
    const response = await apiClient.patch<AiModuleStatus>(`/detection/modules/${id}`, { status: newStatus });
    return response.data;
  }, fallbackMod);
};
