<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-7xl mx-auto bg-white p-5 rounded-lg shadow-md mb-6">
      <div class="welcome-message text-5xl font-bold mb-4">
        Welcome, {{ userInfo.username }}
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          :class="[
            'px-6 py-2 rounded-md font-medium transition-colors',
            selectedRange === 'LAST_YEAR' ? 'bg-[#1E3A5F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
          @click="setDateRange('LAST_YEAR')">
          Tahun Lalu
        </button>
        <button
          :class="[
            'px-6 py-2 rounded-md font-medium transition-colors',
            selectedRange === 'THIS_YEAR' ? 'bg-[#1E3A5F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
          @click="setDateRange('THIS_YEAR')">
          Tahun Ini
        </button>
        <button
          :class="[
            'px-6 py-2 rounded-md font-medium transition-colors',
            selectedRange === 'THIS_QUARTER' ? 'bg-[#1E3A5F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
          @click="setDateRange('THIS_QUARTER')">
          Kuartal Ini
        </button>
        <button
          :class="[
            'px-6 py-2 rounded-md font-medium transition-colors',
            selectedRange === 'THIS_MONTH' ? 'bg-[#1E3A5F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
        <div class="text-3xl font-semibold mt-2">{{ totalPurchase }}</div>
        <div :class="{'text-green-500': purchasePercentage >= 0, 'text-red-500': purchasePercentage < 0}" class="text-sm mt-1">
          {{ purchasePercentage >= 0 ? '+' : '' }}{{ purchasePercentage.toFixed(2) }}% dari {{ timeAgoText }}
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center">
          <div class="text-xl font-bold">Total Distribusi</div>
          <div class="bg-[#E5EAF2] p-3 rounded-full">
            <font-awesome-icon :icon="['fas', 'truck']" class="text-[#1E3A5F]" />
          </div>
        </div>
        <div class="text-3xl font-semibold mt-2">{{ totalDistribution }}</div>
        <div :class="{'text-green-500': distributionPercentage >= 0, 'text-red-500': distributionPercentage < 0}" class="text-sm mt-1">
          {{ distributionPercentage >= 0 ? '+' : '' }}{{ distributionPercentage.toFixed(2) }}% dari {{ timeAgoText }}
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center">
          <div class="text-xl font-bold">Total Penjualan</div>
          <div class="bg-[#E5EAF2] p-3 rounded-full">
            <font-awesome-icon :icon="['fas', 'dollar-sign']" class="text-[#1E3A5F]" />
          </div>
        </div>
        <div class="text-3xl font-semibold mt-2">{{ totalSales }}</div>
        <div :class="{'text-green-500': salesPercentage >= 0, 'text-red-500': salesPercentage < 0}" class="text-sm mt-1">
          {{ salesPercentage >= 0 ? '+' : '' }}{{ salesPercentage.toFixed(2) }}% dari {{ timeAgoText }}
        </div>
      </div>
    </div>

    <div class="mb-6">
        <VLineActivityTrend :range="selectedRange" />
    </div>

    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 class="text-xl font-bold mb-4">{{ purchaseTableTitle }}</h2>
      <div v-if="loading" class="text-center py-6">Loading...</div>
      <div v-else>
        <table class="custom-table">
          <thead class="text-white bg-[#1E3A5F]">
            <tr>
              <th @click="sortByPurchase('purchaseId')" class="px-6 py-4 cursor-pointer">
                ID Pembelian <span v-if="purchaseSortKey === 'purchaseId'">{{ purchaseSortAsc ? '▲' : '▼' }}</span>
              </th>
              <th @click="sortByPurchase('purchaseSupplier')" class="px-6 py-4 cursor-pointer">
                Nama Supplier <span v-if="purchaseSortKey === 'purchaseSupplier'">{{ purchaseSortAsc ? '▲' : '▼' }}</span>
              </th>
              <th @click="sortByPurchase('purchaseSubmissionDate')" class="px-6 py-4 cursor-pointer">
                Tanggal Pengajuan <span v-if="purchaseSortKey === 'purchaseSubmissionDate'">{{ purchaseSortAsc ? '▲' : '▼' }}</span>
              </th>
              <th @click="sortByPurchase('purchaseStatus')" class="px-6 py-4 cursor-pointer">
                Status <span v-if="purchaseSortKey === 'purchaseStatus'">{{ purchaseSortAsc ? '▲' : '▼' }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedPurchases.length === 0 && !loading">
                <td colspan="4" class="text-center py-4 text-gray-500 italic">Tidak ada data pembelian.</td>
            </tr>
            <tr v-for="purchase in paginatedPurchases" :key="purchase.purchaseId" @click="goToPurchaseDetail(purchase)" class="cursor-pointer">
              <td class="px-6 py-4">{{ purchase.purchaseId }}</td>
              <td class="px-6 py-4">{{ purchase.purchaseSupplier }}</td>
              <td class="px-6 py-4">{{ formatDate(purchase.purchaseSubmissionDate) }}</td>
              <td class="px-6 py-4">{{ purchase.purchaseStatus }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="totalPurchaseTablePages > 1" class="flex justify-center items-center space-x-4 my-4 pt-4">
          <button :disabled="purchaseTablePage === 1" @click="purchaseTablePage--" class="pagination-btn">&larr; Prev</button>
          <span>Page {{ purchaseTablePage }} of {{ totalPurchaseTablePages }}</span>
          <button :disabled="purchaseTablePage === totalPurchaseTablePages" @click="purchaseTablePage++" class="pagination-btn">Next &rarr;</button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 class="text-xl font-bold mb-4">{{ distributionSalesTableTitle }}</h2>
      <div v-if="loading" class="text-center py-6">Loading...</div>
      <div v-else>
        <table class="custom-table">
          <thead class="text-white bg-[#1E3A5F]">
            <tr>
              <th @click="sortByDistributionSale('id')" class="px-6 py-4 cursor-pointer">
                ID Distribusi & Penjualan <span v-if="distributionSaleSortKey === 'id'">{{ distributionSaleSortAsc ? '▲' : '▼' }}</span>
              </th>
              <th @click="sortByDistributionSale('projectClientName')" class="px-6 py-4 cursor-pointer">
                Nama Klien <span v-if="distributionSaleSortKey === 'projectClientName'">{{ distributionSaleSortAsc ? '▲' : '▼' }}</span>
              </th>
              <th @click="sortByDistributionSale('projectStartDate')" class="px-6 py-4 cursor-pointer">
                Tanggal Mulai <span v-if="distributionSaleSortKey === 'projectStartDate'">{{ distributionSaleSortAsc ? '▲' : '▼' }}</span>
              </th>
              <th @click="sortByDistributionSale('projectStatus')" class="px-6 py-4 cursor-pointer">
                Status <span v-if="distributionSaleSortKey === 'projectStatus'">{{ distributionSaleSortAsc ? '▲' : '▼' }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedDistributionsAndSales.length === 0 && !loading">
                <td colspan="4" class="text-center py-4 text-gray-500 italic">Tidak ada data distribusi dan penjualan.</td>
            </tr>
            <tr v-for="item in paginatedDistributionsAndSales" :key="item.id" @click="goToProjectDetail(item)" class="cursor-pointer">
              <td class="px-6 py-4">{{ item.id }}</td>
              <td class="px-6 py-4">{{ item.projectClientName }}</td>
              <td class="px-6 py-4">{{ formatDate(item.projectStartDate) }}</td>
              <td class="px-6 py-4">{{ getProjectStatus(item.projectStatus) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="totalDistributionSalesTablePages > 1" class="flex justify-center items-center space-x-4 my-4 pt-4">
          <button :disabled="distributionSalesTablePage === 1" @click="distributionSalesTablePage--" class="pagination-btn">&larr; Prev</button>
          <span>Page {{ distributionSalesTablePage }} of {{ totalDistributionSalesTablePages }}</span>
          <button :disabled="distributionSalesTablePage === totalDistributionSalesTablePages" @click="distributionSalesTablePage++" class="pagination-btn">Next &rarr;</button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 class="text-xl font-bold mb-4">Asset yang Sedang dalam Maintenance</h2>
      <div v-if="loading" class="text-center py-6">Loading...</div>
      <div v-else>
        <table class="custom-table">
          <thead class="text-white bg-[#1E3A5F]">
            <tr>
              <th @click="sortByAssetMaintenance('namaAset')" class="px-6 py-4 cursor-pointer">
                Nama Asset <span v-if="assetMaintenanceSortKey === 'namaAset'">{{ assetMaintenanceSortAsc ? '▲' : '▼' }}</span>
              </th>
              <th @click="sortByAssetMaintenance('platNomor')" class="px-6 py-4 cursor-pointer">
                Plat Nomor <span v-if="assetMaintenanceSortKey === 'platNomor'">{{ assetMaintenanceSortAsc ? '▲' : '▼' }}</span>
              </th>
              <th @click="sortByAssetMaintenance('tanggalMulaiMaintenance')" class="px-6 py-4 cursor-pointer">
                Tanggal Dibuat <span v-if="assetMaintenanceSortKey === 'tanggalMulaiMaintenance'">{{ assetMaintenanceSortAsc ? '▲' : '▼' }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedAssetsInMaintenance.length === 0 && !loading">
                <td colspan="3" class="text-center py-4 text-gray-500 italic">Tidak ada asset dalam maintenance.</td>
            </tr>
            <tr v-for="asset in paginatedAssetsInMaintenance" :key="asset.id" @click="goToAssetDetail(asset)" class="cursor-pointer">
              <td class="px-6 py-4">{{ asset.namaAset }}</td>
              <td class="px-6 py-4">{{ asset.platNomor }}</td>
              <td class="px-6 py-4">{{ formatDate(asset.tanggalMulaiMaintenance) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="totalMaintenanceTablePages > 1" class="flex justify-center items-center space-x-4 my-4 pt-4">
          <button :disabled="maintenanceTablePage === 1" @click="maintenanceTablePage--" class="pagination-btn">&larr; Prev</button>
          <span>Page {{ maintenanceTablePage }} of {{ totalMaintenanceTablePages }}</span>
          <button :disabled="maintenanceTablePage === totalMaintenanceTablePages" @click="maintenanceTablePage++" class="pagination-btn">Next &rarr;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, type Ref } from 'vue'; // Import Ref
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import { usePurchaseStore } from '@/stores/purchase';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import VLineActivityTrend from '@/components/VLineActivityTrend.vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { API_URLS } from '@/config/api.config';

// --- Interface untuk item data (opsional tapi direkomendasikan) ---
interface PurchaseItem {
  purchaseId: string;
  purchaseSupplier: string;
  purchaseSubmissionDate: string;
  purchaseStatus: string;
  [key: string]: any; // Untuk properti lain jika ada
}

interface DistributionSaleItem {
  id: string;
  projectClientName: string;
  projectStartDate: string;
  projectStatus: number;
  [key: string]: any;
}

interface AssetMaintenanceItem {
  id: string; // Asumsi API memberikan ID unik, atau gunakan platNomor jika id tidak ada
  namaAset: string;
  platNomor: string;
  tanggalMulaiMaintenance: string;
  [key: string]: any;
}


const router = useRouter();

const projectStore = useProjectStore();
const purchaseStore = usePurchaseStore();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref('');

const purchases: Ref<PurchaseItem[]> = ref([]);
const distributionsAndSales: Ref<DistributionSaleItem[]> = ref([]);
const assetsInMaintenance: Ref<AssetMaintenanceItem[]> = ref([]);

const totalPurchase = ref(0);
const totalDistribution = ref(0);
const totalSales = ref(0);
const purchasePercentage = ref(0);
const distributionPercentage = ref(0);
const salesPercentage = ref(0);

// --- Pagination State ---
const itemsPerPage = 5;

const purchaseTablePage = ref(1);
const distributionSalesTablePage = ref(1);
const maintenanceTablePage = ref(1);

// --- Sorting State ---
const purchaseSortKey = ref<string>('');
const purchaseSortAsc = ref(true);
const distributionSaleSortKey = ref<string>('');
const distributionSaleSortAsc = ref(true);
const assetMaintenanceSortKey = ref<string>('');
const assetMaintenanceSortAsc = ref(true);

// --- Helper function untuk sorting ---
const sortData = <T extends Record<string, any>>(data: T[], key: string, asc: boolean): T[] => {
  if (!key) return data;
  return [...data].sort((a, b) => {
    let valA = a[key];
    let valB = b[key];

    // Penanganan khusus untuk tanggal (asumsikan string tanggal ISO atau format yang bisa dibandingkan langsung oleh new Date())
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('tanggal')) {
      const dateA = new Date(valA).getTime();
      const dateB = new Date(valB).getTime();
      return asc ? dateA - dateB : dateB - dateA;
    }
    
    // Penanganan untuk angka (misalnya projectStatus)
    if (typeof valA === 'number' && typeof valB === 'number') {
      return asc ? valA - valB : valB - valA;
    }

    // Default ke perbandingan string
    valA = String(valA).toLowerCase();
    valB = String(valB).toLowerCase();

    if (valA < valB) return asc ? -1 : 1;
    if (valA > valB) return asc ? 1 : -1;
    return 0;
  });
};

// --- Computed properties untuk data yang sudah di-sort ---
const sortedPurchases = computed(() => sortData(purchases.value, purchaseSortKey.value, purchaseSortAsc.value));
const sortedDistributionsAndSales = computed(() => sortData(distributionsAndSales.value, distributionSaleSortKey.value, distributionSaleSortAsc.value));
const sortedAssetsInMaintenance = computed(() => sortData(assetsInMaintenance.value, assetMaintenanceSortKey.value, assetMaintenanceSortAsc.value));

// --- Computed properties untuk data yang dipaginasi (menggunakan data yang sudah di-sort) ---
const totalPurchaseTablePages = computed(() => Math.ceil(sortedPurchases.value.length / itemsPerPage));
const paginatedPurchases = computed(() => {
  const start = (purchaseTablePage.value - 1) * itemsPerPage;
  return sortedPurchases.value.slice(start, start + itemsPerPage);
});

const totalDistributionSalesTablePages = computed(() => Math.ceil(sortedDistributionsAndSales.value.length / itemsPerPage));
const paginatedDistributionsAndSales = computed(() => {
  const start = (distributionSalesTablePage.value - 1) * itemsPerPage;
  return sortedDistributionsAndSales.value.slice(start, start + itemsPerPage);
});

const totalMaintenanceTablePages = computed(() => Math.ceil(sortedAssetsInMaintenance.value.length / itemsPerPage));
const paginatedAssetsInMaintenance = computed(() => {
  const start = (maintenanceTablePage.value - 1) * itemsPerPage;
  return sortedAssetsInMaintenance.value.slice(start, start + itemsPerPage);
});

// --- Fungsi untuk handle klik sorting header ---
const createSortHandler = (sortKeyRef: Ref<string>, sortAscRef: Ref<boolean>, pageRef: Ref<number>) => {
  return (key: string) => {
    if (sortKeyRef.value === key) {
      sortAscRef.value = !sortAscRef.value;
    } else {
      sortKeyRef.value = key;
      sortAscRef.value = true;
    }
    pageRef.value = 1; // Reset ke halaman pertama setelah sorting
  };
};

const sortByPurchase = createSortHandler(purchaseSortKey, purchaseSortAsc, purchaseTablePage);
const sortByDistributionSale = createSortHandler(distributionSaleSortKey, distributionSaleSortAsc, distributionSalesTablePage);
const sortByAssetMaintenance = createSortHandler(assetMaintenanceSortKey, assetMaintenanceSortAsc, maintenanceTablePage);


const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const fetchSummaryData = async (range: string) => {
  try {
    await purchaseStore.getPurchaseSummary(range);
    totalPurchase.value = purchaseStore.purchaseSummary?.totalPurchase || 0;
    purchasePercentage.value = purchaseStore.purchaseSummary?.percentageChange || 0;

    await projectStore.getSellDistributionSummary(range);
    totalDistribution.value = projectStore.sellDistributionSummary?.totalDistribution || 0;
    totalSales.value = projectStore.sellDistributionSummary?.totalSell || 0;
    distributionPercentage.value = projectStore.sellDistributionSummary?.percentageDistributionChange || 0;
    salesPercentage.value = projectStore.sellDistributionSummary?.percentageSellChange || 0;

  } catch (err) {
    console.error("Error fetching summary data:", err);
    totalPurchase.value = 0;
    purchasePercentage.value = 0;
    totalDistribution.value = 0;
    totalSales.value = 0;
    distributionPercentage.value = 0;
    salesPercentage.value = 0;
  }
};

const fetchData = async (range: string) => {
  loading.value = true;
  error.value = '';
  try {
    purchaseTablePage.value = 1;
    distributionSalesTablePage.value = 1;
    maintenanceTablePage.value = 1;

    // Reset sorting keys
    purchaseSortKey.value = '';
    distributionSaleSortKey.value = '';
    assetMaintenanceSortKey.value = '';
    // Arah sorting bisa direset ke true atau dibiarkan
    purchaseSortAsc.value = true;
    distributionSaleSortAsc.value = true;
    assetMaintenanceSortAsc.value = true;


    await Promise.all([
        projectStore.getProjectListByRange(range),
        purchaseStore.getPurchaseListByRange(range),
        fetchSummaryData(range),
        fetchAssetsInMaintenance(range)
    ]);
    purchases.value = (purchaseStore.purchases as PurchaseItem[]) || [];
    distributionsAndSales.value = (projectStore.projects as DistributionSaleItem[]) || [];
  } catch (err: any) {
    error.value = err.message || 'Gagal mengambil data.';
    console.error("Error fetching main data:", err);
    purchases.value = [];
    distributionsAndSales.value = [];
    assetsInMaintenance.value = [];
  } finally {
    loading.value = false;
  }
};

const getProjectStatus = (status: number) => {
  switch (status) {
    case 0: return 'Direncanakan';
    case 1: return 'Dilaksanakan';
    case 2: return 'Selesai';
    case 3: return 'Telah Dibayar';
    default: return 'Status Tidak Diketahui';
  }
};

const fetchAssetsInMaintenance = async (range: string) => {
  try {
    const response = await axios.get(`${API_URLS.ASSET}/maintenance/maintenance-in-progress`, {
      params: { range },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    if (response.data && response.data.data) {
      assetsInMaintenance.value = response.data.data as AssetMaintenanceItem[];
    } else {
      assetsInMaintenance.value = [];
    }
  } catch (err) {
    console.error("Error fetching assets in maintenance:", err);
    assetsInMaintenance.value = [];
  }
};

const selectedRange = ref<string>('THIS_YEAR');

const setDateRange = (range: string) => {
  selectedRange.value = range;
  fetchData(range);
};

const goToPurchaseDetail = (purchaseItem: PurchaseItem) => {
  const idPurchase = String(purchaseItem.purchaseId);
  let conditional = '';
  if (idPurchase.startsWith('R')) {
    conditional = 'Resource';
  } else if (idPurchase.startsWith('A')) {
    conditional = 'Asset';
  }

  if (conditional && idPurchase) {
    router.push(`/purchase/detail/${conditional}/$ da`);
  } else {
    console.warn('Tidak dapat menentukan conditional atau ID untuk detail pembelian:', purchaseItem);
  }
};

const goToProjectDetail = (projectItem: DistributionSaleItem) => {
  const idProject = String(projectItem.id);
  let conditional = '';
  if (idProject.startsWith('D')) {
    conditional = 'distribution';
  } else if (idProject.startsWith('P')) {
    conditional = 'sale';
  }

  if (conditional && idProject) {
    router.push(`/project/${conditional}/${idProject}`);
  } else {
    console.warn('Tidak dapat menentukan conditional atau ID untuk detail proyek:', projectItem);
  }
};

const goToAssetDetail = (assetItem: AssetMaintenanceItem) => {
  const platNomor = assetItem.platNomor;
  if (platNomor) {
    router.push(`/asset/${encodeURIComponent(platNomor)}`);
  } else {
    console.warn('Plat Nomor tidak ditemukan untuk detail aset:', assetItem);
  }
};

onMounted(() => {
  fetchData('THIS_YEAR');
});

const purchaseTableTitle = computed(() => {
  switch (selectedRange.value) {
    case 'THIS_YEAR':
      return 'Pembelian Tahun Ini';
    case 'THIS_QUARTER':
      return 'Pembelian Kuartal Ini';
    case 'THIS_MONTH':
      return 'Pembelian Bulan Ini';
    case 'LAST_YEAR': // Tambahkan case untuk LAST_YEAR
      return 'Pembelian Tahun Lalu';
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
    case 'LAST_YEAR': // Tambahkan case untuk LAST_YEAR
      return 'Distribusi dan Penjualan Tahun Lalu';
    default:
      return 'Distribusi dan Penjualan';
  }
});

const timeAgoText = computed(() => {
  switch (selectedRange.value) {
    case 'THIS_YEAR':
      return 'tahun lalu';
    case 'THIS_QUARTER':
      return 'kuartal lalu';
    case 'THIS_MONTH':
      return 'bulan lalu';
    case 'LAST_YEAR': // Tambahkan case untuk LAST_YEAR
      return '2 tahun lalu'; // Atau teks lain yang sesuai, misal "periode sebelumnya (tahun)"
    default:
      return 'periode lalu';
  }
});

const userInfo = computed(() => {
  const user = authStore.user;
  return { username: user ? user.username : 'User' };
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
  padding: 16px 20px;
  font-size: 15px;
  border-bottom: 1px solid #e5e7eb;
}
.custom-table th {
    text-align: left; 
    padding-left: 24px; 
    cursor: pointer; /* Menambahkan cursor pointer ke header untuk sorting */
}
.custom-table th:hover {
    background-color: #32486B; /* Efek hover pada header */
}
.custom-table td {
    text-align: left; 
    padding-left: 24px; 
}


.custom-table tbody tr:nth-child(odd) {
  background-color: #ffffff;
}

.custom-table tbody tr:nth-child(even) {
  background-color: #f9fafb;
}

.custom-table tbody tr:hover {
  background-color: #f0f4f8;
}

.text-green-500 {
  color: #16A34A;
}

.text-red-500 {
  color: #EF4444;
}

.custom-table tbody tr.cursor-pointer:hover {
  cursor: pointer;
}

.pagination-btn {
  background-color: #1E3A5F;
  color: white;
  font-weight: 500; 
  padding: 8px 16px;
  border-radius: 6px;
  transition: background-color 0.2s ease-in-out;
  border: none;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #32486B; 
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Indikator Sorting */
.custom-table th span {
  margin-left: 8px;
  font-size: 0.8em; /* Ukuran panah lebih kecil */
  display: inline-block;
}
</style>