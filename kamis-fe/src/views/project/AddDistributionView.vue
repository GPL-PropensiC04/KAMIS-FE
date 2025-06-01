<template>
  <Breadcrumb/>
  <div class="min-h-screen bg-gray-100 p-6">
    <!-- Navigation header -->
    <div class="mb-4 flex justify-between items-center">

    </div>

    <!-- Main Form -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- Form header with back button and next button -->
      <div class="flex justify-between mb-6">
        <router-link to="/project" class="text-[#1E3A5F] hover:text-[#1a325a] text-2xl flex items-center">
        <span>←</span>
      </router-link>
        <button 
          @click="submitForm" 
          class="bg-[#2D6A4F] hover:bg-[#216043] text-white px-4 py-2 rounded-md"
        >
          Selanjutnya
        </button>
      </div>

      <!-- Main form grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Left column -->
        <div class="space-y-6">
          <!-- Nama Aktivitas -->
          <div>
            <label class="block text-gray-700 mb-2 font-medium">Nama Aktivitas</label>
            <input 
              v-model="formData.projectName"
              type="text" 
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan nama aktivitas"
            />
          </div>

          <!-- Klien -->
          <div>
            <label class="block text-gray-700 mb-2 font-medium">Klien</label>
            <div class="relative">
              <select 
                v-model="formData.projectClientId"
                class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="" disabled>Nama Klien Tujuan Barang</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.nameClient }}
                </option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg class="w-4 h-4 fill-current text-gray-400" viewBox="0 0 20 20"><path d="M7 7l3-3 3 3m0 6l-3 3-3-3"></path></svg>
              </div>
            </div>
          </div>

          <!-- Alamat Pengambilan -->
          <div>
            <label class="block text-gray-700 mb-2 font-medium">Alamat Pengambilan</label>
            <input 
              v-model="formData.projectPickupAddress"
              type="text" 
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan alamat pengambilan"
            />
          </div>

          <!-- Jumlah PHL Dipekerjakan -->
          <div>
            <label class="block text-gray-700 mb-2 font-medium">Jumlah PHL Dipekerjakan</label>
            <div class="flex items-center">
              <input 
                v-model.number="formData.projectPHLCount"
                type="number" 
                min="0"
                class="w-20 p-2 border border-gray-300 rounded mr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span class="mr-3">Orang x upah sebesar Rp</span>
              <input 
                v-model.number="formData.projectPHLPay"
                type="number" 
                min="0"
                class="w-32 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- Right column -->
        <div class="space-y-6">
          <!-- Jenis Aktivitas - Display only -->
          <div>
            <label class="block text-gray-700 mb-2 font-medium">Jenis Aktivitas</label>
            <div class="w-full p-2 bg-gray-200 border border-gray-300 rounded text-gray-700">
              Distribusi
            </div>
          </div>

          <!-- Tanggal Aktivitas -->
          <div>
            <label class="block text-gray-700 mb-2 font-medium">Tanggal Aktivitas</label>
            <div class="flex flex-col space-y-4">
              <div class="flex space-x-2">
                <div class="w-1/2">
                  <div class="relative">
                    <input 
                      :value="formData.projectStartDate"
                      @input="handleStartDateInput($event)"
                      type="date" 
                      class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div class="w-1/2">
                  <div class="relative">
                    <input 
                      :value="formData.projectEndDate"
                      @input="handleEndDateInput($event)"
                      type="date" 
                      class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Alamat Pengiriman -->
          <div>
            <label class="block text-gray-700 mb-2 font-medium">Alamat Pengiriman</label>
            <input 
              v-model="formData.projectDeliveryAddress"
              type="text" 
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan alamat pengiriman"
            />
          </div>

          <!-- Total Pemasukan -->
          <div>
            <label class="block text-gray-700 mb-2 font-medium">Total Pemasukan</label>
            <input 
              v-model.number="formData.projectTotalPemasukkan"
              type="number" 
              min="0"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Rp 0"
            />
          </div>
        </div>
      </div>

      <!-- Assets Section -->
      <div class="mt-8">
        <h2 class="text-xl font-semibold text-[#1E3A5F] mb-4">Aset yang digunakan</h2>
        
        <!-- Asset selection form -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 items-end">
          <div>
            <label class="block text-gray-700 mb-2 text-sm">Jenis Aset</label>
            <div class="relative">
              <select 
                v-model="selectedAssetType"
                class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
                :class="{ 'bg-gray-200': !datesSelected }"
                @change="updateAssetNames"
                :disabled="!datesSelected"
              >
                <option value="" disabled>{{ datesSelected ? 'Pilih Jenis Aset' : 'Pilih Tanggal Aktivitas Terlebih Dahulu' }}</option>
                <option v-for="type in assetTypes" :key="type" :value="type">{{ type }}</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg class="w-4 h-4 fill-current text-gray-400" viewBox="0 0 20 20"><path d="M7 7l3-3 3 3m0 6l-3 3-3-3"></path></svg>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-gray-700 mb-2 text-sm">Nama Aset</label>
            <div class="relative">
              <select 
                v-model="selectedAssetName"
                class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
                :class="{ 'bg-gray-200': !datesSelected || !selectedAssetType }"
                :disabled="!datesSelected || !selectedAssetType"
              >
                <option value="" disabled>{{ !datesSelected ? 'Pilih Tanggal Aktivitas Terlebih Dahulu' : !selectedAssetType ? 'Pilih Jenis Aset Terlebih Dahulu' : 'Pilih Nama' }}</option>
                <option v-for="name in assetNames" :key="name" :value="name">{{ name }}</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg class="w-4 h-4 fill-current text-gray-400" viewBox="0 0 20 20"><path d="M7 7l3-3 3 3m0 6l-3 3-3-3"></path></svg>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-gray-700 mb-2 text-sm">Biaya Bensin</label>
            <input 
              v-model.number="fuelCost"
              type="number"
              min="0"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              :class="{ 'bg-gray-200': !datesSelected || !selectedAssetName }"
              placeholder="Rp 0,00"
              :disabled="!datesSelected || !selectedAssetName"
            />
          </div>
          
          <div>
            <label class="block text-gray-700 mb-2 text-sm">Ongkos Kirim</label>
            <input 
              v-model.number="shippingCost"
              type="number"
              min="0"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              :class="{ 'bg-gray-200': !datesSelected || !selectedAssetName }"
              placeholder="Rp 0,00"
              :disabled="!datesSelected || !selectedAssetName"
            />
          </div>
          
          <div>
            <button 
              @click="addAsset"
              class="w-full bg-[#1E3A5F] hover:bg-[#152c49] text-white p-2 rounded"
              :disabled="!datesSelected || !selectedAssetName"
              :class="{ 'opacity-50 cursor-not-allowed': !datesSelected || !selectedAssetName }"
            >
              Tambah
            </button>
          </div>
        </div>

        <!-- Add an information banner when no assets are available -->
        <div v-if="datesSelected && availableAssets.length === 0" 
             class="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">
          Tidak ada aset yang tersedia untuk periode waktu yang dipilih. Silakan pilih tanggal lain.
        </div>

        <!-- Assets table with loading overlay -->
        <div class="relative">
          <!-- Loading overlay -->
          <div v-if="loadingAssets" class="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center rounded-lg backdrop-filter backdrop-blur-sm">
            <div class="flex flex-col items-center p-4 bg-white bg-opacity-90 rounded-lg shadow-lg">
              <svg class="animate-spin h-10 w-10 text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span class="text-blue-700 font-medium">Memeriksa ketersediaan aset...</span>
            </div>
          </div>
          
          <!-- Assets table -->
          <div class="overflow-x-auto bg-white shadow rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-[#1E3A5F] text-white">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-medium uppercase">Jenis Aset</th>
                  <th class="px-6 py-3 text-left text-sm font-medium uppercase">Nama Aset</th>
                  <th class="px-6 py-3 text-right text-sm font-medium uppercase">Biaya Pakai</th>
                  <th class="px-6 py-3 text-center text-sm font-medium uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(asset, index) in selectedAssetList" :key="index" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">{{ asset.type }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ asset.name }}</td>
                  <td class="px-6 py-4 text-right whitespace-nowrap">{{ formatCurrency(asset.totalCost) }}</td>
                  <td class="px-6 py-4 text-center whitespace-nowrap">
                    <button 
                      @click="removeAsset(index)"
                      class="text-red-600 hover:text-red-800"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr v-if="selectedAssetList.length === 0">
                  <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                    Belum ada aset yang ditambahkan
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-gray-50">
                <tr>
                  <td colspan="2" class="px-6 py-3 text-right font-medium">Total Biaya Aset:</td>
                  <td class="px-6 py-3 text-right font-bold">{{ formatCurrency(totalAssetCost) }}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Summary -->
        <div class="mt-6 bg-gray-50 rounded-lg p-4">
          <div class="flex justify-between">
            <div class="text-lg font-bold">Total Pengeluaran</div>
            <div class="text-lg font-bold">{{ formatCurrency(totalExpenses) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import axios from 'axios';
import { API_URLS } from '@/config/api.config';
import type { DistributionFormData, AssetUsageDTO } from '@/interfaces/project/project.interface';
import type { ProjectAsset, AvailableAsset } from '@/interfaces/project/project.interface';
import type { ClientInterface } from '@/interfaces/profile/client.interface';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { useAssetStore } from '@/stores/assetReservability';

// Router & Toast
const router = useRouter();
const toast = useToast();

// Form data
const formData = ref<DistributionFormData>({
  projectName: '',
  projectClientId: '',
  projectType: true, // True for Distribution
  projectStartDate: '',
  projectEndDate: '',
  projectPHLCount: 0,
  projectPHLPay: 0,
  projectPickupAddress: '',
  projectDeliveryAddress: '',
  projectTotalPemasukkan: 0,
  projectTotalPengeluaran: 0,
  projectUseAsset: [] as Array<AssetUsageDTO>
});

const clients = ref<ClientInterface[]>([]);


const assets = ref<AvailableAsset[]>([]);
const selectedAssetList = ref<ProjectAsset[]>([]);
const assetTypes = ref<string[]>([]);
const selectedAssetType = ref('');
const selectedAssetName = ref('');
const assetNames = ref<string[]>([]);
const fuelCost = ref(0);
const shippingCost = ref(0);

// Store
const assetStore = useAssetStore();

// Add a new state variable to track available assets
const availableAssets = ref<AvailableAsset[]>([]);
const datesSelected = ref(false);
const loadingAssets = ref(false);
// Add a flag to track if availability check has run
const availabilityChecked = ref(false);

// Computed values
const totalAssetCost = computed(() => {
  return selectedAssetList.value.reduce((sum, asset) => sum + asset.totalCost, 0);
});

const totalPhlCost = computed(() => {
  return formData.value.projectPHLCount * formData.value.projectPHLPay;
});

const totalExpenses = computed(() => {
  return totalAssetCost.value + totalPhlCost.value;
});

// Fetch clients from API
const fetchClients = async () => {
  try {
    const response = await axios.get(`${API_URLS.PROFILE}/client/all`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    clients.value = response.data.data.map((client: {id: string; nameClient: string}) => ({
      id: client.id,
      name: client.nameClient
    }));
  } catch (error) {
    console.error('Error fetching clients:', error);
    toast.error('Gagal mengambil data klien');
  }
};

// Fetch assets from API
const fetchAssets = async () => {
  try {
    // Use the asset store instead of direct API call
    const fetchedAssets = await assetStore.fetchAssets();
    
    // Map the fetched assets to our Asset interface format
    assets.value = fetchedAssets.map(asset => ({
      id: asset.platNomor,
      assetType: asset.tipeAset,
      assetName: asset.nama,
      assetUsageCost: 0,
      platNomor: asset.platNomor
    }));
    
    // Extract unique asset types
    const types = new Set(assets.value.map(asset => asset.assetType));
    assetTypes.value = Array.from(types) as string[];
  } catch (error) {
    console.error('Error fetching assets:', error);
    toast.error('Gagal mengambil data aset');
  }
};

// Add a new function to check asset availability
const checkAvailableAssets = async () => {
  if (!formData.value.projectStartDate || !formData.value.projectEndDate) {
    toast.error('Tanggal mulai dan selesai proyek harus diisi terlebih dahulu');
    return;
  }

  // If already checking or has been checked with the same dates, don't run again
  if (loadingAssets.value || availabilityChecked.value) return;

  try {
    loadingAssets.value = true;
    
    // Fetch all assets first if not already fetched
    if (assets.value.length === 0) {
      await fetchAssets();
    }
    
    const startDate = new Date(formData.value.projectStartDate);
    const endDate = new Date(formData.value.projectEndDate);
    
    // Validate date range
    if (endDate < startDate) {
      toast.error('Tanggal akhir harus setelah tanggal mulai');
      loadingAssets.value = false;
      return;
    }
    
    // Get all asset plat nomors
    const platNomors = assets.value.map(asset => asset.platNomor as string);
    
    // Check availability
    const availability = await assetStore.checkAssetAvailability({
      platNomors,
      startDate,
      endDate,
      excludeProjectId: undefined // No project ID for new projects
    });
    
    // Filter assets to only include available ones
    availableAssets.value = assets.value.filter(asset => 
      asset.platNomor && availability[asset.platNomor]
    );
    
    // Extract unique asset types from available assets
    const types = new Set(availableAssets.value.map(asset => asset.assetType));
    assetTypes.value = Array.from(types) as string[];
    
    datesSelected.value = true;
    availabilityChecked.value = true;
    loadingAssets.value = false;
    
    // If no assets available
    if (availableAssets.value.length === 0) {
      toast.warning('Tidak ada aset yang tersedia untuk periode waktu yang dipilih');
    } else {
      toast.success(`${availableAssets.value.length} aset tersedia untuk periode waktu yang dipilih`);
    }
    
  } catch (error) {
    console.error('Error checking asset availability:', error);
    toast.error('Gagal memeriksa ketersediaan aset');
    loadingAssets.value = false;
  }
};

// Replace updateAssetNames with a version that filters from available assets
const updateAssetNames = () => {
  if (!selectedAssetType.value) {
    assetNames.value = [];
    return;
  }
  
  const filteredAssets = availableAssets.value.filter(asset => 
    asset.assetType === selectedAssetType.value &&
    !selectedAssetList.value.some(a => a.id === asset.id)
  );
  
  assetNames.value = filteredAssets.map(asset => asset.assetName);
};

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

// Modify the addAsset function to skip availability check since we're already filtering
const addAsset = () => {
  if (!selectedAssetType.value || !selectedAssetName.value) {
    toast.error('Pilih tipe dan nama aset terlebih dahulu');
    return;
  }
  
  const selectedAsset = availableAssets.value.find(
    asset => asset.assetType === selectedAssetType.value && 
    asset.assetName === selectedAssetName.value
  );
  
  if (!selectedAsset) {
    toast.error('Aset tidak ditemukan');
    return;
  }
  
  if (selectedAssetList.value.some(asset => asset.id === selectedAsset.id)) {
    toast.error('Aset sudah ditambahkan');
    return;
  }
  
  // Add asset to list with costs
  selectedAssetList.value.push({
    id: selectedAsset.id,
    type: selectedAssetType.value,
    name: selectedAssetName.value,
    fuelCost: fuelCost.value,
    shippingCost: shippingCost.value,
    usageCost: selectedAsset.assetUsageCost || 0,
    totalCost: (selectedAsset.assetUsageCost || 0) + fuelCost.value + shippingCost.value,
    platNomor: selectedAsset.platNomor
  });
  
  // Reset fields
  selectedAssetType.value = '';
  selectedAssetName.value = '';
  fuelCost.value = 0;
  shippingCost.value = 0;
  
  // Update form data
  updateFormData();
  
  toast.success(`Aset ${selectedAsset.assetName} berhasil ditambahkan`);
};

// Remove asset from list
const removeAsset = (index: number) => {
  selectedAssetList.value.splice(index, 1);
  updateFormData();
};

// Update form data with current asset list
const updateFormData = () => {
  formData.value.projectTotalPengeluaran = totalExpenses.value;
  formData.value.projectUseAsset = selectedAssetList.value.map(asset => ({
    platNomor: asset.id,
    tipeAset: asset.type || '',
    assetUseCost: asset.usageCost || 0,
    assetFuelCost: asset.fuelCost || 0
  }));
  
  // Store form data in localStorage for summary page
  localStorage.setItem('distributionFormData', JSON.stringify(formData.value));
  localStorage.setItem('distributionselectedAssetList', JSON.stringify(selectedAssetList.value));
  localStorage.setItem('clientList', JSON.stringify(clients.value));
};

// Custom date input handlers
const handleStartDateInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target) {
    formData.value.projectStartDate = target.value;
  }
};

const handleEndDateInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target) {
    formData.value.projectEndDate = target.value;
  }
};

// Form submission
const submitForm = async () => {
  // Basic validation
  if (!formData.value.projectName) {
    toast.error('Nama aktivitas harus diisi');
    return;
  }
  
  if (!formData.value.projectClientId) {
    toast.error('Klien harus dipilih');
    return;
  }
  
  if (!formData.value.projectStartDate) {
    toast.error('Tanggal mulai harus diisi');
    return;
  }
  
  if (selectedAssetList.value.length === 0) {
    toast.error('Minimal satu aset harus ditambahkan');
    return;
  }
  
  // Adjust dates to avoid timezone issues
  if (formData.value.projectStartDate) {
    // Add 'T12:00:00' to ensure it's noon and won't shift days due to timezone
    if (!formData.value.projectStartDate.includes('T')) {
      formData.value.projectStartDate = `${formData.value.projectStartDate}T12:00:00`;
    }
  }
  if (formData.value.projectEndDate) {
    // Add 'T12:00:00' to ensure it's noon and won't shift days due to timezone
    if (!formData.value.projectEndDate.includes('T')) {
      formData.value.projectEndDate = `${formData.value.projectEndDate}T12:00:00`;
    }
  }
  
  // Update form data before submitting
  updateFormData();
  
  try {
    // Navigate to summary page instead of submitting directly
    router.push('/project/add/distribution-summary');
  } catch (error) {
    console.error('Error navigating to summary page:', error);
    toast.error('Terjadi kesalahan. Silahkan coba lagi.');
  }
};

// Watch for asset type changes
watch(selectedAssetType, updateAssetNames);

// Watch for date changes to automatically check asset availability
watch(
  [() => formData.value.projectStartDate, () => formData.value.projectEndDate],
  async ([newStartDate, newEndDate]) => {
    if (newStartDate && newEndDate) {
      // Reset availability check flag when dates change
      availabilityChecked.value = false;
      await checkAvailableAssets();
    }
  }
);

// Load data on component mount
onMounted(() => {
  fetchClients();
  fetchAssets();
  
  // Check for saved form data
  const savedData = localStorage.getItem('distributionFormData');
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      formData.value = { ...formData.value, ...parsedData };
      
      // Restore asset list if available
      if (parsedData.projectUseAsset && Array.isArray(parsedData.projectUseAsset)) {
        // We'll need to fetch full asset details to reconstruct selectedAssetList
        // This is simplified for now
      }
    } catch (error) {
      console.error('Error parsing saved form data:', error);
    }
  }
});
</script> 