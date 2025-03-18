<template>
    <div class="detail-aset-container">
      <!-- Tombol Kembali -->
      <div class="kembali-container">
        <router-link to="/asset" class="kembali-btn">
          <i class="fas fa-arrow-left"></i>
        </router-link>
      </div>
  
      <div v-if="isLoading" class="loading-container">
        <p>Memuat data...</p>
      </div>
  
      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
        <button @click="loadData" class="btn-reload">Coba Lagi</button>
      </div>
  
      <template v-else>
        <!-- Gambar Aset -->
        <AssetImage :image-url="asetImageUrl" :alt="aset.nama" />
  
        <!-- Informasi Aset -->
        <AssetInfoCard 
          :aset="aset" 
          @edit="handleEditAset" 
          @delete="handleDeleteAset" 
        />
  
        <!-- Maintenance History -->
        <MaintenanceTable 
          :maintenance-history="maintenanceHistory" 
          @add-maintenance="handleAddMaintenance" 
        />
      </template>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import type { Aset } from '@/interfaces/asset';
  import type { Maintenance } from '@/interfaces/maintenance';
  import { AsetService } from '@/assets/assetservices';
  import { MaintenanceService } from '@/assets/maintenanceservice';
  import { byteArrayToImageUrl } from '@/utils/formatters';
  import AssetImage from '@/components/AssetImage.vue';
  import AssetInfoCard from '@/components/AssetInfoCard.vue';
  import MaintenanceTable from '@/components/MaintenanceTable.vue';
  
  const route = useRoute();
  const router = useRouter();
  const platNomor = route.params.platNomor as string;
  
  // State
  const aset = ref<Aset>({} as Aset);
  const maintenanceHistory = ref<Maintenance[]>([]);
  const isLoading = ref(true);
  const error = ref('');
  
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
      const asetData = await AsetService.getAsetByPlatNomor(platNomor);
      aset.value = asetData;
  
      // Load maintenance history
      const maintenanceData = await MaintenanceService.getMaintenanceByAsetId(platNomor);
      maintenanceHistory.value = maintenanceData;
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
          { id: 1, assetId: platNomor, tanggalPengajuan: '2022-12-12', tanggalSelesai: '2022-12-28', catatan: 'Alasan Rusak' },
          { id: 2, assetId: platNomor, tanggalPengajuan: '2022-12-12', tanggalSelesai: '2022-12-28', catatan: 'Alasan Rusak' },
          { id: 3, assetId: platNomor, tanggalPengajuan: '2022-12-12', tanggalSelesai: '2022-12-28', catatan: 'Alasan Rusak' },
          { id: 4, assetId: platNomor, tanggalPengajuan: '2022-12-12', tanggalSelesai: '2022-12-28', catatan: 'Alasan Rusak' }
        ];
      }
    } finally {
      isLoading.value = false;
    }
  };
  
  // Event handlers
  const handleEditAset = () => {
    // Navigate to edit page or open edit modal
    router.push(`/asset/edit/${platNomor}`);
  };
  
  const handleDeleteAset = async () => {
    if (confirm('Apakah Anda yakin ingin menghapus aset ini?')) {
      try {
        await AsetService.deleteAset(platNomor);
        alert('Aset berhasil dihapus');
        router.push('/asset');
      } catch (err) {
        console.error('Error deleting asset:', err);
        alert('Gagal menghapus aset. Silakan coba lagi.');
      }
    }
  };
  
  const handleAddMaintenance = () => {
    // Navigate to add maintenance page or open add maintenance modal
    router.push(`/asset/${platNomor}/maintenance/add`);
  };
  
  onMounted(() => {
    loadData();
  });
  </script>
  
  <style scoped>
  .detail-aset-container {
    padding: 20px;
    background-color: #f5f5f5;
  }
  
  .kembali-container {
    margin-bottom: 15px;
  }
  
  .kembali-btn {
    color: #333;
    font-size: 20px;
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
  </style>