<template>
  <div class="edit-asset-view">
    <!-- Notification popup -->
    <div 
      v-if="showNotification" 
      class="notification-popup"
      :class="{ 'success': notificationType === 'success', 'error': notificationType === 'error' }"
    >
      <div class="notification-content">
        <span v-if="notificationType === 'success'" class="notification-icon">✓</span>
        <span v-else class="notification-icon">✕</span>
        <span class="notification-message">{{ notificationMessage }}</span>
      </div>
    </div>
    
    <div class="content-wrapper">
      <div class="breadcrumb-container">
        <div class="breadcrumb">
          <router-link to="/" class="breadcrumb-item">Home</router-link>
          <span class="separator">&gt;</span>
          <router-link to="/asset" class="breadcrumb-item">Asset</router-link>
          <span class="separator">&gt;</span>
          <router-link :to="`/asset/${platNomor}`" class="breadcrumb-item">Detail Aset</router-link>
          <span class="separator">&gt;</span>
          <span class="breadcrumb-item current">Mengubah Aset</span>
        </div>
      </div>

      <div class="main-content">
        <div v-if="isLoading" class="loading-container">
          <p>Memuat data...</p>
        </div>
        <div v-else-if="error" class="error-container">
          <p>{{ error }}</p>
          <button @click="loadData" class="btn-reload">Coba Lagi</button>
        </div>
        <div v-else class="edit-form-container">
          <div class="form-container">
            <div class="asset-image">
              <img :src="assetImageUrl || '/placeholder-truck.jpg'" alt="Asset Image" class="asset-preview" />
            </div>

            <div class="form-fields">
              <div class="form-row">
                <div class="form-group">
                  <label for="nama">Nama Aset</label>
                  <input type="text" id="nama" v-model="formData.nama" class="form-control" />
                </div>
                <div class="form-group">
                  <label for="jenisAset">Jenis Aset</label>
                  <VDropDownInput 
                    id="jenisAset" 
                    :options="jenisAsetOptions.map(option => option.value)" 
                    v-model="formData.jenisAset" 
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="platNomor">Nomor Plat</label>
                  <VLockedInput
                    id="platNomor"
                    :value="formattedPlateNumber"
                    class="plate-locked-input"
                  />
                </div>
                <div class="form-group">
                  <label for="status">Status</label>
                  <VDropDownInput 
                    id="status" 
                    :options="statusOptions" 
                    v-model="formData.status" 
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="deskripsi">Deskripsi Aset</label>
                  <textarea id="deskripsi" v-model="formData.deskripsi" class="form-control"></textarea>
                </div>
                <!-- Added empty form-group to balance the layout -->
                <div class="form-group">
                  <!-- This empty space balances the width -->
                </div>
              </div>

              <div class="form-actions">
                <VCancelButton @click="cancel">Batal</VCancelButton>
                <VSuccessButton @click="updateAsset" label="Update">Update</VSuccessButton>
              </div>
            </div>
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
import { formatCurrency, byteArrayToImageUrl } from '@/utils/formatters';
import VLockedInput from '@/components/VLockedInput.vue';
import VDropDownInput from '@/components/VDropDownInput.vue';
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
const notificationType = ref('success');

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

// Format date to DD / MM / YYYY
const formattedDate = computed(() => {
  if (!asset.value?.tanggalPerolehan) return '';
  const date = new Date(asset.value.tanggalPerolehan);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day} / ${month} / ${year}`;
});

// Formatted plate number computed property
const formattedPlateNumber = computed(() => {
  return platNomor;
});

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
  try {
    // Update the form data using the original plate number
    const updatedData = {
      ...formData.value,
      platNomor: platNomor
    };
    
    await AsetService.updateAset(platNomor, updatedData);
    // Show success notification
    showNotificationPopup('Berhasil mengubah detail aset');
    
    // Wait a bit before redirecting to allow user to see the notification
    setTimeout(() => {
      router.push({
        path: `/asset/${platNomor}`,
        query: { updated: 'true' } // Pass a query parameter to show notification on the detail page
      });
    }, 1000);
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
.edit-asset-view {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.content-wrapper {
  flex: 1;
  margin-left: 60px;
}

/* Notification Popup Styling */
.notification-popup {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  min-width: 300px;
  padding: 16px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out forwards;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-popup.success {
  background-color: #ecfdf5;
  border-left: 4px solid #10b981;
}

.notification-popup.error {
  background-color: #fef2f2;
  border-left: 4px solid #ef4444;
}

.notification-content {
  display: flex;
  align-items: center;
}

.notification-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 12px;
  font-size: 14px;
  font-weight: bold;
}

.success .notification-icon {
  background-color: #10b981;
  color: white;
}

.error .notification-icon {
  background-color: #ef4444;
  color: white;
}

.notification-message {
  color: #374151;
  font-size: 14px;
  font-weight: 500;
}

.breadcrumb-container {
  padding: 15px 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.breadcrumb {
  display: flex;
  align-items: center;
}

.breadcrumb-item {
  color: #333;
  text-decoration: none;
  font-size: 16px;
}

.breadcrumb-item:hover {
  text-decoration: underline;
}

.breadcrumb-item.current {
  font-weight: bold;
  color: #000;
}

.separator {
  margin: 0 10px;
  color: #888;
}

.main-content {
  padding: 20px;
}

.loading-container, .error-container {
  background-color: white;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  margin: 20px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.error-container {
  color: #dc3545;
}

.btn-reload {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  margin-top: 10px;
  cursor: pointer;
}

.edit-form-container {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.form-container {
  display: flex;
  gap: 30px;
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.asset-image {
  flex: 0 0 250px;
  height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.asset-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-fields {
  flex: 1;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  width: 100%;
}

label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.form-control {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

textarea.form-control {
  min-height: 100px;
  resize: vertical;
  width: 100%; /* Ensures the textarea uses the full width of its container */
}

.plate-locked-input {
  color: #0066cc; /* Blue color for plate number */
  font-weight: bold;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}
</style>