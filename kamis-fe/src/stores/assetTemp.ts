import { defineStore } from 'pinia';
import axios from 'axios';
import type { AssetTempInterface, AddAssetTemp } from '@/interfaces/assettemp.interface';
import type { CommonResponseInterface } from '@/interfaces/common.interface';
import { useToast } from 'vue-toastification';

export const useAssetTempStore = defineStore('assetTemp', {
    state: () => ({
        assetTemps: [] as AssetTempInterface[],
        draftAssetTemp: (() => {
            const savedData = localStorage.getItem("draftAssetTemp");
            return savedData ? JSON.parse(savedData) : null;
          })(),
        loading: false,
        error: null as null | string,
    }),
    actions: {
        setDraftAssetTemp(data: AssetTempInterface) {
            this.draftAssetTemp = data;
            localStorage.setItem("draftAssetTemp", JSON.stringify(data)); // Simpan ke localStorage
        },
      
        clearDraftAssetTemp() {
            this.draftAssetTemp = null;
            localStorage.removeItem("draftAssetTemp"); // Hapus dari localStorage
        },

        async addAssetTemp(body: AddAssetTemp) {
          this.loading = true;
          this.error = null;
        
          try {
            let requestData;
            let headers = {};

            // Handle different types of foto input
            if (body.foto instanceof File) {
              // If foto is a File object, create FormData
              const formData = new FormData();
              formData.append('assetName', body.assetName || '');
              formData.append('assetDescription', body.assetDescription || '');
              formData.append('assetType', body.assetType || '');
              formData.append('assetPrice', body.assetPrice?.toString() || '0');
              formData.append('foto', body.foto);
              
              requestData = formData;
              headers = { 'Content-Type': 'multipart/form-data' };
              console.log('Sending as multipart/form-data with File');
            } 
            else if (typeof body.foto === 'string' && body.foto.startsWith('data:')) {
              // If base64 string, send as JSON
              requestData = body;
              headers = { 'Content-Type': 'application/json' };
              console.log('Sending as JSON with base64 image');
            }
            else {
              // Default case - send as JSON
              requestData = body;
              headers = { 'Content-Type': 'application/json' };
              console.log('Sending as JSON without image');
            }

            console.log('Request headers:', headers);
            
            const response = await axios.post<CommonResponseInterface<AssetTempInterface>>(
              `http://localhost:8084/api/purchase/addAsset`, 
              requestData,
              { headers }
            );

            this.assetTemps.push(response.data.data);
          } catch (err: unknown) {
            this.error = `Gagal menambahkan Draf Aset ${err instanceof Error ? err.message : 'Unknown error'}`;
            useToast().error(this.error);
          } finally {
            this.loading = false;
          }
        }
    },
});
