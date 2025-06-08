import { defineStore } from 'pinia';
import axios from 'axios';
import type { PurchaseInterface, AddPurchaseRequestInterface, UpdatePurchaseRequestInterface, UpdatePurchaseStatusRequestInterface, PurchaseSummaryResponseDTO } from '@/interfaces/purchase/purchase.interface';
import type { CommonResponseInterface, PaginatedResponse } from '@/interfaces/common.interface';
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
    
    // NEW PAGINATION STATE
    currentPage: 0,
    totalPages: 0,
    pageSize: 10,
    totalElements: 0,
    isLoading: false,
  }),
  actions: {
    setDraftPurchase(data: PurchaseInterface) {
      this.draftPurchase = data;
      localStorage.setItem("draftPurchase", JSON.stringify(data));
    },

    clearDraftPurchase() {
      this.draftPurchase = null;
      localStorage.removeItem("draftPurchase");
    },

    // NEW PAGINATION METHOD
    async viewAllPurchasesPaginated(
      page: number, 
      size: number = 10, 
      filters: {
        startNominal?: number | null;
        endNominal?: number | null;
        highNominal?: boolean | null;
        startDate?: string | null;
        endDate?: string | null;
        newDate?: boolean | null;
        type?: string;
        idSearch?: string | null;
        status?: string | null;
      } = {}
    ) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const params: any = { page, size };

        // Add filters to params
        if (filters.startNominal !== null && filters.startNominal !== undefined) {
          params.startNominal = filters.startNominal;
        }
        
        if (filters.endNominal !== null && filters.endNominal !== undefined) {
          params.endNominal = filters.endNominal;
        }
        
        if (filters.highNominal !== null && filters.highNominal !== undefined) {
          params.highNominal = filters.highNominal;
        }
        
        if (filters.startDate && filters.startDate.trim() !== '') {
          params.startDate = filters.startDate.trim();
        }
        
        if (filters.endDate && filters.endDate.trim() !== '') {
          params.endDate = filters.endDate.trim();
        }
        
        if (filters.newDate !== null && filters.newDate !== undefined) {
          params.newDate = filters.newDate;
        }
        
        if (filters.type && filters.type !== 'All' && filters.type !== 'all') {
          params.type = filters.type.toLowerCase();
        }
        
        if (filters.idSearch && filters.idSearch.trim() !== '') {
          params.idSearch = filters.idSearch.trim();
        }
        
        if (filters.status && filters.status.trim() !== '') {
          params.status = filters.status.trim();
        }

        console.log('Purchase pagination params:', params);

        const response = await axios.get<CommonResponseInterface<PaginatedResponse<PurchaseInterface>>>(
          `${API_URLS.PURCHASE}/purchase/viewall/paginated`,
          {
            params,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
          }
        );

        const paginatedData = response.data.data;
        
        this.purchases = paginatedData.content;
        this.currentPage = paginatedData.number;
        this.totalPages = paginatedData.totalPages;
        this.pageSize = paginatedData.size;
        this.totalElements = paginatedData.totalElements;
        
        return paginatedData.content;
      } catch (err: unknown) {
        this.error = `Gagal mengambil data pembelian ${err instanceof Error ? err.message : "Unknown error"}`;
        useToast().error(this.error);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    resetPaginationStore() {
      this.purchases = [];
      this.currentPage = 0;
      this.totalPages = 0;
      this.totalElements = 0;
      this.error = null;
    },

    // EXISTING METHODS REMAIN UNCHANGED
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

    // EXISTING METHOD - KEEP FOR BACKWARD COMPATIBILITY
    async viewAllPurchase(filters = {}) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get<CommonResponseInterface<PurchaseInterface[]>>(
          `${API_URLS.PURCHASE}/purchase/viewall`,
          { params: filters }
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
      } catch (err: unknown) {
        this.error = `Gagal mengambil daftar pembelian: ${err instanceof Error ? err.message : 'Unknown error'}`;
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
      } finally {
        this.loading = false;
      }
    },
  },
});