import { defineStore } from 'pinia';
import axios from 'axios';
import type { FinancialSummaryResponseDTO, LapkeuInterface, LapkeuSummaryResponseDTO } from '@/interfaces/finance.report/lapkeu.interface';
import type { CommonResponseInterface } from "@/interfaces/common.interface";
import { API_URLS } from '@/config/api.config';

export const useFinanceReportStore = defineStore('financereport', {
  state: () => ({
    lapkeuList: [] as LapkeuInterface[],
    lapkeuSummary: null as LapkeuSummaryResponseDTO | null,
    financialSummary: null as FinancialSummaryResponseDTO | null,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchLapkeu(params: {
      startDate?: string;
      endDate?: string;
      activityType?: number;
    } = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get<CommonResponseInterface<LapkeuInterface[]>>(
          `${API_URLS.FINANCE}/lapkeu/all`,
          { params }
        );
        if (response.data.status === 200 && response.data.data) {
          this.lapkeuList = response.data.data;
        } else {
          this.lapkeuList = [];
          this.error = response.data.message || 'Tidak ada data laporan keuangan';
        }
      } catch (err: any) {
        this.error = err?.response?.data?.message || 'Gagal mengambil data laporan keuangan';
        this.lapkeuList = [];
      } finally {
        this.loading = false;
      }
    },
    async fetchLapkeuSummary(params: {
      startDate?: string;
      endDate?: string;
      activityType?: number;
    } = {}) {
      try {
        const response = await axios.get<CommonResponseInterface<LapkeuSummaryResponseDTO>>(
          `${API_URLS.FINANCE}/lapkeu/summary`,
          { params }
        );
        if (response.data.status === 200 && response.data.data) {
          this.lapkeuSummary = response.data.data;
        } else {
          this.lapkeuSummary = null;
          this.error = response.data.message || 'Tidak ada data summary';
        }
      } catch (err: any) {
        this.error = err?.response?.data?.message || 'Gagal mengambil data summary';
        this.lapkeuSummary = null;
      }
    },
    async fetchFinancialSummary(range: string = 'THIS_MONTH') {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get<CommonResponseInterface<FinancialSummaryResponseDTO>>(
          `${API_URLS.FINANCE}/finance-report/summary`, // Update URL to /finance-report/summary
          { params: { range } }
        );
        if (response.data.status === 200 && response.data.data) {
          this.financialSummary = response.data.data;
        } else {
          this.financialSummary = null;
          this.error = response.data.message || 'Tidak ada data summary finansial';
        }
      } catch (err: any) {
        this.error = err?.response?.data?.message || 'Gagal mengambil data summary finansial';
        this.financialSummary = null;
      } finally {
        this.loading = false;
      }
    },
    clearLapkeu() {
      this.lapkeuList = [];
    }
  }
});