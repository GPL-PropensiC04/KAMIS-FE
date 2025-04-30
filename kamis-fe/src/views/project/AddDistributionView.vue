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
                  {{ client.name }}
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
            <div class="flex space-x-2">
              <div class="w-1/2">
                <div class="relative">
                  <input 
                    v-model="formData.projectStartDate"
                    type="date" 
                    class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg class="w-5 h-5 fill-current text-gray-400" viewBox="0 0 20 20"><path d="M10 14a4 4 0 100-8 4 4 0 000 8zm0 1A5 5 0 1110 5a5 5 0 010 10z"></path></svg>
                  </div>
                </div>
              </div>
              <div class="w-1/2">
                <div class="relative">
                  <input 
                    v-model="formData.projectEndDate"
                    type="date" 
                    class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg class="w-5 h-5 fill-current text-gray-400" viewBox="0 0 20 20"><path d="M10 14a4 4 0 100-8 4 4 0 000 8zm0 1A5 5 0 1110 5a5 5 0 010 10z"></path></svg>
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
                @change="updateAssetNames"
              >
                <option value="" disabled>Pilih Jenis</option>
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
              >
                <option value="" disabled>Pilih Nama</option>
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
              placeholder="Rp 0,00"
            />
          </div>
          
          <div>
            <label class="block text-gray-700 mb-2 text-sm">Ongkos Kirim</label>
            <input 
              v-model.number="shippingCost"
              type="number"
              min="0"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Rp 0,00"
            />
          </div>
          
          <div>
            <button 
              @click="addAsset"
              class="w-full bg-[#1E3A5F] hover:bg-[#152c49] text-white p-2 rounded"
            >
              Tambah
            </button>
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
              <tr v-for="(asset, index) in assetList" :key="index" class="hover:bg-gray-50">
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
              <tr v-if="assetList.length === 0">
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
import Breadcrumb from '@/components/Breadcrumb.vue';

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

// Client data
interface Client {
  id: string;
  name: string;
}

const clients = ref<Client[]>([]);

// Asset data
interface Asset {
  id: string;
  assetType: string;
  assetName: string;
  assetUsageCost?: number;
  platNomor?: string;
}

interface ProjectAsset {
  id: string;
  type: string;
  name: string;
  fuelCost: number;
  shippingCost: number;
  usageCost: number;
  totalCost: number;
  platNomor?: string;
}

const assets = ref<Asset[]>([]);
const assetList = ref<ProjectAsset[]>([]);
const assetTypes = ref<string[]>([]);
const selectedAssetType = ref('');
const selectedAssetName = ref('');
const assetNames = ref<string[]>([]);
const fuelCost = ref(0);
const shippingCost = ref(0);

// Computed values
const totalAssetCost = computed(() => {
  return assetList.value.reduce((sum, asset) => sum + asset.totalCost, 0);
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
    const response = await axios.get(`${API_URLS.ASSET}/asset/all`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    // Map the backend response to our Asset interface format
    interface AssetResponse {
      platNomor: string;
      tipeAset: string;
      nama: string;
      status: string;
      nilaiPerolehan: number;
    }
    
    assets.value = response.data.data.map((asset: AssetResponse) => ({
      id: asset.platNomor, // Using platNomor as ID
      assetType: asset.tipeAset,
      assetName: asset.nama,
      assetUsageCost: 0, // Default value as it's not provided by API
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

// Update asset names when asset type changes
const updateAssetNames = () => {
  if (!selectedAssetType.value) {
    assetNames.value = [];
    return;
  }
  
  const filteredAssets = assets.value.filter(asset => 
    asset.assetType === selectedAssetType.value &&
    !assetList.value.some(a => a.id === asset.id)
  );
  
  assetNames.value = filteredAssets.map(asset => asset.assetName);
};

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

// Add asset to project
const addAsset = () => {
  if (!selectedAssetType.value || !selectedAssetName.value) {
    toast.error('Pilih tipe dan nama aset terlebih dahulu');
    return;
  }
  
  const selectedAsset = assets.value.find(
    asset => asset.assetType === selectedAssetType.value && 
    asset.assetName === selectedAssetName.value
  );
  
  if (!selectedAsset) {
    toast.error('Aset tidak ditemukan');
    return;
  }
  
  if (assetList.value.some(asset => asset.id === selectedAsset.id)) {
    toast.error('Aset sudah ditambahkan');
    return;
  }
  
  // Add asset to list with costs
  assetList.value.push({
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
};

// Remove asset from list
const removeAsset = (index: number) => {
  assetList.value.splice(index, 1);
  updateFormData();
};

// Update form data with current asset list
const updateFormData = () => {
  formData.value.projectTotalPengeluaran = totalExpenses.value;
  formData.value.projectUseAsset = assetList.value.map(asset => ({
    id: asset.id,
    platNomor: asset.platNomor || asset.name,
    assetUseCost: asset.shippingCost || 0,
    assetFuelCost: asset.fuelCost || 0,
    tipeAset: asset.type
  }));
  
  // Store form data in localStorage for summary page
  localStorage.setItem('distributionFormData', JSON.stringify(formData.value));
  localStorage.setItem('distributionAssetList', JSON.stringify(assetList.value));
  localStorage.setItem('clientList', JSON.stringify(clients.value));
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
  
  if (assetList.value.length === 0) {
    toast.error('Minimal satu aset harus ditambahkan');
    return;
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
        // We'll need to fetch full asset details to reconstruct assetList
        // This is simplified for now
      }
    } catch (error) {
      console.error('Error parsing saved form data:', error);
    }
  }
});
</script> 