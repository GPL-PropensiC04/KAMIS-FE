<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <!-- Header Section -->
      <div class="max-w-7xl mx-auto bg-white p-3 rounded-lg shadow-md mb-4">
            <!-- Menambahkan tulisan Welcome, {User} -->
            <div class="welcome-message text-xl font-bold my-4">
            Welcome, {{ userInfo.username }}
            </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <!-- Tiga Tombol untuk Pilihan Rentang Waktu -->
          <div class="flex justify-between">
            <button 
              class="bg-blue-500 text-white p-2 rounded-lg"
              @click="setDateRange('THIS_YEAR')">
              Tahun Ini
            </button>
            <button 
              class="bg-green-500 text-white p-2 rounded-lg"
              @click="setDateRange('THIS_QUARTER')">
              Kuartal Ini
            </button>
            <button 
              class="bg-yellow-500 text-white p-2 rounded-lg"
              @click="setDateRange('THIS_MONTH')">
              Bulan Ini
            </button>
          </div>
        </div>
      </div>

    <!-- Total Pembelian, Total Distribusi, Total Penjualan -->
    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <!-- Total Pembelian -->
        <div class="card-container">
          <div class="flex justify-between items-center">
            <div class="text-xl font-bold">Total Pembelian</div>
            <div class="icon-container">
              <span class="material-icons">shopping_cart</span>
            </div>
          </div>
          <div class="text-3xl font-semibold">{{ totalPurchase }}</div>
          <div :class="{'text-green-500': purchasePercentage >= 0, 'text-red-500': purchasePercentage < 0}" class="text-sm">
            {{ purchasePercentage >= 0 ? '+' : '' }}{{ purchasePercentage }}% dari {{ timeAgoText }}
          </div>
        </div>

        <!-- Total Distribusi -->
        <div class="card-container">
          <div class="flex justify-between items-center">
            <div class="text-xl font-bold">Total Distribusi</div>
            <div class="icon-container">
              <span class="material-icons">local_shipping</span>
            </div>
          </div>
          <div class="text-3xl font-semibold">{{ totalDistribution }}</div>
          <div :class="{'text-green-500': distributionPercentage >= 0, 'text-red-500': distributionPercentage < 0}" class="text-sm">
            {{ distributionPercentage >= 0 ? '+' : '' }}{{ distributionPercentage }}% dari {{ timeAgoText }}
          </div>
        </div>

        <!-- Total Penjualan -->
        <div class="card-container">
          <div class="flex justify-between items-center">
            <div class="text-xl font-bold">Total Penjualan</div>
            <div class="icon-container">
              <span class="material-icons">attach_money</span>
            </div>
          </div>
          <div class="text-3xl font-semibold">{{ totalSales }}</div>
          <div :class="{'text-green-500': salesPercentage >= 0, 'text-red-500': salesPercentage < 0}" class="text-sm">
            {{ salesPercentage >= 0 ? '+' : '' }}{{ salesPercentage }}% dari {{ timeAgoText }}
          </div>
        </div>
        
      </div>
    </div>

    <div class="mb-4">
      <VLineActivityTrend :range="selectedRange" />
    </div>

    <!-- Tabel Pembelian dan Distribusi Bulan Ini -->
    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md mb-4">
      <h2 class="text-xl font-bold mb-4">{{ purchaseTableTitle }}</h2>
      
      <div v-if="loading" class="text-center py-6">Loading...</div>

      <div v-else>
        <table class="custom-table">
          <thead class="text-white bg-[#1E3A5F] rounded-t-lg">
            <tr>
              <th class="px-6 py-4">ID Pembelian</th>
              <th class="px-6 py-4">Nama Supplier</th>
              <th class="px-6 py-4">Tanggal Pengajuan</th>
              <th class="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="purchase in purchases" :key="purchase.purchaseId">
              <td class="px-6 py-4">{{ purchase.purchaseId }}</td>
              <td class="px-6 py-4">{{ purchase.purchaseSupplier }}</td>
              <td class="px-6 py-4">{{ formatDate(purchase.purchaseSubmissionDate) }}</td>
              <td class="px-6 py-4">{{ purchase.purchaseStatus }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tabel Distribusi dan Penjualan Bulan Ini -->
    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md mb-4">
      <h2 class="text-xl font-bold mb-4">{{ distributionSalesTableTitle }}</h2>

      <div v-if="loading" class="text-center py-6">Loading...</div>

      <div v-else>
        <table class="custom-table">
          <thead class="text-white bg-[#1E3A5F] rounded-t-lg">
            <tr>
              <th class="px-6 py-4">ID Distribusi & Penjualan</th>
              <th class="px-6 py-4">Nama Klien</th>
              <th class="px-6 py-4">Tanggal Perencanaan</th>
              <th class="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in distributionsAndSales" :key="item.id">
              <td class="px-6 py-4">{{ item.id }}</td>
              <td class="px-6 py-4">{{ item.projectClientName }}</td>
              <td class="px-6 py-4">{{ formatDate(item.projectStartDate) }}</td>
              <td class="px-6 py-4">{{ getProjectStatus(item.projectStatus) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>


    <!-- Tabel Asset yang Sedang Dalam Maintenance -->
    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md mb-4">
      <h2 class="text-xl font-bold mb-4">Asset yang Sedang dalam Maintenance</h2>

      <div v-if="loading" class="text-center py-6">Loading...</div>

      <div v-else>
        <table class="custom-table">
          <thead class="text-white bg-[#1E3A5F] rounded-t-lg">
            <tr>
              <th class="px-6 py-4">Nama Asset</th>
              <th class="px-6 py-4">Plat Nomor</th>
              <th class="px-6 py-4">Tanggal Pengajuan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="asset in assetsInMaintenance" :key="asset.id">
              <td class="px-6 py-4">{{ asset.namaAset }}</td>
              <td class="px-6 py-4">{{ asset.platNomor }}</td>
              <td class="px-6 py-4">{{ formatDate(asset.tanggalMulaiMaintenance) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useProjectStore } from '@/stores/project';
import { usePurchaseStore } from '@/stores/purchase';
import { useAuthStore } from '@/stores/auth'; // Import the auth store
import axios from 'axios';
import { useToast } from 'vue-toastification';
import VLineActivityTrend from '@/components/VLineActivityTrend.vue'; 
import Breadcrumb from '@/components/Breadcrumb.vue'; 
import { API_URLS } from '@/config/api.config';
import VOptionInput from '@/components/VOptionInput.vue'; // Import VOptionInput

// State untuk filter
const selectedType = ref<string>('All'); // Filter Type
const activityType = ref<string | number>('');
// Stores
const projectStore = useProjectStore();
const purchaseStore = usePurchaseStore();
const authStore = useAuthStore(); // Initialize the auth store

// State untuk loading dan error
const loading = ref(false);
const error = ref('');

// Data tabel
const purchases = ref<any[]>([]);
const distributionsAndSales = ref<any[]>([]);
const assetsInMaintenance = ref<any[]>([]);

// Total Pembelian, Distribusi, dan Penjualan
const totalPurchase = ref(0);
const totalDistribution = ref(0);
const totalSales = ref(0);
const purchasePercentage = ref(0);
const distributionPercentage = ref(0);
const salesPercentage = ref(0);

// Ambil nama pengguna (misalnya dari localStorage atau store)
const userName = ref(localStorage.getItem('userName') || 'Operasional1');

// Format Date function directly within this component (No `dateUtils` needed anymore)
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Fetch summary data for Total Purchase, Distribution, and Sales using Store
const fetchSummaryData = async (range: string) => {
  try {
    // Fetching purchase summary from the store
    await purchaseStore.getPurchaseSummary(range);
    totalPurchase.value = purchaseStore.purchaseSummary?.totalPurchase || 0;
    purchasePercentage.value = purchaseStore.purchaseSummary?.percentageChange || 0;

    // Fetching sell distribution summary from the store
    await projectStore.getSellDistributionSummary(range);
    totalDistribution.value = projectStore.sellDistributionSummary?.totalDistribution || 0;
    totalSales.value = projectStore.sellDistributionSummary?.totalSell || 0;
    distributionPercentage.value = projectStore.sellDistributionSummary?.percentageDistributionChange || 0;
    salesPercentage.value = projectStore.sellDistributionSummary?.percentageSellChange || 0;

  } catch (error) {
    console.error('Error fetching summary data', error);
  }
};

// Fetch data on mount
const fetchData = async (range: string) => {
  loading.value = true;

  // Fetching Projects, Purchases, and Maintenance data
  await projectStore.getProjectListByRange(range);
  await purchaseStore.getPurchaseListByRange(range);
  await fetchSummaryData(range);  // Fetching summary for total purchase, distribution, and sales
  await fetchAssetsInMaintenance(range);

  // Update purchases, distributions and sales data from the store
  purchases.value = purchaseStore.purchases;
  distributionsAndSales.value = projectStore.projects; // Assuming we want to display all projects as distribution & sales

  loading.value = false;
};

// Function to get project status as a readable string
const getProjectStatus = (status: number) => {
  switch (status) {
    case 0: return 'Direncanakan';
    case 1: return 'Dilaksanakan';
    case 2: return 'Selesai';
    case 3: return 'Telah Dibayar';
    default: return 'Status Tidak Diketahui';
  }
};

// Function to fetch assets in maintenance
const fetchAssetsInMaintenance = async (range: string) => {
  try {
    const response = await axios.get(`${API_URLS.ASSET}/maintenance/maintenance-in-progress`, {
      params: { range },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (response.data && response.data.data) {
      assetsInMaintenance.value = response.data.data;
    } else {
      assetsInMaintenance.value = [];
    }
  } catch (error) {
    console.error('Error fetching maintenance data', error);
  }
};

// State for selected range
const selectedRange = ref<string>('THIS_YEAR');

// Set date range based on the button clicked
const setDateRange = (range: string) => {
  selectedRange.value = range;
  fetchData(range);  // Re-fetch data based on selected range
};

onMounted(() => {
  fetchData('THIS_YEAR');  // Default to THIS_YEAR or adjust if necessary
});

// Dynamic Table Titles
// Dynamic Table Titles
const purchaseTableTitle = computed(() => {
  switch (selectedRange.value) {
    case 'THIS_YEAR':
      return 'Pembelian Tahun Ini';
    case 'THIS_QUARTER':
      return 'Pembelian Kuartal Ini';
    case 'THIS_MONTH':
      return 'Pembelian Bulan Ini';
    default:
      return 'Pembelian';
  }
});

const distributionSalesTableTitle = computed(() => {
  switch (selectedRange.value) {
    case 'THIS_YEAR':
      return 'Distribusi dan Penjualan Tahun Ini';
    case 'THIS_QUARTER':
      return 'Distribusi dan Penjualan Kuartal Ini';
    case 'THIS_MONTH':
      return 'Distribusi dan Penjualan Bulan Ini';
    default:
      return 'Distribusi dan Penjualan';
  }
});

// Computed property untuk teks dinamis yang mengikuti filter range
const timeAgoText = computed(() => {
  switch (selectedRange.value) {
    case 'THIS_YEAR':
      return 'tahun lalu';
    case 'THIS_QUARTER':
      return 'kuartal lalu';
    case 'THIS_MONTH':
      return 'bulan lalu';
    default:
      return 'tahun lalu'; // Sebagai default jika range tidak dikenali
  }
});



// Getting user info for welcome message
const userInfo = computed(() => {
  const user = authStore.user;
  return { username: user ? user.username : 'User' };  // Access username from authStore
});
</script>

<style scoped>
/* Styling for the custom-table, breadcrumbs, and other elements */
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
  padding: 16px 20px;
  text-align: center;
  font-size: 15px;
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

.custom-table tbody tr:hover {
  background-color: #f3f4f6;
}

.table-header:hover {
  background-color: #32486B;
}

.card-container {
  background-color: #F9FAFB;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.icon-container {
  background-color: #E5EAF2;
  padding: 8px;
  border-radius: 50%;
  display: inline-block;
}

.material-icons {
  font-size: 32px;
  color: #1E3A5F;
}

.text-green-500 {
  color: #16A34A;
}

.text-red-500 {
  color: #EF4444;
}

</style>
