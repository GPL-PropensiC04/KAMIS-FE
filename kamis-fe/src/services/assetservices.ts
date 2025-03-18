import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api.config';
import type { AsetInterface } from '@/interfaces/asset.interface';

interface ApiResponse<T> {
  status: number;
  message: string;
  timestamp: string;
  data: T;
}



export const AsetService = {
  /**
   * Fetch asset by platNomor
   */
  async getAsetByPlatNomor(platNomor: string): Promise<AsetInterface> {
    const response = await axios.get<ApiResponse<AsetInterface>>(`${API_BASE_URL}${API_ENDPOINTS.ASET.GET_BY_PLATNOMOR(platNomor)}`);
    
    // Transformasi data dari API ke format yang sesuai dengan interface Aset
    const asetData = response.data.data;
    
    // Transform dari API response ke Aset interface
    return {
      platNomor: asetData.platNomor,
      nama: asetData.nama,
      jenisAset: asetData.jenisAset,
      status: asetData.status,
      tanggalPerolehan: asetData.tanggalPerolehan,
      nilaiPerolehan: asetData.nilaiPerolehan,
      deskripsi: asetData.deskripsi,
      assetMaintenance: asetData.assetMaintenance,
      gambarAset: asetData.gambarAset || '',
      isDeleted: false
    };
  },

  /**
   * Update asset
   */
  async updateAset(platNomor: string, data: Partial<AsetInterface>): Promise<AsetInterface> {
    const response = await axios.put<ApiResponse<AsetInterface>>(`${API_BASE_URL}${API_ENDPOINTS.ASET.UPDATE(platNomor)}`, data);
    const asetData = response.data.data;
    
    return {
      platNomor: asetData.platNomor,
      nama: asetData.nama,
      jenisAset: asetData.jenisAset,
      status: asetData.status,
      tanggalPerolehan: asetData.tanggalPerolehan,
      nilaiPerolehan: asetData.nilaiPerolehan,
      deskripsi: asetData.deskripsi,
      assetMaintenance: asetData.assetMaintenance,
      gambarAset: asetData.gambarAset || '',
      isDeleted: false
    };
  },

  /**
   * Delete asset (soft delete)
   */
  async deleteAset(platNomor: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.ASET.DELETE(platNomor)}`);
  }
};