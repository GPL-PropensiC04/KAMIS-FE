<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TheWelcome from '../components/TheWelcome.vue'
import type { AsetInterface } from '../interfaces/asset.interface'
import { API_URLS } from '@/config/api.config'
const router = useRouter()
const assets = ref<AsetInterface[]>([])
const loading = ref(true)

onMounted(async () => {
  await fetchAssets()
})

const fetchAssets = async () => {
  try {
    const response = await fetch(`${API_URLS.ASSET}/asset/all`)
    const data = await response.json()
    
    if (data.status === 200) {
      assets.value = data.data
    } else {
      console.error('Failed to fetch assets:', data.message)
    }
  } catch (err) {
    console.error('Error fetching assets:', err)
  } finally {
    loading.value = false
  }
}

const viewAssetDetail = (platNomor: string) => {
  router.push(`/asset/${platNomor}`)
}
</script>

<template>
  <main>
    <TheWelcome />
    
    <div class="container mx-auto p-4">
      <h2 class="text-xl font-bold mb-4">Daftar Aset</h2>
      
      <div v-if="loading" class="text-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-2">Memuat data aset...</p>
      </div>
      
      <div v-else-if="assets.length === 0" class="text-center py-4">
        <p>Tidak ada data aset yang tersedia</p>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="asset in assets" 
          :key="asset.platNomor" 
          class="bg-white p-4 rounded shadow cursor-pointer hover:shadow-md transition-shadow"
          @click="viewAssetDetail(asset.platNomor)"
        >
          <h3 class="font-bold text-lg">{{ asset.nama }}</h3>
          <p class="text-gray-600">{{ asset.jenisAset }}</p>
          <p class="text-gray-600">{{ asset.platNomor }}</p>
          <p class="text-gray-600">Status: {{ asset.status }}</p>
        </div>
      </div>
    </div>
  </main>
</template>