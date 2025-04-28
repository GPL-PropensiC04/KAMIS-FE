// stores/supplier.store.ts

import { API_URLS } from "@/config/api.config";
import type { AddSupplierRequestInterface, SupplierInterface, SupplierListResponseInterface } from "@/interfaces/profile/supplier.interface";
import type { CommonResponseInterface } from "@/interfaces/common.interface";
import router from "@/router";
import axios from "axios";
import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

export const useSupplierStore = defineStore('supplier', {
  state: () => ({
    suppliers: [] as SupplierListResponseInterface[], // Untuk list supplier
    loading: false,
    error: null as null | string,
  }),
  actions: {
    async addSupplier(body: AddSupplierRequestInterface) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post<CommonResponseInterface<SupplierInterface>>(
          `${API_URLS.PROFILE}/supplier/add`,
          body,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
          }
        );

        if (response.data.status === 200) {
          useToast().success('Supplier berhasil ditambahkan!');
          await router.push('/supplier');
        }
      } catch (error: any) {
        this.error = error instanceof Error ? error.message : 'Terjadi kesalahan saat menambahkan supplier';
        useToast().error(error.response?.data?.message || this.error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async viewAllSuppliers(filters: { nameSupplier?: string; companySupplier?: string } = {}) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get<CommonResponseInterface<SupplierListResponseInterface[]>>(
          `${API_URLS.PROFILE}/supplier/all`,
          {
            params: filters,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
          }
        );
        this.suppliers = response.data.data;
      } catch (error: any) {
        this.error = error instanceof Error ? error.message : 'Gagal mengambil data supplier';
        useToast().error(error.response?.data?.message || this.error);
      } finally {
        this.loading = false;
      }
    },
  }
});
