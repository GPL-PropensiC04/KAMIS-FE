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
      <div class="flex items-center justify-between mb-2">
        <button @click="router.back()" class="hover:underline flex items-center mb-2 text-[28px]">
          <span>←</span>
        </button>

        <div v-if="purchase.purchaseStatus !== 'Ditolak' && purchase.purchaseStatus !== 'Dibatalkan'" class="flex justify-end gap-2 mb-2">
          <template v-if="purchase.purchaseStatus === 'Diajukan'">
            <template v-if="userRole === 'Operasional'">
              <VButton label="Ubah Detail" @click="handleEditDetail" />
            </template>
            <template v-else>
              <VCancelButton label="Tolak" @click="openModal(false)" />
              <VSuccessButton label="Setuju" @click="openModal(true)" />
            </template>
          </template>

          <template v-else-if="purchase.purchaseStatus === 'Disetujui'">
            <template v-if="userRole === 'Operasional'">
              <VButton label="Update Status" @click="openModal(true)" />
            </template>
            <template v-else-if="userRole === 'Admin'">
              <VCancelButton label="Batalkan" @click="openModal(false)" />
              <VButton label="Update Status" @click="openModal(true)" />
            </template>
          </template>

          <template v-else-if="purchase.purchaseStatus === 'Diproses'">
            <template v-if="userRole === 'Operasional'">
              <VCancelButton label="Batalkan" @click="openModal(false)" />
              <VButton label="Update Status" @click="openModal(true)" />
            </template>
            <template v-else-if="userRole === 'Finance'">
              <VSuccessButton v-if="!purchase.purchasePaymentDate" label="Pembayaran" @click="openPaymentModal()" />
            </template>
          </template>

          <template v-else-if="purchase.purchaseStatus === 'Selesai'">
            <template v-if="userRole === 'Finance'">
              <VSuccessButton v-if="!purchase.purchasePaymentDate" label="Pembayaran" @click="openPaymentModal()" />
            </template>
          </template>
        </div>
      </div>

      <!-- Supplier & Purchase Type Info -->
      <div class="grid grid-cols-3 gap-4 mb-4 border-b pb-5">
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
          <p class="text-[#1E3A5F] text-lg font-lato font-bold">{{ purchase.purchaseType }}</p>
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

      <!-- Asset Details -->
      <div v-if="purchase.purchaseAsset" class="grid grid-cols-2 gap-4 mb-4">
        <div class="grid grid-cols-[auto,0fr] gap-x-2 gap-y-2 items-center">
          <p class="font-lato font-bold">Nama Aset:</p>
          <p class="pl-5 text-[#1E3A5F] font-lato font-bold">{{ purchase.purchaseAsset.assetNameString }}</p>
          <p class="font-lato font-bold">Deskripsi</p>
          <p class="pl-5 text-[#1E3A5F] font-lato font-bold">{{ purchase.purchaseAsset.assetDescription }}</p>
          <p v-if="canViewFinancialInfo" class="font-lato font-bold">Total Harga</p>
          <p v-if="canViewFinancialInfo" class="pl-5 text-[#1E3A5F] font-lato font-bold">{{ formatCurrency(purchase.purchaseAsset.assetPrice) }}</p>
        </div>

        <div class="flex justify-center items-start">
          <img :src="imageUrl || '/placeholder-asset.jpg'" :alt="purchase.purchaseAsset.assetNameString"
            class="rounded-md shadow-md w-[250px] h-auto object-cover" />
        </div>
      </div>

      <!-- Note Section -->
      <div class="mb-6">
        <VLockedInput label="Catatan" placeholder="Tidak ada catatan" :value="purchase.purchaseNote" />
      </div>
    </div>

    <!-- Modal -->
    <!-- Modal Update Status -->
    <div v-if="showUpdateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow-md w-full max-w-lg">
        <h3 class="text-xl font-semibold mb-4">Konfirmasi Update Status</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium">Catatan <span class="text-red-500">*</span></label>
          <textarea v-model="noteUpdate" rows="3" class="w-full border border-gray-300 p-2 rounded"></textarea>
        </div>

        <!-- Muncul hanya jika Next & status sekarang Diproses -->
        <div v-if="isNextStatus && purchase?.purchaseStatus === 'Diproses'" class="mb-4">
          <label class="block text-sm font-medium">Plat Nomor <span class="text-red-500">*</span></label>
          <input v-model="platNomor" type="text" class="w-full border border-gray-300 p-2 rounded" />
        </div>

        <p v-if="errorUpdate" class="text-red-500 text-sm">{{ errorUpdate }}</p>
        <div class="flex justify-end gap-2 mt-4">
          <button @click="showUpdateModal = false" class="bg-gray-300 px-4 py-2 rounded">Batal</button>
          <button @click="submitUpdateStatus" class="bg-blue-600 text-white px-4 py-2 rounded">Kirim</button>
        </div>
      </div>
    </div>

    <!-- Modal Pembayaran -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow-md w-full max-w-lg">
        <h3 class="text-xl font-semibold mb-4">Konfirmasi Pembayaran</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium">Catatan <span class="text-red-500">*</span></label>
          <textarea v-model="notePayment" rows="3" class="w-full border border-gray-300 p-2 rounded"></textarea>
        </div>
        <p v-if="errorPayment" class="text-red-500 text-sm">{{ errorPayment }}</p>
        <div class="flex justify-end gap-2 mt-4">
          <button @click="showPaymentModal = false" class="bg-gray-300 px-4 py-2 rounded">Batal</button>
          <button @click="submitPayment" class="bg-blue-600 text-white px-4 py-2 rounded">Kirim</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePurchaseStore } from '@/stores/purchase';
import { useAuthStore } from '@/stores/auth';
import VButton from '@/components/VButton.vue';
import VSuccessButton from '@/components/VSuccessButton.vue';
import VCancelButton from '@/components/VCancelButton.vue';
import VLockedInput from '@/components/VLockedInput.vue';
import type { AssetTempInterface } from '@/interfaces/assettemp.interface';
import type { PurchaseInterface } from '@/interfaces/purchase.interface';
import type { UpdatePurchaseStatusRequestInterface } from '@/interfaces/purchase.interface';
import axios from 'axios';

// Extended interface for the detail view
interface DetailAssetPurchaseInterface extends Omit<PurchaseInterface, 'purchaseAsset'> {
  purchaseAsset?: AssetTempInterface;
}

const route = useRoute();
const router = useRouter();
const purchaseStore = usePurchaseStore();
const authStore = useAuthStore();

const purchaseId = ref(route.params.id as string);
const loading = computed(() => purchaseStore.loading);
const error = computed(() => purchaseStore.error);
const purchase = computed(() => purchaseStore.currentPurchase as DetailAssetPurchaseInterface);

const showUpdateModal = ref(false)
const showPaymentModal = ref(false)

const isNextStatus = ref(true)
const noteUpdate = ref('')
const notePayment = ref('')
const platNomor = ref('')
const errorUpdate = ref('')
const errorPayment = ref('')

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

// Buka Modal Update Status
const openModal = (next: boolean) => {
  isNextStatus.value = next
  noteUpdate.value = ''
  errorUpdate.value = ''
  showUpdateModal.value = true
}

// Buka Modal Pembayaran
const openPaymentModal = () => {
  notePayment.value = ''
  platNomor.value = ''
  errorPayment.value = ''
  showPaymentModal.value = true
}

const submitUpdateStatus = async () => {
  if (!noteUpdate.value.trim()) {
    errorUpdate.value = 'Catatan wajib diisi ❗'
    return
  }

  // Plat Nomor wajib hanya kalau Next & status saat ini 'Diproses'
  if (isNextStatus.value && purchase.value?.purchaseStatus === 'Diproses') {
    if (!platNomor.value.trim()) {
      errorUpdate.value = 'Plat Nomor wajib diisi ❗'
      return
    }
  }

  const body: UpdatePurchaseStatusRequestInterface = {
    purchaseNote: noteUpdate.value,
    platNomor: isNextStatus.value && purchase.value?.purchaseStatus === 'Diproses' ? platNomor.value : undefined
  }

  await purchaseStore.updatePurchaseStatus(purchaseId.value, isNextStatus.value, body)
  showUpdateModal.value = false
  await loadPurchaseData()
}


// Submit Pembayaran
const submitPayment = async () => {
  if (!notePayment.value.trim()) {
    errorPayment.value = 'Catatan wajib diisi ❗'
    return
  }

  const body: UpdatePurchaseStatusRequestInterface = {
    purchaseNote: notePayment.value,
  }

  await purchaseStore.updatePurchaseStatusPembayaran(purchaseId.value, body)
  showPaymentModal.value = false
  await loadPurchaseData()
}

// Handle edit detail action
const handleEditDetail = () => {
  router.push(`/purchase/update-asset/${purchaseId.value}`);
};

// Add ref for image URL
const imageUrl = ref('');

// Add function to fetch image using axios
const fetchAssetImage = async () => {
  try {
    if (!purchase.value?.purchaseAsset?.id) return;
    
    const assetId = purchase.value.purchaseAsset.id;
    const response = await axios.get(`http://localhost:8084/api/purchase/asset/${assetId}/foto`, {
      responseType: 'blob' // Important: we need the response as a Blob
    });
    
    // Create a URL for the blob
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] 
    });
    
    // Free memory from any previous blob URLs
    if (imageUrl.value) {
      URL.revokeObjectURL(imageUrl.value);
    }
    
    // Create and store new blob URL
    imageUrl.value = URL.createObjectURL(blob);
    console.log('Image loaded successfully');
  } catch (error) {
    console.error('Error fetching asset image:', error);
    imageUrl.value = '/placeholder-asset.jpg'; // Fallback image
  }
};

// Update onMounted to also fetch the image
onMounted(() => {
  loadPurchaseData().then(() => {
    fetchAssetImage();
  });
});

// Add cleanup when component is unmounted
onUnmounted(() => {
  // Free memory
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
});
</script>

<style scoped>
/* Using Lato font */
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');

.font-lato {
  font-family: 'Lato', sans-serif;
}
</style> 