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
            const response = await axios.post<CommonResponseInterface<AssetTempInterface>>(
              `http://localhost:8084/api/purchase/addAsset`, 
              body,
              {
                headers: {
                  'Content-Type': 'application/json',
                }
              }
            );

            const newAsset = response.data.data;
            this.assetTemps.push(response.data.data);
            return newAsset.id; // Mengembalikan ID Asset baru
          } catch (err: unknown) {
            this.error = `Gagal menambahkan Draf Aset ${err instanceof Error ? err.message : 'Unknown error'}`;
            useToast().error(this.error);
          } finally {
            this.loading = false;
          }
        }
    },
});
