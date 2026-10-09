import api from './api';
import { Leak } from '../types';

export const leakService = {
  getLeaks: async (filters?: { status?: string; severity?: string; buildingId?: string }): Promise<Leak[]> => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters?.severity && filters.severity !== 'All') params.append('severity', filters.severity);
    if (filters?.buildingId) params.append('buildingId', filters.buildingId);

    const res = await api.get<Leak[]>(`/leaks?${params.toString()}`);
    return res.data;
  },

  getLeakById: async (id: string): Promise<Leak> => {
    const res = await api.get<Leak>(`/leaks/${id}`);
    return res.data;
  },

  updateStatus: async (id: string, status: 'Detected' | 'Investigating' | 'Resolved'): Promise<Leak> => {
    const res = await api.patch<Leak>(`/leaks/${id}`, { status });
    return res.data;
  },
};
