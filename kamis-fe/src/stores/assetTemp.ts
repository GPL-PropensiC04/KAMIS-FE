import { defineStore } from 'pinia';
import axios from 'axios';
import type { AssetTempInterface } from '@/interfaces/assettemp.interface';
// import type { ResourceTempInterface, AddResourceTempRequestInterface } from '@/interfaces/resourcetemp.interface';
import type { CommonResponseInterface } from '@/interfaces/common.interface';
import { useToast } from 'vue-toastification';
import type { AddAssetTemp } from '@/interfaces/assettemp.interface';

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
            // Create FormData for submission since backend requires multipart/form-data
            const formData = new FormData();
            formData.append('assetName', body.assetName || '');
            formData.append('assetDescription', body.assetDescription || '');
            formData.append('assetType', body.assetType || '');
            formData.append('assetPrice', body.assetPrice?.toString() || '0');
            
            if (body.foto instanceof File) {
              formData.append('foto', body.foto);
              console.log('Sending as multipart/form-data with File');
            } else {
              console.log('No file attached or invalid file type');
            }
            
            const headers = { 'Content-Type': 'multipart/form-data' };
            console.log('Request headers:', headers);
            
            const response = await axios.post<CommonResponseInterface<AssetTempInterface>>(
              `http://localhost:8084/api/purchase/addAsset`, 
              formData,
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
