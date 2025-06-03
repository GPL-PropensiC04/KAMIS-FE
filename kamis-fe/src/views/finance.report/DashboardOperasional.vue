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
            Semoga harinya menyenangkan!
          </div>
        </div>
        
        <!-- Right Side: Date Range Buttons -->
        <div class="flex flex-wrap gap-3 lg:flex-shrink-0">
          <button
            :class="[
              'px-4 py-2 lg:px-6 lg:py-3 rounded-lg font-medium transition-all duration-200 text-sm lg:text-base',
              selectedRange === 'LAST_YEAR' 
                ? 'bg-[#1E3A5F] text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
            ]"
            @click="setDateRange('LAST_YEAR')">
            Tahun Lalu
          </button>
          <button
            :class="[
              'px-4 py-2 lg:px-6 lg:py-3 rounded-lg font-medium transition-all duration-200 text-sm lg:text-base',
              selectedRange === 'THIS_YEAR' 
                ? 'bg-[#1E3A5F] text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
            ]"
            @click="setDateRange('THIS_YEAR')">
            Tahun Ini
          </button>
          <button
            :class="[
              'px-4 py-2 lg:px-6 lg:py-3 rounded-lg font-medium transition-all duration-200 text-sm lg:text-base',
              selectedRange === 'THIS_QUARTER' 
                ? 'bg-[#1E3A5F] text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
            ]"
            @click="setDateRange('THIS_QUARTER')">
            Kuartal Ini
          </button>
          <button
            :class="[
              'px-4 py-2 lg:px-6 lg:py-3 rounded-lg font-medium transition-all duration-200 text-sm lg:text-base',
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
    <div class="w-full grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
      <!-- Total Pembelian Card -->
      <div class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="text-lg lg:text-xl font-bold text-gray-800 mb-2">Total Pembelian</div>
            <div class="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">{{ totalPurchase }}</div>
            <div :class="{'text-green-600': purchasePercentage >= 0, 'text-red-500': purchasePercentage < 0}" 
                 class="text-sm font-medium">
              {{ purchasePercentage >= 0 ? '+' : '' }}{{ purchasePercentage.toFixed(2) }}% dari {{ timeAgoText }}
            </div>
          </div>
          <div class="bg-[#E5EAF2] p-3 rounded-full flex-shrink-0">
            <font-awesome-icon :icon="['fas', 'shopping-cart']" class="text-[#1E3A5F] text-xl" />
          </div>
        </div>
      </div>

      <!-- Total Distribusi Card -->
      <div class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="text-lg lg:text-xl font-bold text-gray-800 mb-2">Total Distribusi</div>
            <div class="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">{{ totalDistribution }}</div>
            <div :class="{'text-green-600': distributionPercentage >= 0, 'text-red-500': distributionPercentage < 0}" 
                 class="text-sm font-medium">
              {{ distributionPercentage >= 0 ? '+' : '' }}{{ distributionPercentage.toFixed(2) }}% dari {{ timeAgoText }}
            </div>
          </div>
          <div class="bg-[#E5EAF2] p-3 rounded-full flex-shrink-0">
            <font-awesome-icon :icon="['fas', 'truck']" class="text-[#1E3A5F] text-xl" />
          </div>
        </div>
      </div>

      <!-- Total Penjualan Card -->
      <div class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="text-lg lg:text-xl font-bold text-gray-800 mb-2">Total Penjualan</div>
            <div class="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">{{ totalSales }}</div>
            <div :class="{'text-green-600': salesPercentage >= 0, 'text-red-500': salesPercentage < 0}" 
                 class="text-sm font-medium">
              {{ salesPercentage >= 0 ? '+' : '' }}{{ salesPercentage.toFixed(2) }}% dari {{ timeAgoText }}
            </div>
          </div>
          <div class="bg-[#E5EAF2] p-3 rounded-full flex-shrink-0">
            <font-awesome-icon :icon="['fas', 'dollar-sign']" class="text-[#1E3A5F] text-xl" />
          </div>
        </div>
      </div>
    </div>

    <!-- Activity Trend Chart -->
    <div class="mb-6">
      <VLineActivityTrend :range="selectedRange" />
    </div>

    <!-- Purchase Table -->
    <div class="w-full bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
      <div class="p-6 border-b border-gray-100">
        <h2 class="text-xl lg:text-2xl font-bold text-gray-800">{{ purchaseTableTitle }}</h2>
      </div>
      
      <div v-if="loading" class="text-center py-12">
        <div class="text-gray-500 text-lg">Loading...</div>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="custom-table">
          <thead class="text-white bg-[#1E3A5F]">
            <tr>
              <th @click="sortByPurchase('purchaseId')" class="table-header">
                ID Pembelian 
                <span v-if="purchaseSortKey === 'purchaseId'" class="sort-indicator">
                  {{ purchaseSortAsc ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="sortByPurchase('purchaseSupplier')" class="table-header">
                Nama Supplier 
                <span v-if="purchaseSortKey === 'purchaseSupplier'" class="sort-indicator">
                  {{ purchaseSortAsc ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="sortByPurchase('purchaseSubmissionDate')" class="table-header">
                Tanggal Pengajuan 
                <span v-if="purchaseSortKey === 'purchaseSubmissionDate'" class="sort-indicator">
                  {{ purchaseSortAsc ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="sortByPurchase('purchaseStatus')" class="table-header">
                Status 
                <span v-if="purchaseSortKey === 'purchaseStatus'" class="sort-indicator">
                  {{ purchaseSortAsc ? '▲' : '▼' }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedPurchases.length === 0 && !loading">
              <td colspan="4" class="text-center py-8 text-gray-500 italic">Tidak ada data pembelian.</td>
            </tr>
            <tr v-for="purchase in paginatedPurchases" 
                :key="purchase.purchaseId" 
                @click="goToPurchaseDetail(purchase)" 
                class="table-row">
              <td class="table-cell">{{ purchase.purchaseId }}</td>
              <td class="table-cell">{{ purchase.purchaseSupplier }}</td>
              <td class="table-cell">{{ formatDate(purchase.purchaseSubmissionDate) }}</td>
              <td class="table-cell">{{ purchase.purchaseStatus }}</td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="totalPurchaseTablePages > 1" class="pagination-container">
          <button :disabled="purchaseTablePage === 1" 
                  @click="purchaseTablePage--" 
                  class="pagination-btn">
            &larr; Prev
          </button>
          <span class="pagination-info">Page {{ purchaseTablePage }} of {{ totalPurchaseTablePages }}</span>
          <button :disabled="purchaseTablePage === totalPurchaseTablePages" 
                  @click="purchaseTablePage++" 
                  class="pagination-btn">
            Next &rarr;
          </button>
        </div>
      </div>
    </div>

    <!-- Distribution & Sales Table -->
    <div class="w-full bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
      <div class="p-6 border-b border-gray-100">
        <h2 class="text-xl lg:text-2xl font-bold text-gray-800">{{ distributionSalesTableTitle }}</h2>
      </div>
      
      <div v-if="loading" class="text-center py-12">
        <div class="text-gray-500 text-lg">Loading...</div>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="custom-table">
          <thead class="text-white bg-[#1E3A5F]">
            <tr>
              <th @click="sortByDistributionSale('id')" class="table-header">
                ID Distribusi & Penjualan 
                <span v-if="distributionSaleSortKey === 'id'" class="sort-indicator">
                  {{ distributionSaleSortAsc ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="sortByDistributionSale('projectClientName')" class="table-header">
                Nama Klien 
                <span v-if="distributionSaleSortKey === 'projectClientName'" class="sort-indicator">
                  {{ distributionSaleSortAsc ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="sortByDistributionSale('projectStartDate')" class="table-header">
                Tanggal Mulai 
                <span v-if="distributionSaleSortKey === 'projectStartDate'" class="sort-indicator">
                  {{ distributionSaleSortAsc ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="sortByDistributionSale('projectStatus')" class="table-header">
                Status 
                <span v-if="distributionSaleSortKey === 'projectStatus'" class="sort-indicator">
                  {{ distributionSaleSortAsc ? '▲' : '▼' }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedDistributionsAndSales.length === 0 && !loading">
              <td colspan="4" class="text-center py-8 text-gray-500 italic">Tidak ada data distribusi dan penjualan.</td>
            </tr>
            <tr v-for="item in paginatedDistributionsAndSales" 
                :key="item.id" 
                @click="goToProjectDetail(item)" 
                class="table-row">
              <td class="table-cell">{{ item.id }}</td>
              <td class="table-cell">{{ item.projectClientName }}</td>
              <td class="table-cell">{{ formatDate(item.projectStartDate) }}</td>
              <td class="table-cell">{{ getProjectStatus(item.projectStatus) }}</td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="totalDistributionSalesTablePages > 1" class="pagination-container">
          <button :disabled="distributionSalesTablePage === 1" 
                  @click="distributionSalesTablePage--" 
                  class="pagination-btn">
            &larr; Prev
          </button>
          <span class="pagination-info">Page {{ distributionSalesTablePage }} of {{ totalDistributionSalesTablePages }}</span>
          <button :disabled="distributionSalesTablePage === totalDistributionSalesTablePages" 
                  @click="distributionSalesTablePage++" 
                  class="pagination-btn">
            Next &rarr;
          </button>
        </div>
      </div>
    </div>

    <!-- Assets in Maintenance Table -->
    <div class="w-full bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
      <div class="p-6 border-b border-gray-100">
        <h2 class="text-xl lg:text-2xl font-bold text-gray-800">Asset yang Sedang dalam Maintenance</h2>
      </div>
      
      <div v-if="loading" class="text-center py-12">
        <div class="text-gray-500 text-lg">Loading...</div>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="custom-table">
          <thead class="text-white bg-[#1E3A5F]">
            <tr>
              <th @click="sortByAssetMaintenance('namaAset')" class="table-header">
                Nama Asset 
                <span v-if="assetMaintenanceSortKey === 'namaAset'" class="sort-indicator">
                  {{ assetMaintenanceSortAsc ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="sortByAssetMaintenance('platNomor')" class="table-header">
                Plat Nomor 
                <span v-if="assetMaintenanceSortKey === 'platNomor'" class="sort-indicator">
                  {{ assetMaintenanceSortAsc ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="sortByAssetMaintenance('tanggalMulaiMaintenance')" class="table-header">
                Tanggal Dibuat 
                <span v-if="assetMaintenanceSortKey === 'tanggalMulaiMaintenance'" class="sort-indicator">
                  {{ assetMaintenanceSortAsc ? '▲' : '▼' }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedAssetsInMaintenance.length === 0 && !loading">
              <td colspan="3" class="text-center py-8 text-gray-500 italic">Tidak ada asset dalam maintenance.</td>
            </tr>
            <tr v-for="asset in paginatedAssetsInMaintenance" 
                :key="asset.id" 
                @click="goToAssetDetail(asset)" 
                class="table-row">
              <td class="table-cell">{{ asset.namaAset }}</td>
              <td class="table-cell">{{ asset.platNomor }}</td>
              <td class="table-cell">{{ formatDate(asset.tanggalMulaiMaintenance) }}</td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="totalMaintenanceTablePages > 1" class="pagination-container">
          <button :disabled="maintenanceTablePage === 1" 
                  @click="maintenanceTablePage--" 
                  class="pagination-btn">
            &larr; Prev
          </button>
          <span class="pagination-info">Page {{ maintenanceTablePage }} of {{ totalMaintenanceTablePages }}</span>
          <button :disabled="maintenanceTablePage === totalMaintenanceTablePages" 
                  @click="maintenanceTablePage++" 
                  class="pagination-btn">
            Next &rarr;
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import { usePurchaseStore } from '@/stores/purchase';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import VLineActivityTrend from '@/components/VLineActivityTrend.vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { API_URLS } from '@/config/api.config';

// --- Interface untuk item data ---
interface PurchaseItem {
  purchaseId: string;
  purchaseSupplier: string;
  purchaseSubmissionDate: string;
  purchaseStatus: string;
  [key: string]: any;
}

interface DistributionSaleItem {
  id: string;
  projectClientName: string;
  projectStartDate: string;
  projectStatus: number;
  [key: string]: any;
}

interface AssetMaintenanceItem {
  id: string;
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

    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('tanggal')) {
      const dateA = new Date(valA).getTime();
      const dateB = new Date(valB).getTime();
      return asc ? dateA - dateB : dateB - dateA;
    }
    
    if (typeof valA === 'number' && typeof valB === 'number') {
      return asc ? valA - valB : valB - valA;
    }

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

// --- Computed properties untuk data yang dipaginasi ---
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
    pageRef.value = 1;
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

    purchaseSortKey.value = '';
    distributionSaleSortKey.value = '';
    assetMaintenanceSortKey.value = '';
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
    case 'LAST_YEAR':
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
    case 'LAST_YEAR':
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
    case 'LAST_YEAR':
      return '2 tahun lalu';
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
  text-align: left;
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
  text-align: left;
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

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem;
  border-top: 1px solid #f3f4f6;
}

.pagination-btn {
  background-color: #1E3A5F;
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #32486B;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.pagination-info {
  font-weight: 500;
  color: #6b7280;
}

/* Stats Cards Enhancement */
.text-green-600 {
  color: #059669;
}

.text-red-500 {
  color: #ef4444;
}

/* Responsive Design */
@media (max-width: 768px) {
  .table-header,
  .table-cell {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .pagination-btn {
    min-width: 80px;
  }
}
</style>