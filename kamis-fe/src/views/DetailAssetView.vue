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

    <div v-if="isLoading" class="bg-[#E5EAF2] rounded-lg shadow-md p-8 text-center">
      <p>Memuat data...</p>
    </div>

    <div v-else-if="error" class="bg-[#E5EAF2] rounded-lg shadow-md p-8 text-center">
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
      <div class="mb-6 flex justify-center">
        <img 
          :src="assetImage || '/placeholder-image.jpg'" 
          alt="Gambar Aset" 
          class="rounded-md shadow-md w-[250px] h-auto object-cover"
          @error="handleImageError"
        />
      </div>

      <!-- Asset Info Card -->
      <div class="bg-[#E5EAF2] rounded-lg shadow-md overflow-hidden mb-6">
        <div class="bg-[#1E3A5F] p-4 flex justify-between items-center">
          <h2 class="text-xl font-bold text-white">Informasi Aset</h2>
          <div v-if="canEditAsset" class="flex space-x-2">
            <VSuccessButton 
              label="Ubah" 
              @click="handleEditAset" 
            />
            <VCancelButton 
              label="Hapus" 
              @click="showDeleteModal = true" 
            />
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
          
          <!-- Description section moved to the grid area with no border -->
          <div class="col-span-2 mt-2">
            <p class="text-gray-600 text-sm mb-2">Deskripsi</p>
            <p>{{ aset.deskripsi }}</p>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300 w-full max-w-md">
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
      <div class="bg-[#E5EAF2] rounded-lg shadow-md overflow-hidden">
        <div class="bg-[#1E3A5F] p-4 flex justify-between items-center">
          <h2 class="text-xl font-bold text-white">Riwayat Maintenance</h2>
          <VSuccessButton 
            v-if="canEditAsset" 
            label="Ajukan" 
            @click="handleAddMaintenance" 
          />
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-xl text-gray-600 uppercase tracking-wider">Tanggal Pengajuan</th>
                <th class="px-6 py-3 text-left text-sm font-xl text-gray-600 uppercase tracking-wider">Tanggal Selesai</th>
                <th class="px-6 py-3 text-left text-sm font-xl text-gray-600 uppercase tracking-wider">Catatan</th>
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
import VSuccessButton from '@/components/VSuccessButton.vue';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const platNomor = route.params.platNomor as string;

// State variables
const aset = ref<AsetInterface>({} as AsetInterface);
const maintenanceHistory = ref<Maintenance[]>([]);
const isLoading = ref(true);
const error = ref('');
const assetImage = ref('');

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

// Fetch asset image from backend
const fetchAssetImage = async (id: string) => {
  try {
    // Check if the id is valid before making the request
    if (!id || id === 'undefined' || id === 'null') {
      console.warn('Invalid asset ID for image fetch:', id);
      assetImage.value = '/placeholder-image.jpg'; // Use placeholder
      return;
    }

    const response = await axios.get(`http://localhost:8081/api/asset/${id}/foto`, {
      responseType: 'blob',
      // Add timeout and validate status to handle errors better
      timeout: 5000,
      validateStatus: (status) => status >= 200 && status < 300,
    });
    
    // Check if we received valid image data
    if (response.data && response.data.size > 0) {
      assetImage.value = URL.createObjectURL(response.data);
    } else {
      console.warn('Empty image data received');
      assetImage.value = '/placeholder-image.jpg'; // Use placeholder
    }
  } catch (error) {
    console.error("Error fetching asset image:", error);
    // Set default image when fetching fails
    assetImage.value = '/placeholder-image.jpg'; // Path to your placeholder image
  }
};

// Handle image loading errors
const handleImageError = () => {
  console.log('Image failed to load, using placeholder');
  assetImage.value = '/placeholder-image.jpg'; // Path to your placeholder image
};

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

// Load data from API
const loadData = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    // Load asset details
    const response = await AsetService.getAsetByPlatNomor(platNomor);
    aset.value = response;
    
    // Make sure we have a valid asset before fetching the image
    if (aset.value && aset.value.platNomor) {
      // Use the platNomor as the ID for image fetching
      await fetchAssetImage(aset.value.platNomor);
    } else {
      console.warn('No valid asset data received');
      assetImage.value = '/placeholder-image.jpg';
    }

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
    assetImage.value = '/placeholder-image.jpg';
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
