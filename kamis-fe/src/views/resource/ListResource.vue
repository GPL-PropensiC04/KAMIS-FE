<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-full mx-auto bg-white p-3 rounded-lg shadow-md mb-4">
      <div class="flex justify-between items-center gap-2">
        <VSearchBar v-model="searchName" placeholder="Cari Nama Resource..." />
        <VButton v-if="showAddButton" label="+ Tambah Resource" @click="goToAddResource" />
      </div>
    </div>
    
    <div class="max-w-full mx-auto bg-white p-6 rounded-lg shadow-md">
      <div v-if="resourceStore.isLoading && resourceStore.resources.length === 0" class="flex justify-center items-center py-14">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="custom-table">
          <thead class="text-white bg-[#1E3A5F] rounded-t-lg">
            <tr>
              <th class="px-3 py-4 table-header text-base" style="width: 60px;">No</th>
              <th class="px-6 py-4 table-header cursor-pointer text-base" @click="sortBy('resourceName')">
                <div class="flex items-center justify-center gap-2">
                  <span>Nama Resource</span>
                  <span v-if="sortField === 'resourceName'" class="sort-indicator">
                    <span v-if="sortOrder === 'asc'" class="text-white">▲</span>
                    <span v-else class="text-white">▼</span>
                  </span>
                </div>
              </th>
              <th class="px-6 py-4 table-header cursor-pointer text-base" @click="sortBy('resourceStock')">
                <div class="flex items-center justify-center gap-2">
                  <span>Stok</span>
                  <span v-if="sortField === 'resourceStock'" class="sort-indicator">
                    <span v-if="sortOrder === 'asc'" class="text-white">▲</span>
                    <span v-else class="text-white">▼</span>
                  </span>
                </div>
              </th>
              <th v-if="showHargaJual" class="px-6 py-4 table-header text-base">Harga Jual</th>
              <th class="px-6 py-4 table-header text-base">Deskripsi</th>
              <th v-if="showAction" class="px-6 py-4 table-header text-base">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(resource, index) in sortedAndFilteredResources" 
              :key="resource.id"
              class="bg-white border-b border-gray-200 hover:bg-gray-50 cursor-pointer text-base"
            >
              <td class="px-3 py-5 font-medium text-gray-600" style="width: 60px;">{{ itemNumber(index) }}</td>
              <td class="px-6 py-5">{{ resource.resourceName }}</td>
              <td class="px-6 py-5">{{ resource.resourceStock }}</td>
              <td v-if="showHargaJual" class="px-6 py-5 font-bold">{{ formatCurrency(resource.resourcePrice) }}</td>
              <td class="px-6 py-5">{{ resource.resourceDescription }}</td>
              <td v-if="showAction" class="px-6 py-5">
                <VSuccessButton
                  label="Update"
                  @click="goToUpdateResource(resource.id!)"
                />
              </td>
            </tr>
            
            <tr v-if="!resourceStore.isLoading && sortedAndFilteredResources.length === 0">
              <td :colspan="getColspan" class="text-center text-gray-500 py-6 text-base italic">
                Data resource tidak ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="resourceStore.totalPages > 1 || resourceStore.resources.length > 0" class="mt-6 text-center">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <label for="pageSizeSelect" class="text-sm text-gray-700 whitespace-nowrap">Item per halaman:</label>
              <select 
                id="pageSizeSelect" 
                v-model="selectedPageSize" 
                @change="handlePageSizeChange"
                class="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              >
                <option :value="1">1</option>
                <option :value="3">3</option>
                <option :value="5">5</option>
                <option :value="10">10</option>
              </select>
            </div>
            <div class="flex items-center justify-center space-x-2">
              <button
                @click="changePage(resourceStore.currentPage)"
                :disabled="resourceStore.currentPage === 0"
                class="bg-[#1E3A5F] text-white px-6 py-2 rounded-md font-inter font-medium text-center transition hover:cursor-pointer active:scale-95"
              >
                Sebelumnya
              </button>
              
              <template v-for="pageNumber in pageNavigation" :key="pageNumber">
                <button
                  v-if="typeof pageNumber === 'number'"
                  @click="changePage(pageNumber)"
                  :class="['px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 cursor-pointer', pageNumber === resourceStore.currentPage + 1 ? 'bg-[#2D6A4F] text-white border border-blue-600' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50']"
                >
                  {{ pageNumber }}
                </button>
                <span v-else class="px-3 py-2 text-sm font-medium text-gray-600">{{ pageNumber }}</span>
              </template>
              
              <button
                @click="changePage(resourceStore.currentPage + 2)"
                :disabled="resourceStore.currentPage >= resourceStore.totalPages - 1"
                class="bg-[#1E3A5F] text-white px-6 py-2 rounded-md font-inter font-medium text-center transition hover:cursor-pointer active:scale-95"
              >
                Selanjutnya
              </button>
            </div>
            
            <p v-if="resourceStore.resources.length > 0" class="text-sm text-gray-700 text-center sm:text-left">
              Menampilkan <span class="font-medium">{{ (resourceStore.currentPage * resourceStore.pageSize) + 1 }}</span>
              sampai <span class="font-medium">{{ (resourceStore.currentPage * resourceStore.pageSize) + resourceStore.resources.length }} hasil</span>
            </p>
            <p v-else class="text-sm text-gray-700">Tidak ada data untuk ditampilkan</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useResourceStore } from "@/stores/resource";
import { useAuthStore } from "@/stores/auth";
import VSearchBar from "@/components/VSearchBar.vue";
import VButton from "@/components/VButton.vue";
import VSuccessButton from "@/components/VSuccessButton.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";

// Store & Router
const resourceStore = useResourceStore();
const authStore = useAuthStore();
const router = useRouter();

// State
const searchName = ref('');
const loading = ref(true);
const sortField = ref<string>('');
const sortOrder = ref<'asc' | 'desc'>('asc');
const selectedPageSize = ref(resourceStore.pageSize || 10); // Initialize with store's page size or default to 10

// Fetch initial data
const fetchResources = async (page: number) => {
  await resourceStore.viewAllResourcesWithPagination(page - 1, selectedPageSize.value);
};

const initialFetchResources = async () => {
  await fetchResources(1);
};

// Change page
const changePage = (page: number) => {
  if (page < 1 || page > resourceStore.totalPages || page === resourceStore.currentPage + 1) {
    return;
  }
  fetchResources(page);
};

// Handle page size change
const handlePageSizeChange = () => {
  resourceStore.pageSize = selectedPageSize.value; // Update store's page size
  fetchResources(1); // Fetch first page with new page size
};

// Rupiah formatter
const formatCurrency = (value: number) => `Rp ${value.toLocaleString("id-ID")},00`;

// Search & filter data
const filteredResources = computed(() => {
  if (!searchName.value) return resourceStore.resources;
  return resourceStore.resources.filter(res =>
    res.resourceName.toLowerCase().includes(searchName.value.toLowerCase())
  );
});

// Sorting function
const sortBy = (field: string) => {
  if (sortField.value === field) {
    // Toggle sort order if same field
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Set new field and default to ascending
    sortField.value = field;
    sortOrder.value = 'asc';
  }
};

// Sorted and filtered resources
const sortedAndFilteredResources = computed(() => {
  const resources = [...filteredResources.value];
  
  if (sortField.value) {
    resources.sort((a, b) => {
      let aValue = a[sortField.value as keyof typeof a];
      let bValue = b[sortField.value as keyof typeof b];
      
      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      // Handle number comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string comparison
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortOrder.value === 'asc' ? 1 : -1;
      if (bValue == null) return sortOrder.value === 'asc' ? -1 : 1;
      if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  return resources;
});

// Dynamic colspan for empty state message
const getColspan = computed(() => {
  let colspan = 4; // Base columns (no, name, stock, description)
  if (showHargaJual.value) colspan++;
  if (showAction.value) colspan++;
  return colspan;
});

// Pagination display logic
const pageNavigation = computed(() => {
  const current = resourceStore.currentPage + 1; // 1-indexed
  const total = resourceStore.totalPages;
  
  // If only 1 page or no pages, don't show complex pagination
  if (total <= 1) {
    return total === 1 ? [1] : [];
  }
  
  // If total pages is small (≤ 7), show all pages
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  
  const delta = 1; // How many pages to show before and after current page
  const range = [];
  const rangeWithDots: (number | string)[] = [];
  let l: number | undefined;

  // Always include first page
  range.push(1);
  
  // Add pages around current page
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }
  
  // Always include last page if total > 1
  if (total > 1) {
    range.push(total);
  }

  // Remove duplicates and sort
  const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

  // Add dots where there are gaps
  for (let i = 0; i < uniqueRange.length; i++) {
    const current = uniqueRange[i];
    
    if (l !== undefined) {
      if (current - l === 2) {
        // If gap is exactly 2, show the missing number
        rangeWithDots.push(l + 1);
      } else if (current - l > 2) {
        // If gap is more than 2, show dots
        rangeWithDots.push('...');
      }
    }
    
    rangeWithDots.push(current);
    l = current;
  }
  
  return rangeWithDots;
});

// Item number
const itemNumber = (index: number) => {
  return resourceStore.currentPage * resourceStore.pageSize + index + 1;
};

const totalItems = computed(() => {
  return resourceStore.totalPages * resourceStore.pageSize;
});

// Navigasi
const goToAddResource = () => router.push("/resource/add");
const goToUpdateResource = (id: string | number, event?: Event) => {
  if (event) event.stopPropagation();
  router.push(`/resource/update/${id}`);
};

// Role-based visibility
const showHargaJual = computed(() => authStore.userRole !== 'Operasional');
const showAction = computed(() => !['Direksi', 'Finance', 'Admin'].includes(authStore.userRole || ''));
// Role-based visibility tombol Tambah Resource
const showAddButton = computed(() => !['Direksi', 'Finance', 'Admin'].includes(authStore.userRole || ''));

// Fetch on load
onMounted(() => {
  initialFetchResources();
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