<template>
    <div class="container mx-auto p-4">
      <h2 class="text-xl font-bold mb-4">Daftar Aset</h2>
      
      <!-- Search Bar -->
      <div class="mb-4">
        <VSearchBar v-model="searchQuery" placeholder="Search" />
      </div>
      
      <div v-if="loading" class="text-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-2">Memuat data aset...</p>
      </div>
      
      <div v-else-if="filteredAssets.length === 0" class="text-center py-4">
        <p>Tidak ada data aset yang tersedia</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-200">
          <thead>
            <tr class="bg-gray-100">
              <th class="py-2 px-4 border-b">Nama Aset</th>
              <th class="py-2 px-4 border-b">Tanggal Perolehan</th>
              <th class="py-2 px-4 border-b">Nilai Perolehan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="asset in filteredAssets" :key="asset.platNomor" class="hover:bg-gray-50">
              <td class="py-2 px-4 border-b">{{ asset.nama }}</td>
              <td class="py-2 px-4 border-b">{{ formatDate(asset.tanggalPerolehan) }}</td>
              <td class="py-2 px-4 border-b">{{ formatCurrency(asset.nilaiPerolehan) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { AsetService } from '@/stores/assetservices';
  import type { AsetInterface } from '@/interfaces/asset.interface';
  import VSearchBar from '@/components/VSearchBar.vue';
  
  const assets = ref<AsetInterface[]>([]);
  const loading = ref(true);
  const searchQuery = ref('');
  
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
  </script>
  
  <style scoped>
  .container {
    max-width: 1000px;
    margin: 0 auto;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    text-align: left;
    padding: 8px;
  }
  
  th {
    background-color: #f2f2f2;
  }
  
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  </style>