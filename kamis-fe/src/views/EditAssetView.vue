<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Notification popup - dengan warna dinamis berdasarkan tipe notifikasi -->
    <div 
      v-if="showNotification" 
      :class="[
        'fixed top-5 right-5 text-white px-6 py-3 rounded-md shadow-lg z-50 animate-slide-in',
        notificationType === 'error' ? 'bg-red-500' : 'bg-green-500'
      ]"
    >
      {{ notificationMessage }}
    </div>
    
    <div class="max-w-7xl mx-auto px-4 py-6">
      <!-- Breadcrumb -->
      <nav class="bg-white p-4 rounded-md shadow-sm mb-6">
        <ol class="flex items-center text-sm">
          <li class="flex items-center">
            <router-link to="/" class="text-gray-600 hover:text-gray-900">Home</router-link>
            <span class="mx-2 text-gray-400">&gt;</span>
          </li>
          <li class="flex items-center">
            <router-link to="/assets" class="text-gray-600 hover:text-gray-900">Asset</router-link>
            <span class="mx-2 text-gray-400">&gt;</span>
          </li>
          <li class="flex items-center">
            <router-link :to="`/asset/${platNomor}`" class="text-gray-600 hover:text-gray-900">Detail Aset</router-link>
            <span class="mx-2 text-gray-400">&gt;</span>
          </li>
          <li class="font-semibold text-gray-900">Mengubah Aset</li>
        </ol>
      </nav>

      <!-- Main Content -->
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
      
      <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6 flex flex-col md:flex-row gap-8">
          <!-- Asset Image -->
          <div class="w-full md:w-1/3 lg:w-1/4">
            <div class="bg-gray-100 rounded-lg overflow-hidden h-64 flex items-center justify-center">
              <img 
                :src="assetImageUrl || '/placeholder-truck.jpg'" 
                alt="Asset Image" 
                class="w-full h-full object-cover"
              />
            </div>
          </div>

          <!-- Form -->
          <div class="w-full md:w-2/3 lg:w-3/4">
            <form @submit.prevent="updateAsset" class="space-y-6">
              <!-- Name and Type in same row -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="nama" class="block text-sm font-medium text-gray-700 mb-1">
                    Nama Aset <span class="text-red-500">*</span>
                  </label>
                  <VTextArea
                    id="nama"
                    v-model="formData.nama"
                    placeholder="Masukkan nama aset"
                    required
                  />
                  <p v-if="errors.nama" class="mt-1 text-sm text-red-600">{{ errors.nama }}</p>
                </div>
                
                <div>
                  <label for="jenisAset" class="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Aset
                  </label>
                  <VDropDownInput
                    id="jenisAset"
                    :options="jenisAsetOptions.map(option => option.value)"
                    v-model="formData.jenisAset"
                  />
                </div>
              </div>

              <!-- Plate number and Status in same row -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="platNomor" class="block text-sm font-medium text-gray-700 mb-1">
                    No Polisi
                  </label>
                  <VLockedInput
                    id="platNomor"
                    :value="formattedPlateNumber"
                  />
                </div>
                
                <div>
                  <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <VDropDownInput
                    id="status"
                    :options="statusOptions"
                    v-model="formData.status"
                  />
                </div>
              </div>

              <!-- Description -->
              <div>
                <label for="deskripsi" class="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi Aset <span class="text-red-500">*</span>
                </label>
                <VTextBox
                  id="deskripsi"
                  v-model="formData.deskripsi"
                  placeholder="Masukkan deskripsi aset"
                  required
                />
                <p v-if="errors.deskripsi" class="mt-1 text-sm text-red-600">{{ errors.deskripsi }}</p>
              </div>

              <!-- Action Buttons -->
              <div class="flex justify-end space-x-4 pt-6">
                <VCancelButton @click="cancel">Batal</VCancelButton>
                <VSuccessButton label="Update" type="submit" />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { AsetInterface } from '@/interfaces/asset.interface';
import { AsetService } from '@/stores/assetservices';
import { byteArrayToImageUrl } from '@/utils/formatters';
import VLockedInput from '@/components/VLockedInput.vue';
import VDropDownInput from '@/components/VDropDownInput.vue';
import VTextBox from '@/components/VTextBox.vue';
import VTextArea from '@/components/VTextArea.vue';
import VCancelButton from '@/components/VCancelButton.vue';
import VSuccessButton from '@/components/VSuccessButton.vue';

const route = useRoute();
const router = useRouter();
const platNomor = route.params.platNomor as string;

// State variables
const asset = ref<AsetInterface | null>(null);
const assetImageUrl = ref('');
const isLoading = ref(true);
const error = ref('');

// Notification state
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error'>('success');

// Form data for editing
const formData = ref({
  nama: '',
  jenisAset: '',
  deskripsi: '',
  status: 'Tersedia',
  assetMaintenance: ''
});

// Options for dropdown
const jenisAsetOptions = [
  { value: 'Truk', label: 'Truk' },
  { value: 'Mobil', label: 'Mobil' },
  { value: 'Motor', label: 'Motor' },
  { value: 'Lainnya', label: 'Lainnya' }
];

const statusOptions = ['Tersedia', 'Sedang Maintenance', 'Dalam Proyek'];

// Formatted plate number computed property
const formattedPlateNumber = computed(() => {
  return platNomor;
});

// Form validation
const errors = ref({
  nama: '',
  deskripsi: ''
});

// Validate form function
const validateForm = () => {
  let isValid = true;
  errors.value = {
    nama: '',
    deskripsi: ''
  };
  
  if (!formData.value.nama.trim()) {
    errors.value.nama = 'Nama aset tidak boleh kosong';
    isValid = false;
  }
  
  if (!formData.value.deskripsi.trim()) {
    errors.value.deskripsi = 'Deskripsi aset tidak boleh kosong';
    isValid = false;
  }
  
  return isValid;
};

// Show notification helper function
const showNotificationPopup = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

const loadData = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    const loadedAsset = await AsetService.getAsetByPlatNomor(platNomor);
    asset.value = loadedAsset;
    
    formData.value.nama = loadedAsset.nama;
    formData.value.jenisAset = loadedAsset.jenisAset;
    formData.value.deskripsi = loadedAsset.deskripsi;
    formData.value.status = loadedAsset.status;
    formData.value.assetMaintenance = loadedAsset.assetMaintenance;
    
    if (loadedAsset.gambarAset) {
      assetImageUrl.value = byteArrayToImageUrl(loadedAsset.gambarAset as unknown as number[]);
    }
  } catch (err) {
    console.error('Failed to load asset:', err);
    error.value = 'Gagal memuat data aset. Silakan coba lagi.';
    showNotificationPopup('Gagal memuat data aset', 'error');
  } finally {
    isLoading.value = false;
  }
};

const updateAsset = async () => {
  // Validate form before submitting
  if (!validateForm()) {
    showNotificationPopup('Harap lengkapi semua field yang wajib diisi', 'error');
    return;
  }
  
  try {
    // Update the form data using the original plate number
    const updatedData = {
      ...formData.value,
      platNomor: platNomor
    };
    
    await AsetService.updateAset(platNomor, updatedData);
    
    // Only show a brief success notification here
    showNotificationPopup('Berhasil mengubah detail aset');
    
    // Wait a bit before redirecting to allow user to see the notification
    setTimeout(() => {
      // Pass query parameter to show notification on the detail page
      router.push({
        path: `/asset/${platNomor}`,
        query: { edited: 'true' } // Use 'edited' parameter for consistency
      });
    }, 1500);
  } catch (err) {
    console.error('Failed to update asset:', err);
    error.value = 'Gagal memperbarui aset. Silakan coba lagi.';
    showNotificationPopup('Gagal memperbarui aset', 'error');
  }
};

const cancel = () => {
  router.push(`/asset/${platNomor}`);
};

onMounted(() => {
  loadData();
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
  animation: slide-in 0.3s ease-out forwards;
}
</style>