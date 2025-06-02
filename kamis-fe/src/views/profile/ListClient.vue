<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-full mx-auto bg-white p-3 rounded-lg shadow-md mb-4">
      <div class="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
        <VSearchBar v-model="searchName" placeholder="Cari Nama Klien..." />
        <VOptionInput v-model="typeClient" :options="['Semua', 'Perusahaan', 'Perorangan']"/>
        <VDropDownInput v-if="isFinance || isDireksi" v-model="selectedNominal" :options="nominalOptions.map(opt => opt.label)" class="w-48"/>
        <VButton v-if="isOperational" class="ml-auto" label="+ Tambah Klien" @click="goToAddClient"/>
      </div>
    </div>
    <div class="max-w-full mx-auto bg-white p-6 rounded-lg shadow-md">
      <div v-if="clientStore.loading" class="flex justify-center items-center py-14">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
      <table v-else class="custom-table">
        <thead class="text-white bg-[#1E3A5F] rounded-t-lg">
          <tr>
            <th @click="sortBy('nameClient')" class="px-6 py-4 table-header cursor-pointer text-base">
              Nama Klien
              <span v-if="sortKey === 'nameClient'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th class="px-6 py-4 table-header text-base">
              Tipe Klien
            </th>
            <th @click="sortBy('companyClient')" class="px-6 py-4 table-header cursor-pointer text-base">
              Perusahaan
              <span v-if="sortKey === 'companyClient'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th v-if="isOperational || isDireksi" @click="sortBy('projectCount')" class="px-6 py-4 table-header cursor-pointer text-base">
              Jumlah Aktivitas
              <span v-if="sortKey === 'projectCount'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
            <th v-if="isFinance || isDireksi" @click="sortBy('totalProfit')" class="px-6 py-4 table-header cursor-pointer text-base">
              Total Profit
              <span v-if="sortKey === 'totalProfit'">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="client in sortedClients"
            :key="client.id"
            class="bg-white border-b border-gray-200 hover:bg-gray-50 cursor-pointer text-base"
            @click="goToDetailClient(client)"
          >
            <td class="px-6 py-5">{{ client.nameClient }}</td>
            <td class="px-6 py-5">{{ client.typeClient === true ? 'Perusahaan' : client.typeClient === false ? 'Perorangan' : client.typeClient }}</td>
            <td class="px-6 py-5">{{ client.companyClient || '-' }}</td>
            <td v-if="isOperational || isDireksi" class="px-6 py-5">{{ client.projectCount ?? 0 }} Aktivitas</td>
            <td v-if="isFinance || isDireksi" class="px-6 py-5" :class="{'text-green-600': (client.totalProfit ?? 0) > 0, 'text-red-600': (client.totalProfit ?? 0) < 0}">
              <template v-if="client.totalProfit != null">
                <span v-if="client.totalProfit > 0"> Rp{{ client.totalProfit.toLocaleString('id-ID') }}</span>
                <span v-else-if="client.totalProfit < 0">- Rp{{ Math.abs(client.totalProfit).toLocaleString('id-ID') }}</span>
                <span v-else>Rp0</span>
              </template>
              <template v-else>Rp0</template>
            </td>
          </tr>
          <tr v-if="sortedClients.length === 0">
            <td :colspan="3 + (isOperational || isDireksi ? 1 : 0) + (isFinance || isDireksi ? 1 : 0)" class="text-center text-gray-500 py-6 text-base">
              Data klien tidak ditemukan.
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Pagination Controls -->
      <div v-if="clientStore.totalPages > 1 || clientStore.clientList.length > 0" class="mt-6">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <!-- Page Size Selector -->
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
          
          <!-- Page Navigation -->
          <div class="flex items-center justify-center space-x-2">
            <button
              @click="changePage(clientStore.currentPage)"
              :disabled="clientStore.currentPage === 0"
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
                  pageNumber === clientStore.currentPage + 1 ? 
                    'bg-[#2D6A4F] text-white border border-[#2D6A4F]' : 
                    'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                ]"
              >
                {{ pageNumber }}
              </button>
              <span v-else class="px-2 py-2 text-sm font-medium text-gray-600">{{ pageNumber }}</span>
            </template>
            
            <button
              @click="changePage(clientStore.currentPage + 2)"
              :disabled="clientStore.currentPage >= clientStore.totalPages - 1"
              class="bg-[#1E3A5F] text-white px-4 py-2 rounded-md font-medium text-center transition hover:bg-[#2A4A6B] disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
          
          <!-- Item Count Display -->
          <p v-if="clientStore.clientList.length > 0" class="text-sm text-gray-700 text-center">
            Menampilkan <span class="font-medium">{{ (clientStore.currentPage * clientStore.pageSize) + 1 }}</span>
            sampai <span class="font-medium">{{ Math.min((clientStore.currentPage * clientStore.pageSize) + clientStore.clientList.length, totalItems) }}</span> hasil
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
import { useClientStore } from '@/stores/client';
import { useAuthStore } from '@/stores/auth';
import VButton from '@/components/VButton.vue';
import type { ClientListResponseInterface } from '@/interfaces/profile/client.interface';
import VSearchBar from '@/components/VSearchBar.vue';
import VOptionInput from '@/components/VOptionInput.vue';
import Breadcrumb from '@/components/Breadcrumb.vue'
import VDropDownInput from '@/components/VDropDownInput.vue';

const searchName = ref('');
const clientStore = useClientStore();
const authStore = useAuthStore();
const router = useRouter();
const typeClient = ref('Semua');

const sortKey = ref('');
const sortAsc = ref(true);

// Pagination state
const selectedPageSize = ref(clientStore.pageSize || 5);

const nominalOptions = [
  { label: "Semua Profit", min: null, max: null },
  { label: "0 - 10 Juta", min: 0, max: 10_000_000 },
  { label: "10 Juta - 100 Juta", min: 10_000_000, max: 100_000_000 },
  { label: "100 Juta - 1 Miliar", min: 100_000_000, max: 1_000_000_000 },
  { label: "1 Miliar ke atas", min: 1_000_000_000, max: null },
];
const selectedNominal = ref(nominalOptions[0].label);

// Get current filters for API calls
const getCurrentFilters = () => {
  const selected = nominalOptions.find(opt => opt.label === selectedNominal.value);
  let type = undefined;
  if (typeClient.value === 'Perusahaan') type = true;
  else if (typeClient.value === 'Perorangan') type = false;

  return {
    nameClient: searchName.value,
    typeClient: type,
    minProfit: selected?.min,
    maxProfit: selected?.max,
  };
};

// Fetch paginated clients
const fetchPaginatedClients = async (page: number = 1) => {
  await clientStore.viewAllClientPaginated(
    page - 1, // Convert 1-indexed to 0-indexed
    selectedPageSize.value,
    getCurrentFilters()
  );
};

// Handle page size change
const handlePageSizeChange = () => {
  clientStore.pageSize = selectedPageSize.value;
  fetchPaginatedClients(1); // Reset to first page
};

// Change page
const changePage = (page: number) => {
  if (page < 1 || page > clientStore.totalPages || page === clientStore.currentPage + 1) {
    return;
  }
  fetchPaginatedClients(page);
};

// Total items calculation
const totalItems = computed(() => {
  return Math.max(clientStore.totalPages * clientStore.pageSize, clientStore.clientList.length);
});

// Pagination display logic
const pageNavigation = computed(() => {
  const current = clientStore.currentPage + 1; // 1-indexed
  const total = clientStore.totalPages;
  
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

// Watch for filter changes
watch(typeClient, () => {
  fetchPaginatedClients(1); // Reset to first page when filter changes
});

watch(selectedNominal, () => {
  fetchPaginatedClients(1); // Reset to first page when filter changes
});

// Debounce search input
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

watch(searchName, () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    fetchPaginatedClients(1);
  }, 400);
});

const sortBy = (key: string) => {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value;
  } else {
    sortKey.value = key;
    sortAsc.value = true;
  }
};

const sortedClients = computed(() => {
  if (!sortKey.value) {
    return clientStore.clientList;
  }
  return [...clientStore.clientList].sort((a, b) => {
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

function goToAddClient() {
  router.push('/client/add');
}

function goToDetailClient(client: ClientListResponseInterface) {
  if (client.id) {
    router.push(`/client/${client.id}`);
  }
}

const isFinance = computed(() => authStore.userRole === 'Finance');
const isOperational = computed(() => authStore.userRole === 'Operasional');
const isDireksi = computed(() => authStore.userRole === 'Direksi');

onMounted(() => {
  // Set initial page size if needed
  if (clientStore.pageSize) {
    selectedPageSize.value = clientStore.pageSize;
  }
  
  // Load initial data with pagination
  fetchPaginatedClients(1);
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