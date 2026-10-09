import api from './api';
import { Building } from '../types';

export const buildingService = {
  getBuildings: async (): Promise<Building[]> => {
    const res = await api.get<Building[]>('/buildings');
    return res.data;
  },

  getBuildingById: async (id: string): Promise<Building> => {
    const res = await api.get<Building>(`/buildings/${id}`);
    return res.data;
  },
};
