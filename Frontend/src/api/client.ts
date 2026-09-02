import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const USE_MOCK_DATA = false;

// Helper for safe API call with mock fallback
export async function fetchWithFallback<T>(apiCall: () => Promise<T>, fallbackData: T): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    console.warn('Backend API connection offline/failed, using local fallback:', error);
    return fallbackData;
  }
}
