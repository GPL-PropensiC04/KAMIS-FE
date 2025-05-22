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

    <div class="max-w-7xl mx-auto bg-white rounded-2xl shadow-md p-6 mb-6">
       <VLineActivityTrend :range="selectedRange" />
    </div>

    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 class="text-xl font-bold mb-4">{{ purchaseTableTitle }}</h2>
      <div v-if="loading" class="text-center py-6">Loading...</div>
      <div v-else>
        <table class="custom-table">
          <thead class="text-white bg-[#1E3A5F]">
            <tr>
              <th class="px-6 py-4">ID Pembelian</th>
              <th class="px-6 py-4">Nama Supplier</th>
              <th class="px-6 py-4">Tanggal Pengajuan</th>
              <th class="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="purchases.length === 0 && !loading">
                <td colspan="4" class="text-center py-4 text-gray-500 italic">Tidak ada data pembelian.</td>
            </tr>
            <tr v-for="purchase in purchases" :key="purchase.purchaseId" @click="goToPurchaseDetail(purchase)" class="cursor-pointer">
              <td class="px-6 py-4">{{ purchase.purchaseId }}</td>
              <td class="px-6 py-4">{{ purchase.purchaseSupplier }}</td>
              <td class="px-6 py-4">{{ formatDate(purchase.purchaseSubmissionDate) }}</td>
              <td class="px-6 py-4">{{ purchase.purchaseStatus }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 class="text-xl font-bold mb-4">{{ distributionSalesTableTitle }}</h2>
      <div v-if="loading" class="text-center py-6">Loading...</div>
      <div v-else>
        <table class="custom-table">
          <thead class="text-white bg-[#1E3A5F]">
            <tr>
              <th class="px-6 py-4">ID Distribusi & Penjualan</th>
              <th class="px-6 py-4">Nama Klien</th>
              <th class="px-6 py-4">Tanggal Perencanaan</th>
              <th class="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="distributionsAndSales.length === 0 && !loading">
                <td colspan="4" class="text-center py-4 text-gray-500 italic">Tidak ada data distribusi dan penjualan.</td>
            </tr>
            <tr v-for="item in distributionsAndSales" :key="item.id" @click="goToProjectDetail(item)" class="cursor-pointer">
              <td class="px-6 py-4">{{ item.id }}</td>
              <td class="px-6 py-4">{{ item.projectClientName }}</td>
              <td class="px-6 py-4">{{ formatDate(item.projectStartDate) }}</td>
              <td class="px-6 py-4">{{ getProjectStatus(item.projectStatus) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 class="text-xl font-bold mb-4">Asset yang Sedang dalam Maintenance</h2>
      <div v-if="loading" class="text-center py-6">Loading...</div>
      <div v-else>
        <table class="custom-table">
          <thead class="text-white bg-[#1E3A5F]">
            <tr>
              <th class="px-6 py-4">Nama Asset</th>
              <th class="px-6 py-4">Plat Nomor</th>
              <th class="px-6 py-4">Tanggal Pengajuan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="assetsInMaintenance.length === 0 && !loading">
                <td colspan="3" class="text-center py-4 text-gray-500 italic">Tidak ada asset dalam maintenance.</td>
            </tr>
            <tr v-for="asset in assetsInMaintenance" :key="asset.id" @click="goToAssetDetail(asset)" class="cursor-pointer">
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
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import { usePurchaseStore } from '@/stores/purchase';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import VLineActivityTrend from '@/components/VLineActivityTrend.vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { API_URLS } from '@/config/api.config';

const router = useRouter();

const selectedType = ref<string>('All');
const activityType = ref<string | number>('');

const projectStore = useProjectStore();
const purchaseStore = usePurchaseStore();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref('');

const purchases = ref<any[]>([]);
const distributionsAndSales = ref<any[]>([]);
const assetsInMaintenance = ref<any[]>([]);

const totalPurchase = ref(0);
const totalDistribution = ref(0);
const totalSales = ref(0);
const purchasePercentage = ref(0);
const distributionPercentage = ref(0);
const salesPercentage = ref(0);

const userName = ref(localStorage.getItem('userName') || 'Operasional1');

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
    await Promise.all([
        projectStore.getProjectListByRange(range),
        purchaseStore.getPurchaseListByRange(range),
        fetchSummaryData(range),
        fetchAssetsInMaintenance(range)
    ]);
    purchases.value = purchaseStore.purchases;
    distributionsAndSales.value = projectStore.projects;
  } catch (err: any) {
    error.value = err.message || 'Gagal mengambil data.';
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
      assetsInMaintenance.value = response.data.data;
    } else {
      assetsInMaintenance.value = [];
    }
  } catch (err) {
    assetsInMaintenance.value = [];
  }
};

const selectedRange = ref<string>('THIS_YEAR');

const setDateRange = (range: string) => {
  selectedRange.value = range;
  fetchData(range);
};

const goToPurchaseDetail = (purchaseItem: any) => {
  const idPurchase = String(purchaseItem.purchaseId);
  let conditional = '';
  if (idPurchase.startsWith('R')) {
    conditional = 'Resource';
  } else if (idPurchase.startsWith('A')) {
    conditional = 'Asset';
  }

  if (conditional && idPurchase) {
    router.push(`/purchase/detail/${conditional}/${idPurchase}`);
  } else {
    console.warn('Tidak dapat menentukan conditional atau ID untuk detail pembelian:', purchaseItem);
  }
};

const goToProjectDetail = (projectItem: any) => {
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

const goToAssetDetail = (assetItem: any) => {
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

.text-green-500 {
  color: #16A34A;
}

.text-red-500 {
  color: #EF4444;
}

/* Menambahkan cursor pointer pada baris tabel yang bisa diklik */
.custom-table tbody tr.cursor-pointer:hover {
  cursor: pointer;
}
</style>