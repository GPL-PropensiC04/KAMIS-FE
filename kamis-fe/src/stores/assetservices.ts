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
<<<<<<< HEAD
=======
   * Fetch all assets
   */
  async viewAllAsset(): Promise<AsetInterface[]> {
    const response = await axios.get<ApiResponse<AsetInterface[]>>(`${API_BASE_URL}${API_ENDPOINTS.ASET.GET_ALL}`);
    return response.data.data;
  },
  
  /**
>>>>>>> 0d240df44833aa3f1998689ed95dd9c24838b8a6
   * Fetch asset by platNomor
   */
  async getAsetByPlatNomor(platNomor: string): Promise<AsetInterface> {
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.ASET.GET_BY_PLATNOMOR(platNomor)}`);
    
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
  },

  /**
   * Update asset
   */
  async updateAset(platNomor: string, data: Partial<AsetInterface>): Promise<AsetInterface> {
    const response = await axios.put(`${API_BASE_URL}${API_ENDPOINTS.ASET.UPDATE(platNomor)}`, data);
    
    // Cek apakah response menggunakan format baru (dengan field data)
    if (response.data && response.data.data) {
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
  },

  /**
   * Delete asset (soft delete)
   */
  async deleteAset(platNomor: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.ASET.DELETE(platNomor)}`);
  }
};