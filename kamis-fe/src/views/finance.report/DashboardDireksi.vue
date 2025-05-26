<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <!-- Header Section -->
    <div class="max-w-7xl mx-auto bg-white p-5 rounded-lg shadow-md mb-4">
      <div class="welcome-message text-5xl font-bold mb-4">
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

    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <!-- Card Total Profit -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center">
          <div class="text-xl font-bold">Total Profit/Loss</div>
          <div class="bg-[#E5EAF2] p-3 rounded-full">
            <font-awesome-icon :icon="['fas', 'dollar-sign']" class="text-[#1E3A5F]" />
          </div>
        </div>
        <div class="text-3xl font-semibold mt-2">{{ formatCurrency(cardTotalProfit) }}</div>
        <div :class="{'text-green-500': cardTotalProfitPercentage >= 0, 'text-red-500': cardTotalProfitPercentage < 0}" class="text-sm mt-1">
          {{ cardTotalProfitPercentage >= 0 ? '+' : '' }}{{ cardTotalProfitPercentage.toFixed(2) }}% dari {{ timeAgoText }}
        </div>
      </div>

      <!-- Card Total Transaksi -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center">
          <div class="text-xl font-bold">Total Transaksi</div>
          <div class="bg-[#E5EAF2] p-3 rounded-full">
            <font-awesome-icon :icon="['fas', 'shopping-cart']" class="text-[#1E3A5F]" />
          </div>
        </div>
        <div class="text-3xl font-semibold mt-2">{{ cardTotalTransaction }}</div>
        <div :class="{'text-green-500': cardTotalTransactionPercentage >= 0, 'text-red-500': cardTotalTransactionPercentage < 0}" class="text-sm mt-1">
          {{ cardTotalTransactionPercentage >= 0 ? '+' : '' }}{{ cardTotalTransactionPercentage.toFixed(2) }}% dari {{ timeAgoText }}
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

    <!-- Daftar Supplier Section -->
    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md mb-4">
      <div class="mb-4">
        <h2 class="text-xl font-bold text-center">Daftar Supplier Teratas</h2>
      </div>
      
      <table class="custom-table w-full">
        <thead class="text-white bg-[#1E3A5F]">
          <tr>
            <th @click="sortTable('supplier', 'nameSupplier')" class="px-4 py-3 text-center cursor-pointer table-header">
              Nama Supplier
              <span v-if="sortSupplierKey === 'nameSupplier'" class="ml-1">
                <font-awesome-icon :icon="['fas', sortSupplierOrder === 'asc' ? 'sort-up' : 'sort-down']" />
              </span>
            </th>
            <th @click="sortTable('supplier', 'purchaseCount')" class="px-4 py-3 text-center cursor-pointer table-header">
              Jumlah Pembelian
              <span v-if="sortSupplierKey === 'purchaseCount'" class="ml-1">
                <font-awesome-icon :icon="['fas', sortSupplierOrder === 'asc' ? 'sort-up' : 'sort-down']" />
              </span>
            </th>
            <th @click="sortTable('supplier', 'companySupplier')" class="px-4 py-3 text-center cursor-pointer table-header">
              Perusahaan
              <span v-if="sortSupplierKey === 'companySupplier'" class="ml-1">
                <font-awesome-icon :icon="['fas', sortSupplierOrder === 'asc' ? 'sort-up' : 'sort-down']" />
              </span>
            </th>
            <th @click="sortTable('supplier', 'noTelpSupplier')" class="px-4 py-3 text-center cursor-pointer table-header">
              Nomor Telepon
              <span v-if="sortSupplierKey === 'noTelpSupplier'" class="ml-1">
                <font-awesome-icon :icon="['fas', sortSupplierOrder === 'asc' ? 'sort-up' : 'sort-down']" />
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

    <!-- Daftar Klien Section -->
    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md mb-4">
      <div class="mb-4">
        <h2 class="text-xl font-bold text-center">Daftar Klien Teratas</h2>
      </div>
      
      <table class="custom-table w-full">
        <thead class="text-white bg-[#1E3A5F]">
          <tr>
            <th @click="sortTable('client', 'nameClient')" class="px-4 py-3 text-center cursor-pointer table-header">
              Nama Klien
              <span v-if="sortClientKey === 'nameClient'" class="ml-1">
                <font-awesome-icon :icon="['fas', sortClientOrder === 'asc' ? 'sort-up' : 'sort-down']" />
              </span>
            </th>
            <th @click="sortTable('client', 'projectCount')" class="px-4 py-3 text-center cursor-pointer table-header">
              Jumlah Aktivitas
              <span v-if="sortClientKey === 'projectCount'" class="ml-1">
                <font-awesome-icon :icon="['fas', sortClientOrder === 'asc' ? 'sort-up' : 'sort-down']" />
              </span>
            </th>
            <th @click="sortTable('client', 'totalProfit')" class="px-4 py-3 text-center cursor-pointer table-header">
              Total Profit
              <span v-if="sortClientKey === 'totalProfit'" class="ml-1">
                <font-awesome-icon :icon="['fas', sortClientOrder === 'asc' ? 'sort-up' : 'sort-down']" />
              </span>
            </th>
            <th @click="sortTable('client', 'noTelpClient')" class="px-4 py-3 text-center cursor-pointer table-header">
              Nomor Telepon
              <span v-if="sortClientKey === 'noTelpClient'" class="ml-1">
                <font-awesome-icon :icon="['fas', sortClientOrder === 'asc' ? 'sort-up' : 'sort-down']" />
              </span>
            </th>
            <th @click="sortTable('client', 'companyClient')" class="px-4 py-3 text-center cursor-pointer table-header">
              Perusahaan
              <span v-if="sortClientKey === 'companyClient'" class="ml-1">
                <font-awesome-icon :icon="['fas', sortClientOrder === 'asc' ? 'sort-up' : 'sort-down']" />
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import { usePurchaseStore } from '@/stores/purchase';
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
const projectStore = useProjectStore();
const purchaseStore = usePurchaseStore();
const authStore = useAuthStore();

// Tambahkan useRouter untuk navigasi
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
  purchaseCount: number; // Jumlah pembelian
  purchaseIds?: string[]; // Daftar ID pembelian
}

interface Client {
  id: string ;
  nameClient: string;
  projectCount: number;
  totalProfit: number;
  noTelpClient?: string;
  companyClient?: string;
}

const topSuppliers = ref<Supplier[]>([]);
const topClients = ref<Client[]>([]);

// Tambahkan state untuk pengurutan supplier
const supplierSortAsc = ref(false);

// Tambahkan state untuk pengurutan klien
const clientSortAsc = ref(false);

// Ganti dengan variable sorting seperti di ListAsset
const sortSupplierKey = ref('purchaseCount');
const sortSupplierOrder = ref('desc'); // Default desc (tertinggi dulu)
const sortClientKey = ref('totalProfit');
const sortClientOrder = ref('desc'); // Default desc (tertinggi dulu)

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

// Computed property untuk top 3 suppliers berdasarkan kriteria sorting saat ini
// Meningkatkan fungsi sort untuk menangani semua tipe kolom
const topThreeSuppliers = computed(() => {
  // Jika tidak ada data, kembalikan array kosong
  if (!topSuppliers.value || topSuppliers.value.length === 0) {
    return [];
  }

  return [...topSuppliers.value]
    .sort((a, b) => {
      let aValue = a[sortSupplierKey.value as keyof Supplier];
      let bValue = b[sortSupplierKey.value as keyof Supplier];
      
      // Khusus untuk purchaseCount, jika tidak ada gunakan panjang purchaseIds
      if (sortSupplierKey.value === 'purchaseCount') {
        aValue = typeof aValue === 'number' ? aValue : 
          (a.purchaseIds ? a.purchaseIds.length : 0);
        bValue = typeof bValue === 'number' ? bValue : 
          (b.purchaseIds ? b.purchaseIds.length : 0);
      }
      
      // Handle undefined atau null
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';
      
      // Untuk string, gunakan localeCompare
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortSupplierOrder.value === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // Untuk angka
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortSupplierOrder.value === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      
      // Fallback untuk tipe campuran
      const aString = String(aValue);
      const bString = String(bValue);
      
      return sortSupplierOrder.value === 'asc' 
        ? aString.localeCompare(bString) 
        : bString.localeCompare(aString);
    })
    .slice(0, 3); // Ambil 3 teratas saja
});

// Computed property untuk top 3 clients berdasarkan kriteria sorting saat ini
// Meningkatkan fungsi sort untuk menangani semua tipe kolom
const topThreeClients = computed(() => {
  // Jika tidak ada data, kembalikan array kosong
  if (!topClients.value || topClients.value.length === 0) {
    return [];
  }

  return [...topClients.value]
    .sort((a, b) => {
      let aValue = a[sortClientKey.value as keyof Client];
      let bValue = b[sortClientKey.value as keyof Client];
      
      // Handle undefined atau null
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';
      
      // Untuk string, gunakan localeCompare
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortClientOrder.value === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // Untuk angka
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortClientOrder.value === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      
      // Fallback untuk tipe campuran
      const aString = String(aValue);
      const bString = String(bValue);
      
      return sortClientOrder.value === 'asc' 
        ? aString.localeCompare(bString) 
        : bString.localeCompare(aString);
    })
    .slice(0, 3); // Ambil 3 teratas saja
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
      // Transformasi data supplier untuk menghitung purchaseCount dari purchaseIds
      topSuppliers.value = Array.isArray(response.data.data) ? 
        response.data.data.map((supplier: { purchaseCount: any; purchaseIds: string | any[]; }) => {
          return {
            ...supplier,
            // Gunakan purchaseCount dari API jika ada, jika tidak hitung dari purchaseIds
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

// Perbarui fungsi sortTable untuk memastikan semua kolom dapat di-sort
const sortTable = (tableType: string, key: string) => {
  if (tableType === 'supplier') {
    if (sortSupplierKey.value === key) {
      // Toggle urutan jika key yang sama
      sortSupplierOrder.value = sortSupplierOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
      // Set key baru dan default ke descending
      sortSupplierKey.value = key;
      sortSupplierOrder.value = 'desc';
    }
  } else if (tableType === 'client') {
    if (sortClientKey.value === key) {
      // Toggle urutan jika key yang sama
      sortClientOrder.value = sortClientOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
      // Set key baru dan default ke descending
      sortClientKey.value = key;
      sortClientOrder.value = 'desc';
    }
  }
};

/// Fungsi untuk navigasi ke halaman detail supplier
const goToSupplierDetail = (supplierId: string) => {
  console.log('Navigating to supplier detail with ID:', supplierId);
  router.push({
    name: 'supplier-detail', // Perbaikan: nama rute yang benar dari router
    params: { id: supplierId }
  });
};

// Fungsi untuk navigasi ke halaman detail klien
const goToClientDetail = (clientId: string) => {
  console.log('Navigating to client detail with ID:', clientId);
  router.push({
    name: 'client-detail', // Perbaikan: nama rute yang benar dari router
    params: { id: clientId }
  });
};
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
  text-align: center;
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

/* Tambahkan style untuk sort indicator dari ListAsset */
.table-header:hover {
  background-color: #32486B;
}

/* Tambahkan style untuk baris tabel yang dapat diklik */
.custom-table tbody tr {
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.custom-table tbody tr:hover {
  background-color: #EDF2F7;
}

/* Tambahkan efek visual seperti pada ListAsset */
.custom-table tbody tr td {
  border-bottom: 1px solid #E2E8F0;
}

/* Tambahkan highlight effect saat hover */
.custom-table tbody tr:hover td {
  position: relative;
}

.custom-table tbody tr:hover td::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 1px;
  background-color: #4299E1;
}
</style>