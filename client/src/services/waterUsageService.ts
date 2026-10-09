import api from './api';
import { WaterUsageAnalytics } from '../types';

export const waterUsageService = {
  getAnalytics: async (period: '7d' | '30d' | '90d' = '7d'): Promise<WaterUsageAnalytics> => {
    const res = await api.get<WaterUsageAnalytics>(`/water-usage?period=${period}`);
    return res.data;
  },
};
