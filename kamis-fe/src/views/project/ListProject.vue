<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
  <!-- Filter Section -->
  <div class="max-w-full mx-auto bg-white p-3 rounded-lg shadow-md mb-4">
    <template v-if="canViewFinancialInfo">
      <div class="grid grid-cols-1 gap-2 items-center">
        <div class="flex flex-wrap gap-2 items-center justify-between">
          <div class="flex flex-1 gap-2 items-center">
    
              <VSearchBar 
                v-model="searchQuery" 
                placeholder="Cari ID atau nama proyek..." 
                class="flex-1" 
              />
              <VDropDownInput
              :options="nominalOptions.map((opt) => opt.label)"
              v-model="selectedNominalLabel"
              @update:modelValue="updateNominalFilter"
              class="flex-1"
              placeholder="Filter berdasarkan profit"
            />
          </div>
          <div class="flex-shrink-0 min-w-[250px]">
            <VDateRangeFilter v-model="dateRange" />
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="grid grid-cols-1 gap-2 items-center">
        <div class="flex flex-wrap gap-2 items-center justify-between">
          <div class="flex flex-1 gap-2 items-center">
            <div class="relative flex-1">
              <VSearchBar 
                v-model="searchQuery" 
                placeholder="Cari ID atau nama proyek..." 
                class="w-full pr-10" 
              />
              <button 
                v-if="searchQuery" 
                @click="clearSearch" 
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <span class="text-xl">×</span>
              </button>
            </div>
          </div>
          <div class="flex-shrink-0 min-w-[250px]">
            <VDateRangeFilter v-model="dateRange" />
          </div>
        </div>
      </div>
    </template>
  </div>

    <!-- Main Content Section -->
    <div class="max-w-full mx-auto bg-white p-6 rounded-lg shadow-md">
      <div class="flex justify-between items-center mb-4">
        <VOptionInput 
          v-model="selectedType" 
          :options="['All', 'Penjualan', 'Distribusi']" 
          class="w-1/3" 
        />
        <div class="flex gap-2">
          <VButton v-if="canEditProject" label="+ Tambah Aktivitas" @click="goToAddProject" />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="projectStore.isLoading" class="flex justify-center items-center py-14">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>

      <!-- Table -->
      <div v-else>
        <table class="custom-table">
          <thead class="text-white bg-[#1E3A5F] rounded-t-lg">
            <tr>
              <th class="px-6 py-4 table-header text-base">ID Aktivitas</th>
              <th class="px-6 py-4 table-header text-base">Nama Aktivitas</th>
              <th class="px-6 py-4 table-header text-base">Tipe</th>
              <th class="px-6 py-4 table-header text-base">Status</th>
              <th class="px-6 py-4 table-header text-base">Tanggal Mulai</th>
              <th class="px-6 py-4 table-header text-base">Tanggal Selesai</th>
              <th v-if="canViewFinancialInfo" class="px-6 py-4 table-header text-base">Pemasukkan</th>
              <th v-if="canViewFinancialInfo" class="px-6 py-4 table-header text-base">Pengeluaran</th>
              <th v-if="canViewFinancialInfo" class="px-6 py-4 table-header text-base">Profit</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="project in projectStore.projects" 
              :key="project.id" 
              class="bg-white border-b border-gray-200 hover:bg-gray-50 cursor-pointer text-base"
              @click="goToProjectDetails(project)"
            >
              <td class="px-6 py-5">{{ project.id }}</td>
              <td class="px-6 py-5">{{ project.projectName }}</td>
              <td class="px-6 py-5">{{ formatType(project.projectType) }}</td>
              <td class="px-6 py-5">{{ formatStatus(project.projectStatus, project.projectType, project.projectPaymentStatus) }}</td>
              <td class="px-6 py-5">{{ formatDate(project.projectStartDate) }}</td>
              <td class="px-6 py-5">{{ formatDate(project.projectEndDate) }}</td>
              <td v-if="canViewFinancialInfo" class="px-6 py-5 text-right text-green-600">
                {{ formatCurrency(project.projectTotalPemasukkan) }}
              </td>
              <td v-if="canViewFinancialInfo" class="px-6 py-5 text-right text-red-600">
                {{ formatCurrency(project.projectTotalPengeluaran) }}
              </td>
              <td v-if="canViewFinancialInfo" 
                  class="px-6 py-5"
                  :class="{
                    'text-right font-bold': true,
                    'text-green-600': (project.projectProfit ?? 0) >= 0,
                    'text-red-600': (project.projectProfit ?? 0) < 0
                  }">
                {{ project.projectProfit !== undefined ? formatCurrency(project.projectProfit) : '-' }}
              </td>
            </tr>
            
            <!-- No Data Message -->
            <tr v-if="projectStore.projects.length === 0">
              <td :colspan="canViewFinancialInfo ? 9 : 6" class="text-center text-gray-500 py-6 text-base">
                <p class="italic">
                  <template v-if="searchQuery && dateRange.start && dateRange.end">
                    Tidak ada data proyek dengan nama atau ID "{{ searchQuery }}" dan dalam rentang tanggal {{ dateRange.start }} hingga {{ dateRange.end }}.
                  </template>
                  <template v-else-if="searchQuery && dateRange.start">
                    Tidak ada data proyek dengan nama atau ID "{{ searchQuery }}" dan tanggal mulai {{ dateRange.start }}.
                  </template>
                  <template v-else-if="searchQuery && dateRange.end">
                    Tidak ada data proyek dengan nama atau ID "{{ searchQuery }}" dan tanggal selesai {{ dateRange.end }}.
                  </template>
                  <template v-else-if="dateRange.start && dateRange.end">
                    Tidak ada data proyek dalam rentang tanggal {{ dateRange.start }} hingga {{ dateRange.end }}.
                  </template>
                  <template v-else-if="dateRange.start">
                    Tidak ada data proyek dengan tanggal mulai {{ dateRange.start }}.
                  </template>
                  <template v-else-if="dateRange.end">
                    Tidak ada data proyek dengan tanggal selesai {{ dateRange.end }}.
                  </template>
                  <template v-else-if="searchQuery">
                    Tidak ada data proyek dengan nama atau ID "{{ searchQuery }}".
                  </template>
                  <template v-else-if="startNominal !== null && endNominal !== null">
                    Tidak ada data proyek dengan profit antara {{ formatCurrency(startNominal) }} - {{ formatCurrency(endNominal) }}.
                  </template>
                  <template v-else-if="hasActiveFilters">
                    Tidak ada data proyek yang sesuai dengan filter yang dipilih.
                  </template>
                  <template v-else-if="selectedType === 'All'">
                    Tidak ada data proyek ditemukan.
                  </template>
                  <template v-else-if="selectedType === 'Penjualan'">
                    Tidak ada data proyek penjualan ditemukan.
                  </template>
                  <template v-else>
                    Tidak ada data proyek distribusi ditemukan.
                  </template>
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Navigation -->
        <div v-if="projectStore.totalPages > 1 || projectStore.projects.length > 0" class="mt-6 text-center">
          <div class="flex items-center justify-between mb-4">
            <!-- Page Navigation -->
            <div class="flex items-center justify-center space-x-2">
              <button
                @click="changePage(projectStore.currentPage)"
                :disabled="projectStore.currentPage === 0"
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
                    pageNumber === projectStore.currentPage + 1 ? 
                      'bg-[#1E3A5F] text-white border border-[#1E3A5F]' : 
                      'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  {{ pageNumber }}
                </button>
                <span v-else class="px-2 py-2 text-sm font-medium text-gray-600">{{ pageNumber }}</span>
              </template>
              
              <button
                @click="changePage(projectStore.currentPage + 2)"
                :disabled="projectStore.currentPage >= projectStore.totalPages - 1"
                class="bg-[#1E3A5F] text-white px-4 py-2 rounded-md font-medium text-center 
                      transition hover:bg-[#2A4A6B] disabled:bg-gray-300 cursor-pointer disabled:cursor-not-allowed"
              >
                ►
              </button>
            </div>
              
            <p v-if="projectStore.projects.length > 0" class="text-sm text-gray-700 text-center sm:text-left">
              Menampilkan <span class="font-medium">{{ (projectStore.currentPage * projectStore.pageSize) + 1 }}</span>
              sampai <span class="font-medium">{{ (projectStore.currentPage * projectStore.pageSize) + projectStore.projects.length }}</span>
              dari <span class="font-medium">{{ projectStore.totalElements }}</span> aktivitas
            </p>
            <p v-else class="text-sm text-gray-700">Tidak ada data untuk ditampilkan</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Inline Modal for Project Type Selection -->
  <div v-if="showModal" class="fixed inset-0 backdrop-blur-xs flex justify-center items-center z-50" @click="closeModal">
    <div class="bg-white rounded-lg shadow-lg max-w-md w-full overflow-hidden" @click.stop>
      <div class="border-b px-6 py-4 flex justify-between items-center">
        <h3 class="text-lg font-semibold text-[#1E3A5F]">Tipe Aktivitas</h3>
        <button class="text-gray-500 hover:text-gray-700 text-2xl" @click="closeModal">&times;</button>
      </div>
      
      <div class="p-6">
        <!-- Use VOptionInput for selection -->
        <div class="mb-6">
          <VOptionInput 
            v-model="tipeProyekOption" 
            :options="['Penjualan', 'Distribusi']" 
          />
        </div>
        
        <!-- Proceed Button -->
        <div class="flex justify-center">
          <button 
            class="bg-[#2F855A] text-white px-8 py-3 rounded-md font-medium hover:bg-[#276749] transition-colors"
            @click="proceedToAddProject"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useProjectStore } from "@/stores/project";
import { useAuthStore } from "@/stores/auth";
import VSearchBar from "@/components/VSearchBar.vue";
import VDateRangeFilter from "@/components/VDateRangeFilter.vue";
import VDropDownInput from "@/components/VDropDownInput.vue";
import VOptionInput from "@/components/VOptionInput.vue";
import VButton from "@/components/VButton.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import type { ListProject } from "@/interfaces/project/project.interface";

// Store & Router
const projectStore = useProjectStore();
const authStore = useAuthStore();
const router = useRouter();

// State for filters & sorting
const searchQuery = ref("");
const dateRange = ref({ start: "", end: "" });
const selectedType = ref("All");
const selectedPageSize = ref(projectStore.pageSize || 10);

// State for price range filter
const startNominal = ref<number | null>(null);
const endNominal = ref<number | null>(null);
const selectedNominalLabel = ref("Seluruh Profit");

// Modal state
const showModal = ref(false);
const tipeProyekOption = ref("Penjualan");

// Debounce search
let searchTimeout: ReturnType<typeof setTimeout>;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchProjects(1); // Reset to first page when searching
  }, 500);
};

// Watch for search changes
watch(searchQuery, () => {
  debouncedSearch();
});

// Watch for other filter changes
watch([dateRange, selectedType, startNominal, endNominal], () => {
  fetchProjects(1); // Reset to first page when filters change
});

// Role-based permission computed properties
const canViewFinancialInfo = computed(() => {
  const userRole = authStore.userRole;
  return userRole === "Direksi" || userRole === "Finance";
});

const canEditProject = computed(() => {
  const userRole = authStore.userRole;
  return userRole === "Operasional";
});

// Price range options
const nominalOptions = [
  { label: "Seluruh Profit", start: null, end: null },
  { label: "0 - 1 Juta", start: 0, end: 1000000 },
  { label: "1 Juta - 10 Juta", start: 1000000, end: 10000000 },
  { label: "10 Juta - 100 Juta", start: 10000000, end: 100000000 },
  { label: "100 Juta - 1 Miliar", start: 100000000, end: 1000000000 },
];

// Get current filters for API calls
const getCurrentFilters = () => {
  const filters: any = {
    idProject: searchQuery.value || null,
    namaProject: searchQuery.value || null,
    startNominal: startNominal.value,
    endNominal: endNominal.value,
  };

  // Handle project type filter
  if (selectedType.value === "Penjualan") {
    filters.tipeProject = false;
  } else if (selectedType.value === "Distribusi") {
    filters.tipeProject = true;
  }
  // Don't set tipeProject for "All"

  // Format dates from DD-MM-YYYY to YYYY-MM-DD format for the backend
  if (dateRange.value.start) {
    const parts = dateRange.value.start.split('-');
    if (parts.length === 3) {
      filters.tanggalMulai = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  if (dateRange.value.end) {
    const parts = dateRange.value.end.split('-');
    if (parts.length === 3) {
      filters.tanggalSelesai = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  return filters;
};

// Fetch projects with pagination
const fetchProjects = async (page: number = 1) => {
  try {
    await projectStore.fetchProjectsPaginated(
      page - 1, 
      selectedPageSize.value,
      getCurrentFilters()
    );
  } catch (error) {
    console.error('Error fetching projects:', error);
  }
};

// Pagination functions
const changePage = (page: number) => {
  if (page < 1 || page > projectStore.totalPages || page === projectStore.currentPage + 1) {
    return;
  }
  fetchProjects(page);
};

// Pagination navigation computed
const pageNavigation = computed(() => {
  const current = projectStore.currentPage + 1; // 1-indexed
  const total = projectStore.totalPages;
  
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

// Clear search function
const clearSearch = () => {
  searchQuery.value = "";
};

// Update nominal filter when dropdown selection changes
const updateNominalFilter = (selectedLabel: string) => {
  selectedNominalLabel.value = selectedLabel;
  const selectedOption = nominalOptions.find((opt) => opt.label === selectedLabel);
  if (selectedOption) {
    startNominal.value = selectedOption.start;
    endNominal.value = selectedOption.end;
  }
};

// Initial data fetch
onMounted(() => {
  fetchProjects(1);
});

// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
};

// Rupiah formatter
const formatCurrency = (value: number) => {
  if (!value && value !== 0) return 'Rp 0,00';
  return `Rp ${value.toLocaleString("id-ID")},00`;
};

// Status formatter
const formatStatus = (status: number, projectType: boolean, projectPaymentStatus: number) => {
  const userRole = authStore.userRole;
  if ((userRole === "Direksi" || userRole === "Finance") &&  projectPaymentStatus === 0) {
    return "Menunggu Pembayaran";
  }
  if (projectType) {
    switch (status) { // Distribusi
      case 0: return 'Direncanakan';
      case 1: return 'Dalam Pengiriman';
      case 2: return 'Selesai';
      case 3: return 'Dibatalkan';
      default: return 'Unknown';
    }
  } else {
    switch (status) { // Penjualan
      case 0: return 'Direncanakan';
      case 1: return 'Sedang Dikerjakan';
      case 2: return 'Selesai';
      case 3: return 'Dibatalkan';
      default: return 'Unknown';
    }
  }
};

// Project type formatter
const formatType = (type: boolean) => {
  return type ? 'Distribusi' : 'Penjualan';
};

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return Boolean(
    searchQuery.value || 
    dateRange.value.start || 
    dateRange.value.end ||
    selectedType.value !== 'All' ||
    startNominal.value !== null ||
    endNominal.value !== null
  );
});

// Navigations
const goToProjectDetails = (project: ListProject) => {
  if (project.projectType === true) {
    router.push(`/project/distribution/${project.id}`);
  } else {
    router.push(`/project/sale/${project.id}`);
  }
};

const goToAddProject = () => {
  showModal.value = true;
};

const proceedToAddProject = () => {
  if (tipeProyekOption.value === "Distribusi") {
    router.push("/project/add/distribution");
  } else {
    router.push("/project/add/sales");
  }
  showModal.value = false;
};

const closeModal = () => {
  showModal.value = false;
};
</script>

<!-- Keep existing styles -->
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

.backdrop-blur-xs {
  backdrop-filter: blur(2px);
  background-color: rgba(0, 0, 0, 0.5);
}
</style>