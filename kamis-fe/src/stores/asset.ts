import axios from 'axios';
import { API_ENDPOINTS, API_URLS } from '@/config/api.config';
import type { AsetInterface, AsetListInterface } from '@/interfaces/asset/asset.interface';
import type { CommonResponseInterface, PaginatedResponse } from '@/interfaces/common.interface';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export class AsetService {
  /**
   * Fetch all assets (existing method)
   */
  static async viewAllAsset(): Promise<AsetListInterface[]> {
    const response = await axios.get<CommonResponseInterface<AsetListInterface[]>>(`${API_URLS.ASSET}${API_ENDPOINTS.ASET.GET_ALL}`);
    return response.data.data;
  }

  /**
   * Fetch all assets with pagination (NEW METHOD)
   */
  static async viewAllAssetsPaginated(
    page: number, 
    size: number = 10, 
    searchParams?: {
      nama?: string;
      jenisAset?: string;
      status?: string;
    }
  ): Promise<PaginatedResponse<AsetListInterface>> {
    const params: any = { page, size };

    console.log('Search Params received in service:', searchParams);
    
    // Add search parameters to the request
    if (searchParams?.nama && searchParams.nama.trim() !== '') {
      params.nama = searchParams.nama.trim();
      console.log('Adding nama filter:', params.nama);
    }
    
    if (searchParams?.jenisAset && searchParams.jenisAset.trim() !== '') {
      params.jenisAset = searchParams.jenisAset.trim();
      console.log('Adding jenisAset filter:', params.jenisAset);
    }
    
    if (searchParams?.status && searchParams.status.trim() !== '') {
      params.status = searchParams.status.trim();
      console.log('Adding status filter:', params.status);
    }

    console.log('Final params being sent to API:', params);

    const response = await axios.get<CommonResponseInterface<PaginatedResponse<AsetListInterface>>>(
      `${API_URLS.ASSET}/asset/viewall/paginated`,
      {
        params,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      }
    );
    
    return response.data.data;
  }

  /**
   * Fetch asset by platNomor (existing method - unchanged)
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
   * Update asset (existing method - unchanged)
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
   * Delete asset (soft delete) (existing method - unchanged)
   */
  static async deleteAset(platNomor: string): Promise<void> {
    await axios.delete(`${API_URLS.ASSET}${API_ENDPOINTS.ASET.DELETE(platNomor)}`);
  }
}

// ADD PINIA STORE FOR PAGINATION
export const useAssetStore = defineStore('asset', () => {
  const assets = ref<AsetListInterface[]>([]);
  const isLoading = ref(false);
  const currentPage = ref(0);
  const totalPages = ref(0);
  const pageSize = ref(10);
  const totalElements = ref(0);
  const error = ref<string | null>(null);

  const viewAllAssetsWithPagination = async (
    page: number, 
    size: number = 10, 
    searchParams?: {
      nama?: string;
      jenisAset?: string;
      status?: string;
    }
  ) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await AsetService.viewAllAssetsPaginated(page, size, searchParams);
      
      assets.value = response.content;
      currentPage.value = response.number;
      totalPages.value = response.totalPages;
      pageSize.value = response.size;
      totalElements.value = response.totalElements;
      
      return response.content;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch assets';
      console.error('Error fetching paginated assets:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const resetStore = () => {
    assets.value = [];
    currentPage.value = 0;
    totalPages.value = 0;
    totalElements.value = 0;
    error.value = null;
  };

  return {
    assets,
    isLoading,
    currentPage,
    totalPages,
    pageSize,
    totalElements,
    error,
    viewAllAssetsWithPagination,
    resetStore,
  };
});