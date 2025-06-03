<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <!-- Notification -->
    <div 
      v-if="showNotification" 
      class="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg z-50 animate-slide-in"
    >
      {{ notificationMessage }}
    </div>

    <!-- Search Bar -->
    <div class="max-w-full mx-auto bg-white p-3 rounded-lg shadow-md mb-4">
      <div class="grid grid-cols-1 gap-2 items-center">
        <VSearchBar v-model="searchQuery" placeholder="Cari Nama Aset..." />
      </div>
    </div>

    <!-- Asset Table -->
    <div class="max-w-full mx-auto bg-white p-6 rounded-lg shadow-md">
      <div v-if="assetStore.isLoading" class="flex justify-center items-center py-14">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="custom-table">
          <thead class="text-white bg-[#1E3A5F] rounded-t-lg">
            <tr>
              <th @click="sortTable('nama')" class="px-6 py-4 table-header cursor-pointer text-base">
                <div class="flex items-center justify-center gap-2">
                  <span>Nama Aset</span>
                  <span v-if="sortKey === 'nama'" class="sort-indicator">
                    <span v-if="sortOrder === 'asc'" class="text-white">▲</span>
                    <span v-else class="text-white">▼</span>
                  </span>
                </div>
              </th>
              <th class="px-6 py-4 table-header text-base">Jenis Aset</th>
              <th @click="sortTable('tanggalPerolehan')" class="px-6 py-4 table-header cursor-pointer text-base">
                <div class="flex items-center justify-center gap-2">
                  <span>Tanggal Perolehan</span>
                  <span v-if="sortKey === 'tanggalPerolehan'" class="sort-indicator">
                    <span v-if="sortOrder === 'asc'" class="text-white">▲</span>
                    <span v-else class="text-white">▼</span>
                  </span>
                </div>
              </th>
              <th class="px-6 py-4 table-header text-base">{{ thirdColumnHeader }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="asset in sortedAssets"
              :key="asset.platNomor"
              class="bg-white border-b border-gray-200 hover:bg-gray-50 cursor-pointer text-base"
              @click="goToDetailAsset(asset.platNomor)"
            >
              <td class="px-6 py-5">{{ asset.nama }}</td>
              <td class="px-6 py-5">{{ asset.tipeAset }}</td>
              <td class="px-6 py-5">{{ formatDate(asset.tanggalPerolehan) }}</td>
              <td class="px-6 py-5">{{ thirdColumnValue(asset) }}</td>
            </tr>
            
            <tr v-if="!assetStore.isLoading && sortedAssets.length === 0">
              <td colspan="4" class="text-center text-gray-500 py-6 text-base italic">
                {{ searchQuery ? `Tidak ada aset dengan pencarian "${searchQuery}"` : 'Data aset tidak ditemukan.' }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Navigation (Same as ListResource) -->
        <div v-if="assetStore.totalPages > 1 || assetStore.assets.length > 0" class="mt-6 text-center">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <label for="pageSizeSelect" class="text-sm text-gray-700 whitespace-nowrap">Item per halaman:</label>
              <select 
                id="pageSizeSelect" 
                v-model="selectedPageSize" 
                @change="handlePageSizeChange"
                class="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              >
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
              </select>
            </div>          

            <!-- Page Navigation -->
            <div class="flex items-center justify-center space-x-2">
              <button
                @click="changePage(assetStore.currentPage)"
                :disabled="assetStore.currentPage === 0"
                class="bg-[#1E3A5F] text-white px-4 py-2 rounded-md font-medium text-center transition hover:bg-[#2A4A6B] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              
              <template v-for="pageNumber in pageNavigation" :key="pageNumber">
                <button
                  v-if="typeof pageNumber === 'number'"
                  @click="changePage(pageNumber)"
                  :class="[
                    'px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 cursor-pointer', 
                    pageNumber === assetStore.currentPage + 1 ? 
                      'bg-[#2D6A4F] text-white border border-[#2D6A4F]' : 
                      'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  {{ pageNumber }}
                </button>
                <span v-else class="px-2 py-2 text-sm font-medium text-gray-600">{{ pageNumber }}</span>
              </template>
              
              <button
                @click="changePage(assetStore.currentPage + 2)"
                :disabled="assetStore.currentPage >= assetStore.totalPages - 1"
                class="bg-[#1E3A5F] text-white px-4 py-2 rounded-md font-medium text-center transition hover:bg-[#2A4A6B] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
              
            <p v-if="assetStore.assets.length > 0" class="text-sm text-gray-700 text-center sm:text-left">
              Menampilkan <span class="font-medium">{{ (assetStore.currentPage * assetStore.pageSize) + 1 }}</span>
              sampai <span class="font-medium">{{ (assetStore.currentPage * assetStore.pageSize) + assetStore.assets.length }} hasil</span>
            </p>
            <p v-else class="text-sm text-gray-700">Tidak ada data untuk ditampilkan</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAssetStore } from '@/stores/asset';
import type { AsetListInterface } from '@/interfaces/asset/asset.interface';
import { useAuthStore } from '@/stores/auth';
import VSearchBar from '@/components/VSearchBar.vue';
import Breadcrumb from '@/components/Breadcrumb.vue';

// Store & Router
const assetStore = useAssetStore();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

// State
const searchQuery = ref('');
const sortKey = ref<string>('nama');
const sortOrder = ref<string>('asc');
const selectedPageSize = ref(assetStore.pageSize || 10);

// Notification state
const showNotification = ref(false);
const notificationMessage = ref('');

// Debounce search
let searchTimeout: ReturnType<typeof setTimeout>;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchAssets(1); // Reset to first page when searching
  }, 500);
};

// Watch for search changes
watch(searchQuery, () => {
  debouncedSearch();
});

// Get current filters for API calls
const getCurrentFilters = () => {
  const filters: any = {};
  
  if (searchQuery.value && searchQuery.value.trim()) {
    filters.nama = searchQuery.value.trim();
  }
  
  console.log('getCurrentFilters result:', filters);
  return filters;
};

// Fetch assets with search parameters
const fetchAssets = async (page: number = 1) => {
  try {
    await assetStore.viewAllAssetsWithPagination(
      page - 1, 
      selectedPageSize.value,
      getCurrentFilters()
    );
  } catch (error) {
    console.error('Error fetching assets:', error);
  }
};

// Use store assets directly with client-side sorting for current page
const sortedAssets = computed(() => {
  const assets = [...assetStore.assets];
  
  if (sortKey.value) {
    assets.sort((a, b) => {
      let modifier = 1;
      if (sortOrder.value === 'desc') modifier = -1;
      
      if (sortKey.value === 'nama') {
        if (a.nama < b.nama) return -1 * modifier;
        if (a.nama > b.nama) return 1 * modifier;
        return 0;
      } else if (sortKey.value === 'tanggalPerolehan') {
        if (a.tanggalPerolehan < b.tanggalPerolehan) return -1 * modifier;
        if (a.tanggalPerolehan > b.tanggalPerolehan) return 1 * modifier;
        return 0;
      }
      return 0;
    });
  }
  
  return assets;
});

// Pagination functions
const changePage = (page: number) => {
  if (page < 1 || page > assetStore.totalPages || page === assetStore.currentPage + 1) {
    return;
  }
  fetchAssets(page);
};

const handlePageSizeChange = () => {
  assetStore.pageSize = selectedPageSize.value;
  fetchAssets(1);
};

// Pagination navigation computed (Same logic as ListResource)
const pageNavigation = computed(() => {
  const current = assetStore.currentPage + 1; // 1-indexed
  const total = assetStore.totalPages;
  
  if (total <= 1) {
    return total === 1 ? [1] : [];
  }
  
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  
  const delta = 1;
  const range = [];
  const rangeWithDots: (number | string)[] = [];
  let l: number | undefined;

  range.push(1);
  
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }
  
  if (total > 1) {
    range.push(total);
  }

  const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

  for (let i = 0; i < uniqueRange.length; i++) {
    const current = uniqueRange[i];
    
    if (l !== undefined) {
      if (current - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (current - l > 2) {
        rangeWithDots.push('...');
      }
    }
    
    rangeWithDots.push(current);
    l = current;
  }
  
  return rangeWithDots;
});

// Role-based computed properties
const canViewFinancialInfo = computed(() => {
  const userRole = authStore.userRole;
  return userRole === 'Direksi' || userRole === 'Finance';
});

const canViewMaintenanceInfo = computed(() => {
  return authStore.userRole === 'Operasional' || authStore.userRole === 'Admin';
});

const thirdColumnHeader = computed(() => {
  if (canViewMaintenanceInfo.value) {
    return 'Terakhir Maintenance';
  } else if (canViewFinancialInfo.value) {
    return 'Nilai Perolehan';
  }
  return '';
});

const thirdColumnValue = (asset: AsetListInterface) => {
  if (canViewMaintenanceInfo.value) {
    if (!asset.lastMaintenance) {
      return 'Belum Maintenance';
    }
    return formatDate(asset.lastMaintenance);
  } else if (canViewFinancialInfo.value) {
    return formatCurrency(asset.nilaiPerolehan);
  }
  return '';
};

// Utility functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, '0')} / ${String(date.getMonth() + 1).padStart(2, '0')} / ${date.getFullYear()}`;
};

const formatCurrency = (value: number) => {
  return `Rp${value.toLocaleString('id-ID')}`;
};

const goToDetailAsset = (platNomor: string) => {
  router.push(`/asset/${platNomor}`);
};

const sortTable = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

// Notification functions
const showSuccessNotification = (message: string) => {
  notificationMessage.value = message;
  showNotification.value = true;
  
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

// Watch for deletion notification
watch(() => route.query, (query) => {
  if (query.deleted === 'true') {
    const platNomor = query.platNomor as string;
    showSuccessNotification(`Aset ${platNomor} berhasil dihapus`);
    
    router.replace({ path: route.path });
  }
}, { immediate: true });

// Initial load
onMounted(async () => {
  await fetchAssets(1);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

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

.sort-indicator {
  font-size: 12px;
  line-height: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 12px;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
</style>