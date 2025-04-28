import axios from 'axios';
import { API_ENDPOINTS, API_URLS } from '@/config/api.config';
import type { AsetInterface, AsetListInterface } from '@/interfaces/asset/asset.interface';

interface ApiResponse<T> {
  status: number;
  message: string;
  timestamp: string;
  data: T;
}

export class AsetService {
  /**
   * Fetch all assets
   */
  static async viewAllAsset(): Promise<AsetListInterface[]> {
    const response = await axios.get<ApiResponse<AsetListInterface[]>>(`${API_URLS.ASSET}${API_ENDPOINTS.ASET.GET_ALL}`);
    return response.data.data;
  }

  /**
   * Fetch asset by platNomor
   */
  static async getAsetByPlatNomor(platNomor: string): Promise<AsetInterface> {
    const response = await axios.get(`${API_URLS.ASSET}${API_ENDPOINTS.ASET.GET_BY_PLATNOMOR(platNomor)}`);

    // Cek apakah response menggunakan format baru (dengan field data)
    if (response.data && response.data.data) {
      const asetData = response.data.data;

      // Jika menggunakan format baru dengan field data
      return {
        platNomor: asetData.platNomor,
        nama: asetData.nama,
        jenisAset: asetData.jenisAset,
        status: asetData.status,
        tanggalPerolehan: asetData.tanggalPerolehan,
        nilaiPerolehan: asetData.nilaiPerolehan,
        deskripsi: asetData.deskripsi,
        assetMaintenance: asetData.assetMaintenance,
        gambarAset: asetData.gambarAsetBase64 || '',
        isDeleted: false
      };
    } else {
      // Jika menggunakan format lama (tanpa field data)
      const asetData = response.data;
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
    }
  }

  /**
   * Update asset
   */
  static async updateAset(platNomor: string, updateData: Partial<AsetInterface>): Promise<AsetInterface> {
    try {
      const response = await axios.put(`${API_URLS.ASSET}${API_ENDPOINTS.ASET.UPDATE(platNomor)}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating asset:', error);
      throw error;
    }
  }

  /**
   * Delete asset (soft delete)
   */
  static async deleteAset(platNomor: string): Promise<void> {
    await axios.delete(`${API_URLS.ASSET}${API_ENDPOINTS.ASET.DELETE(platNomor)}`);
  }
};