import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api.config';
import type { Aset } from '@/interfaces/asset';

export const AsetService = {
  /**
   * Fetch asset by platNomor
   */
  async getAsetByPlatNomor(platNomor: string): Promise<Aset> {
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.ASET.GET_BY_PLATNOMOR(platNomor)}`);
    return response.data;
  },

  /**
   * Update asset
   */
  async updateAset(platNomor: string, data: Partial<Aset>): Promise<Aset> {
    const response = await axios.put(`${API_BASE_URL}${API_ENDPOINTS.ASET.UPDATE(platNomor)}`, data);
    return response.data;
  },

  /**
   * Delete asset (soft delete)
   */
  async deleteAset(platNomor: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.ASET.DELETE(platNomor)}`);
  }
};