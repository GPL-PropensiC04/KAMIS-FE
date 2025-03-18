import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api.config';
import type { Maintenance } from '@/interfaces/maintenance';

export const MaintenanceService = {
  /**
   * Get maintenance history by platNomor
   */
  async getMaintenanceByAsetId(platNomor: string): Promise<Maintenance[]> {
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.MAINTENANCE.GET_BY_ASET_ID(platNomor)}`);
    return response.data;
  },

  /**
   * Add new maintenance record
   */
  async addMaintenance(data: Partial<Maintenance>): Promise<Maintenance> {
    const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.MAINTENANCE.CREATE}`, data);
    return response.data;
  }
};