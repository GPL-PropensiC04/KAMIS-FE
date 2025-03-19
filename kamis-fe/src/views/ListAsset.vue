<template>
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md mb-4">
      <h1 class="text-2xl font-bold mb-4">Daftar Aset</h1>

      <div class="flex justify-between mb-4">
        <VSearchBar v-model="searchQuery" placeholder="Cari Nama Aset..." />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left text-gray-700 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <thead class="text-xs text-white bg-[#1E3A5F] rounded-t-lg">
            <tr>
              <th scope="col" class="px-6 py-3">Nama Aset</th>
              <th scope="col" class="px-6 py-3">Tanggal Perolehan</th>
              <th scope="col" class="px-6 py-3">{{ thirdColumnHeader }}</th>
              <th scope="col" class="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="asset in filteredAssets" :key="asset.platNomor" class="bg-white border-b border-gray-200 hover:bg-gray-50 rounded-lg">
              <td class="px-6 py-4">{{ asset.nama }}</td>
              <td class="px-6 py-4">{{ formatDate(asset.tanggalPerolehan) }}</td>
              <td class="px-6 py-4">{{ thirdColumnValue(asset) }}</td>
              <td class="px-6 py-4">
                <VSuccessButton
                  label="Detail"
                  @click="goToDetailAsset(asset.platNomor)"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="filteredAssets.length === 0" class="text-center text-gray-500 mt-4">Data tidak ditemukan.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { AsetService } from '@/stores/assetservices';
import type { AsetInterface } from '@/interfaces/asset.interface';
import VSearchBar from '@/components/VSearchBar.vue';
import VSuccessButton from '@/components/VSuccessButton.vue';

const assets = ref<AsetInterface[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const userRole = ref<'DIREKSI' | 'FINANCE' | 'OPERASIONAL'>('OPERASIONAL'); // Ganti dengan logika untuk mendapatkan peran pengguna saat ini

const router = useRouter();

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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, '0')} / ${String(date.getMonth() + 1).padStart(2, '0')} / ${date.getFullYear()}`;
};

const formatCurrency = (value: number) => {
  return `Rp ${value.toLocaleString('id-ID')},00`;
};

const thirdColumnHeader = computed(() => {
  if (userRole.value === 'OPERASIONAL') {
    return 'Sisa Hari Maintenance';
  } else {
    return 'Nilai Perolehan';
  }
});

const thirdColumnValue = (asset: AsetInterface) => {
  if (userRole.value === 'OPERASIONAL') {
    return 'Coming soon';
  } else {
    return formatCurrency(asset.nilaiPerolehan);
  }
};

const goToDetailAsset = (platNomor: string) => {
  router.push(`/asset/${platNomor}`);
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
* {
  font-family: 'Inter', sans-serif;
}
</style>