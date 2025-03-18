import { defineStore } from 'pinia';
import axios from 'axios';
import type { PurchaseInterface, AddPurchaseRequestInterface, UpdatePurchaseRequestInterface } from '@/interfaces/purchase.interface';
// import type { ResourceTempInterface, AddResourceTempRequestInterface } from '@/interfaces/resourcetemp.interface';
import type { CommonResponseInterface } from '@/interfaces/common.interface';
import { useToast } from 'vue-toastification';
import router from '@/router';

export const usePurchaseStore = defineStore('purchase', {
    state: () => ({
        purchases: [] as PurchaseInterface[],
        draftPurchase: (() => {
            const savedData = localStorage.getItem("draftPurchase");
            return savedData ? JSON.parse(savedData) : null;
          })(),
        loading: false,
        error: null as null | string,
    }),
    actions: {
        setDraftPurchase(data: PurchaseInterface) {
            this.draftPurchase = data;
            localStorage.setItem("draftPurchase", JSON.stringify(data)); // Simpan ke localStorage
        },
      
        clearDraftPurchase() {
            this.draftPurchase = null;
            localStorage.removeItem("draftPurchase"); // Hapus dari localStorage
        },

        
        async addPurchase(body: AddPurchaseRequestInterface) {
            this.loading = true;
            this.error = null;
          
            try {
              const response = await axios.post<CommonResponseInterface<PurchaseInterface>>(
                'http://localhost:8084/api/purchase/add', 
                body,
                {
                  headers: {
                    'Content-Type': 'application/json',
                  }
                }
              );

              this.purchases.push(response.data.data);
          
              useToast().success('Sukses mengajukan Pembelian');
              await router.push('/purchase');
            } catch (err: unknown) {
              this.error = `Gagal menambah Pembelian ${err instanceof Error ? err.message : 'Unknown error'}`;
              useToast().error(this.error);
            } finally {
              this.loading = false;
            }
        },

        async updatePurchase(body: UpdatePurchaseRequestInterface, id: string) {
          this.loading = true;
          this.error = null;
        
          try {
            const response = await axios.put<CommonResponseInterface<PurchaseInterface>>(
              `http://localhost:8084/api/purchase/update/${id}`, 
              body,
              {
                headers: {
                  'Content-Type': 'application/json',
                }
              }
            );

            this.purchases.push(response.data.data);
        
            useToast().success('Sukses mengedit Pembelian');
            await router.push('/purchase');
          } catch (err: unknown) {
            this.error = `Gagal mengedit Pembelian ${err instanceof Error ? err.message : 'Unknown error'}`;
            useToast().error(this.error);
          } finally {
            this.loading = false;
          }
      }
    },
});
