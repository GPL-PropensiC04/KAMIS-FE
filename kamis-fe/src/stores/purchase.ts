import { defineStore } from 'pinia';
import type { PurchaseInterface, AddPurchaseRequestInterface } from '@/interfaces/purchase.interface';
import type { ResourceTempInterface, AddResourceTempRequestInterface } from '@/interfaces/resourcetemp.interface';
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
        setDraftPurchase(data) {
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
              const response = await fetch('http://localhost:8084/api/purchase/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'
                    ,"Authorization": `Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBZG1pbiIsImlhdCI6MTc0MjIyNDM1MywiZXhwIjoxNzQyMzEwNzUzfQ.J70CZ19O39Yc447iOaLXPyaaoaQNCVSVlzX1Kb3vF3idCVorhctLiKXTwYd11M4U4Jy7Td6IrDAjf6GmnksWAHjRdO15juVmARmLxQ9elG0tW7wb1tbw7kie0QChS_F3MmIt7yfN1zgihtaQivOWMBhJlNPOPbtsC_XTXllwgveRzrGHnBIIOs75_EUit8MhiPnGbNehZRQsW6irOJm_EoaFZIgZW76xI5WDRQjEJ7MnskIdRSi1E9jzFky7fzqthWPDK4-ibcmrJ-sDQ2vkDYznnCMDb0Jxzj-LOvSbHkRwbkcOj4WoatuXWcesczq7oOXc-xNvgoUPKv71e1iMDA` // Token Otentikasi
                },
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
              this.error = `Gagal menambah Pembelian ${(err as Error).message}`;
              useToast().error(this.error);
            } finally {
              this.loading = false;
            }
        }
    },
});
