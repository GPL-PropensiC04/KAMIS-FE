<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-full mx-auto bg-white p-3 rounded-lg shadow-md mb-4">
      <template v-if="canViewFinancialInfo">
        <div class="grid grid-cols-1 gap-2 items-center">
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <div class="flex flex-1 gap-2 items-center">
              <VSearchBar v-model="searchId" placeholder="Cari ID..." class="flex-1" />
              <VDropDownInput
                :options="nominalOptions.map((opt) => opt.label)"
                v-model="selectedNominalLabel"
                @update:modelValue="updateNominalFilter"
                class="flex-1"
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
              <VSearchBar v-model="searchId" placeholder="Cari ID..." class="flex-1" />
            </div>
            <div class="flex-shrink-0 min-w-[250px]">
              <VDateRangeFilter v-model="dateRange" />
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="max-w-full mx-auto bg-white p-6 rounded-lg shadow-md">
      <div class="flex justify-between items-center mb-4">
        <VOptionInput v-model="selectedType" :options="['All', 'Aset', 'Resource']" class="w-1/4" />
        <VButton v-if="canEditPurchase" label="+ Tambah Pembelian" @click="goToAddPurchase" />
      </div>

      <div v-if="purchaseStore.isLoading" class="flex justify-center items-center py-14">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
      
      <div v-else>
        <!-- 📋 Table -->
        <table class="custom-table">
          <thead class="text-white bg-[#1E3A5F] rounded-t-lg">
            <tr>
              <th class="px-6 py-4 table-header cursor-pointer text-base" @click="handleSort('id')">
                <div class="flex items-center justify-center gap-1">
                  ID Pembelian
                  <span class="sort-indicator">
                    <span v-if="currentSort.field === 'id' && currentSort.direction === 'asc'">▲</span>
                    <span v-else-if="currentSort.field === 'id' && currentSort.direction === 'desc'">▼</span>
                  </span>
                </div>
              </th>
              <th class="px-6 py-4 table-header cursor-pointer text-base" @click="handleSort('date')">
                <div class="flex items-center justify-center gap-1">
                  Tanggal Pengajuan
                  <span class="sort-indicator">
                    <span v-if="currentSort.field === 'date' && currentSort.direction === 'asc'">▲</span>
                    <span v-else-if="currentSort.field === 'date' && currentSort.direction === 'desc'">▼</span>
                  </span>
                </div>
              </th>
              <th class="px-6 py-4 table-header cursor-pointer text-base" @click="handleSort('status')">
                <div class="flex items-center justify-center gap-1">
                  Status
                  <span class="sort-indicator">
                    <span v-if="currentSort.field === 'status' && currentSort.direction === 'asc'">▲</span>
                    <span v-else-if="currentSort.field === 'status' && currentSort.direction === 'desc'">▼</span>
                  </span>
                </div>
              </th>
              <th class="px-6 py-4 table-header cursor-pointer text-base" @click="handleSort('supplier')">
                <div class="flex items-center justify-center gap-1">
                  Supplier
                  <span class="sort-indicator">
                    <span v-if="currentSort.field === 'supplier' && currentSort.direction === 'asc'">▲</span>
                    <span v-else-if="currentSort.field === 'supplier' && currentSort.direction === 'desc'">▼</span>
                  </span>
                </div>
              </th>
              <th class="px-6 py-4 table-header text-base">Tipe Barang</th>
              <th v-if="canViewFinancialInfo" class="px-6 py-4 table-header text-base">Total Harga</th>
              <th class="px-6 py-4 table-header cursor-pointer text-base" @click="handleSort('lastUpdate')">
                <div class="flex items-center justify-center gap-1">
                  Last Updated
                  <span class="sort-indicator">
                    <span v-if="currentSort.field === 'lastUpdate' && currentSort.direction === 'asc'">▲</span>
                    <span v-else-if="currentSort.field === 'lastUpdate' && currentSort.direction === 'desc'">▼</span>
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-if="sortedPurchases.length">
              <tr 
                v-for="purchase in sortedPurchases" 
                :key="purchase.id" 
                class="bg-white border-b border-gray-200 hover:bg-gray-50 cursor-pointer text-base"
                @click="goToPurchaseDetail(purchase.purchaseId)"
              >
                <td class="px-6 py-5">{{ purchase.purchaseId }}</td>
                <td class="px-6 py-5">{{ formatDate(purchase.purchaseSubmissionDate) }}</td>
                <td class="px-6 py-5">
                  <template v-if="(userRole === 'Finance' || userRole === 'Direksi') && purchase.purchaseStatus === 'Diajukan'">
                    Menunggu Persetujuan
                  </template>
                  <template v-else-if="(userRole === 'Finance') && (purchase.purchaseStatus === 'Diproses'
                    || purchase.purchaseStatus === 'Selesai') && purchase.purchasePaymentDate === null">
                    Menunggu Pembayaran
                  </template>
                  <template v-else>
                    {{ purchase.purchaseStatus }}
                  </template>
                </td>
                <td class="px-6 py-5">{{ purchase.purchaseSupplier }}</td>
                <td class="px-6 py-5">{{ purchase.purchaseType }}</td>
                <td v-if="canViewFinancialInfo" class="px-6 py-5 font-bold">
                  {{ formatCurrency(purchase.purchasePrice) }}
                </td>
                <td class="px-6 py-5 text-sm">
                  {{ formatDate(purchase.purchaseUpdateDate) }}
                </td>
              </tr>
            </template>

            <!-- Jika Tidak Ada Data -->
            <tr v-else>
              <td :colspan="canViewFinancialInfo ? 7 : 6" class="text-center text-gray-500 py-6 text-base italic">
                {{ searchId ? `Tidak ada pembelian dengan pencarian "${searchId}"` : 'Data pembelian tidak ditemukan.' }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Navigation (Same as ListResource) -->
        <div v-if="purchaseStore.totalPages > 1 || purchaseStore.purchases.length > 0" class="mt-6 text-center">
          <div class="flex items-center justify-between mb-4">
            <!-- Page Navigation -->
            <div class="flex items-center justify-center space-x-2">
              <button
                @click="changePage(purchaseStore.currentPage)"
                :disabled="purchaseStore.currentPage === 0"
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
                    pageNumber === purchaseStore.currentPage + 1 ? 
                      'bg-[#1E3A5F] text-white border border-[#1E3A5F]' : 
                      'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  {{ pageNumber }}
                </button>
                <span v-else class="px-2 py-2 text-sm font-medium text-gray-600">{{ pageNumber }}</span>
              </template>
              
              <button
                @click="changePage(purchaseStore.currentPage + 2)"
                :disabled="purchaseStore.currentPage >= purchaseStore.totalPages - 1"
                class="bg-[#1E3A5F] text-white px-4 py-2 rounded-md font-medium text-center transition hover:bg-[#2A4A6B] disabled:bg-gray-300 cursor-pointer disabled:cursor-not-allowed"
              >
                ►
              </button>
            </div>
              
            <p v-if="purchaseStore.purchases.length > 0" class="text-sm text-gray-700 text-center sm:text-left">
              Menampilkan <span class="font-medium">{{ (purchaseStore.currentPage * purchaseStore.pageSize) + 1 }}</span>
              dari <span class="font-medium">{{ (purchaseStore.currentPage * purchaseStore.pageSize) + purchaseStore.purchases.length }} pembelian</span>
            </p>
            <p v-else class="text-sm text-gray-700">Tidak ada data untuk ditampilkan</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { usePurchaseStore } from "@/stores/purchase";
import { useAuthStore } from "@/stores/auth";
import VSearchBar from "@/components/VSearchBar.vue";
import VDateRangeFilter from "@/components/VDateRangeFilter.vue";
import VDropDownInput from "@/components/VDropDownInput.vue";
import VOptionInput from "@/components/VOptionInput.vue";
import VButton from "@/components/VButton.vue";
import Breadcrumb from '@/components/Breadcrumb.vue';

// Router & Store
const router = useRouter();
const purchaseStore = usePurchaseStore();
const authStore = useAuthStore();

// **State untuk filter & sorting**
const searchId = ref("");
const dateRange = ref({ start: "", end: "" });
const selectedType = ref("All");
const selectedPageSize = ref(purchaseStore.pageSize || 10);

// **State untuk sorting**
const currentSort = ref({
  field: '',
  direction: ''
});

const userRole = computed(() => authStore.userRole);

// **State untuk Filter Rentang Nominal**
const startNominal = ref<number | null>(null);
const endNominal = ref<number | null>(null);
const selectedNominalLabel = ref("Seluruh Total Harga");

// Debounce search
let searchTimeout: ReturnType<typeof setTimeout>;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchPurchases(1); // Reset to first page when searching
  }, 500);
};

// Watch for search changes
watch(searchId, () => {
  debouncedSearch();
});

// Watch for other filter changes
watch([dateRange, selectedType, startNominal, endNominal], () => {
  fetchPurchases(1); // Reset to first page when filters change
});

// Role-based permission computed properties
const canViewFinancialInfo = computed(() => {
  const userRole = authStore.userRole;
  return userRole === "Direksi" || userRole === "Finance" || userRole === "Admin";
});

const canEditPurchase = computed(() => {
  const userRole = authStore.userRole;
  return userRole === "Operasional";
});

// **Computed untuk data yang sudah disort (client-side sorting for current page)**
const sortedPurchases = computed(() => {
  if (!currentSort.value.field || !currentSort.value.direction) {
    return purchaseStore.purchases;
  }

  const purchases = [...purchaseStore.purchases];
  
  purchases.sort((a, b) => {
    let valueA, valueB;
    
    switch (currentSort.value.field) {
      case 'id':
        valueA = a.purchaseId.toLowerCase();
        valueB = b.purchaseId.toLowerCase();
        break;
      case 'date':
        valueA = new Date(a.purchaseSubmissionDate);
        valueB = new Date(b.purchaseSubmissionDate);
        break;
      case 'status':
        valueA = getDisplayStatus(a).toLowerCase();
        valueB = getDisplayStatus(b).toLowerCase();
        break;
      case 'supplier':
        valueA = a.purchaseSupplier.toLowerCase();
        valueB = b.purchaseSupplier.toLowerCase();
        break;
      case 'lastUpdate':
        valueA = new Date(a.purchaseUpdateDate);
        valueB = new Date(b.purchaseUpdateDate);
        break;
      default:
        return 0;
    }
    
    if (valueA < valueB) {
      return currentSort.value.direction === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return currentSort.value.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  return purchases;
});

// Get current filters for API calls
const getCurrentFilters = () => {
  return {
    idSearch: searchId.value || null,
    startDate: dateRange.value.start || null,
    endDate: dateRange.value.end || null,
    startNominal: startNominal.value,
    endNominal: endNominal.value,
    type: selectedType.value,
  };
};

// **Fetch purchases with pagination**
const fetchPurchases = async (page: number = 1) => {
  try {
    await purchaseStore.viewAllPurchasesPaginated(
      page - 1, 
      selectedPageSize.value,
      getCurrentFilters()
    );
  } catch (error) {
    console.error('Error fetching purchases:', error);
  }
};

// **Handle sorting**
const handleSort = (field: string) => {
  if (currentSort.value.field === field) {
    if (currentSort.value.direction === 'asc') {
      currentSort.value.direction = 'desc';
    } else if (currentSort.value.direction === 'desc') {
      currentSort.value.field = '';
      currentSort.value.direction = '';
    } else {
      currentSort.value.direction = 'asc';
    }
  } else {
    currentSort.value.field = field;
    currentSort.value.direction = 'asc';
  }
};

// Pagination functions
const changePage = (page: number) => {
  if (page < 1 || page > purchaseStore.totalPages || page === purchaseStore.currentPage + 1) {
    return;
  }
  fetchPurchases(page);
};

// Pagination navigation computed
const pageNavigation = computed(() => {
  const current = purchaseStore.currentPage + 1; // 1-indexed
  const total = purchaseStore.totalPages;
  
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

// **Helper function untuk mendapatkan status yang ditampilkan**
const getDisplayStatus = (purchase: any) => {
  if ((userRole.value === 'Finance' || userRole.value === 'Direksi') && purchase.purchaseStatus === 'Diajukan') {
    return 'Menunggu Persetujuan';
  } else if ((userRole.value === 'Finance') && (purchase.purchaseStatus === 'Diproses' || purchase.purchaseStatus === 'Selesai') && purchase.purchasePaymentDate === null) {
    return 'Menunggu Pembayaran';
  } else {
    return purchase.purchaseStatus;
  }
};

// **List Rentang Harga**
const nominalOptions = [
  { label: "Seluruh Total Harga", start: null, end: null },
  { label: "Rp0 - Rp1.000.000", start: 0, end: 1000000 },
  { label: "Rp1.000.000 - Rp10.000.000", start: 1000000, end: 10000000 },
  { label: "Rp10.000.000 - Rp100.000.000", start: 10000000, end: 100000000 },
  { label: "> Rp100.000.000", start: 100000000, end: 1000000000 },
];

// **Watch perubahan dropdown nominal & update nilai filter**
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
  fetchPurchases(1);
});

// **Format Rupiah**
const formatCurrency = (value: number) => {
  return `Rp ${value.toLocaleString("id-ID")},00`;
};

// **Format Tanggal**
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, "0")} / ${String(date.getMonth() + 1).padStart(2, "0")} / ${date.getFullYear()}`;
};

// **Navigasi ke halaman tambah pembelian**
const goToAddPurchase = () => {
  router.push("/purchase/add");
};

const goToPurchaseDetail = (purchaseId: string) => {
  if (purchaseId.startsWith("A-")) {
    router.push(`/purchase/detail/asset/${purchaseId}`);
  } else {
    router.push(`/purchase/detail/resource/${purchaseId}`);
  }
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

.sort-indicator {
  min-width: 12px;
  font-size: 12px;
  color: #ffffff;
  display: inline-block;
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