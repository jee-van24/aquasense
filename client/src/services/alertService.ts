import api from './api';
import { Alert } from '../types';

export const alertService = {
  getAlerts: async (filters?: { severity?: string; buildingId?: string; isResolved?: boolean; search?: string }): Promise<Alert[]> => {
    const params = new URLSearchParams();
    if (filters?.severity && filters.severity !== 'All') params.append('severity', filters.severity);
    if (filters?.buildingId) params.append('buildingId', filters.buildingId);
    if (filters?.isResolved !== undefined) params.append('isResolved', String(filters.isResolved));
    if (filters?.search) params.append('search', filters.search);

    const res = await api.get<Alert[]>(`/alerts?${params.toString()}`);
    return res.data;
  },

  updateAlert: async (id: string, data: { isRead?: boolean; isResolved?: boolean }): Promise<Alert> => {
    const res = await api.patch<Alert>(`/alerts/${id}`, data);
    return res.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.post('/alerts/mark-all-read');
  },
};
