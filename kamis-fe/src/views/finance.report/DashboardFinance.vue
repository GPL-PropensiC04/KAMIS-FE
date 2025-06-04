<template>
  <Breadcrumb />
  <div class="min-h-screen bg-gray-50 p-4 lg:p-6">
    <!-- Welcome Section -->
    <div class="w-full bg-white p-6 rounded-xl shadow-sm mb-6">
      <div class="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4">
        <!-- Left Side: Welcome Message -->
        <div class="flex-1">
          <div class="welcome-message text-4xl lg:text-5xl font-bold mb-2 text-gray-800">
            Welcome, {{ userInfo.username }}
          </div>
          <div class="text-gray-600 text-sm lg:text-base">
            Mari kelola keuangan dengan bijak!
          </div>
        </div>
        
        <!-- Right Side: Date Range Buttons -->
        <div class="flex flex-wrap gap-3 lg:flex-shrink-0">
          <button
            :class="[
              'px-4 py-2 lg:px-5 lg:py-3 rounded-lg font-medium transition-all duration-200 text-sm lg:text-base',
              selectedRange === 'LAST_YEAR' 
                ? 'bg-[#1E3A5F] text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
            ]"
            @click="setDateRange('LAST_YEAR')">
            Tahun Lalu
          </button>
          <button
            :class="[
              'px-4 py-2 lg:px-5 lg:py-3 rounded-lg font-medium transition-all duration-200 text-sm lg:text-base',
              selectedRange === 'THIS_YEAR' 
                ? 'bg-[#1E3A5F] text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
            ]"
            @click="setDateRange('THIS_YEAR')">
            Tahun Ini
          </button>
          <button
            :class="[
              'px-4 py-2 lg:px-5 lg:py-3 rounded-lg font-medium transition-all duration-200 text-sm lg:text-base',
              selectedRange === 'THIS_QUARTER' 
                ? 'bg-[#1E3A5F] text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
            ]"
            @click="setDateRange('THIS_QUARTER')">
            Kuartal Ini
          </button>
          <button
            :class="[
              'px-4 py-2 lg:px-5 lg:py-3 rounded-lg font-medium transition-all duration-200 text-sm lg:text-base',
              selectedRange === 'THIS_MONTH' 
                ? 'bg-[#1E3A5F] text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
            ]"
            @click="setDateRange('THIS_MONTH')">
            Bulan Ini
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6">
      <!-- Total Profit/Loss Card -->
      <div class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="text-lg lg:text-xl font-bold text-gray-800 mb-2">Total Profit/Loss</div>
            <div class="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">{{ formatCurrency(cardTotalProfit) }}</div>
            <div :class="{'text-green-600': cardTotalProfitPercentage >= 0, 'text-red-500': cardTotalProfitPercentage < 0}" 
                 class="text-sm font-medium">
              {{ cardTotalProfitPercentage >= 0 ? '+' : '' }}{{ cardTotalProfitPercentage.toFixed(2) }}% dari {{ timeAgoText }}
            </div>
          </div>
          <div class="bg-[#E5EAF2] p-3 rounded-full flex-shrink-0">
            <font-awesome-icon :icon="['fas', 'dollar-sign']" class="text-[#1E3A5F] text-xl" />
          </div>
        </div>
      </div>

      <!-- Total Transaksi Card -->
      <div class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="text-lg lg:text-xl font-bold text-gray-800 mb-2">Total Transaksi</div>
            <div class="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">{{ cardTotalTransaction }}</div>
            <div :class="{'text-green-600': cardTotalTransactionPercentage >= 0, 'text-red-500': cardTotalTransactionPercentage < 0}" 
                 class="text-sm font-medium">
              {{ cardTotalTransactionPercentage >= 0 ? '+' : '' }}{{ cardTotalTransactionPercentage.toFixed(2) }}% dari {{ timeAgoText }}
            </div>
          </div>
          <div class="bg-[#E5EAF2] p-3 rounded-full flex-shrink-0">
            <font-awesome-icon :icon="['fas', 'shopping-cart']" class="text-[#1E3A5F] text-xl" />
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6">
      <!-- Distribusi Keuangan Chart -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center mb-4">
          <div class="bg-green-100 p-2 rounded-lg mr-3">
            <font-awesome-icon
              :icon="['fas', 'scale-balanced']"
              class="text-green-700 text-lg"
            />
          </div>
          <h2 class="text-lg lg:text-xl font-bold text-gray-800 leading-tight">
            Distribusi Keuangan Perusahaan
          </h2>
        </div>
        <div class="h-80">
          <VBarTotalPemasukkanPengeluaran :range="selectedRange" @data-loaded="updateBarChartData" />
        </div>
      </div>

      <!-- Pengeluaran Chart -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center mb-4">
          <div class="bg-red-100 p-2 rounded-lg mr-3">
            <font-awesome-icon
              :icon="['fas', 'money-bill']"
              class="text-red-700 text-lg"
            />
          </div>
          <h2 class="text-lg lg:text-xl font-bold text-gray-800 leading-tight">
            % Pengeluaran per Jenis Pengeluaran
          </h2>
        </div>
        <div class="h-80">
          <VDonutPengeluaran :range="selectedRange" @data-loaded="updateDonutChartData" />
        </div>
      </div>
    </div>

    <!-- Line Chart -->
    <div class="mb-6">
      <VLineIncomeExpense :range="selectedRange" :view="chartView" @data-loaded="updateLineChartData" />
    </div>

    <!-- Financial Summary -->
    <div class="w-full bg-white rounded-xl shadow-sm overflow-hidden mb-6">
      <div class="bg-[#1E3A5F] p-4 lg:p-6">
        <h2 class="text-lg lg:text-xl font-bold text-white">
          Informasi Keuangan Perusahaan {{ dynamicTitle }}
        </h2>
      </div>
      
      <div class="p-6 bg-gray-50">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm lg:text-base">
          <div class="flex justify-between items-center py-2 border-b border-gray-200">
            <span class="font-medium text-gray-700">Total Pemasukan</span>
            <span class="font-semibold text-gray-900">{{ formatCurrency(financialSummary?.totalIncome) }}</span>
          </div>
          
          <div class="flex justify-between items-center py-2 border-b border-gray-200">
            <span class="font-medium text-gray-700">Total Pembelian</span>
            <span class="font-semibold text-gray-900">{{ formatCurrency(financialSummary?.totalPurchase) }}</span>
          </div>
          
          <div class="flex justify-between items-center py-2 border-b border-gray-200">
            <span class="font-medium text-gray-700">Pemasukan dari Distribusi</span>
            <span class="font-semibold text-gray-900">{{ formatCurrency(financialSummary?.totalIncomeFromDistribusi) }}</span>
          </div>
          
          <div class="flex justify-between items-center py-2 border-b border-gray-200">
            <span class="font-medium text-gray-700">Pengeluaran Maintenance</span>
            <span class="font-semibold text-gray-900">{{ formatCurrency(financialSummary?.totalMaintenanceExpense) }}</span>
          </div>
          
          <div class="flex justify-between items-center py-2 border-b border-gray-200">
            <span class="font-medium text-gray-700">Pemasukan dari Penjualan</span>
            <span class="font-semibold text-gray-900">{{ formatCurrency(financialSummary?.totalIncomeFromPenjualan) }}</span>
          </div>
          
          <div class="flex justify-between items-center py-2 border-b border-gray-200">
            <span class="font-medium text-gray-700">Pengeluaran Proyek</span>
            <span class="font-semibold text-gray-900">{{ formatCurrency(financialSummary?.totalProjectExpense) }}</span>
          </div>
          
          <div class="md:col-span-2 flex justify-between items-center py-3 mt-2 bg-white rounded-lg p-4 border-2 border-[#1E3A5F]">
            <span class="font-bold text-lg text-gray-800">Total Profit</span>
            <span class="font-bold text-lg" :class="financialSummary && financialSummary.totalProfit < 0 ? 'text-red-600' : 'text-green-600'">
              {{ formatCurrency(financialSummary?.totalProfit) }}
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
  totalTransactions: number;
  transactionPercentageChange: number;
  profitPercentageChange: number;
}

const selectedRange = ref('THIS_YEAR');
const chartView = ref('MONTH');
const loading = ref(true);

const authStore = useAuthStore();
const financeReportStore = useFinanceReportStore();

const financialSummary = computed<FinancialSummaryResponseDTO | null | undefined>(() => financeReportStore.financialSummary);

const cardTotalProfit = ref(0);
const cardTotalTransaction = ref(0);
const cardTotalProfitPercentage = ref(0);
const cardTotalTransactionPercentage = ref(0);

const timeAgoText = computed(() => {
  switch (selectedRange.value) {
    case 'THIS_YEAR':
      return 'tahun lalu';
    case 'THIS_QUARTER':
      return 'kuartal lalu';
    case 'THIS_MONTH':
      return 'bulan lalu';
    case 'LAST_YEAR': // Tambahkan case untuk LAST_YEAR
      return '2 tahun lalu'; // Periode perbandingan untuk 'Tahun Lalu' adalah '2 Tahun Lalu'
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
    case 'LAST_YEAR': return 'Tahun Lalu'; // Tambahkan case untuk LAST_YEAR
    default: return 'Periode Ini'; // Default yang lebih umum jika ada range tak terduga
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
    await financeReportStore.fetchFinancialSummary(selectedRange.value);
    cardTotalProfit.value = financialSummary.value?.totalProfit || 0;
    cardTotalTransaction.value = financialSummary.value?.totalTransactions || 0;
    cardTotalProfitPercentage.value = financialSummary.value?.profitPercentageChange || 0;
    cardTotalTransactionPercentage.value = financialSummary.value?.transactionPercentageChange || 0;  
  } catch (error) {
    console.error('Error fetching card summary data', error);
    cardTotalProfit.value = 0;
    cardTotalTransaction.value = 0;
    cardTotalProfitPercentage.value = 0;
    cardTotalTransactionPercentage.value = 0;
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
.text-green-600 {
  color: #059669;
}

.text-red-500 {
  color: #ef4444;
}

.text-green-700 {
  color: #047857;
}

.text-red-700 {
  color: #b91c1c;
}

.bg-green-100 {
  background-color: #dcfce7;
}

.bg-red-100 {
  background-color: #fee2e2;
}

/* Responsive Design */
@media (max-width: 768px) {
  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>