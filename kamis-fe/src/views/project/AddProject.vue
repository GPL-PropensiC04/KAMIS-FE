<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import axios from "axios";
import { API_URLS } from '@/config/api.config';
import Breadcrumb from '@/components/Breadcrumb.vue';
import VDropDownInput from "@/components/VDropDownInput.vue";
import VNumberInput from "@/components/VNumberInput.vue";
import VPriceInput from "@/components/VPriceInput.vue";
import VButton from "@/components/VButton.vue";
import VSuccessButton from "@/components/VSuccessButton.vue";
import type { AssetInterface, ProjectAssetInterface, ClientInterface, ProjectDraftInterface } from "@/interfaces/project/projectAsset.interface";

// Router & Store
const router = useRouter();
const route = useRoute();
const toast = useToast();

// Project draft data
const draftProject = ref<ProjectDraftInterface>({
  projectName: "",
  projectClientId: "",
  projectType: computed(() => route.query.type === "Distribusi") as unknown as boolean,
  projectStartDate: "",
  projectEndDate: "",
  assets: [],
  totalPemasukkan: 0,
  phlCount: 0,
  phlWage: 0,
  pickupAddress: "",
  deliveryAddress: ""
});

// Display data
const projectType = computed(() => draftProject.value.projectType ? "Distribusi" : "Penjualan");
const clients = ref<ClientInterface[]>([]);
const selectedClient = ref("");

// For asset table
const assets = ref<AssetInterface[]>([]);
const assetList = ref<ProjectAssetInterface[]>([]); // Assets added to project
const assetTypes = ref<string[]>([]);
const selectedAssetType = ref("");
const selectedAssetName = ref("");
const assetNames = ref<string[]>([]);
const fuelCost = ref(0);
const shippingCost = ref(0);

// Fetch clients from API
const fetchClients = async () => {
  try {
    const response = await axios.get(`${API_URLS.PROFILE}/client/all`, {
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    clients.value = response.data.data.map((client: {id: string; nameClient: string}) => ({
      id: client.id,
      name: client.nameClient
    }));
  } catch (error) {
    console.error("Error fetching clients:", error);
    toast.error("Gagal mengambil data klien");
  }
};

// Fetch assets from API
const fetchAssets = async () => {
  try {
    const response = await axios.get(`${API_URLS.ASSET}/asset/all`, {
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    assets.value = response.data.data || [];
    
    // Extract unique asset types
    const types = new Set(assets.value.map(asset => asset.assetType));
    assetTypes.value = Array.from(types) as string[];
  } catch (error) {
    console.error("Error fetching assets:", error);
    toast.error("Gagal mengambil data aset");
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

// Watch for asset type changes
watch(selectedAssetType, updateAssetNames);

// Format currency
const formatCurrency = (value: number): string => {
  return `Rp ${value.toLocaleString("id-ID")},00`;
};

// Add asset to project
const addAsset = () => {
  if (!selectedAssetType.value || !selectedAssetName.value) {
    toast.error("Pilih tipe dan nama aset terlebih dahulu");
    return;
  }
  
  const selectedAsset = assets.value.find(
    asset => asset.assetType === selectedAssetType.value && 
    asset.assetName === selectedAssetName.value
  );
  
  if (!selectedAsset) {
    toast.error("Aset tidak ditemukan");
    return;
  }
  
  if (assetList.value.some(asset => asset.id === selectedAsset.id)) {
    toast.error("Aset sudah ditambahkan");
    return;
  }
  
  // Add asset to list with costs
  assetList.value.push({
    id: selectedAsset.id,
    type: selectedAsset.assetType,
    name: selectedAsset.assetName,
    fuelCost: fuelCost.value,
    shippingCost: shippingCost.value,
    usageCost: selectedAsset.assetUsageCost || 0,
    totalCost: (selectedAsset.assetUsageCost || 0) + fuelCost.value + shippingCost.value
  });
  
  // Reset fields
  selectedAssetType.value = "";
  selectedAssetName.value = "";
  fuelCost.value = 0;
  shippingCost.value = 0;
  
  // Update draft
  updateDraftProject();
};

// Remove asset from list
const removeAsset = (index: number): void => {
  assetList.value.splice(index, 1);
  updateDraftProject();
};

// Calculate total cost
const totalAssetCost = computed(() => {
  return assetList.value.reduce((sum, asset) => sum + asset.totalCost, 0);
});

// Calculate total PHL cost
const totalPhlCost = computed(() => {
  return draftProject.value.phlCount * draftProject.value.phlWage;
});

// Calculate total expenses
const totalExpenses = computed(() => {
  return totalAssetCost.value + totalPhlCost.value;
});

// Update draft project in store
const updateDraftProject = (): void => {
  draftProject.value.assets = assetList.value;
  
  // Save to localStorage to persist during refresh
  localStorage.setItem("draftProject", JSON.stringify(draftProject.value));
};

// Handle client selection
const handleClientSelect = (clientName: string): void => {
  const selected = clients.value.find(c => c.name === clientName);
  if (selected) {
    draftProject.value.projectClientId = selected.id;
  }
};

// Save project and navigate to summary
const saveAndContinue = (): void => {
  // Validation
  if (!draftProject.value.projectName) {
    toast.error("Nama aktivitas harus diisi");
    return;
  }
  
  if (!draftProject.value.projectClientId) {
    toast.error("Klien harus dipilih");
    return;
  }
  
  if (!draftProject.value.projectStartDate) {
    toast.error("Tanggal mulai harus diisi");
    return;
  }
  
  if (draftProject.value.projectType && assetList.value.length === 0) {
    toast.error("Minimal satu aset harus ditambahkan untuk proyek distribusi");
    return;
  }
  
  // Update draft and proceed to summary
  updateDraftProject();
  router.push("/project/add/summary");
};

// Initialize
onMounted(() => {
  fetchClients();
  fetchAssets();
  
  // Load saved draft if exists
  const savedDraft = localStorage.getItem("draftProject");
  if (savedDraft) {
    const parsed = JSON.parse(savedDraft);
    draftProject.value = {
      ...draftProject.value,
      ...parsed
    };
    assetList.value = parsed.assets || [];
  }
});
</script>

<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <!-- Back button and next button -->
      <div class="flex justify-between mb-6">
        <button @click="router.back()" class="text-black hover:underline flex items-center text-[28px]">
          ←
        </button>
        <VSuccessButton label="Selanjutnya" @click="saveAndContinue" />
      </div>
      
      <!-- Main form -->
      <div class="grid grid-cols-2 gap-6">
        <!-- Left column -->
        <div>
          <div class="mb-4">
            <label class="block text-black mb-1 font-bold text-lg">Nama Aktivitas</label>
            <input 
              v-model="draftProject.projectName"
              type="text" 
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              placeholder="Masukkan nama aktivitas"
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-black mb-1 font-bold text-lg">Klien</label>
            <VDropDownInput 
              v-model="selectedClient"
              :options="clients.map(c => c.name)"
              @update:modelValue="handleClientSelect"
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-black mb-1 font-bold text-lg">Alamat Pengambilan</label>
            <div class="relative">
              <input 
                v-model="draftProject.pickupAddress"
                type="text" 
                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                placeholder="Masukkan alamat pengambilan"
              />
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-black mb-1 font-bold text-lg">Jumlah PHL Dipekerjakan</label>
            <div class="flex items-center gap-2">
              <VNumberInput 
                v-model="draftProject.phlCount"
                :min="0"
                class="w-8"
              />
              <span>Orang x upah sebesar</span>
              <VPriceInput 
                v-model="draftProject.phlWage"
                :min="0"
                class="flex-1"
              />
            </div>
          </div>
        </div>
        
        <!-- Right column -->
        <div>
          <div class="mb-4">
            <label class="block text-black mb-1 font-bold text-lg">Jenis Aktivitas</label>
            <div class="bg-gray-200 px-3 py-2 rounded-md">
              {{ projectType }}
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-black mb-1 font-bold text-lg">Tanggal Aktivitas</label>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <input 
                  v-model="draftProject.projectStartDate"
                  type="date" 
                  class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                />
              </div>
              <div>
                <input 
                  v-model="draftProject.projectEndDate"
                  type="date" 
                  class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                />
              </div>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-black mb-1 font-bold text-lg">Alamat Pengiriman</label>
            <input 
              v-model="draftProject.deliveryAddress"
              type="text" 
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              placeholder="Masukkan alamat pengiriman"
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-black mb-1 font-bold text-lg">Total Pemasukan</label>
            <VPriceInput 
              v-model="draftProject.totalPemasukkan"
              :min="0"
              class="w-full"
            />
          </div>
        </div>
      </div>
      
      <!-- Asset Section (only for Distribusi) -->
      <div v-if="draftProject.projectType" class="mt-8">
        <h2 class="text-xl font-bold mb-4">Aset yang digunakan</h2>
        
        <div class="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 mb-4">
          <div>
            <label class="block text-black mb-1 font-bold">Jenis Aset</label>
            <VDropDownInput 
              v-model="selectedAssetType"
              :options="assetTypes"
            />
          </div>
          <div>
            <label class="block text-black mb-1 font-bold">Nama Aset</label>
            <VDropDownInput 
              v-model="selectedAssetName"
              :options="assetNames"
            />
          </div>
          <div>
            <label class="block text-black mb-1 font-bold">Biaya Bensin</label>
            <VPriceInput 
              v-model="fuelCost"
              :min="0"
            />
          </div>
          <div>
            <label class="block text-black mb-1 font-bold">Ongkos Kirim</label>
            <VPriceInput 
              v-model="shippingCost"
              :min="0"
            />
          </div>
          <div class="flex items-end">
            <VButton label="Tambah" @click="addAsset" />
          </div>
        </div>
        
        <!-- Asset Table -->
        <div class="overflow-x-auto mt-4">
          <table class="w-full border-collapse">
            <thead class="bg-[#1E3A5F] text-white">
              <tr>
                <th class="p-2 text-left">Jenis Aset</th>
                <th class="p-2 text-left">Nama Aset</th>
                <th class="p-2 text-right">Biaya Pakai</th>
                <th class="p-2 text-right">Biaya Bensin</th>
                <th class="p-2 text-right">Ongkos Kirim</th>
                <th class="p-2 text-right">Total Biaya</th>
                <th class="p-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(asset, index) in assetList" :key="index" class="border-b">
                <td class="p-2">{{ asset.type }}</td>
                <td class="p-2">{{ asset.name }}</td>
                <td class="p-2 text-right">{{ formatCurrency(asset.usageCost) }}</td>
                <td class="p-2 text-right">{{ formatCurrency(asset.fuelCost) }}</td>
                <td class="p-2 text-right">{{ formatCurrency(asset.shippingCost) }}</td>
                <td class="p-2 text-right font-bold">{{ formatCurrency(asset.totalCost) }}</td>
                <td class="p-2 text-center">
                  <button @click="removeAsset(index)" class="text-red-500 hover:text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
              <!-- Empty state -->
              <tr v-if="assetList.length === 0">
                <td colspan="7" class="p-4 text-center text-gray-500">
                  Belum ada aset yang ditambahkan
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Total costs -->
        <div class="mt-4 flex flex-col items-end">
          <div class="text-right mb-1">
            <span class="font-bold">Total Biaya Aset:</span> 
            <span>{{ formatCurrency(totalAssetCost) }}</span>
          </div>
          <div class="text-right mb-1">
            <span class="font-bold">Total Biaya PHL:</span> 
            <span>{{ formatCurrency(totalPhlCost) }}</span>
          </div>
          <div class="text-right font-bold text-lg">
            <span>Total Pengeluaran:</span> 
            <span>{{ formatCurrency(totalExpenses) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="date"] {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  background-position: right center;
  background-size: 1.2em;
  cursor: pointer;
}
</style> 