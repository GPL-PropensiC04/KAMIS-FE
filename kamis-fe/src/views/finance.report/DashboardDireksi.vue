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

    <!-- Charts Section - 2 Column Grid for Bar and Donut Chart -->
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <!-- Pemasukan dan Pengeluaran Chart -->
      <div class="bg-white rounded-2xl shadow-md p-6">
        <div class="flex items-center mb-4">
          <font-awesome-icon
            :icon="['fas', 'scale-balanced']"
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
      
      <!-- Donut Pengeluaran Chart -->
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

    <!-- Line Income Expense Chart -->
      <div class="mb-4">
        <VLineIncomeExpense :range="selectedRange" :view="chartView" @data-loaded="updateLineChartData" />
      </div>

    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md mb-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">Daftar Supplier</h2>
        <!-- Tombol sortir -->
        <button @click="supplierSortAsc = !supplierSortAsc" class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center gap-1">
          <font-awesome-icon :icon="['fas', supplierSortAsc ? 'sort-amount-up' : 'sort-amount-down']" class="text-sm" />
          {{ supplierSortAsc ? 'Pembelian Terendah' : 'Pembelian Tertinggi' }}
        </button>
      </div>
      
      <table class="custom-table w-full">
        <thead class="text-white bg-[#1E3A5F]">
          <tr>
            <th class="px-4 py-3 text-left">Nama Supplier</th>
            <th class="px-4 py-3 text-center">Jumlah Pembelian</th>
            <th class="px-4 py-3 text-right">Perusahaan</th>
            <th class="px-4 py-3 text-center">Nomor Telepon</th>
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
          <tr v-else-if="sortedSuppliers.length === 0">
            <td colspan="4" class="text-center py-4 text-gray-500 italic">
              Tidak ada data supplier.
            </td>
          </tr>
          <tr v-for="supplier in sortedSuppliers" :key="supplier.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-left">{{ supplier.nameSupplier }}</td>
            <td class="px-4 py-3 text-center">{{ supplier.purchaseCount || 0 }} Pembelian</td>
            <td class="px-4 py-3 text-right">{{ supplier.companySupplier || '-' }}</td>
            <td class="px-4 py-3 text-center">{{ supplier.noTelpSupplier || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Daftar Klien Section -->
    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md mb-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">Daftar Klien</h2>
        <!-- Tombol sortir untuk klien -->
        <button @click="clientSortAsc = !clientSortAsc" class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center gap-1">
          <font-awesome-icon :icon="['fas', clientSortAsc ? 'sort-amount-up' : 'sort-amount-down']" class="text-sm" />
          {{ clientSortAsc ? 'Profit Terendah' : 'Profit Tertinggi' }}
        </button>
      </div>
      
      <table class="custom-table w-full">
        <thead class="text-white bg-[#1E3A5F]">
          <tr>
            <th class="px-4 py-3 text-left">Nama Klien</th>
            <th class="px-4 py-3 text-center">Jumlah Aktivitas</th>
            <th class="px-4 py-3 text-right">Total Profit</th>
            <th class="px-4 py-3 text-center">Nomor Telepon</th>
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
          <tr v-else-if="sortedClients.length === 0">
            <td colspan="5" class="text-center py-4 text-gray-500 italic">
              Tidak ada data klien.
            </td>
          </tr>
          <tr v-for="client in sortedClients" :key="client.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-left">{{ client.nameClient }}</td>
            <td class="px-4 py-3 text-center">{{ client.projectCount || 0 }} Aktivitas</td>
            <td class="px-4 py-3 text-right">{{ formatCurrency(client.totalProfit || 0) }}</td>
            <td class="px-4 py-3 text-center">{{ client.noTelpClient || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
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
const chartView = ref('MONTH');
const loading = ref(true);
const barChartData = ref(null);

// Summary data
const totalPurchase = ref(0);
const totalDistribution = ref(0);
const totalSales = ref(0);
const purchasePercentage = ref(0);
const distributionPercentage = ref(0);
const salesPercentage = ref(0);

// Top suppliers and clients
interface Supplier {
  id: string;
  nameSupplier: string;
  noTelpSupplier: string;
  companySupplier: string;
  totalPurchases: number;
  totalAmount: number;
}

interface Client {
  id: string | number;
  name: string;
  activityCount: number;
  totalProfit: number;
  phone?: string;
}

const topSuppliers = ref<Supplier[]>([]);
const topClients = ref<Client[]>([]);

// Tambahkan state untuk pengurutan supplier
const supplierSortAsc = ref(false);

// Tambahkan state untuk pengurutan klien
const clientSortAsc = ref(false);

// Computed property untuk mengurutkan supplier berdasarkan jumlah pembelian
const sortedSuppliers = computed(() => {
  return [...topSuppliers.value].sort((a, b) => {
    const aPurchaseCount = a.purchaseCount || 0;
    const bPurchaseCount = b.purchaseCount || 0;
    
    return supplierSortAsc.value 
      ? aPurchaseCount - bPurchaseCount 
      : bPurchaseCount - aPurchaseCount;
  });
});

// Computed property untuk mengurutkan klien berdasarkan total profit
const sortedClients = computed(() => {
  return [...topClients.value].sort((a, b) => {
    const aProfit = a.totalProfit || 0;
    const bProfit = b.totalProfit || 0;
    
    return clientSortAsc.value 
      ? aProfit - bProfit 
      : bProfit - aProfit;
  });
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

// Update bar chart data when loaded
const updateBarChartData = (data: any) => {
  barChartData.value = data;
  console.log('Bar chart data loaded:', data);

};

// Update donut chart data when loaded
const updateDonutChartData = (data: any) => {
  console.log('Donut chart data loaded:', data);

};

// Update line chart data when loaded
const updateLineChartData = (data: any) => {
  console.log('Line chart data loaded:', data);
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

  } catch (error: any) {
    console.error('Error fetching summary data', error);

  }
};  // Fetch top suppliers data
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
      // Transformasi data supplier untuk sesuai dengan format yang diinginkan
      topSuppliers.value = Array.isArray(response.data.data) ? 
        response.data.data.map(supplier => {
          return {
            id: supplier.id,
            nameSupplier: supplier.nameSupplier,
            noTelpSupplier: supplier.noTelpSupplier,
            companySupplier: supplier.companySupplier,
            // Jika purchaseCount tidak ada, gunakan panjang purchaseIds jika tersedia
            purchaseCount: supplier.purchaseCount || (supplier.purchaseIds ? supplier.purchaseIds.length : 0),
            totalAmount: supplier.totalAmount || 0
          };
        }) : [];
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

// Fungsi yang sama untuk klien
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
  table-layout: fixed;
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