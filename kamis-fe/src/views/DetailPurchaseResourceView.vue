<template>
  <div class="min-h-screen flex justify-center items-center bg-[#E5EAF2]">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <p class="text-lg">Memuat data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-md mb-6">
      <p class="text-red-700">{{ error }}</p>
      <button @click="loadPurchaseData" class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
        Coba Lagi
      </button>
    </div>

    <!-- Purchase Details -->
    <div v-else-if="purchase" class="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
      <!-- Header with Back Button -->
      <div class="flex items-center justify-between mb-2">
        <button 
          @click="router.back()" 
          class="hover:underline flex items-center mb-2 text-[28px]">
          <span >←</span>
        </button>
        <div v-if="purchase.purchaseStatus !== 'Selesai' && purchase.purchaseStatus !== 'Ditolak'" class="flex justify-end gap-2 mb-2">
          <!-- When status is "Diajukan" -->
          <template v-if="purchase.purchaseStatus === 'Diajukan'">
            <!-- For Operasional role -->
            <VButton v-if="userRole === 'Operasional'" label="Ubah Detail" @click="handleEditDetail" />
            
            <!-- For Finance or Direksi roles -->
            <template v-else>
              <VCancelButton label="Tolak" @click="updateStatus(false)" />
              <VSuccessButton label="Setuju" @click="updateStatus(true)" />
            </template>
          </template>
          
          <!-- When status is "Disetujui" -->
          <template v-else-if="purchase.purchaseStatus === 'Disetujui'">
            <!-- For Operasional role -->
            <VButton v-if="userRole === 'Operasional'" label="Update Status" @click="updateStatus(true)" />
            
            <!-- For Finance or Direksi roles -->
            <template v-else>
              <VButton label="Update Status" @click="updateStatus(true)" />
              <VSuccessButton label="Pembayaran" @click="handlePayment" />
            </template>
          </template>
        </div>
      </div>

      <!-- Supplier & Purchase Type Info -->
      <div class="grid grid-cols-3 gap-4 mb-4 border-b pb-4">   
          <div>
            <p class="text-lg font-bold font-lato">ID Transaksi</p>
            <p class="text-[#1E3A5F] text-lg font-lato font-bold">{{ purchase.purchaseId }}</p>
          </div>
          <div>
            <p class="text-lg font-bold font-lato">Supplier</p>
            <p class="text-[#1E3A5F] text-lg font-lato font-bold">{{ purchase.purchaseSupplier }}</p>
          </div>
          <div>
            <p class="text-lg font-bold font-lato">Tipe Barang</p>
            <p class="text-[#1E3A5F] text-lg font-lato font-bold">Resource</p>
          </div>
        <div>
          <p class="text-lg font-bold font-lato">Tanggal Pengajuan</p>
          <p class="text-[#1E3A5F] text-lg font-lato font-bold">{{ formatDate(purchase.purchaseSubmissionDate) }}</p>
        </div>

        <div>
          <p class="text-lg font-bold font-lato">Tanggal Terakhir Diperbarui</p>
          <p class="text-[#1E3A5F] text-lg font-lato font-bold">{{ formatDate(purchase.purchaseUpdateDate) }}</p>
        </div>
        <div v-if="purchase.purchasePaymentDate">
          <p class="text-lg font-bold font-lato">Tanggal Pembayaran</p>
          <p class="text-[#1E3A5F] text-lg font-lato font-bold">{{ formatDate(purchase.purchasePaymentDate) }}</p>
        </div>
        <div>
          <p class="text-lg font-bold font-lato">Status Pembelian</p>
          <p class="text-[#1E3A5F] text-lg font-lato font-bold">{{ purchase.purchaseStatus }}</p>
        </div>
      </div>
      <!-- Top Section -->


      <!-- Resource Table -->
      <div v-if="purchase.purchaseResource && purchase.purchaseResource.length > 0">
        <table class="w-full border-collapse border border-[#1E3A5F] mb-4">
          <thead>
            <tr class="bg-[#1E3A5F] text-white">
              <th class="p-2 border border-[#1E3A5F] text-left">Nama Barang</th>
              <th class="p-2 border border-[#1E3A5F] text-center">Jumlah</th>
              <th v-if="canViewFinancialInfo" class="p-2 border border-[#1E3A5F] text-right">Harga Satuan</th>
              <th v-if="canViewFinancialInfo" class="p-2 border border-[#1E3A5F] text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="resource in purchase.purchaseResource" :key="resource.resourceId">
              <td class="p-2 border border-[#1E3A5F]">{{ resource.resourceName }}</td>
              <td class="p-2 border border-[#1E3A5F] text-center">{{ resource.resourceTotal }}</td>
              <td v-if="canViewFinancialInfo" class="p-2 border border-[#1E3A5F] text-right">{{ formatCurrency(resource.resourcePrice) }}</td>
              <td v-if="canViewFinancialInfo" class="p-2 border border-[#1E3A5F] text-right">{{ formatCurrency(resource.resourcePrice * resource.resourceTotal) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="userRole !== 'Operasional'">
          <div class="flex justify-end">
            <p class="text-lg font-bold font-lato pr-10">Total Harga:</p>
            <p class="text-black text-lg font-lato font-bold">{{ formatCurrency(purchase.purchasePrice) }}</p>
          </div>
        </div>
        
      </div>

      <!-- Note Section -->
      <div class="mb-6">
        <VLockedInput label="Catatan" 
        placeholder="Tidak ada catatan"
        :value="purchase.purchaseNote" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePurchaseStore } from '@/stores/purchase';
import { useAuthStore } from '@/stores/auth';
import VButton from '@/components/VButton.vue';
import VSuccessButton from '@/components/VSuccessButton.vue';
import VCancelButton from '@/components/VCancelButton.vue';
import VLockedInput from '@/components/VLockedInput.vue';
import type { ResourceTempInterface } from '@/interfaces/resourcetemp.interface';
import type { PurchaseInterface } from '@/interfaces/purchase.interface';

// Extended interface for the detail view
interface DetailResourcePurchaseInterface extends Omit<PurchaseInterface, 'purchaseResource'> {
  purchaseResource?: ResourceTempInterface[];
}

const route = useRoute();
const router = useRouter();
const purchaseStore = usePurchaseStore();
const authStore = useAuthStore();

const purchaseId = ref(route.params.id as string);
const loading = computed(() => purchaseStore.loading);
const error = computed(() => purchaseStore.error);
const purchase = computed(() => purchaseStore.currentPurchase as DetailResourcePurchaseInterface);

// User role for conditional rendering
const userRole = computed(() => authStore.userRole);

// Format date 
const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric'
  });
};

// Format currency
const formatCurrency = (value: number): string => {
  if (value === undefined || value === null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

// Access control - only operational staff cannot see financial details
const canViewFinancialInfo = computed(() => {
  return userRole.value !== 'Operasional';
});

// Load purchase data
const loadPurchaseData = async () => {
  if (!purchaseId.value) return;
  await purchaseStore.getPurchaseById(purchaseId.value);
};

// Update purchase status
const updateStatus = async (isNextStatus: boolean = true) => {
  if (!purchaseId.value) return;
  
  const statusNote = isNextStatus 
    ? "Status pembelian diperbarui ke tahap selanjutnya" 
    : "Pembelian ditolak";
  
  await purchaseStore.updatePurchaseStatus(purchaseId.value, statusNote, isNextStatus);
};

// Handle edit detail action
const handleEditDetail = () => {
  router.push(`/purchase/update-resource/${purchaseId.value}`);
};

// Handle payment action
const handlePayment = async () => {
  if (!purchaseId.value) return;
  await purchaseStore.updatePurchaseStatus(purchaseId.value, "Pembayaran telah dilakukan", true);
};

// Load data on component mount
onMounted(() => {
  loadPurchaseData();
});
</script>

<style scoped>
/* Using Lato font */
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');

.font-lato {
  font-family: 'Lato', sans-serif;
}
</style> 