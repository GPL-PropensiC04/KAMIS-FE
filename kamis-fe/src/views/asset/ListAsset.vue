<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div 
      v-if="showNotification" 
      class="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg z-50 animate-slide-in"
    >
      {{ notificationMessage }}
    </div>

    <div class="max-w-6xl mx-auto bg-white p-4 rounded-lg shadow-md mb-4">
      <div class="flex items-center">
        <div class="w-full">
          <VSearchBar v-model="searchQuery" placeholder="Cari Nama Aset..." class="w-full" />
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md mb-4">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-center text-gray-700 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <thead class="text-xs text-white bg-[#1E3A5F] rounded-t-lg">
            <tr>
              <th scope="col" class="px-6 py-3 cursor-pointer text-center" @click="sortTable('nama')">
                Nama Aset
                <span v-if="sortKey === 'nama' && sortOrder === 'asc'">▲</span>
                <span v-if="sortKey === 'nama' && sortOrder === 'desc'">▼</span>
              </th>
              <th scope="col" class="px-6 py-3 cursor-pointer text-center" @click="sortTable('tanggalPerolehan')">
                Tanggal Perolehan
                <span v-if="sortKey === 'tanggalPerolehan' && sortOrder === 'asc'">▲</span>
                <span v-if="sortKey === 'tanggalPerolehan' && sortOrder === 'desc'">▼</span>
              </th>
              <th scope="col" class="px-6 py-3 text-center">{{ thirdColumnHeader }}</th>
            </tr>
          </thead>
          <tbody v-if="sortedAssets.length > 0">
            <tr v-for="asset in sortedAssets" 
                :key="asset.platNomor" 
                class="bg-white border-b border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                @click="goToDetailAsset(asset.platNomor)">
              <td class="px-6 py-4 text-center">{{ asset.nama }}</td>
              <td class="px-6 py-4 text-center">{{ formatDate(asset.tanggalPerolehan) }}</td>
              <td class="px-6 py-4 text-center">{{ thirdColumnValue(asset) }}</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="3" class="px-6 py-8 text-center text-gray-500">
                Data tidak ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { AsetService } from '@/stores/assetservices';
import type { AsetInterface } from '@/interfaces/asset/asset.interface';
import { useAuthStore } from '@/stores/auth';
import VSearchBar from '@/components/VSearchBar.vue';
import Breadcrumb from '@/components/Breadcrumb.vue';

const assets = ref<AsetInterface[]>([]);
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
    assets.value = data;
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

const thirdColumnValue = (asset: AsetInterface) => {
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
* {
  font-family: 'Inter', sans-serif;
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

th {
  cursor: pointer;
}

th span {
  margin-left: 4px;
}
</style>