import { defineStore } from 'pinia';
import axios from 'axios';
import type { PurchaseInterface, AddPurchaseRequestInterface, UpdatePurchaseRequestInterface, UpdatePurchaseStatusRequestInterface, PurchaseSummaryResponseDTO } from '@/interfaces/purchase/purchase.interface';
// import type { ResourceTempInterface, AddResourceTempRequestInterface } from '@/interfaces/resourcetemp.interface';
import type { CommonResponseInterface } from '@/interfaces/common.interface';
import { useToast } from 'vue-toastification';
import router from '@/router';
import type { AddAssetTemp } from '@/interfaces/purchase/assettemp.interface';
import { API_URLS } from '@/config/api.config';
export const usePurchaseStore = defineStore('purchase', {
  state: () => ({
    purchases: [] as PurchaseInterface[],
    currentPurchase: null as PurchaseInterface | null,
    draftPurchase: (() => {
      const savedData = localStorage.getItem("draftPurchase");
      return savedData ? JSON.parse(savedData) : null;
    })(),
    loading: false,
    error: null as null | string,
    purchaseSummary: null as PurchaseSummaryResponseDTO | null,
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
          `${API_URLS.PURCHASE}/purchase/add`,
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

    async getPurchaseById(id: string) {
      this.loading = true;
      this.error = null;
      this.currentPurchase = null;

      try {
        const response = await axios.get<CommonResponseInterface<PurchaseInterface>>(
          `${API_URLS.PURCHASE}/purchase/detail/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          }
        );

        this.currentPurchase = response.data.data;
        return this.currentPurchase;
      } catch (err: unknown) {
        this.error = `Gagal mendapatkan detail pembelian ${err instanceof Error ? err.message : 'Unknown error'}`;
        useToast().error(this.error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updatePurchase(body: UpdatePurchaseRequestInterface, id: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.put<CommonResponseInterface<PurchaseInterface>>(
          `${API_URLS.PURCHASE}/purchase/update/${id}`,
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
    },

    async updatePurchaseStatus(id: string, isNextStatus: boolean = true, body: UpdatePurchaseStatusRequestInterface) {
      this.loading = true;
      this.error = null;

      try {
        const endpoint = isNextStatus
          ? `${API_URLS.PURCHASE}/purchase/updatestatus/next/${id}`
          : `${API_URLS.PURCHASE}/purchase/updatestatus/cancel/${id}`;

        const response = await axios.put<CommonResponseInterface<PurchaseInterface>>(
          endpoint,
          body,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          }
        );

        // Update local state
        if (this.currentPurchase && this.currentPurchase.id === id) {
          this.currentPurchase = response.data.data;
        }

        // Update in purchases array if exists
        const index = this.purchases.findIndex(p => p.id === id);
        if (index !== -1) {
          this.purchases[index] = response.data.data;
        }

        useToast().success('Status pembelian berhasil diperbarui');
        return response.data.data;
      } catch (err: unknown) {
        this.error = `Gagal memperbarui status pembelian ${err instanceof Error ? err.message : 'Unknown error'}`;
        useToast().error(this.error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updatePurchaseStatusPembayaran(id: string, body: UpdatePurchaseStatusRequestInterface) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.put<CommonResponseInterface<PurchaseInterface>>(
          `${API_URLS.PURCHASE}/purchase/updatestatus/pembayaran/${id}`,
          body,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          }
        );

        // Update local state
        if (this.currentPurchase && this.currentPurchase.id === id) {
          this.currentPurchase = response.data.data;
        }

        // Update in purchases array if exists
        const index = this.purchases.findIndex(p => p.id === id);
        if (index !== -1) {
          this.purchases[index] = response.data.data;
        }

        useToast().success('Status pembayaran berhasil diperbarui');
        return response.data.data;
      } catch (err: unknown) {
        this.error = `Gagal memperbarui status pembayaran ${err instanceof Error ? err.message : 'Unknown error'}`;
        useToast().error(this.error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async addAssetTemp(body: AddAssetTemp) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post<CommonResponseInterface<PurchaseInterface>>(
          `${API_URLS.PURCHASE}/purchase/addAsset`,
          body,
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        this.purchases.push(response.data.data);

        useToast().success('Sukses mengajukan Pembelian Aset');
        await router.push('/purchase');
      } catch (err: unknown) {
        this.error = `Gagal menambahkan Aset ${err instanceof Error ? err.message : 'Unknown error'}`;
        useToast().error(this.error);
      } finally {
        this.loading = false;
      }
    },
    async viewAllPurchase(filters = {}) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get<CommonResponseInterface<PurchaseInterface[]>>(
          `${API_URLS.PURCHASE}/purchase/viewall`,
          { params: filters } // ✅ Kirim filter sebagai query parameters
        );

        this.purchases = response.data.data;
      } catch (err: unknown) {
        this.error = `Gagal mengambil data pembelian ${err instanceof Error ? err.message : "Unknown error"}`;
        useToast().error(this.error);
      } finally {
        this.loading = false;
      }
    },
        // Method untuk mendapatkan daftar pembelian berdasarkan rentang
    async getPurchaseListByRange(range: string = 'THIS_YEAR') {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get<CommonResponseInterface<PurchaseInterface[]>>(
          `${API_URLS.PURCHASE}/purchase/range`, {
            params: { range }
          }
        );
        
        this.purchases = response.data.data;
        useToast().success('Daftar pembelian berhasil diambil');
      } catch (err: unknown) {
        this.error = `Gagal mengambil daftar pembelian: ${err instanceof Error ? err.message : 'Unknown error'}`;
        useToast().error(this.error);
      } finally {
        this.loading = false;
      }
    },

    // Method untuk mendapatkan ringkasan pembelian berdasarkan rentang
    async getPurchaseSummary(range: string = 'THIS_YEAR') {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get<CommonResponseInterface<PurchaseSummaryResponseDTO>>(
          `${API_URLS.PURCHASE}/purchase/summary`, {
            params: { range }
          }
        );

        this.purchaseSummary = response.data.data;

      } catch (err: unknown) {
        this.error = `Gagal mendapatkan ringkasan pembelian: ${err instanceof Error ? err.message : 'Unknown error'}`;
        useToast().error(this.error);
      } finally {
        this.loading = false;
      }
    },
  },
});
