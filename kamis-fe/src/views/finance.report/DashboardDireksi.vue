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
            Dashboard eksekutif untuk pengambilan keputusan strategis
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

    <!-- Top Suppliers Table -->
    <div class="w-full bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
      <div class="bg-[#1E3A5F] p-4 lg:p-6">
        <h2 class="text-lg lg:text-xl font-bold text-white text-center">
          Daftar Supplier Teratas
        </h2>
      </div>
      
      <!-- Loading state untuk tabel supplier -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A5F]"></div>
        <span class="ml-2 text-gray-600">Memuat data supplier...</span>
      </div>

      <!-- Tabel supplier (existing code) -->
      <div v-else class="overflow-x-auto">
        <table class="custom-table w-full">
          <thead class="text-white bg-[#1E3A5F]">
            <tr>
              <th @click="sortTable('supplier', 'nameSupplier')" class="px-4 py-3 text-center cursor-pointer table-header">
                Nama Supplier
                <span v-if="sortSupplierKey === 'nameSupplier'" class="ml-1">
                  {{ sortSupplierOrder === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="sortTable('supplier', 'purchaseCount')" class="px-4 py-3 text-center cursor-pointer table-header">
                Jumlah Pembelian
                <span v-if="sortSupplierKey === 'purchaseCount'" class="ml-1">
                  {{ sortSupplierOrder === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="sortTable('supplier', 'companySupplier')" class="px-4 py-3 text-center cursor-pointer table-header">
                Perusahaan
                <span v-if="sortSupplierKey === 'companySupplier'" class="ml-1">
                  {{ sortSupplierOrder === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="sortTable('supplier', 'noTelpSupplier')" class="px-4 py-3 text-center cursor-pointer table-header">
                Nomor Telepon
                <span v-if="sortSupplierKey === 'noTelpSupplier'" class="ml-1">
                  {{ sortSupplierOrder === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="text-center">
              <td colspan="4" class="py-4">
                <div class="flex justify-center">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A5F]"></div>
                </div>
              </td>
            </tr>
            <tr v-else-if="topThreeSuppliers.length === 0">
              <td colspan="4" class="text-center py-4 text-gray-500 italic">
                Tidak ada data supplier.
              </td>
            </tr>
            <tr 
              v-for="supplier in topThreeSuppliers" 
              :key="supplier.id" 
              class="hover:bg-gray-100 cursor-pointer transition-colors"
              @click="goToSupplierDetail(supplier.id)"
            >
              <td class="px-4 py-3 text-center">{{ supplier.nameSupplier }}</td>
              <td class="px-4 py-3 text-center">{{ supplier.purchaseCount || 0 }} Pembelian</td>
              <td class="px-4 py-3 text-center">{{ supplier.companySupplier || '-' }}</td>
              <td class="px-4 py-3 text-center">{{ supplier.noTelpSupplier || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Top Clients Table -->
    <div class="w-full bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
      <div class="bg-[#1E3A5F] p-4 lg:p-6">
        <h2 class="text-lg lg:text-xl font-bold text-white text-center">
          Daftar Klien Teratas
        </h2>
      </div>
      
      <!-- Loading state untuk tabel client -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A5F]"></div>
        <span class="ml-2 text-gray-600">Memuat data klien...</span>
      </div>

      <!-- Tabel client (existing code) -->
      <div v-else class="overflow-x-auto">
        <table class="custom-table w-full">
          <thead class="text-white bg-[#1E3A5F]">
        <tr>
          <th @click="sortTable('client', 'nameClient')" class="px-4 py-3 text-center cursor-pointer table-header">
            Nama Klien
            <span v-if="sortClientKey === 'nameClient'" class="ml-1">
              {{ sortClientOrder === 'asc' ? '▲' : '▼' }}
            </span>
          </th>
          <th @click="sortTable('client', 'projectCount')" class="px-4 py-3 text-center cursor-pointer table-header">
            Jumlah Aktivitas
            <span v-if="sortClientKey === 'projectCount'" class="ml-1">
              {{ sortClientOrder === 'asc' ? '▲' : '▼' }}
            </span>
          </th>
          <th @click="sortTable('client', 'totalProfit')" class="px-4 py-3 text-center cursor-pointer table-header">
            Total Profit
            <span v-if="sortClientKey === 'totalProfit'" class="ml-1">
              {{ sortClientOrder === 'asc' ? '▲' : '▼' }}
            </span>
          </th>
          <th @click="sortTable('client', 'noTelpClient')" class="px-4 py-3 text-center cursor-pointer table-header">
            Nomor Telepon
            <span v-if="sortClientKey === 'noTelpClient'" class="ml-1">
              {{ sortClientOrder === 'asc' ? '▲' : '▼' }}
            </span>
          </th>
          <th @click="sortTable('client', 'companyClient')" class="px-4 py-3 text-center cursor-pointer table-header">
            Perusahaan
            <span v-if="sortClientKey === 'companyClient'" class="ml-1">
              {{ sortClientOrder === 'asc' ? '▲' : '▼' }}
            </span>
          </th>
        </tr>
      </thead>
        <tbody>
          <tr v-if="loading" class="text-center">
            <td colspan="5" class="py-4">
              <div class="flex justify-center">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A5F]"></div>
              </div>
            </td>
          </tr>
          <tr v-else-if="topThreeClients.length === 0">
            <td colspan="5" class="text-center py-4 text-gray-500 italic">
              Tidak ada data klien.
            </td>
          </tr>
          <tr 
            v-for="client in topThreeClients" 
            :key="client.id" 
            class="hover:bg-gray-100 cursor-pointer transition-colors"
            @click="goToClientDetail(client.id)"
          >
            <td class="px-4 py-3 text-center">{{ client.nameClient }}</td>
            <td class="px-4 py-3 text-center">{{ client.projectCount || 0 }} Aktivitas</td>
            <td class="px-4 py-3 text-center">{{ formatCurrency(client.totalProfit || 0) }}</td>
            <td class="px-4 py-3 text-center">{{ client.noTelpClient || '-' }}</td>
            <td class="px-4 py-3 text-center">{{ client.companyClient || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import { API_URLS } from '@/config/api.config';
import Breadcrumb from '@/components/Breadcrumb.vue';
import VDonutPengeluaran from '@/components/VDonutPengeluaran.vue';
import VBarTotalPemasukkanPengeluaran from '@/components/VBarTotalPemasukkanPengeluaran.vue';
import VLineIncomeExpense from '@/components/VLineIncomeExpense.vue';
import type { FinancialSummaryResponseDTO } from '@/interfaces/finance.report/lapkeu.interface';
import { useFinanceReportStore } from '@/stores/financereport';

// Stores
const authStore = useAuthStore();

// Router for navigation
const router = useRouter();

// State variables
const selectedRange = ref('THIS_YEAR');
const chartView = ref('MONTH');
const loading = ref(true);
const barChartData = ref(null);

// Summary data
const cardTotalProfit = ref(0);
const cardTotalTransaction = ref(0);
const cardTotalProfitPercentage = ref(0);
const cardTotalTransactionPercentage = ref(0);

// Top suppliers and clients
interface Supplier {
  id: string;
  nameSupplier: string;
  noTelpSupplier: string;
  companySupplier: string;
  totalPurchases: number;
  totalAmount: number;
  purchaseCount: number;
  purchaseIds?: string[];
}

interface Client {
  id: string;
  nameClient: string;
  projectCount: number;
  totalProfit: number;
  noTelpClient?: string;
  companyClient?: string;
}

const topSuppliers = ref<Supplier[]>([]);
const topClients = ref<Client[]>([]);


const sortSupplierKey = ref('purchaseCount');
const sortSupplierOrder = ref('desc');
const sortClientKey = ref('totalProfit');
const sortClientOrder = ref('desc');

// Computed property for top 3 suppliers
const topThreeSuppliers = computed(() => {
  if (!topSuppliers.value || topSuppliers.value.length === 0) {
    return [];
  }

  return [...topSuppliers.value]
    .sort((a, b) => {
      let aValue = a[sortSupplierKey.value as keyof Supplier];
      let bValue = b[sortSupplierKey.value as keyof Supplier];
      
      if (sortSupplierKey.value === 'purchaseCount') {
        aValue = typeof aValue === 'number' ? aValue : 
          (a.purchaseIds ? a.purchaseIds.length : 0);
        bValue = typeof bValue === 'number' ? bValue : 
          (b.purchaseIds ? b.purchaseIds.length : 0);
      }
      
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortSupplierOrder.value === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortSupplierOrder.value === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      
      const aString = String(aValue);
      const bString = String(bValue);
      
      return sortSupplierOrder.value === 'asc' 
        ? aString.localeCompare(bString) 
        : bString.localeCompare(aString);
    })
    .slice(0, 3);
});

// Computed property for top 3 clients
const topThreeClients = computed(() => {
  if (!topClients.value || topClients.value.length === 0) {
    return [];
  }

  return [...topClients.value]
    .sort((a, b) => {
      let aValue = a[sortClientKey.value as keyof Client];
      let bValue = b[sortClientKey.value as keyof Client];
      
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortClientOrder.value === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortClientOrder.value === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      
      const aString = String(aValue);
      const bString = String(bValue);
      
      return sortClientOrder.value === 'asc' 
        ? aString.localeCompare(bString) 
        : bString.localeCompare(aString);
    })
    .slice(0, 3);
});

// Time ago text based on selected range
const timeAgoText = computed(() => {
  switch (selectedRange.value) {
    case 'THIS_YEAR':
      return 'tahun lalu';
    case 'THIS_QUARTER':
      return 'kuartal lalu';
    case 'THIS_MONTH':
      return 'bulan lalu';
    default:
      return 'tahun lalu';
  }
});

// User info for welcome message
const userInfo = computed(() => {
  const user = authStore.user;
  return { username: user ? user.username : 'User' };
});

// Format currency function
const formatCurrency = (amount: number): string => {
  if (amount === null || amount === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Set date range and fetch data
const setDateRange = (range: string) => {
  selectedRange.value = range;
  fetchData();
};

// Update chart data functions
const updateBarChartData = (data: any) => {
  barChartData.value = data;
  console.log('Bar chart data loaded:', data);
};

const updateDonutChartData = (data: any) => {
  console.log('Donut chart data loaded:', data);
};

const updateLineChartData = (data: any) => {
  console.log('Line chart data loaded:', data);
};

const financialSummary = computed<FinancialSummaryResponseDTO | null | undefined>(() => financeReportStore.financialSummary);
const financeReportStore = useFinanceReportStore();

// Fetch summary data
const fetchSummaryData = async () => {
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

// Fetch top suppliers data
const fetchTopSuppliers = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('auth_token');
    console.log('Fetching suppliers with range:', selectedRange.value);
    
    const response = await axios.get(`${API_URLS.PROFILE}/supplier/getall`, {
      params: { range: selectedRange.value },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Supplier API response:', response.data);
    
    if (response.data && response.data.status === 200 && response.data.data) {
      topSuppliers.value = Array.isArray(response.data.data) ? 
        response.data.data.map((supplier: { purchaseCount: any; purchaseIds: string | any[]; }) => {
          return {
            ...supplier,
            purchaseCount: supplier.purchaseCount || (supplier.purchaseIds ? supplier.purchaseIds.length : 0)
          };
        }) : [];
      console.log('Processed suppliers:', topSuppliers.value);
    } else {
      console.warn('Unexpected supplier API response structure:', response.data);
      topSuppliers.value = [];
    }
  } catch (error: any) {
    console.error('Error fetching suppliers:', error.message, error.response?.data);
    topSuppliers.value = [];
  } finally {
    loading.value = false;
  }
};

// Fetch top clients data
const fetchTopClients = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('auth_token');
    console.log('Fetching clients with range:', selectedRange.value);
    
    const response = await axios.get(`${API_URLS.PROFILE}/client/all`, {
      params: { range: selectedRange.value },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Client API response:', response.data);
    
    if (response.data && response.data.status === 200 && response.data.data) {
      topClients.value = Array.isArray(response.data.data) ? response.data.data : [];
      console.log('Loaded clients:', topClients.value);
    } else {
      console.warn('Unexpected client API response structure:', response.data);
      topClients.value = [];
    }
  } catch (error: any) {
    console.error('Error fetching clients:', error.message, error.response?.data);
    topClients.value = [];
  } finally {
    loading.value = false;
  }
};

// Fetch all data
const fetchData = async () => {
  loading.value = true;
  
  try {
    await Promise.all([
      fetchSummaryData(),
      fetchTopSuppliers(),
      fetchTopClients()
    ]);
  } catch (error: any) {
    console.error('Error fetching dashboard data', error);
  } finally {
    loading.value = false;
  }
};

// Initialize on component mount
onMounted(() => {
  fetchData();
});

// Watch for chart view changes
watch(chartView, () => {
  // Handle chart view changes if needed
});

// Sort table function
const sortTable = (tableType: string, key: string) => {
  if (tableType === 'supplier') {
    if (sortSupplierKey.value === key) {
      sortSupplierOrder.value = sortSupplierOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortSupplierKey.value = key;
      sortSupplierOrder.value = 'desc';
    }
  } else if (tableType === 'client') {
    if (sortClientKey.value === key) {
      sortClientOrder.value = sortClientOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortClientKey.value = key;
      sortClientOrder.value = 'desc';
    }
  }
};

// Navigation functions
const goToSupplierDetail = (supplierId: string) => {
  console.log('Navigating to supplier detail with ID:', supplierId);
  router.push({
    name: 'supplier-detail',
    params: { id: supplierId }
  });
};

const goToClientDetail = (clientId: string) => {
  console.log('Navigating to client detail with ID:', clientId);
  router.push({
    name: 'client-detail',
    params: { id: clientId }
  });
};
</script>

<style scoped>
/* Table Styles */
.custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 0;
  overflow: hidden;
}

.table-header {
  padding: 1rem 1.5rem;
  text-align: center;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.table-header:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.table-cell {
  padding: 1rem 1.5rem;
  text-align: center;
  border-bottom: 1px solid #f3f4f6;
}

.table-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.table-row:nth-child(odd) {
  background-color: #ffffff;
}

.table-row:nth-child(even) {
  background-color: #f9fafb;
}

.table-row:hover {
  background-color: #f0f4f8;
}

/* Sort Indicator */
.sort-indicator {
  margin-left: 0.5rem;
  font-size: 0.75rem;
  display: inline-block;
}

/* Stats Cards Enhancement */
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
  .table-header,
  .table-cell {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
}
</style>