<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import axios from 'axios';
import { API_URLS } from '@/config/api.config';
import type { UpdateProjectFormData, ProjectInterface } from '@/interfaces/project/project.interface';
import Breadcrumb from '@/components/Breadcrumb.vue';
import VLockedInput from '@/components/VLockedInput.vue';
import VTextBox from '@/components/VTextBox.vue';
import VPriceInput from '@/components/VPriceInput.vue';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import { useProjectStore } from '@/stores/project';
import { useAssetStore } from '@/stores/assetReservability';
import type { ProjectAsset, AvailableAsset } from '@/interfaces/project/project.interface';
import type { ClientInterface } from '@/interfaces/profile/client.interface';

// Router & Toast
const router = useRouter();
const route = useRoute();
const toast = useToast();
const projectId = route.params.id as string;
const projectStore = useProjectStore();
const assetStore = useAssetStore();

// Form data
const formData = ref<UpdateProjectFormData | null>(null);
const isLoading = ref(true);

const clients = ref<ClientInterface[]>([]);

const assets = ref<AvailableAsset[]>([]);
const selectedAssetList = ref<ProjectAsset[]>([]);
const assetTypes = ref<string[]>([]);
const selectedAssetType = ref('');
const selectedAssetName = ref('');
const assetNames = ref<string[]>([]);
const fuelCost = ref(0);
const shippingCost = ref(0);

// Add a new state variable to track available assets
const availableAssets = ref<AvailableAsset[]>([]);
const datesSelected = ref(false);
const loadingAssets = ref(false);
// Add a flag to track if availability check has run
const availabilityChecked = ref(false);

// Helper functions
const formatStatus = (status: number): string => {
  switch (status) {
    case 0: return 'Direncanakan';
    case 1: return 'Dalam Pengiriman';
    case 2: return 'Selesai';
    case 3: return 'Dibatalkan';
    default: return 'Unknown';
  }
};

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

// Computed values
const totalAssetCost = computed(() => {
  return selectedAssetList.value.reduce((sum, asset) => sum + asset.totalCost, 0);
});

const totalPhlCost = computed(() => {
  if (!formData.value) return 0;
  return (formData.value.projectPHLCount || 0) * (formData.value.projectPHLPay || 0);
});

const totalExpenses = computed(() => {
  return totalAssetCost.value + totalPhlCost.value;
});

// Add new methods for handling date input
const handleStartDateInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target) {
    formData.value!.projectStartDate = target.value;
  }
};

const handleEndDateInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target) {
    formData.value!.projectEndDate = target.value;
  }
};

// Fetch project details
const fetchProjectDetails = async () => {
  isLoading.value = true;
  try {
    const projectData = await projectStore.fetchProjectById(projectId) as ProjectInterface;
    
    // Check if this is a distribution project
    if (!projectData.projectType) {
      toast.error('Halaman ini hanya untuk proyek distribusi.');
      router.push('/project');
      return;
    }
    
    // Format the dates to YYYY-MM-DD with timezone-safe parsing
    let formattedStartDate = '';
    if (projectData.projectStartDate) {
      try {
        // Extract just the date part to avoid timezone issues
        const dateStr = projectData.projectStartDate.split('T')[0];
        formattedStartDate = dateStr;
      } catch {
        console.error('Invalid start date:', projectData.projectStartDate);
      }
    }
    
    let formattedEndDate = '';
    if (projectData.projectEndDate) {
      try {
        // Extract just the date part to avoid timezone issues
        const dateStr = projectData.projectEndDate.split('T')[0];
        formattedEndDate = dateStr;
      } catch {
        console.error('Invalid end date:', projectData.projectEndDate);
      }
    }
    
    formData.value = {
      id: projectData.id,
      projectName: projectData.projectName,
      projectClientId: projectData.projectClientId,
      projectType: projectData.projectType,
      projectStatus: projectData.projectStatus,
      projectStartDate: formattedStartDate,
      projectEndDate: formattedEndDate,
      projectPHLCount: projectData.projectPHLCount || 0,
      projectPHLPay: projectData.projectPHLPay || 0,
      projectPickupAddress: projectData.projectPickupAddress || '',
      projectDeliveryAddress: projectData.projectDeliveryAddress || '',
      projectTotalPemasukkan: projectData.projectTotalPemasukkan || 0,
      projectTotalPengeluaran: projectData.projectTotalPengeluaran || 0,
      projectUseAsset: projectData.projectUseAsset || []
    };
    
    // Load related data
    await loadAssetData();
    
    isLoading.value = false;
  } catch (error) {
    console.error('Error fetching project details:', error);
    toast.error('Gagal mengambil detail proyek');
    isLoading.value = false;
    router.push('/project');
  }
};

// Fetch clients
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
      nameClient: client.nameClient
    }));
  } catch (error) {
    console.error('Error fetching clients:', error);
    toast.error('Gagal mengambil data klien');
  }
};

// Load asset data
const loadAssetData = async () => {
  if (!formData.value || !formData.value.projectUseAsset) return;
  
  try {
    // Fetch all assets
    await fetchAssets();
    
    // Process project assets
    selectedAssetList.value = [];
    
    for (const assetData of formData.value.projectUseAsset) {
      // Find the asset details
      const asset = assets.value.find(a => a.platNomor === assetData.platNomor);
      
      if (asset) {
        selectedAssetList.value.push({
          id: asset.id,
          type: asset.assetType,
          name: asset.assetName,
          fuelCost: assetData.assetFuelCost || 0,
          shippingCost: 0, // This is typically part of the overall usage cost
          usageCost: assetData.assetUseCost || 0,
          totalCost: (assetData.assetUseCost || 0) + (assetData.assetFuelCost || 0),
          platNomor: asset.platNomor
        });
      }
    }
    
    // Update the total expenses calculation after loading assets
    if (formData.value) {
      formData.value.projectTotalPengeluaran = totalExpenses.value;
    }
  } catch (error) {
    console.error('Error loading asset data:', error);
    toast.error('Gagal memuat data aset');
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
  if (!formData.value?.projectStartDate || !formData.value?.projectEndDate) {
    toast.error('Tanggal mulai dan selesai proyek harus diisi terlebih dahulu');
    return;
  }

  // If already checking or has been checked, don't run again
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
      excludeProjectId: formData.value.id // Exclude this project's own reservations
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

const onAssetTypeChange = (newAssetType: string) => {
  selectedAssetType.value = newAssetType;
  // Reset selected asset name when asset type changes
  selectedAssetName.value = '';
  updateAssetNames();
};

// Replace updateAssetNames with a version that filters from available assets
const updateAssetNames = () => {
  if (!selectedAssetType.value) {
    assetNames.value = [];
    selectedAssetName.value = '';
    return;
  }
  
  const filteredAssets = availableAssets.value.filter(asset => 
    asset.assetType === selectedAssetType.value &&
    !selectedAssetList.value.some(a => a.id === asset.id)
  );
  
  assetNames.value = filteredAssets.map(asset => asset.assetName);
  selectedAssetName.value = '';
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

// Update form data with current lists
const updateFormData = () => {
  if (!formData.value) return;

  formData.value.projectTotalPengeluaran = totalExpenses.value;
  formData.value.projectUseAsset = selectedAssetList.value.map(asset => ({
    id: asset.id,
    platNomor: asset.platNomor || '',
    assetUseCost: asset.shippingCost,
    assetFuelCost: asset.fuelCost,
    tipeAset: asset.type
  }));
};

// Form submission
const submitForm = async () => {
  if (!formData.value) return;
  
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
  
  if (formData.value.projectStatus === 0 && selectedAssetList.value.length === 0) {
    toast.error('Minimal satu aset harus ditambahkan');
    return;
  }

  if (formData.value.projectEndDate && formData.value.projectStartDate && formData.value.projectEndDate < formData.value.projectStartDate) {
    toast.error('Tanggal akhir harus lebih dari tanggal mulai');
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
    await axios.put(
      `${API_URLS.PROJECT}/project/update/${formData.value.id}`,
      formData.value,
      {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      }
    );
    
    toast.success('Proyek berhasil diperbarui');
    // Redirect to project detail page
    router.push(`/project/distribution/${formData.value.id}`);
  } catch (error) {
    console.error('Error updating project:', error);
    toast.error('Gagal memperbarui proyek');
  }
};

// Update our watch section to automatically check asset availability
watch(selectedAssetType, updateAssetNames);

// Watch for date changes to automatically check asset availability
watch(
  [() => formData.value?.projectStartDate, () => formData.value?.projectEndDate],
  async ([newStartDate, newEndDate]) => {
    if (newStartDate && newEndDate) {
      // Reset the check flag when dates change
      availabilityChecked.value = false;
      await checkAvailableAssets();
    }
  }
);

// Load data on component mount
onMounted(async () => {
  await fetchProjectDetails();
  await fetchAssets();
  await fetchClients();
  
  // If project has dates, set datesSelected to true
  if (formData.value?.projectStartDate && formData.value?.projectEndDate) {
    // Set availableAssets to include both currently selected assets and available ones
    availableAssets.value = [...assets.value]; // Start with all assets
    datesSelected.value = true;
    
    // We don't need to call checkAvailableAssets here - the watcher will handle it
    // This prevents the double check
  }
});
</script> 

<template>
  <Breadcrumb/>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="max-w-full mx-auto px-6 py-8">
      <!-- Header Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
        <div class="bg-[#1E3A5F] px-8 py-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <router-link to="/project" class="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white hover:scale-105 transform">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </router-link>
              <div>
                <h1 class="text-2xl font-bold text-white">Update Aktivitas Distribusi</h1>
                <p class="text-blue-100 mt-1">Perbarui informasi aktivitas distribusi</p>
              </div>
            </div>

            <button 
              @click="submitForm" 
              :disabled="formData?.projectStatus === 2"
              class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
              </svg>
              <span>Update</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Project Status Banner -->
      <div v-if="formData" class="mb-8 rounded-xl overflow-hidden shadow-sm border" :class="{
        'bg-blue-50 border-blue-200': formData.projectStatus === 0,
        'bg-yellow-50 border-yellow-200': formData.projectStatus === 1,
        'bg-green-50 border-green-200': formData.projectStatus === 2,
        'bg-purple-50 border-purple-200': formData.projectStatus === 3
      }">
        <div class="px-8 py-6 text-center">
          <div class="flex items-center justify-center space-x-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-lg" :class="{
              'bg-blue-100': formData.projectStatus === 0,
              'bg-yellow-100': formData.projectStatus === 1,
              'bg-green-100': formData.projectStatus === 2,
              'bg-purple-100': formData.projectStatus === 3
            }">
              <svg class="w-5 h-5" :class="{
                'text-blue-600': formData.projectStatus === 0,
                'text-yellow-600': formData.projectStatus === 1,
                'text-green-600': formData.projectStatus === 2,
                'text-purple-600': formData.projectStatus === 3
              }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p class="text-lg font-bold" :class="{
                'text-blue-800': formData.projectStatus === 0,
                'text-yellow-800': formData.projectStatus === 1,
                'text-green-800': formData.projectStatus === 2,
                'text-purple-800': formData.projectStatus === 3
              }">Status Proyek: {{ formatStatus(formData.projectStatus) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Form Card -->
      <div v-if="formData" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div class="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-800">Informasi Aktivitas</h2>
          </div>
        </div>

        <div class="p-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Left Column -->
            <div class="space-y-6">
              <!-- Nama Aktivitas -->
              <div class="group">
                <label class="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                  <span>Nama Aktivitas</span>
                  <span class="text-red-500">*</span>
                </label>
                <VLockedInput :value="formData.projectName" />
              </div>

              <!-- Klien -->
              <div class="group">
                <label class="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0v-2a2 2 0 00-2-2H7a2 2 0 00-2 2v2"></path>
                  </svg>
                  <span>Klien</span>
                  <span class="text-red-500">*</span>
                </label>
                <VLockedInput :value="clients.find(client => client.id === formData?.projectClientId)?.nameClient || 'Pilih Klien'" />
              </div>

              <!-- Alamat Pengambilan -->
              <div class="group">
                <label class="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span>Alamat Pengambilan</span>
                </label>
                <VTextBox
                  v-model="formData.projectPickupAddress"
                  placeholder="Masukkan alamat pengambilan barang"
                  :disabled="formData.projectStatus >= 1"
                />
              </div>

              <!-- Jumlah PHL -->
              <div class="group">
                <label class="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span>Tenaga Kerja (PHL)</span>
                </label>
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4" :class="{ 'bg-gray-100': formData.projectStatus >= 2 }">
                  <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                    <div class="flex items-center space-x-3">
                      <input 
                        v-model.number="formData.projectPHLCount"
                        type="number" 
                        min="0"
                        class="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        :class="{ 'bg-gray-100 text-gray-600': formData.projectStatus >= 2 }"
                        :disabled="formData.projectStatus >= 2"
                      />
                      <span class="text-gray-600 font-medium">orang</span>
                    </div>
                    <span class="text-gray-500">×</span>
                    <div class="flex items-center space-x-2">
                      <span class="text-gray-600">upah</span>
                      <input 
                        v-model.number="formData.projectPHLPay"
                        type="number" 
                        min="0"
                        class="w-32 px-3 py-2 border border-gray-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        :class="{ 'bg-gray-100 text-gray-600': formData.projectStatus >= 2 }"
                        placeholder="0"
                        :disabled="formData.projectStatus >= 2"
                      />
                      <span class="text-gray-600">/orang</span>
                    </div>
                  </div>
                  <div class="mt-3 pt-3 border-t border-gray-300">
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600">Total Biaya PHL:</span>
                      <span class="text-lg font-bold text-gray-800">{{ formatCurrency(totalPhlCost) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
              <!-- Jenis Aktivitas -->
              <div class="group">
                <label class="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                  <span>Jenis Aktivitas</span>
                </label>
                <VLockedInput value="Distribusi" />
              </div>

              <!-- Tanggal Aktivitas -->
              <div class="group">
                <label class="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"></path>
                  </svg>
                  <span>Tanggal Aktivitas</span>
                  <span class="text-red-500">*</span>
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-2">Tanggal Mulai</label>
                    <input 
                      :value="formData.projectStartDate"
                      @input="handleStartDateInput($event)"
                      type="date" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      :class="{ 'bg-gray-100 text-gray-600': formData.projectStatus >= 1 }"
                      :disabled="formData.projectStatus >= 1"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-2">Tanggal Selesai</label>
                    <input 
                      :value="formData.projectEndDate"
                      @input="handleEndDateInput($event)"
                      type="date" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      :class="{ 'bg-gray-100 text-gray-600': formData.projectStatus >= 2 }"
                      :disabled="formData.projectStatus >= 2"
                    />
                  </div>
                </div>
              </div>

              <!-- Alamat Pengiriman -->
              <div class="group">
                <label class="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                  <span>Alamat Pengiriman</span>
                </label>
                <VTextBox 
                  v-model="formData.projectDeliveryAddress"
                  placeholder="Masukkan alamat tujuan pengiriman"
                  :disabled="formData.projectStatus >= 1"
                />
              </div>

              <!-- Total Pemasukan -->
              <div class="group">
                <label class="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                  <span>Total Pemasukan</span>
                </label>
                <div class="relative">
                  <VPriceInput 
                    v-model.number="formData.projectTotalPemasukkan"
                    type="number"
                    placeholder="0"
                    :disabled="formData.projectStatus >= 1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Assets Section -->
      <div v-if="formData" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="bg-[#1E3A5F] px-8 py-5">
          <div class="flex items-center space-x-3">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0v-2a2 2 0 00-2-2H7a2 2 0 00-2 2v2"></path>
            </svg>
            <h2 class="text-xl font-bold text-white">Aset yang Digunakan</h2>
          </div>
        </div>

        <div class="p-8">
          <!-- Asset Selection Form -->
          <div v-if="formData.projectStatus < 1" class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <!-- Jenis Aset -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Jenis Aset</label>
                <SearchableDropdown
                  v-model="selectedAssetType"
                  :options="assetTypes"
                  :placeholder="datesSelected ? 'Pilih atau ketik jenis aset...' : 'Pilih tanggal terlebih dahulu'"
                  :disabled="!datesSelected"
                  @update:modelValue="onAssetTypeChange"
                />
              </div>
              
              <!-- Nama Aset -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Nama Aset</label>
                <SearchableDropdown
                  v-model="selectedAssetName"
                  :options="assetNames"
                  :placeholder="!datesSelected ? 'Pilih tanggal terlebih dahulu' : !selectedAssetType ? 'Pilih jenis aset terlebih dahulu' : 'Pilih atau ketik nama aset...'"
                  :disabled="!datesSelected || !selectedAssetType"
                />
              </div>
              
              <!-- Biaya Bensin -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Biaya Bensin</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 text-sm">Rp</span>
                  </div>
                  <input 
                    v-model.number="fuelCost"
                    type="number"
                    min="0"
                    class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    :class="{ 'bg-gray-100': !datesSelected || !selectedAssetName }"
                    placeholder="0"
                    :disabled="!datesSelected || !selectedAssetName"
                  />
                </div>
              </div>
              
              <!-- Ongkos Kirim -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Ongkos Kirim</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 text-sm">Rp</span>
                  </div>
                  <input 
                    v-model.number="shippingCost"
                    type="number"
                    min="0"
                    class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    :class="{ 'bg-gray-100': !datesSelected || !selectedAssetName }"
                    placeholder="0"
                    :disabled="!datesSelected || !selectedAssetName"
                  />
                </div>
              </div>
              
              <!-- Add Button -->
              <div class="flex items-end">
                <button 
                  @click="addAsset"
                  class="w-full px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#152c49] text-white rounded-lg transition-colors duration-200 font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="!datesSelected || !selectedAssetName"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  <span>Tambah</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Asset Availability Warning -->
          <div v-if="datesSelected && availableAssets.length === 0" 
               class="mb-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <div>
                <p class="font-medium text-amber-800">Tidak ada aset tersedia</p>
                <p class="text-sm text-amber-700">Tidak ada aset yang tersedia untuk periode waktu yang dipilih. Silakan pilih tanggal lain.</p>
              </div>
            </div>
          </div>

          <!-- Assets Table with Loading Overlay -->
          <div class="relative">
            <!-- Loading Overlay -->
            <div v-if="loadingAssets" class="absolute inset-0 bg-white bg-opacity-90 z-10 flex items-center justify-center rounded-xl backdrop-filter backdrop-blur-sm">
              <div class="flex flex-col items-center p-6 bg-white bg-opacity-95 rounded-xl shadow-lg border border-gray-200">
                <svg class="animate-spin h-8 w-8 text-blue-600 mb-3" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-blue-700 font-medium text-sm">Memeriksa ketersediaan aset...</span>
              </div>
            </div>
            
            <!-- Assets Table -->
            <div class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="bg-[#1E3A5F] text-white">
                      <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider rounded-tl-lg">
                        <div class="flex items-center space-x-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0v-2a2 2 0 00-2-2H7a2 2 0 00-2 2v2"></path>
                          </svg>
                          <span>Jenis Aset</span>
                        </div>
                      </th>
                      <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                        <div class="flex items-center space-x-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                          </svg>
                          <span>Nama Aset</span>
                        </div>
                      </th>
                      <th class="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">
                        <div class="flex items-center justify-end space-x-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                          </svg>
                          <span>Biaya Pakai</span>
                        </div>
                      </th>
                      <th v-if="formData.projectStatus < 1" class="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider rounded-tr-lg">
                        <div class="flex items-center justify-center space-x-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                          </svg>
                          <span>Aksi</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="(asset, index) in selectedAssetList" :key="index" class="hover:bg-blue-50 transition-colors duration-150">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center space-x-3">
                          <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0v-2a2 2 0 00-2-2H7a2 2 0 00-2 2v2"></path>
                            </svg>
                          </div>
                          <span class="text-sm font-medium text-gray-900">{{ asset.type }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-sm font-medium text-gray-900">{{ asset.name }}</span>
                      </td>
                      <td class="px-6 py-4 text-right whitespace-nowrap">
                        <span class="text-sm font-bold text-gray-900">{{ formatCurrency(asset.totalCost) }}</span>
                      </td>
                      <td v-if="formData.projectStatus < 1" class="px-6 py-4 text-center whitespace-nowrap">
                        <button 
                          @click="removeAsset(index)"
                          class="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Hapus aset"
                        >
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                    <tr v-if="selectedAssetList.length === 0">
                      <td :colspan="formData.projectStatus < 1 ? 4 : 3" class="px-6 py-12 text-center">
                        <div class="flex flex-col items-center space-y-3">
                          <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                          </svg>
                          <div class="text-center">
                            <h3 class="text-sm font-medium text-gray-700 mb-1">Belum ada aset yang ditambahkan</h3>
                            <p class="text-xs text-gray-500">Pilih tanggal aktivitas terlebih dahulu untuk melihat aset yang tersedia</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot v-if="selectedAssetList.length > 0" class="bg-gray-50">
                    <tr>
                      <td :colspan="formData.projectStatus < 1 ? 2 : 2" class="px-6 py-4 text-right font-semibold text-gray-700">Total Biaya Aset:</td>
                      <td class="px-6 py-4 text-right font-bold text-lg text-gray-900">{{ formatCurrency(totalAssetCost) }}</td>
                      <td v-if="formData.projectStatus < 1"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Section -->
      <div v-if="formData" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div class="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
              <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800">Ringkasan Biaya</h3>
          </div>
        </div>

        <div class="p-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Biaya PHL -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div class="flex items-center space-x-3 mb-3">
                <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-blue-700">Biaya Tenaga Kerja</p>
                  <p class="text-xs text-blue-600">{{ formData.projectPHLCount }} orang x {{ formatCurrency(formData.projectPHLPay || 0) }}</p>
                </div>
              </div>
              <p class="text-2xl font-bold text-blue-800">{{ formatCurrency(totalPhlCost) }}</p>
            </div>

            <!-- Biaya Aset -->
            <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <div class="flex items-center space-x-3 mb-3">
                <div class="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0v-2a2 2 0 00-2-2H7a2 2 0 00-2 2v2"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-purple-700">Biaya Aset</p>
                  <p class="text-xs text-purple-600">{{ selectedAssetList.length }} aset digunakan</p>
                </div>
              </div>
              <p class="text-2xl font-bold text-purple-800">{{ formatCurrency(totalAssetCost) }}</p>
            </div>

            <!-- Total Pengeluaran -->
            <div class="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
              <div class="flex items-center space-x-3 mb-3">
                <div class="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-red-700">Total Pengeluaran</p>
                  <p class="text-xs text-red-600">PHL + Aset</p>
                </div>
              </div>
              <p class="text-2xl font-bold text-red-800">{{ formatCurrency(totalExpenses) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700&display=swap');

* {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Custom animations */
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.grid > div {
    animation: slideIn 0.3s ease-out;
}

/* Smooth transitions */
button, input, textarea, select {
    transition: all 0.2s ease;
}

/* Input focus effects */
input:focus, select:focus, textarea:focus {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* Button hover effects */
button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Custom scrollbar */
.overflow-x-auto::-webkit-scrollbar {
    height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

/* Loading animation */
@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Responsive design */
@media (max-width: 1024px) {
    .grid-cols-1.lg\\:grid-cols-2 {
        grid-template-columns: 1fr;
    }
    
    .grid-cols-1.lg\\:grid-cols-5 {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .grid-cols-1.md\\:grid-cols-2,
    .grid-cols-1.md\\:grid-cols-3,
    .grid-cols-1.md\\:grid-cols-5 {
        grid-template-columns: 1fr;
    }
    
    .px-8 {
        padding-left: 1rem;
        padding-right: 1rem;
    }
    
    .py-8 {
        padding-top: 1.5rem;
        padding-bottom: 1.5rem;
    }
    
    .space-x-4 > * + * {
        margin-left: 0;
        margin-top: 1rem;
    }
    
    .flex-col {
        flex-direction: column;
    }
}

@media (max-width: 640px) {
    .text-2xl {
        font-size: 1.25rem;
        line-height: 1.75rem;
    }
    
    .text-xl {
        font-size: 1.125rem;
        line-height: 1.75rem;
    }
    
    .px-6 {
        padding-left: 0.75rem;
        padding-right: 0.75rem;
    }
    
    .py-6 {
        padding-top: 1rem;
        padding-bottom: 1rem;
    }
}

/* Modern gradient overlays */
.bg-gradient-to-br {
    background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

.bg-gradient-to-r {
    background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

/* Focus ring improvements */
.focus\\:ring-2:focus {
    ring-width: 2px;
    ring-color: rgb(59 130 246 / 0.5);
}

/* Disabled state improvements */
.disabled\\:opacity-50:disabled {
    opacity: 0.5;
}

.disabled\\:cursor-not-allowed:disabled {
    cursor: not-allowed;
}

/* Modern shadow effects */
.shadow-sm {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.shadow-lg {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-xl {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Backdrop filter support */
.backdrop-filter {
    backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
}

.backdrop-blur-sm {
    --tw-backdrop-blur: blur(4px);
}
</style>