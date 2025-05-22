<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-7xl mx-auto bg-white p-5 rounded-lg shadow-md mb-6">
      <div class="welcome-message text-xl font-bold mb-4">
        Welcome, {{ userInfo.username }}
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          :class="[
            'px-6 py-2 rounded-md font-medium transition-colors',
            selectedRange === 'THIS_YEAR' ? 'bg-[#1E3A5F] text-white' : 'bg-gray-100 text-gray-700'
          ]"
          @click="setDateRange('THIS_YEAR')">
          Tahun Ini
        </button>
        <button
          :class="[
            'px-6 py-2 rounded-md font-medium transition-colors',
            selectedRange === 'THIS_QUARTER' ? 'bg-[#1E3A5F] text-white' : 'bg-gray-100 text-gray-700'
          ]"
          @click="setDateRange('THIS_QUARTER')">
          Kuartal Ini
        </button>
        <button
          :class="[
            'px-6 py-2 rounded-md font-medium transition-colors',
            selectedRange === 'THIS_MONTH' ? 'bg-[#1E3A5F] text-white' : 'bg-gray-100 text-gray-700'
          ]"
          @click="setDateRange('THIS_MONTH')">
          Bulan Ini
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center">
          <div class="text-xl font-bold">Total Pembelian</div>
          <div class="bg-[#E5EAF2] p-3 rounded-full">
            <font-awesome-icon :icon="['fas', 'shopping-cart']" class="text-[#1E3A5F]" />
          </div>
        </div>
        <div class="text-3xl font-semibold mt-2">{{ cardTotalPurchase }}</div>
        <div :class="{'text-green-500': cardPurchasePercentage >= 0, 'text-red-500': cardPurchasePercentage < 0}" class="text-sm mt-1">
          {{ cardPurchasePercentage >= 0 ? '+' : '' }}{{ cardPurchasePercentage.toFixed(2) }}% dari {{ timeAgoText }}
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center">
          <div class="text-xl font-bold">Total Pemasukan Distribusi</div>
          <div class="bg-[#E5EAF2] p-3 rounded-full">
            <font-awesome-icon :icon="['fas', 'truck']" class="text-[#1E3A5F]" />
          </div>
        </div>
        <div class="text-3xl font-semibold mt-2">{{ cardTotalDistribution }}</div>
        <div :class="{'text-green-500': cardDistributionPercentage >= 0, 'text-red-500': cardDistributionPercentage < 0}" class="text-sm mt-1">
          {{ cardDistributionPercentage >= 0 ? '+' : '' }}{{ cardDistributionPercentage.toFixed(2) }}% dari {{ timeAgoText }}
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center">
          <div class="text-xl font-bold">Total Pemasukan Penjualan</div>
          <div class="bg-[#E5EAF2] p-3 rounded-full">
            <font-awesome-icon :icon="['fas', 'dollar-sign']" class="text-[#1E3A5F]" />
          </div>
        </div>
        <div class="text-3xl font-semibold mt-2">{{ cardTotalSales }}</div>
        <div :class="{'text-green-500': cardSalesPercentage >= 0, 'text-red-500': cardSalesPercentage < 0}" class="text-sm mt-1">
          {{ cardSalesPercentage >= 0 ? '+' : '' }}{{ cardSalesPercentage.toFixed(2) }}% dari {{ timeAgoText }}
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="bg-white rounded-2xl shadow-md p-6">
        <div class="flex items-center mb-4">
          <font-awesome-icon
            :icon="['fas', 'money-bill-transfer']"
            class="text-[24px] mr-2"
            style="color: #2E7D32;"
          />
          <h2 class="text-lg font-bold leading-tight">
            Distribusi Keuangan Perusahaan
          </h2>
        </div>
        <div class="h-[320px]">
          <VBarTotalPemasukkanPengeluaran :range="selectedRange" @data-loaded="updateBarChartData" />
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md p-6">
        <div class="flex items-center mb-4">
          <font-awesome-icon
            :icon="['fas', 'money-bill']"
            class="text-[24px] mr-2"
            style="color: #912018;"
          />
          <h2 class="text-lg font-bold leading-tight">
            % Pengeluaran per Jenis Pengeluaran
          </h2>
        </div>
        <div class="h-[320px]">
          <VDonutPengeluaran :range="selectedRange" @data-loaded="updateDonutChartData" />
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto bg-white rounded-2xl shadow-md p-6 mb-6">
      <div class="h-[425px]">
        <VLineIncomeExpense :range="selectedRange" :view="chartView" @data-loaded="updateLineChartData" />
      </div>
    </div>

    <div class="max-w-7xl mx-auto bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <h2 class="text-lg font-semibold text-white bg-[#1E3A5F] p-4">
        Informasi Keuangan Perusahaan {{ dynamicTitle }}
      </h2>
      <div class="p-6 bg-[#F0F2F5]">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div class="flex justify-between">
            <span class="font-medium text-gray-700">Total Pemasukan</span>
            <span class="font-semibold text-gray-900">: {{ formatCurrency(financialSummary?.totalIncome) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-700">Total Pembelian</span>
            <span class="font-semibold text-gray-900">: {{ formatCurrency(financialSummary?.totalPurchase) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-700">Pemasukan dari Distribusi</span>
            <span class="font-semibold text-gray-900">: {{ formatCurrency(financialSummary?.totalIncomeFromDistribusi) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-700">Pengeluaran Maintenance</span>
            <span class="font-semibold text-gray-900">: {{ formatCurrency(financialSummary?.totalMaintenanceExpense) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-700">Pemasukan dari Penjualan</span>
            <span class="font-semibold text-gray-900">: {{ formatCurrency(financialSummary?.totalIncomeFromPenjualan) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-700">Pengeluaran Proyek</span>
            <span class="font-semibold text-gray-900">: {{ formatCurrency(financialSummary?.totalProjectExpense) }}</span>
          </div>
          <div class="flex justify-between md:col-start-1">
            <span class="font-medium text-gray-700">Total Profit</span>
            <span class="font-semibold" :class="financialSummary && financialSummary.totalProfit < 0 ? 'text-red-600' : 'text-gray-900'">
              : {{ formatCurrency(financialSummary?.totalProfit) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useFinanceReportStore } from '@/stores/financereport';
import { useProjectStore } from '@/stores/project';
import { usePurchaseStore } from '@/stores/purchase';
import Breadcrumb from '@/components/Breadcrumb.vue';
import VDonutPengeluaran from '@/components/VDonutPengeluaran.vue';
import VBarTotalPemasukkanPengeluaran from '@/components/VBarTotalPemasukkanPengeluaran.vue';
import VLineIncomeExpense from '@/components/VLineIncomeExpense.vue';

export interface FinancialSummaryResponseDTO {
  totalIncome: number;
  totalIncomeFromDistribusi: number;
  totalIncomeFromPenjualan: number;
  totalPurchase: number;
  totalMaintenanceExpense: number;
  totalProjectExpense: number;
  totalProfit: number;
}

const selectedRange = ref('THIS_YEAR');
const chartView = ref('MONTH');
const loading = ref(true);

const authStore = useAuthStore();
const financeReportStore = useFinanceReportStore();
const projectStore = useProjectStore();
const purchaseStore = usePurchaseStore();

const financialSummary = computed<FinancialSummaryResponseDTO | null | undefined>(() => financeReportStore.financialSummary);

const cardTotalPurchase = ref(0);
const cardTotalDistribution = ref(0);
const cardTotalSales = ref(0);
const cardPurchasePercentage = ref(0);
const cardDistributionPercentage = ref(0);
const cardSalesPercentage = ref(0);

const timeAgoText = computed(() => {
  switch (selectedRange.value) {
    case 'THIS_YEAR':
      return 'tahun lalu';
    case 'THIS_QUARTER':
      return 'kuartal lalu';
    case 'THIS_MONTH':
      return 'bulan lalu';
    default:
      return 'periode lalu';
  }
});

const userInfo = computed(() => {
  const user = authStore.user;
  return { username: user ? user.username : 'User' };
});

const formatCurrency = (amount?: number | null): string => {
  if (amount === null || amount === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const setDateRange = (range: string) => {
  selectedRange.value = range;
  fetchData();
};

const dynamicTitle = computed(() => {
  switch (selectedRange.value) {
    case 'THIS_YEAR': return 'Tahun Ini';
    case 'THIS_QUARTER': return 'Kuartal Ini';
    case 'THIS_MONTH': return 'Bulan Ini';
    default: return 'Bulan Ini'; // Default to 'Bulan Ini'
  }
});

const updateBarChartData = (data: any) => {
  console.log('Bar chart data loaded:', data);
};

const updateDonutChartData = (data: any) => {
  console.log('Donut chart data loaded:', data);
};

const updateLineChartData = (data: any) => {
  console.log('Line chart data loaded:', data);
};

const fetchCardSummaryData = async () => {
  try {
    await purchaseStore.getPurchaseSummary(selectedRange.value);
    cardTotalPurchase.value = purchaseStore.purchaseSummary?.totalPurchase || 0;
    cardPurchasePercentage.value = purchaseStore.purchaseSummary?.percentageChange || 0;

    await projectStore.getSellDistributionSummary(selectedRange.value);
    cardTotalDistribution.value = projectStore.sellDistributionSummary?.totalDistribution || 0;
    cardTotalSales.value = projectStore.sellDistributionSummary?.totalSell || 0;
    cardDistributionPercentage.value = projectStore.sellDistributionSummary?.percentageDistributionChange || 0;
    cardSalesPercentage.value = projectStore.sellDistributionSummary?.percentageSellChange || 0;

  } catch (error) {
    console.error('Error fetching card summary data', error);
    cardTotalPurchase.value = 0;
    cardPurchasePercentage.value = 0;
    cardTotalDistribution.value = 0;
    cardTotalSales.value = 0;
    cardDistributionPercentage.value = 0;
    cardSalesPercentage.value = 0;
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      financeReportStore.fetchFinancialSummary(selectedRange.value),
      fetchCardSummaryData()
    ]);
  } catch (error) {
    console.error('Error fetching page data', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.text-green-500 {
  color: #16A34A;
}

.text-red-500 {
  color: #EF4444;
}
</style>