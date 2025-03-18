import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api.config';
import type { Maintenance } from '@/interfaces/maintenance';

export const MaintenanceService = {
  /**
   * Get maintenance history by platNomor
   * Karena API belum ada, kita return data dummy
   */
  async getMaintenanceByAsetId(platNomor: string): Promise<Maintenance[]> {
    try {
      // Coba panggil API, jika tersedia
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.MAINTENANCE.GET_BY_ASET_ID(platNomor)}`);
      return response.data;
    } catch (error) {
      console.log('API maintenance belum tersedia, menggunakan data dummy');
      // Jika error, kembalikan data dummy
      return [
        { id: 1, assetId: platNomor, tanggalPengajuan: '2022-12-12', tanggalSelesai: '2022-12-28', catatan: 'Penggantian Oli Mesin' },
        { id: 2, assetId: platNomor, tanggalPengajuan: '2023-02-15', tanggalSelesai: '2023-02-20', catatan: 'Penggantian Filter Udara' },
        { id: 3, assetId: platNomor, tanggalPengajuan: '2023-05-10', tanggalSelesai: '2023-05-18', catatan: 'Service Rutin 10.000 KM' },
        { id: 4, assetId: platNomor, tanggalPengajuan: '2023-09-22', tanggalSelesai: '2023-09-30', catatan: 'Perbaikan Sistem Rem' }
      ];
    }
  },

  /**
   * Add new maintenance record
   * Karena API belum ada, redirect ke Coming Soon
   */
  async addMaintenance(data: Partial<Maintenance>): Promise<Maintenance> {
    try {
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.MAINTENANCE.CREATE}`, data);
      return response.data;
    } catch (error) {
      console.log('API maintenance belum tersedia');
      // Redirect akan ditangani di komponen
      throw new Error('API maintenance belum tersedia');
    }
  }
};