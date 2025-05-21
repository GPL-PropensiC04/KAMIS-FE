<!-- filepath: e:\Propen\KAMIS-FE\kamis-fe\src\views\finance.report\DashboardDireksi.vue -->
<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <!-- Header Section -->
    <div class="max-w-7xl mx-auto bg-white p-5 rounded-lg shadow-md mb-4">
      <div class="welcome-message text-xl font-bold mb-4">
        Welcome, {{ userInfo.username }}
      </div>
      
      <!-- Filter Buttons -->
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

    <!-- Total Pembelian, Distribusi, Penjualan Cards -->
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <!-- Total Pembelian -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center">
          <div class="text-xl font-bold">Total Pembelian</div>
          <div class="bg-[#E5EAF2] p-3 rounded-full">
            <font-awesome-icon :icon="['fas', 'shopping-cart']" class="text-[#1E3A5F]" />
          </div>
        </div>
        <div class="text-3xl font-semibold mt-2">{{ formatCurrency(totalPurchase) }}</div>
        <div :class="{'text-green-500': purchasePercentage >= 0, 'text-red-500': purchasePercentage < 0}" class="text-sm mt-1">
          {{ purchasePercentage >= 0 ? '+' : '' }}{{ purchasePercentage }}% dari {{ timeAgoText }}
        </div>
      </div>

      <!-- Total Distribusi -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center">
          <div class="text-xl font-bold">Total Distribusi</div>
          <div class="bg-[#E5EAF2] p-3 rounded-full">
            <font-awesome-icon :icon="['fas', 'truck']" class="text-[#1E3A5F]" />
          </div>
        </div>
        <div class="text-3xl font-semibold mt-2">{{ formatCurrency(totalDistribution) }}</div>
        <div :class="{'text-green-500': distributionPercentage >= 0, 'text-red-500': distributionPercentage < 0}" class="text-sm mt-1">
          {{ distributionPercentage >= 0 ? '+' : '' }}{{ distributionPercentage }}% dari {{ timeAgoText }}
        </div>
      </div>

      <!-- Total Penjualan -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center">
          <div class="text-xl font-bold">Total Penjualan</div>
          <div class="bg-[#E5EAF2] p-3 rounded-full">
            <font-awesome-icon :icon="['fas', 'dollar-sign']" class="text-[#1E3A5F]" />
          </div>
        </div>
        <div class="text-3xl font-semibold mt-2">{{ formatCurrency(totalSales) }}</div>
        <div :class="{'text-green-500': salesPercentage >= 0, 'text-red-500': salesPercentage < 0}" class="text-sm mt-1">
          {{ salesPercentage >= 0 ? '+' : '' }}{{ salesPercentage }}% dari {{ timeAgoText }}
        </div>
      </div>
    </div>

    <!-- Charts Section - 2 Column Grid -->
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <!-- Pemasukan dan Pengeluaran Chart -->
      <VBarTotalPemasukkanPengeluaran :range="selectedRange" />
      
      <!-- Donut Pengeluaran Chart -->
      <VDonutPengeluaran :range="selectedRange" />
    </div>

    <!-- Line Chart for Monthly Income-Expense -->
    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md mb-4">
      <div class="flex items-center mb-4">
        <font-awesome-icon
          :icon="['fas', 'chart-line']"
          class="text-[24px] mr-2 text-[#1E3A5F]"
        />
        <h2 class="text-lg font-bold">
          Total Pemasukan Distribusi dan Penjualan per Bulan
        </h2>
      </div>
      
      <!-- Filter buttons for chart -->
      <div class="flex mb-4 gap-2">
        <button 
          :class="[
            'px-6 py-1 text-sm rounded-md font-medium transition-colors', 
            chartView === 'MONTH' ? 'bg-[#1E3A5F] text-white' : 'bg-gray-100 text-gray-700'
          ]"
          @click="chartView = 'MONTH'">
          Bulan
        </button>
        <button 
          :class="[
            'px-6 py-1 text-sm rounded-md font-medium transition-colors', 
            chartView === 'QUARTER' ? 'bg-[#1E3A5F] text-white' : 'bg-gray-100 text-gray-700'
          ]"
          @click="chartView = 'QUARTER'">
          Kuartal
        </button>
      </div>
      
      <div class="h-[300px]">
        <VLineIncomeExpense :range="selectedRange" :view="chartView" />
      </div>
    </div>
    
    <!-- Daftar Supplier Section -->
    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md mb-4">
      <h2 class="text-xl font-bold mb-4">Daftar Supplier</h2>
      
      <table class="custom-table">
        <thead class="text-white bg-[#1E3A5F]">
          <tr>
            <th class="px-4 py-3">Nama Supplier</th>
            <th class="px-4 py-3">Jumlah Pembelian</th>
            <th class="px-4 py-3">Nominal Transaksi</th>
            <th class="px-4 py-3">Nomor Telepon</th>
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
          <tr v-else-if="topSuppliers.length === 0">
            <td colspan="4" class="text-center py-4 text-gray-500 italic">
              Tidak ada data supplier.
            </td>
          </tr>
          <tr v-for="supplier in topSuppliers" :key="supplier.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">{{ supplier.name }}</td>
            <td class="px-4 py-3 text-center">{{ supplier.purchaseCount }}</td>
            <td class="px-4 py-3 text-right">{{ formatCurrency(supplier.totalAmount) }}</td>
            <td class="px-4 py-3">{{ supplier.phone }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Daftar Klien Section -->
    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md mb-4">
      <h2 class="text-xl font-bold mb-4">Daftar Klien</h2>
      
      <table class="custom-table">
        <thead class="text-white bg-[#1E3A5F]">
          <tr>
            <th class="px-4 py-3">Nama Klien</th>
            <th class="px-4 py-3">Jumlah Aktivitas</th>
            <th class="px-4 py-3">Total Profit</th>
            <th class="px-4 py-3">Nomor Telepon</th>
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
          <tr v-else-if="topClients.length === 0">
            <td colspan="4" class="text-center py-4 text-gray-500 italic">
              Tidak ada data klien.
            </td>
          </tr>
          <tr v-for="client in topClients" :key="client.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">{{ client.name }}</td>
            <td class="px-4 py-3 text-center">{{ client.activityCount }}</td>
            <td class="px-4 py-3 text-right">{{ formatCurrency(client.totalProfit) }}</td>
            <td class="px-4 py-3">{{ client.phone }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import { usePurchaseStore } from '@/stores/purchase';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import { API_URLS } from '@/config/api.config';
import Breadcrumb from '@/components/Breadcrumb.vue';
import VDonutPengeluaran from '@/components/VDonutPengeluaran.vue';
import VBarTotalPemasukkanPengeluaran from '@/components/VBarTotalPemasukkanPengeluaran.vue';
import VLineIncomeExpense from '@/components/VLineIncomeExpense.vue';

// Stores
const projectStore = useProjectStore();
const purchaseStore = usePurchaseStore();
const authStore = useAuthStore();

// State variables
const selectedRange = ref('THIS_YEAR');
const chartView = ref('MONTH'); // For monthly/quarterly chart toggle
const loading = ref(true);

// Summary data
const totalPurchase = ref(0);
const totalDistribution = ref(0);
const totalSales = ref(0);
const purchasePercentage = ref(0);
const distributionPercentage = ref(0);
const salesPercentage = ref(0);

// Top suppliers and clients
const topSuppliers = ref([]);
const topClients = ref([]);

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

// Fetch summary data
const fetchSummaryData = async () => {
  try {
    // Fetch purchase summary
    await purchaseStore.getPurchaseSummary(selectedRange.value);
    totalPurchase.value = purchaseStore.purchaseSummary?.totalPurchase || 0;
    purchasePercentage.value = purchaseStore.purchaseSummary?.percentageChange || 0;

    // Fetch sell distribution summary
    await projectStore.getSellDistributionSummary(selectedRange.value);
    totalDistribution.value = projectStore.sellDistributionSummary?.totalDistribution || 0;
    totalSales.value = projectStore.sellDistributionSummary?.totalSell || 0;
    distributionPercentage.value = projectStore.sellDistributionSummary?.percentageDistributionChange || 0;
    salesPercentage.value = projectStore.sellDistributionSummary?.percentageSellChange || 0;

  } catch (error) {
    console.error('Error fetching summary data', error);
  }
};

// Fetch top suppliers data
const fetchTopSuppliers = async () => {
  try {
    const response = await axios.get(`${API_URLS.SUPPLIER}/top-suppliers`, {
      params: { range: selectedRange.value, limit: 3 },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (response.data && response.data.data) {
      topSuppliers.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching top suppliers', error);
    topSuppliers.value = [];
  }
};

// Fetch top clients data
const fetchTopClients = async () => {
  try {
    const response = await axios.get(`${API_URLS.CLIENT}/top-clients`, {
      params: { range: selectedRange.value, limit: 3 },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (response.data && response.data.data) {
      topClients.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching top clients', error);
    topClients.value = [];
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
  } catch (error) {
    console.error('Error fetching dashboard data', error);
  } finally {
    loading.value = false;
  }
};

// Initialize on component mount
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
}

.custom-table thead {
  background-color: #1E3A5F;
  color: white;
}

.custom-table th, .custom-table td {
  padding: 12px 16px;
}

.custom-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
}

.custom-table tbody tr:nth-child(odd) {
  background-color: #ffffff;
}

.custom-table tbody tr:nth-child(even) {
  background-color: #f9fafb;
}

.text-green-500 {
  color: #16A34A;
}

.text-red-500 {
  color: #EF4444;
}
</style>