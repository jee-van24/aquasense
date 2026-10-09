import api from './api';
import { AIInsight } from '../types';

export const aiService = {
  getInsights: async (): Promise<AIInsight[]> => {
    const res = await api.get<AIInsight[]>('/ai/insights');
    return res.data;
  },

  getSimulatorStatus: async () => {
    const res = await api.get('/simulator/status');
    return res.data;
  },

  triggerSimulatorTick: async () => {
    const res = await api.post('/simulator/tick');
    return res.data;
  },

  toggleSimulator: async () => {
    const res = await api.post('/simulator/toggle');
    return res.data;
  },
};
