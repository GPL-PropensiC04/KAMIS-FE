<template>
  <Breadcrumb />
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
          class="rounded-md shadow-md w-full max-w-md h-auto object-cover"
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
            @click="showMaintenanceModal = true" 
          />
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-xl text-gray-600 uppercase tracking-wider">Tanggal Pengajuan</th>
                <th class="px-6 py-3 text-left text-sm font-xl text-gray-600 uppercase tracking-wider">Tanggal Selesai</th>
                <th class="px-6 py-3 text-left text-sm font-xl text-gray-600 uppercase tracking-wider">Deskripsi Pekerjaan</th>
                <th v-if="canViewFinancialInfo" class="px-6 py-3 text-left text-sm font-xl text-gray-600 uppercase tracking-wider">Biaya</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in maintenanceHistory" :key="item.id">
                <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(item.tanggalMulaiMaintenance) }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ item.tanggalSelesaiMaintenance ? formatDate(item.tanggalSelesaiMaintenance) : '-' }}</td>
                <td class="px-6 py-4">{{ item.deskripsiPekerjaan }}</td>
                <td v-if="canViewFinancialInfo" class="px-6 py-4 whitespace-nowrap">{{ formatCurrency(item.biaya) }}</td>
              </tr>
              <tr v-if="maintenanceHistory.length === 0">
                <td :colspan="getColspanUpdated()" class="px-6 py-4 text-center text-gray-500">Tidak ada data maintenance</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Maintenance Modal -->
      <div v-if="showMaintenanceModal" class="fixed inset-0 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300 w-full max-w-md">
          <div class="bg-[#1E3A5F] p-4">
            <h3 class="text-lg font-bold text-white">Ajukan Maintenance</h3>
          </div>
          <div class="p-6">
            <form @submit.prevent="submitMaintenance">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Deskripsi Pekerjaan <span class="text-red-500">*</span></label>
                <textarea 
                  v-model="newMaintenance.deskripsiPekerjaan" 
                  rows="3" 
                  class="w-full border border-gray-300 p-2 rounded"
                  required
                ></textarea>
              </div>
              <div v-if="canViewFinancialInfo" class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Biaya <span class="text-red-500">*</span></label>
                <input 
                  type="number" 
                  v-model="newMaintenance.biaya" 
                  class="w-full border border-gray-300 p-2 rounded"
                  required
                />
              </div>
              
              <p v-if="maintenanceError" class="text-red-500 text-sm mb-4">{{ maintenanceError }}</p>
              
              <div class="flex justify-end gap-2 mt-4">
                <VCancelButton label="Batal" @click="showMaintenanceModal = false" />
                <VSuccessButton label="Ajukan" type="submit" />
              </div>
            </form>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { AsetInterface } from '@/interfaces/asset.interface';
import { AsetService } from '@/stores/assetservices';
import { useAuthStore } from '@/stores/auth';
import VButton from '@/components/VButton.vue';
import VCancelButton from '@/components/VCancelButton.vue';
import VSuccessButton from '@/components/VSuccessButton.vue';
import axios from 'axios';
import { API_URLS } from '@/config/api.config';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { useToast } from 'vue-toastification';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const platNomor = route.params.platNomor as string;

// State variables
const aset = ref<AsetInterface>({} as AsetInterface);
const maintenanceHistory = ref<any[]>([]);
const isLoading = ref(true);
const error = ref('');
const assetImage = ref('');

// Modal states
const showDeleteModal = ref(false);
const showMaintenanceModal = ref(false);
const maintenanceError = ref('');

// New maintenance form
const newMaintenance = ref({
  platNomor: '',
  deskripsiPekerjaan: '',
  biaya: 0
});

// Notification state
const showNotification = ref(false);
const notificationMessage = ref('');

// Maintenance loading state
const maintenanceLoading = ref(false);

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

// Helper function for table colspan (updated without status and action columns)
const getColspanUpdated = () => {
  let span = 3; // Default columns (Tanggal Pengajuan, Tanggal Selesai, Deskripsi)
  if (canViewFinancialInfo.value) span++;
  return span;
};

// Fetch maintenance data
const fetchMaintenanceHistory = async () => {
  maintenanceLoading.value = true;
  maintenanceError.value = '';
  
  try {
    // Remove the duplicated 'api' segment in the URL
    const maintenanceUrl = `${API_URLS.ASSET}/maintenance/${platNomor}`;
    console.log(`Fetching maintenance for ${platNomor} from ${maintenanceUrl}`);
    
    const response = await axios.get(maintenanceUrl, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    console.log('Maintenance API response:', response);
    
    if (response.data && response.data.data) {
      maintenanceHistory.value = response.data.data;
      console.log('Maintenance history loaded:', maintenanceHistory.value.length, 'records');
    } else {
      console.warn('No data property in API response');
      maintenanceHistory.value = [];
    }
  } catch (err) {
    console.error('Error loading maintenance data:', err);
    
    if (axios.isAxiosError(err)) {
      const statusCode = err.response?.status;
      const errorMsg = err.response?.data?.message || err.message;
      
      // More specific error message based on status code
      if (statusCode === 401 || statusCode === 403) {
        maintenanceError.value = 'Anda tidak memiliki akses untuk melihat data maintenance';
      } else if (statusCode === 404) {
        maintenanceError.value = 'Data maintenance tidak ditemukan';
      } else {
        maintenanceError.value = `Gagal memuat data: ${errorMsg}`;
      }
    } else {
      maintenanceError.value = 'Gagal memuat data maintenance';
    }
    
    maintenanceHistory.value = [];
  } finally {
    maintenanceLoading.value = false;
  }
};

// Submit new maintenance
const submitMaintenance = async () => {
  maintenanceError.value = '';
  
  try {
    newMaintenance.value.platNomor = platNomor;
    
    const response = await axios.post(`${API_URLS.ASSET}/maintenance`, newMaintenance.value, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (response.data && response.data.status === 201) {
      toast.success('Maintenance berhasil diajukan');
      showMaintenanceModal.value = false;
      
      // Reset form
      newMaintenance.value = {
        platNomor: '',
        deskripsiPekerjaan: '',
        biaya: 0
      };
      
      // Refresh data
      await Promise.all([
        loadData(),
        fetchMaintenanceHistory()
      ]);
    }
  } catch (err: any) {
    console.error('Error submitting maintenance:', err);
    
    if (err.response && err.response.data && err.response.data.message) {
      maintenanceError.value = err.response.data.message;
    } else {
      maintenanceError.value = 'Gagal mengajukan maintenance. Silakan coba lagi.';
    }
  }
};

// Complete maintenance
const completeMaintenance = async (id: number) => {
  try {
    const response = await axios.patch(`${API_URLS.ASSET}/maintenance/${id}/complete`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (response.data && response.data.status === 200) {
      toast.success('Maintenance berhasil diselesaikan');
      
      // Refresh data
      await Promise.all([
        loadData(),
        fetchMaintenanceHistory()
      ]);
    }
  } catch (err: any) {
    console.error('Error completing maintenance:', err);
    
    if (err.response && err.response.data && err.response.data.message) {
      toast.error(err.response.data.message);
    } else {
      toast.error('Gagal menyelesaikan maintenance. Silakan coba lagi.');
    }
  }
};

// Load data from API
const loadData = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    // Load asset details
    const response = await AsetService.getAsetByPlatNomor(platNomor);
    
    // Check if the asset exists or has been deleted
    if (!response || response.isDeleted) {
      // Redirect to NotFoundView if asset is deleted or doesn't exist
      router.replace('/not-found');
      return;
    }
    
    aset.value = response;
    
    // Fetch asset image
    if (aset.value && aset.value.platNomor) {
      await fetchAssetImage(aset.value.platNomor);
    } else {
      assetImage.value = '/placeholder-image.jpg';
    }

  } catch (err) {
    console.error('Error loading data:', err);
    
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      router.replace('/not-found');
      return;
    }
    
    error.value = 'Terjadi kesalahan saat memuat data. Silakan coba lagi.';
    assetImage.value = '/placeholder-image.jpg';
  } finally {
    isLoading.value = false;
  }
};

// Fetch asset image from backend
const fetchAssetImage = async (id: string) => {
  try {
    if (!id || id === 'undefined' || id === 'null') {
      assetImage.value = '/placeholder-image.jpg';
      return;
    }

    const response = await axios.get(`${API_URLS.ASSET}/asset/${id}/foto`, {
      responseType: 'blob',
      timeout: 5000,
      validateStatus: (status) => status >= 200 && status < 300,
    });
    
    if (response.data && response.data.size > 0) {
      assetImage.value = URL.createObjectURL(response.data);
    } else {
      assetImage.value = '/placeholder-image.jpg';
    }
  } catch (error) {
    console.error("Error fetching asset image:", error);
    assetImage.value = '/placeholder-image.jpg';
  }
};

// Event handlers
const handleImageError = () => {
  assetImage.value = '/placeholder-image.jpg';
};

const handleEditAset = () => {
  router.push(`/asset/edit/${platNomor}`);
};

const confirmDelete = async () => {
  try {
    await AsetService.deleteAset(platNomor);
    showSuccessNotification('Aset berhasil dihapus');
    
    setTimeout(() => {
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

onMounted(async () => {
  await loadData();
  await fetchMaintenanceHistory();
  
  // Check if coming from edit page
  if (route.query.edited === 'true') {
    showSuccessNotification('Berhasil Mengubah Detail Aset');
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
