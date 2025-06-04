<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-full mx-auto bg-white p-3 rounded-lg shadow-md mb-4">
      <div class="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
        <VSearchBar v-model="searchCompany" placeholder="Cari Nama Perusahaan..." />
        <VSearchBar v-model="searchPIC" placeholder="Cari Nama PIC..." />
        <VButton v-if="isOperational" label="+ Tambah Supplier" @click="goToAddSupplier" />
      </div>
    </div>

    <div class="max-w-full mx-auto bg-white p-6 rounded-lg shadow-md">
      <div v-if="supplierStore.loading" class="flex justify-center items-center py-14">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
      <table v-else class="custom-table">
        <thead class="text-white bg-[#1E3A5F] rounded-t-lg">
          <tr>
            <th class="px-3 py-4 table-header text-base" style="width: 60px;">No</th>
            <th @click="sortBy('companySupplier')" class="px-6 py-4 table-header cursor-pointer text-base">
              Nama Perusahaan
              <span v-if="sortKey === 'companySupplier'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="sortBy('nameSupplier')" class="px-6 py-4 table-header cursor-pointer text-base">
              Nama PIC
              <span v-if="sortKey === 'nameSupplier'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th @click="sortBy('totalPurchases')" class="px-6 py-4 table-header cursor-pointer text-base">
              Jumlah Pembelian
              <span v-if="sortKey === 'totalPurchases'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(supplier, index) in sortedSuppliers"
            :key="supplier.id"
            class="bg-white border-b border-gray-200 hover:bg-gray-50 cursor-pointer text-base"
            @click="goToDetailSupplier(supplier.id)"
          >
            <!-- PERBAIKAN: Gunakan index dari v-for + pagination offset -->
            <td class="px-3 py-5 text-center">{{ (supplierStore.currentPage * supplierStore.pageSize) + index + 1 }}</td>
            <td class="px-6 py-5">{{ supplier.companySupplier }}</td>
            <td class="px-6 py-5">{{ supplier.nameSupplier }}</td>
            <td class="px-6 py-5">{{ supplier.totalPurchases }} Pembelian</td>
          </tr>
          <tr v-if="sortedSuppliers.length === 0">
            <td colspan="4" class="text-center text-gray-500 py-6 text-base">Data supplier tidak ditemukan.</td>
          </tr>
        </tbody>
      </table>
      
      <!-- Pagination Controls -->
      <div v-if="supplierStore.totalPages > 1 || supplierStore.suppliers.length > 0" class="mt-6">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">     
          <!-- Page Navigation -->
          <div class="flex items-center justify-center space-x-2">
            <button
              @click="changePage(supplierStore.currentPage)"
              :disabled="supplierStore.currentPage === 0"
              class="bg-[#1E3A5F] text-white px-4 py-2 rounded-md font-medium text-center transition hover:bg-[#2A4A6B] disabled:bg-gray-300 cursor-pointer disabled:cursor-not-allowed"
            >
              ◄
            </button>
            
            <template v-for="pageNumber in pageNavigation" :key="pageNumber">
              <button
                v-if="typeof pageNumber === 'number'"
                @click="changePage(pageNumber)"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 cursor-pointer', 
                  pageNumber === supplierStore.currentPage + 1 ? 
                    'bg-[#1E3A5F] text-white border border-[#1E3A5F]' : 
                    'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                ]"
              >
                {{ pageNumber }}
              </button>
              <span v-else class="px-2 py-2 text-sm font-medium text-gray-600">{{ pageNumber }}</span>
            </template>
            
            <button
              @click="changePage(supplierStore.currentPage + 2)"
              :disabled="supplierStore.currentPage >= supplierStore.totalPages - 1"
              class="bg-[#1E3A5F] text-white px-4 py-2 rounded-md font-medium text-center transition hover:bg-[#2A4A6B] disabled:bg-gray-300 cursor-pointer disabled:cursor-not-allowed"
            >
              ►
            </button>
          </div>
          
          <!-- Item Count Display -->
          <p v-if="supplierStore.suppliers.length > 0" class="text-sm text-gray-700 text-center">
            Menampilkan <span class="font-medium">{{ (supplierStore.currentPage * supplierStore.pageSize) + 1 }}</span>
            dari <span class="font-medium">{{ Math.min((supplierStore.currentPage * supplierStore.pageSize) + supplierStore.suppliers.length, totalItems) }}</span> supplier
          </p>
          <p v-else class="text-sm text-gray-700">Tidak ada data untuk ditampilkan</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSupplierStore } from '@/stores/supplier';
import { useAuthStore } from '@/stores/auth';
import VButton from '@/components/VButton.vue';
import VSearchBar from '@/components/VSearchBar.vue';
import Breadcrumb from '@/components/Breadcrumb.vue';

const searchPIC = ref('');
const searchCompany = ref('');
const supplierStore = useSupplierStore();
const authStore = useAuthStore();
const router = useRouter();

// Pagination state
const selectedPageSize = ref(supplierStore.pageSize || 5);

// Fetch paginated suppliers
const fetchPaginatedSuppliers = async (page: number = 1) => {
  await supplierStore.viewAllSupplierPaginated(
    page - 1, // Convert 1-indexed to 0-indexed
    selectedPageSize.value,
    { 
      nameSupplier: searchPIC.value,
      companySupplier: searchCompany.value
    }
  );
};

// Change page
const changePage = (page: number) => {
  if (page < 1 || page > supplierStore.totalPages || page === supplierStore.currentPage + 1) {
    return;
  }
  fetchPaginatedSuppliers(page);
};

// Total items calculation
const totalItems = computed(() => {
  return Math.max(supplierStore.totalPages * supplierStore.pageSize, supplierStore.suppliers.length);
});

// Pagination display logic
const pageNavigation = computed(() => {
  const current = supplierStore.currentPage + 1; // 1-indexed
  const total = supplierStore.totalPages;
  
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

const isOperational = computed(() => {
  return authStore.userRole === 'Operasional';
});

// Debounce search input
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

watch([searchPIC, searchCompany], () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    fetchPaginatedSuppliers(1);
  }, 400);
});

const sortKey = ref('');
const sortAsc = ref(true);

const sortBy = (key: string) => {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value;
  } else {
    sortKey.value = key;
    sortAsc.value = true;
  }
};

const sortedSuppliers = computed(() => {
  if (!sortKey.value) {
    return supplierStore.suppliers;
  }
  return [...supplierStore.suppliers].sort((a, b) => {
    const valueA = (a as any)[sortKey.value];
    const valueB = (b as any)[sortKey.value];

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortAsc.value
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortAsc.value ? valueA - valueB : valueB - valueA;
    }

    return 0;
  });
});

const goToAddSupplier = () => {
  router.push('/supplier/add');
};

const goToDetailSupplier = (supplierId: string) => {
  router.push(`/supplier/detail/${supplierId}`);
};

onMounted(() => {
  // Set initial page size if needed
  if (supplierStore.pageSize) {
    selectedPageSize.value = 10;
  }
  
  // Load initial data with pagination
  fetchPaginatedSuppliers(1);
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
</style>