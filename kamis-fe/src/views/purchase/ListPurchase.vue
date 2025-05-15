<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-7xl mx-auto bg-white p-3 rounded-lg shadow-md mb-4">
      <template v-if="canViewFinancialInfo">
        <div class="grid grid-cols-1 gap-2 items-center">
          <div class="flex flex-wrap gap-2 items-center">
            <VSearchBar v-model="searchId" placeholder="Cari ID..." class="flex-1" />
            <VDateRangeFilter v-model="dateRange" class="flex-1" />
            <VSortButton v-model:sortOrder="sortByDate" />
            <VDropDownInput
              :options="nominalOptions.map((opt) => opt.label)"
              v-model="selectedNominalLabel"
              @update:modelValue="updateNominalFilter"
              class="flex-1"
            />
            <VSortButton v-model:sortOrder="sortByNominal" />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="grid grid-cols-1 gap-2 items-center">
          <div class="flex flex-wrap gap-2 items-center">
            <VSearchBar v-model="searchId" placeholder="Cari ID..." class="flex-1" />
            <VDateRangeFilter v-model="dateRange" class="flex-1" />
            <VSortButton v-model:sortOrder="sortByDate" />
          </div>
        </div>
      </template>
    </div>

    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div class="flex justify-between items-center mb-4">
        <VOptionInput v-model="selectedType" :options="['All', 'Aset', 'Resource']" class="w-1/4" />
        <VButton v-if="canEditPurchase" label="Tambah Pembelian" @click="goToAddPurchase" />
      </div>

      <div v-if="loading" class="flex justify-center items-center py-14">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
      
      <!-- 📋 Updated Table Style -->
      <table v-else class="custom-table">
        <thead class="text-white bg-[#1E3A5F] rounded-t-lg">
          <tr>
            <th class="px-6 py-4 table-header cursor-pointer text-base">ID Pembelian</th>
            <th class="px-6 py-4 table-header cursor-pointer text-base">Tanggal Pengajuan</th>
            <th class="px-6 py-4 table-header text-base">Status</th>
            <th class="px-6 py-4 table-header text-base">Supplier</th>
            <th class="px-6 py-4 table-header text-base">Tipe Barang</th>
            <th v-if="canViewFinancialInfo" class="px-6 py-4 table-header text-base">Total Harga</th>
            <th class="px-6 py-4 table-header text-base">Last Updated</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="purchaseStore.purchases.length">
            <tr 
              v-for="purchase in purchaseStore.purchases" 
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
import VSortButton from "@/components/VSortButton.vue";
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

// **List Rentang Harga**
const nominalOptions = [
  { label: "Seluruh Total Harga", start: null, end: null },
  { label: "0 - 1 Juta", start: 0, end: 1000000 },
  { label: "1 Juta - 10 Juta", start: 1000000, end: 10000000 },
  { label: "10 Juta - 100 Juta", start: 10000000, end: 100000000 },
  { label: "100 Juta - 1 Miliar", start: 100000000, end: 1000000000 },
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