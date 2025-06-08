import axios from 'axios';
import { API_URLS } from '@/config/api.config';
import type { Maintenance, MaintenanceRequest } from '@/interfaces/asset/maintenance';

export const MaintenanceService = {
  /**
   * Get maintenance history by platNomor
   */
  async getMaintenanceByAsetId(platNomor: string): Promise<Maintenance[]> {
    try {
      const response = await axios.get(`${API_URLS.ASSET}/maintenance/${platNomor}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.data && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
      throw error;
    }
  },

  /**
   * Add new maintenance record
   */
  async addMaintenance(data: MaintenanceRequest): Promise<Maintenance> {
    try {
      const response = await axios.post(`${API_URLS.ASSET}/maintenance/`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.data && response.data.data) {
        return response.data.data;
      }
      throw new Error('Failed to add maintenance');
    } catch (error) {
      console.error('Error adding maintenance:', error);
      throw error;
    }
  },

  /**
   * Complete a maintenance record
   */
  async completeMaintenance(id: number): Promise<Maintenance> {
    try {
      const response = await axios.patch(`${API_URLS.ASSET}/maintenance/${id}/complete`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.data && response.data.data) {
        return response.data.data;
      }
      throw new Error('Failed to complete maintenance');
    } catch (error) {
      console.error('Error completing maintenance:', error);
      throw error;
    }
  },

    /**
   * Get list of assets in maintenance (new method)
   */
  async getAssetsInMaintenance(): Promise<Maintenance[]> {
    try {
      const response = await axios.get(`${API_URLS.ASSET}/maintenance/maintenance-in-progress`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.data && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching assets in maintenance:', error);
      throw error;
    }
  }
};