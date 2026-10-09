import api from './api';
import { ReportsSummary } from '../types';

export const reportService = {
  getSummary: async (): Promise<ReportsSummary> => {
    const res = await api.get<ReportsSummary>('/reports/summary');
    return res.data;
  },

  downloadCsv: async (): Promise<void> => {
    const res = await api.get('/reports/export-csv', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aquasense-leak-audit-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
