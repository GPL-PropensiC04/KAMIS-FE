import { defineStore } from 'pinia';
import type { PurchaseInterface, AddPurchaseRequestInterface } from '@/interfaces/purchase.interface';
import type { ResourceTempInterface, AddResourceTempRequestInterface } from '@/interfaces/resourcetemp.interface';
import type { CommonResponseInterface } from '@/interfaces/common.interface';
import { useToast } from 'vue-toastification';
import router from '@/router';

export const usePurchaseStore = defineStore('purchase', {
    state: () => ({
        purchases: [] as PurchaseInterface[],
        draftPurchase: {
            purchaseSupplier: "",
            purchaseType: false,
        },
        loading: false,
        error: null as null | string,
    }),
    actions: {
        async addPurchase(body: AddPurchaseRequestInterface) {
            this.loading = true;
            this.error = null;
          
            try {
              const response = await fetch('http://localhost:8084/api/purchase/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(body),
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                  `Failed to add purchase: ${errorData.message || response.statusText}`
                );
              }

              const data: CommonResponseInterface<PurchaseInterface> = await response.json();
              this.purchases.push(data.data);
          
              useToast().success('Sukses mengajukan Pembelian');
              await router.push('/purchase');
            } catch (err) {
              this.error = `Gagal menambah reservasi ${(err as Error).message}`;
              useToast().error(this.error);
            } finally {
              this.loading = false;
            }
        }
    },
});
