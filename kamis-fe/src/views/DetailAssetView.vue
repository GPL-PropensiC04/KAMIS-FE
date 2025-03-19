<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <!-- Notification -->
    <div 
      v-if="showNotification" 
      class="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg z-50 animate-slide-in"
    >
      {{ notificationMessage }}
    </div>
    
    <!-- Back Button -->
    <div class="mb-4">
      <router-link to="/assets" class="text-[#1E3A5F] hover:text-[#1a325a] text-2xl flex items-center">
        <span>←</span>
      </router-link>
    </div>

    <div v-if="isLoading" class="bg-white rounded-lg shadow-md p-8 text-center">
      <p>Memuat data...</p>
    </div>

    <div v-else-if="error" class="bg-white rounded-lg shadow-md p-8 text-center">
      <p class="text-red-500">{{ error }}</p>
      <button 
        @click="loadData" 
        class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        Coba Lagi
      </button>
    </div>

    <template v-else>
      <!-- Asset Image -->
      <AssetImage :image-url="asetImageUrl" :alt="aset.nama" class="mb-6 max-w-full h-auto rounded-lg shadow-md mx-auto" />

      <!-- Asset Info Card -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div class="bg-[#1E3A5F] p-4 flex justify-between items-center">
          <h2 class="text-lg font-bold text-white">Informasi Aset</h2>
          <div v-if="canEditAsset" class="flex space-x-2">
            <button 
              @click="handleEditAset" 
              class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded"
            >
              Ubah
            </button>
            <button 
              @click="showDeleteModal = true" 
              class="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
            >
              Hapus
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 p-4">
          <div>
            <p class="text-gray-600 text-sm">Nama Aset</p>
            <p class="font-semibold">{{ aset.nama }}</p>
          </div>
          <div>
            <p class="text-gray-600 text-sm">Jenis Aset</p>
            <p class="font-semibold">{{ aset.jenisAset }}</p>
          </div>
          <div>
            <p class="text-gray-600 text-sm">No Polisi</p>
            <p class="font-semibold">{{ aset.platNomor }}</p>
          </div>
          <div>
            <p class="text-gray-600 text-sm">Tanggal Perolehan</p>
            <p class="font-semibold">{{ formatDate(aset.tanggalPerolehan) }}</p>
          </div>
          <div>
            <p class="text-gray-600 text-sm">Status</p>
            <p class="font-semibold">{{ aset.status }}</p>
          </div>
          <div v-if="canViewFinancialInfo">
            <p class="text-gray-600 text-sm">Nilai Perolehan</p>
            <p class="font-semibold">{{ formatCurrency(aset.nilaiPerolehan) }}</p>
          </div>
        </div>
        
        <div class="p-4 border-t">
          <p class="text-gray-600 text-sm mb-2">Deskripsi</p>
          <p>{{ aset.deskripsi }}</p>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-md">
          <div class="bg-[#1E3A5F] p-4">
            <h3 class="text-lg font-bold text-white">Konfirmasi</h3>
          </div>
          <div class="p-6 text-center">
            <p class="text-gray-700 text-lg mb-6">Apakah anda yakin ingin menghapus?</p>
            <div class="flex justify-center space-x-4">
              <VButton 
                label="Tidak" 
                @click="showDeleteModal = false"
              />
              <VCancelButton 
                label="Ya" 
                @click="confirmDelete"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Maintenance History -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="bg-[#1E3A5F] p-4 flex justify-between items-center">
          <h2 class="text-lg font-bold text-white">Riwayat Maintenance</h2>
          <button 
            v-if="canEditAsset" 
            @click="handleAddMaintenance" 
            class="bg-[#28a745] hover:bg-green-600 text-white px-4 py-1 rounded"
          >
            Ajukan
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pengajuan</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Selesai</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in maintenanceHistory" :key="item.id">
                <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(item.tanggalPengajuan) }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(item.tanggalSelesai) }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ item.catatan }}</td>
              </tr>
              <tr v-if="maintenanceHistory.length === 0">
                <td colspan="3" class="px-6 py-4 text-center text-gray-500">Tidak ada data maintenance</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { AsetInterface } from '@/interfaces/asset.interface';
import type { Maintenance } from '@/interfaces/maintenance';
import { AsetService } from '@/stores/assetservices';
import { MaintenanceService } from '@/stores/maintenanceservice';
import { byteArrayToImageUrl } from '@/utils/formatters';
import AssetImage from '@/components/AssetImage.vue';
import { useAuthStore } from '@/stores/auth';
import VButton from '@/components/VButton.vue';
import VCancelButton from '@/components/VCancelButton.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const platNomor = route.params.platNomor as string;

// Delete modal state
const showDeleteModal = ref(false);

// Notification state
const showNotification = ref(false);
const notificationMessage = ref('');

// Function to show notification
const showSuccessNotification = (message: string) => {
  notificationMessage.value = message;
  showNotification.value = true;
  
  // Auto hide after 3 seconds
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

// Format date function
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Format currency function
const formatCurrency = (value: number): string => {
  if (value === undefined || value === null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

// Check if coming from edit page
watch(() => route.query, (query) => {
  if (query.edited === 'true') {
    showSuccessNotification('Berhasil Mengubah Detail Aset');
    
    // Clean up query parameter
    router.replace({ path: route.path });
  }
}, { immediate: true });

// State
const aset = ref<AsetInterface>({} as AsetInterface);
const maintenanceHistory = ref<Maintenance[]>([]);
const isLoading = ref(true);
const error = ref('');

// Role-based permission computed properties
const canViewFinancialInfo = computed(() => {
  const userRole = authStore.userRole;
  // Only Direksi and Finance can see financial info
  return userRole === 'Direksi' || userRole === 'Finance';
});

const canEditAsset = computed(() => {
  const userRole = authStore.userRole;
  // Only Staf Operasional can edit assets
  return userRole === 'Operasional' || userRole === 'Admin';
});

// Computed value for image url
const asetImageUrl = computed(() => {
  if (aset.value?.gambarAset) {
    return byteArrayToImageUrl(aset.value.gambarAset as unknown as number[]);
  }
  return '';
});

// Load data from API
const loadData = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    // Load asset details
    const response = await AsetService.getAsetByPlatNomor(platNomor);
    aset.value = response;

    // Load maintenance history
    try {
      const maintenanceData = await MaintenanceService.getMaintenanceByAsetId(platNomor);
      maintenanceHistory.value = maintenanceData;
    } catch (errMaintenance) {
      console.error('Error loading maintenance data:', errMaintenance);
      // Fallback to dummy data if error occurs
      maintenanceHistory.value = [
        { id: 1, assetId: platNomor, tanggalPengajuan: '2022-12-12', tanggalSelesai: '2022-12-28', catatan: 'Penggantian Oli Mesin' },
        { id: 2, assetId: platNomor, tanggalPengajuan: '2023-02-15', tanggalSelesai: '2023-02-20', catatan: 'Penggantian Filter Udara' },
        { id: 3, assetId: platNomor, tanggalPengajuan: '2023-05-10', tanggalSelesai: '2023-05-18', catatan: 'Service Rutin 10.000 KM' },
        { id: 4, assetId: platNomor, tanggalPengajuan: '2023-09-22', tanggalSelesai: '2023-09-30', catatan: 'Perbaikan Sistem Rem' }
      ];
    }
  } catch (err) {
    console.error('Error loading data:', err);
    error.value = 'Terjadi kesalahan saat memuat data. Silakan coba lagi.';
    // Set dummy data for development
    if (import.meta.env.MODE === 'development') {
      aset.value = {
        platNomor: platNomor,
        nama: 'Truk Kuning', 
        jenisAset: 'Truk',
        status: 'Tersedia',
        tanggalPerolehan: '2023-10-28',
        nilaiPerolehan: 200000000,
        deskripsi: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce in luctus, dictum sed turpis aliquam, molestie vestibulum turpis. Ut eget scelerisque sapien, et volutpat magna',
        assetMaintenance: 'Rutin',
        isDeleted: false
      };

      maintenanceHistory.value = [
        { id: 1, assetId: platNomor, tanggalPengajuan: '2022-12-12', tanggalSelesai: '2022-12-28', catatan: 'Penggantian Oli Mesin' },
        { id: 2, assetId: platNomor, tanggalPengajuan: '2023-02-15', tanggalSelesai: '2023-02-20', catatan: 'Penggantian Filter Udara' },
        { id: 3, assetId: platNomor, tanggalPengajuan: '2023-05-10', tanggalSelesai: '2023-05-18', catatan: 'Service Rutin 10.000 KM' },
        { id: 4, assetId: platNomor, tanggalPengajuan: '2023-09-22', tanggalSelesai: '2023-09-30', catatan: 'Perbaikan Sistem Rem' }
      ];
    }
  } finally {
    isLoading.value = false;
  }
};

// Event handlers
const handleEditAset = () => {
  router.push(`/asset/edit/${platNomor}`);
};

const confirmDelete = async () => {
  try {
    await AsetService.deleteAset(platNomor);
    showSuccessNotification('Aset berhasil dihapus');
    
    // Tambahkan timeout sebelum navigasi untuk memastikan notifikasi terlihat
    setTimeout(() => {
      // Navigasi ke halaman list asset dengan parameter deleted=true
      router.push({
        path: '/assets',
        query: { deleted: 'true', platNomor: platNomor }
      });
    }, 1500);
  } catch (err) {
    console.error('Error deleting asset:', err);
    error.value = 'Gagal menghapus aset. Silakan coba lagi.';
  } finally {
    showDeleteModal.value = false;
  }
};

// Replaced the handleDeleteAset function with a function to show the modal
const handleDeleteAset = () => {
  showDeleteModal.value = true;
};

const handleAddMaintenance = () => {
  router.push('/coming-soon');   
};

onMounted(() => {
  loadData();
  
  // Check if we've just navigated from edit page
  if (route.query.edited === 'true') {
    showSuccessNotification('Berhasil Mengubah Detail Aset');
    
    // Clean up query parameter
    router.replace({ path: route.path });
  }
});
</script>

<style scoped>
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
