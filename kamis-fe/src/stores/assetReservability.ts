import { defineStore } from 'pinia';
import axios, { AxiosError } from 'axios';
import { API_URLS } from '@/config/api.config';
import type { 
  Asset, 
  AssetResponseDTO, 
  AssetAvailabilityRequest, 
  AssetReservationRequest,
  AssetAvailabilityResponse 
} from '@/interfaces/asset/asset.interface';
import { useToast } from 'vue-toastification';

// Define error interface
interface ErrorResponse {
  message?: string;
}

export const useAssetStore = defineStore('asset', {
  state: () => ({
    assets: [] as Asset[],
    loading: false,
    error: null as string | null,
  }),
  
  actions: {
    async fetchAssets() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get<AssetResponseDTO>(`${API_URLS.ASSET}/asset/all`, {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        if (response.data.status === 200) {
          // Handle case where data is an array or a single object
          const assetData = Array.isArray(response.data.data) 
            ? response.data.data 
            : [response.data.data];
          
          this.assets = assetData;
          this.loading = false;
          return assetData;
        } else {
          throw new Error(response.data.message || 'Failed to fetch assets');
        }
      } catch (error: unknown) {
        const err = error as AxiosError<ErrorResponse>;
        this.error = err.response?.data?.message || 'Error fetching assets';
        this.loading = false;
        return []; // Return empty array on error
      }
    },
    
    async checkAssetAvailability(request: AssetAvailabilityRequest): Promise<Record<string, boolean>> {
      try {
        const response = await axios.post<AssetAvailabilityResponse>(
          `${API_URLS.ASSET}/asset/reservations/check-availability`,
          request,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          }
        );
        
        if (response.data.status === 200) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to check asset availability');
        }
      } catch (error: unknown) {
        const err = error as AxiosError<ErrorResponse>;
        const errorMessage = err.response?.data?.message || 'Error checking asset availability';
        useToast().error(errorMessage);
        throw new Error(errorMessage);
      }
    },
    
    async reserveAssets(request: AssetReservationRequest) {
      this.loading = true;
      this.error = null;
      
      try {
        await axios.post(
          `${API_URLS.ASSET}/asset/reservations/reserve`,
          request,
          {
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          }
        );
        
        useToast().success('Assets reserved successfully');
      } catch (error: unknown) {
        const err = error as AxiosError<ErrorResponse>;
        this.error = err.response?.data?.message || 'Error reserving assets';
        useToast().error(this.error);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  },
  
  getters: {
    availableAssets: (state) => {
      return state.assets.filter(asset => asset.status === 'Tersedia');
    },
    getAssetsByType: (state) => (type: string) => {
      return state.assets.filter(asset => asset.tipeAset === type);
    },
    getAssetById: (state) => (id: string) => {
      return state.assets.find(asset => asset.platNomor === id);
    }
  }
}); 