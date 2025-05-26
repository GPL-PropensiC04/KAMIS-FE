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

      <div v-if="loading" class="flex justify-center items-center py-14">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
      
      <!-- 📋 Updated Table Style with Sorting -->
      <table v-else class="custom-table">
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
              Data pembelian tidak ditemukan.
            </td>
          </tr>
        </tbody>
      </table>
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
import Breadcrumb from '@/components/Breadcrumb.vue'

// Router
const router = useRouter();

// Store
const purchaseStore = usePurchaseStore();
const authStore = useAuthStore();

// Loading state
const loading = ref(true);

// **State untuk filter & sorting**
const searchId = ref("");
const dateRange = ref({ start: "", end: "" });
const selectedType = ref("All");
const sortByDate = ref(null);
const sortByNominal = ref(null);

// **State untuk sorting**
const currentSort = ref({
  field: '',
  direction: ''
});

const userRole = computed(() => authStore.userRole)

// **State untuk Filter Rentang Nominal**
const startNominal = ref<number | null>(null);
const endNominal = ref<number | null>(null);
const selectedNominalLabel = ref("Seluruh Total Harga");

// Role-based permission computed properties
const canViewFinancialInfo = computed(() => {
  const userRole = authStore.userRole;
  return userRole === "Direksi" || userRole === "Finance" || userRole === "Admin";
});

const canEditPurchase = computed(() => {
  const userRole = authStore.userRole;
  return userRole === "Operasional" || userRole === "Admin";
});

// **Computed untuk data yang sudah disort**
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
        // Get display status for comparison
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

// **Handle sorting**
const handleSort = (field: string) => {
  if (currentSort.value.field === field) {
    // Toggle direction
    if (currentSort.value.direction === 'asc') {
      currentSort.value.direction = 'desc';
    } else if (currentSort.value.direction === 'desc') {
      // Reset sorting
      currentSort.value.field = '';
      currentSort.value.direction = '';
    } else {
      currentSort.value.direction = 'asc';
    }
  } else {
    // New field, start with ascending
    currentSort.value.field = field;
    currentSort.value.direction = 'asc';
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

// **Ambil daftar pembelian dari API**
const fetchPurchases = async () => {
  loading.value = true;
  try {
    await purchaseStore.viewAllPurchase({
      idSearch: searchId.value || null,
      startDate: dateRange.value.start || null,
      endDate: dateRange.value.end || null,
      startNominal: startNominal.value,
      endNominal: endNominal.value,
      highNominal: sortByNominal.value || null,
      newDate: !sortByDate.value || null,
      type: selectedType.value,
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
  } finally {
    loading.value = false;
  }
};

// **Watch perubahan dropdown nominal & update nilai filter**
const updateNominalFilter = (selectedLabel: string) => {
  selectedNominalLabel.value = selectedLabel;
  const selectedOption = nominalOptions.find((opt) => opt.label === selectedLabel);
  if (selectedOption) {
    startNominal.value = selectedOption.start;
    endNominal.value = selectedOption.end;
  }
};

// Watch perubahan filter & langsung fetch data
watch([searchId, dateRange, selectedType, sortByDate, sortByNominal, startNominal, endNominal], fetchPurchases);

// Initial data fetch
onMounted(fetchPurchases);

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