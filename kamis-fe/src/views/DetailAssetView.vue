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
          :show-financial-info="showFinancialInfo"
          :show-action-buttons="showActionButtons"
        />
  
        <!-- Maintenance History -->
        <MaintenanceTable 
          :maintenance-history="maintenanceHistory" 
          @add-maintenance="handleAddMaintenance"
          :show-add-button="showActionButtons"
        />
      </template>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import type { AsetInterface } from '@/interfaces/asset.interface';
  import type { Maintenance } from '@/interfaces/maintenance';
  import { AsetService } from '@/services/assetservices';
  import { MaintenanceService } from '@/services/maintenanceservice';
  import { byteArrayToImageUrl } from '@/utils/formatters';
  import AssetImage from '@/components/AssetImage.vue';
  import AssetInfoCard from '@/components/AssetInfoCard.vue';
  import MaintenanceTable from '@/components/MaintenanceTable.vue';
  import { useAuthStore } from '@/stores/auth'; // Import Auth Store
  
  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore(); // Use auth store
  const platNomor = route.params.platNomor as string;
  
  // State
  const aset = ref<AsetInterface>({} as AsetInterface);
  const maintenanceHistory = ref<Maintenance[]>([]);
  const isLoading = ref(true);
  const error = ref('');
  
  // Role-based permission computed properties
  const showFinancialInfo = computed(() => {
    const userRole = authStore.userRole;
    console.log('Current role for financial info check:', userRole);
    // Only Direksi and Finance can see financial info
    return userRole === 'Direksi' || userRole === 'Finance';
  });
  
  const showActionButtons = computed(() => {
    const userRole = authStore.userRole;
    console.log('Current role for action buttons check:', userRole);
    // Only Admin and Operasional can see action buttons
    return userRole === 'Admin' || userRole === 'Operasional';
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
      
      // Menggunakan respons langsung dari backend karena AsetService.getAsetByPlatNomor 
      // sudah me-return response.data
      aset.value = response;
  
      // Load maintenance history (akan menggunakan data dummy jika API tidak tersedia)
      try {
        const maintenanceData = await MaintenanceService.getMaintenanceByAsetId(platNomor);
        maintenanceHistory.value = maintenanceData;
      } catch (errMaintenance) {
        console.error('Error loading maintenance data:', errMaintenance);
        // Tetap gunakan data dummy jika terjadi error
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
    // Arahkan ke halaman Coming Soon
    router.push('/coming-soon');   
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