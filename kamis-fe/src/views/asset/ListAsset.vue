<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div 
      v-if="showNotification" 
      class="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg z-50 animate-slide-in"
    >
      {{ notificationMessage }}
    </div>

    <div class="max-w-full mx-auto bg-white p-3 rounded-lg shadow-md mb-4">
      <div class="grid grid-cols-1 gap-2 items-center">
        <VSearchBar v-model="searchQuery" placeholder="Cari Nama Aset..." />
      </div>
    </div>

    <div class="max-w-full mx-auto bg-white p-6 rounded-lg shadow-md">
      <div v-if="loading" class="flex justify-center items-center py-14">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
      <table v-else class="custom-table">
        <thead class="text-white bg-[#1E3A5F] rounded-t-lg">
          <tr>
            <th @click="sortTable('nama')" class="px-6 py-4 table-header cursor-pointer text-base">
              Nama Aset
              <span v-if="sortKey === 'nama' && sortOrder === 'asc'">▲</span>
              <span v-if="sortKey === 'nama' && sortOrder === 'desc'">▼</span>
            </th>
            <th @click="sortTable('tanggalPerolehan')" class="px-6 py-4 table-header cursor-pointer text-base">
              Tanggal Perolehan
              <span v-if="sortKey === 'tanggalPerolehan' && sortOrder === 'asc'">▲</span>
              <span v-if="sortKey === 'tanggalPerolehan' && sortOrder === 'desc'">▼</span>
            </th>
            <th class="px-6 py-4 table-header text-base">{{ thirdColumnHeader }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="asset in sortedAssets"
            :key="asset.platNomor"
            class="bg-white border-b border-gray-200 hover:bg-gray-50 cursor-pointer text-base"
            @click="goToDetailAsset(asset.platNomor)"
          >
            <td class="px-6 py-5">{{ asset.nama }}</td>
            <td class="px-6 py-5">{{ formatDate(asset.tanggalPerolehan) }}</td>
            <td class="px-6 py-5">{{ thirdColumnValue(asset) }}</td>
          </tr>
          <tr v-if="sortedAssets.length === 0">
            <td colspan="3" class="text-center text-gray-500 py-6 text-base">Data aset tidak ditemukan.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { AsetService } from '@/stores/assetservices';
import type { AsetListInterface } from '@/interfaces/asset/asset.interface';
import { useAuthStore } from '@/stores/auth';
import VSearchBar from '@/components/VSearchBar.vue';
import Breadcrumb from '@/components/Breadcrumb.vue';

const assets = ref<AsetListInterface[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const authStore = useAuthStore();

const canViewFinancialInfo = computed(() => {
  const userRole = authStore.userRole;
  return userRole === 'Direksi' || userRole === 'Finance';
});

const canViewMaintenanceInfo = computed(() => {
  return authStore.userRole === 'Operasional';
});

// Notifikasi state
const showNotification = ref(false);
const notificationMessage = ref('');

const router = useRouter();
const route = useRoute();

// Sorting state
const sortKey = ref<string>('nama');
const sortOrder = ref<string>('asc');

// Fungsi untuk menampilkan notifikasi
const showSuccessNotification = (message: string) => {
  notificationMessage.value = message;
  showNotification.value = true;
  
  // Auto hide setelah 3 detik
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

// Watch perubahan query untuk menampilkan notifikasi saat navigasi dari halaman detail setelah penghapusan
watch(() => route.query, (query) => {
  if (query.deleted === 'true') {
    const platNomor = query.platNomor as string;
    showSuccessNotification(`Aset ${platNomor} berhasil dihapus`);
    
    // Bersihkan parameter query
    router.replace({ path: route.path });
  }
}, { immediate: true });

onMounted(async () => {
  await fetchAssets();
});

const fetchAssets = async () => {
  try {
    const data = await AsetService.viewAllAsset();
    assets.value = data.map((item: any) => ({
      ...item,
      tanggalPerolehan: item.tanggalPerolehan ?? '',
      deskripsi: item.deskripsi ?? '',
      assetMaintenance: item.assetMaintenance ?? '',
      supplierId: item.supplierId ?? '', 
      lastMaintenance: item.lastMaintenance ?? '',
    }));
  } catch (err) {
    console.error('Error fetching assets:', err);
  } finally {
    loading.value = false;
  }
};

const filteredAssets = computed(() => {
  if (!searchQuery.value) {
    return assets.value;
  }
  return assets.value.filter(asset =>
    asset.nama.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const sortedAssets = computed(() => {
  return filteredAssets.value.slice().sort((a, b) => {
    let modifier = 1;
    if (sortOrder.value === 'desc') modifier = -1;
    if (sortKey.value === 'nama') {
      if (a.nama < b.nama) return -1 * modifier;
      if (a.nama > b.nama) return 1 * modifier;
      return 0;
    } else if (sortKey.value === 'tanggalPerolehan') {
      if (a.tanggalPerolehan < b.tanggalPerolehan) return -1 * modifier;
      if (a.tanggalPerolehan > b.tanggalPerolehan) return 1 * modifier;
      return 0;
    }
    return 0;
  });
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, '0')} / ${String(date.getMonth() + 1).padStart(2, '0')} / ${date.getFullYear()}`;
};

const formatCurrency = (value: number) => {
  return `Rp ${value.toLocaleString('id-ID')},00`;
};

const thirdColumnHeader = computed(() => {
  if (canViewMaintenanceInfo.value) {
    return 'Terakhir Maintenance';
  } else if (canViewFinancialInfo.value) {
    return 'Nilai Perolehan';
  }
  return '';
});

const thirdColumnValue = (asset: AsetListInterface) => {
  if (canViewMaintenanceInfo.value) {
    if (!asset.lastMaintenance) {
      return 'Belum Maintenance';
    }
    return formatDate(asset.lastMaintenance);
  } else if (canViewFinancialInfo.value) {
    return formatCurrency(asset.nilaiPerolehan);
  }
  return '';
};

const goToDetailAsset = (platNomor: string) => {
  router.push(`/asset/${platNomor}`);
};

const sortTable = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
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