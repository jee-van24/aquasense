import api from './api';
import { Sensor } from '../types';

export const sensorService = {
  getSensors: async (filters?: {
    buildingId?: string;
    status?: string;
    riskLevel?: string;
    search?: string;
  }): Promise<Sensor[]> => {
    const params = new URLSearchParams();
    if (filters?.buildingId) params.append('buildingId', filters.buildingId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.riskLevel) params.append('riskLevel', filters.riskLevel);
    if (filters?.search) params.append('search', filters.search);

    const res = await api.get<Sensor[]>(`/sensors?${params.toString()}`);
    return res.data;
  },

  getSensorById: async (id: string): Promise<Sensor> => {
    const res = await api.get<Sensor>(`/sensors/${id}`);
    return res.data;
  },

  getLiveTelemetry: async (): Promise<Sensor[]> => {
    const res = await api.get<Sensor[]>('/sensors/live');
    return res.data;
  },

  createSensor: async (data: Partial<Sensor>): Promise<Sensor> => {
    const res = await api.post<Sensor>('/sensors', data);
    return res.data;
  },

  updateSensor: async (id: string, data: Partial<Sensor>): Promise<Sensor> => {
    const res = await api.patch<Sensor>(`/sensors/${id}`, data);
    return res.data;
  },
};
