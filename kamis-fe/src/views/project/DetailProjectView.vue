<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <!-- Back Button -->
    <div class="mb-4 flex justify-between items-center">
      <router-link to="/project" class="text-[#1E3A5F] hover:text-[#1a325a] text-2xl flex items-center">
        <span>←</span>
      </router-link>
      
      <!-- Action buttons - only shown for Operasional role and distribution projects -->
      <div v-if="canEditProject && projectData.projectType === true" class="flex gap-2">
        <VCancelButton 
          label="Batal"
          @click="cancelProject" 
        />
        <VSuccessButton 
          label="Update"
          @click="updateProject"
        />
      </div>
    </div>

    <div v-if="isLoading" class="bg-[#E5EAF2] rounded-lg shadow-md p-8 text-center">
      <p>Memuat data...</p>
    </div>

    <div v-else-if="error" class="bg-[#E5EAF2] rounded-lg shadow-md p-8 text-center">
      <p class="text-red-500">{{ error }}</p>
      <button 
        @click="loadData" 
        class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        Coba Lagi
      </button>
    </div>

    <template v-else>
      <!-- Distribution Details Section -->
      <div v-if="projectData.projectType === true" class="space-y-6">
        <!-- Header with Edit button -->
        <div class="bg-[#E5EAF2] rounded-lg shadow-md overflow-hidden">
          <div class="bg-[#1E3A5F] p-4 flex justify-between items-center">
            <h2 class="text-xl font-bold text-white">Informasi Distribusi - {{ projectData.id }}</h2>
            <!-- Edit button for Operasional role -->
            <VSuccessButton
              v-if="canEditProject"
              label="Ubah"
              @click="editDistributionInfo"
            />
          </div>

          <!-- Basic Info -->
          <div class="grid grid-cols-3 gap-4 p-4">
            <div>
              <p class="text-gray-600 text-sm">Nama Atribusi</p>
              <p class="font-semibold">{{ projectData.projectUseAsset && projectData.projectUseAsset[0] ? projectData.projectUseAsset[0].platNomor : '-' }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Nama Klien</p>
              <p class="font-semibold">{{ projectData.projectName }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Tanggal Mulai</p>
              <p class="font-semibold">{{ formatDate(projectData.projectStartDate) }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Jumlah PHL</p>
              <p class="font-semibold">{{ projectData.projectPHLCount }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Status</p>
              <p class="font-semibold">{{ formatStatus(projectData.projectStatus) }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Tanggal Selesai</p>
              <p class="font-semibold">{{ projectData.projectEndDate ? formatDate(projectData.projectEndDate) : '-' }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Alamat Pengambilan</p>
              <p class="font-semibold">{{ projectData.projectPickupAddress }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Alamat Pengiriman</p>
              <p class="font-semibold">{{ projectData.projectDeliveryAddress }}</p>
            </div>
            <div v-if="projectData.projectUseAsset && projectData.projectUseAsset.length">
              <p class="text-gray-600 text-sm">Aset yang digunakan</p>
              <p class="font-semibold">{{ projectData.projectUseAsset.length }} aset</p>
            </div>
          </div>
        </div>

        <!-- Assets Used Table with Edit button -->
        <div class="bg-[#E5EAF2] rounded-lg shadow-md overflow-hidden">
          <div class="bg-[#1E3A5F] p-4 flex justify-between items-center">
            <h2 class="text-xl font-bold text-white">Aset Yang Digunakan</h2>
            <!-- Edit button for Operasional role -->
            <VSuccessButton
              v-if="canEditProject"
              label="Ubah"
              @click="editAssets"
            />
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">No</th>
                  <th class="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Nomor Polisi</th>
                  <th class="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Jenis</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(asset, index) in projectData.projectUseAsset" :key="index">
                  <td class="px-6 py-4">{{ index + 1 }}</td>
                  <td class="px-6 py-4">{{ asset.platNomor }}</td>
                  <td class="px-6 py-4">Truk</td> <!-- We might need to fetch this from an asset service -->
                </tr>
                <tr v-if="!projectData.projectUseAsset || projectData.projectUseAsset.length === 0">
                  <td colspan="3" class="px-6 py-4 text-center">Tidak ada data aset yang digunakan</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Financial Information -->
        <div v-if="canViewFinancialInfo" class="bg-[#E5EAF2] rounded-lg shadow-md overflow-hidden">
          <div class="bg-[#1E3A5F] p-4">
            <h2 class="text-xl font-bold text-white">Informasi Keuangan</h2>
          </div>
          
          <div class="p-4 grid grid-cols-2 gap-4">
            <div>
              <p class="text-gray-600 text-sm">Jumlah Pengeluaran:</p>
              <p class="font-semibold">{{ formatCurrency(projectData.projectTotalPengeluaran) }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Total Upah PHL:</p>
              <p class="font-semibold">{{ formatCurrency(projectData.projectPHLPay * projectData.projectPHLCount) }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Total Pemasukkan Bersih:</p>
              <p class="font-semibold">{{ formatCurrency(projectData.projectTotalPemasukkan) }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Total Profit:</p>
              <p :class="{'font-semibold': true, 'text-red-600': (projectData.projectTotalPemasukkan - projectData.projectTotalPengeluaran) < 0, 'text-green-600': (projectData.projectTotalPemasukkan - projectData.projectTotalPengeluaran) > 0}">
                {{ formatCurrency(projectData.projectTotalPemasukkan - projectData.projectTotalPengeluaran) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Log Distribusi -->
        <div class="bg-[#E5EAF2] rounded-lg shadow-md overflow-hidden">
          <div class="bg-[#1E3A5F] p-4">
            <h2 class="text-xl font-bold text-white">Log Distribusi</h2>
          </div>
          
          <div class="p-4">
            <!-- Timeline Component -->
            <div class="relative">
              <!-- Timeline vertical line -->
              <div class="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-300"></div>

              <!-- Timeline items -->
              <div v-for="(log, index) in projectData.projectLogs" :key="index" 
                   class="relative pl-12 pb-8 flex flex-col">
                <!-- Timeline dot -->
                <div class="absolute left-4 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-600"></div>
                
                <!-- Timestamp -->
                <div class="text-xs text-gray-500 mb-1">{{ formatDateTime(log.actionDate) }}</div>
                
                <!-- User info -->
                <div class="mb-1 text-sm">
                  <span class="font-medium">User:</span> {{ log.user }}
                </div>
                
                <!-- Action -->
                <div class="bg-gray-50 rounded-md p-3 text-sm">
                  <span class="font-medium">Action:</span>
                  <p>{{ log.action }}</p>
                </div>

                <!-- If it's the last item, display the timestamp on the right -->
                <div v-if="index === projectData.projectLogs.length - 1" class="absolute right-0 top-0 text-xs text-gray-500">
                  {{ formatDateTime(log.actionDate) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sales Details Section -->
      <div v-else-if="projectData.projectType === false" class="space-y-6">
        <!-- Header -->
        <div class="bg-[#E5EAF2] rounded-lg shadow-md overflow-hidden">
          <div class="bg-[#1E3A5F] p-4">
            <h2 class="text-xl font-bold text-white">Informasi Penjualan - {{ projectData.id }}</h2>
          </div>

          <!-- Basic Info -->
          <div class="grid grid-cols-3 gap-4 p-4">
            <div>
              <p class="text-gray-600 text-sm">Nama Atribusi</p>
              <p class="font-semibold">{{ projectData.projectName || 'Klien - Jatin' }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Nama Klien</p>
              <p class="font-semibold">{{ clientName || 'Pedlar' }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Tanggal Mulai</p>
              <p class="font-semibold">{{ formatDate(projectData.projectStartDate) }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Alamat Pengiriman</p>
              <p class="font-semibold">{{ projectData.projectDeliveryAddress || 'Jalan Sudirman' }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Status</p>
              <p class="font-semibold">{{ formatStatus(projectData.projectStatus) }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Tanggal Selesai</p>
              <p class="font-semibold">{{ projectData.projectEndDate ? formatDate(projectData.projectEndDate) : '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Products Sold Table -->
        <div class="bg-[#E5EAF2] rounded-lg shadow-md overflow-hidden">
          <div class="bg-[#1E3A5F] p-4">
            <h2 class="text-xl font-bold text-white">Barang Yang Terjual</h2>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">No</th>
                  <th class="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Nama</th>
                  <th class="px-6 py-3 text-right text-sm font-medium text-gray-600 uppercase">Jumlah</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(resource, index) in projectData.projectUseResource" :key="index">
                  <td class="px-6 py-4">{{ index + 1 }}</td>
                  <td class="px-6 py-4">{{ getResourceName(resource.resourceId) }}</td>
                  <td class="px-6 py-4 text-right">{{ resource.resourceStockUsed }}</td>
                </tr>
                <tr v-if="!projectData.projectUseResource || projectData.projectUseResource.length === 0">
                  <td colspan="3" class="px-6 py-4 text-center">Tidak ada data barang yang terjual</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Financial Information -->
        <div v-if="canViewFinancialInfo" class="bg-[#E5EAF2] rounded-lg shadow-md overflow-hidden">
          <div class="bg-[#1E3A5F] p-4">
            <h2 class="text-xl font-bold text-white">Informasi Keuangan</h2>
          </div>
          
          <div class="p-4 space-y-2">
            <div class="flex justify-between">
              <p class="text-gray-600">Jumlah Pemasukkan:</p>
              <p class="font-semibold">{{ formatCurrency(projectData.projectTotalPemasukkan) }}</p>
            </div>
            <div class="flex justify-between">
              <p class="text-gray-600">Total Harga Barang:</p>
              <p class="font-semibold">{{ formatCurrency(getTotalProductCost()) }}</p>
            </div>
            <div class="flex justify-between">
              <p class="text-gray-600">Total Pemasukkan Bersih:</p>
              <p class="font-semibold">{{ formatCurrency(getNetProfit()) }}</p>
            </div>
            <div class="flex justify-between">
              <p class="text-gray-600">Total Profit:</p>
              <p :class="{
                'font-semibold': true,
                'text-red-600': getProfit() < 0,
                'text-green-600': getProfit() > 0
              }">
                {{ formatCurrency(getProfit()) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Log Penjualan -->
        <div class="bg-[#E5EAF2] rounded-lg shadow-md overflow-hidden">
          <div class="bg-[#1E3A5F] p-4">
            <h2 class="text-xl font-bold text-white">Log Penjualan</h2>
          </div>
          
          <div class="p-4">
            <!-- Timeline Component -->
            <div class="relative">
              <!-- Timeline vertical line -->
              <div class="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-300"></div>

              <!-- Timeline items -->
              <div v-for="(log, index) in projectData.projectLogs" :key="index" 
                   class="relative pl-12 pb-8 flex flex-col">
                <!-- Timeline dot -->
                <div class="absolute left-4 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-600"></div>
                
                <!-- Timestamp -->
                <div class="text-xs text-gray-500 mb-1">{{ formatDateTime(log.actionDate) }}</div>
                
                <!-- User info -->
                <div class="mb-1 text-sm">
                  <span class="font-medium">User:</span> {{ log.user }}
                </div>
                
                <!-- Action -->
                <div class="bg-gray-50 rounded-md p-3 text-sm">
                  <span class="font-medium">Action:</span>
                  <p>{{ log.action }}</p>
                </div>

                <!-- If it's the last or first item, display the timestamp on the right -->
                <div v-if="index === 0 || index === projectData.projectLogs.length - 1" 
                     class="absolute right-0 top-0 text-xs text-gray-500">
                  {{ formatDateTime(log.actionDate) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { API_URLS } from '@/config/api.config';
import { useAuthStore } from '@/stores/auth';
import VSuccessButton from '@/components/VSuccessButton.vue';
import VCancelButton from '@/components/VCancelButton.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const projectId = route.params.id as string;

// State variables
const project = ref<any>({});
const projectData = ref<any>({});
const clientName = ref<string>('');
const isLoading = ref(true);
const error = ref('');

// Mock resource names for demo
const resourceNames = {
  '1': 'Besi Bridgestone',
  '2': 'Paku',
  '3': 'Cakul',
  '4': 'Ml ayam'
};

// Role-based permission computed properties
const canViewFinancialInfo = computed(() => {
  const userRole = authStore.userRole;
  // Only Direksi and Finance can see financial info
  return userRole === 'Direksi' || userRole === 'Finance';
});

// Check if user is Operasional
const isOperasional = computed(() => {
  const userRole = authStore.userRole;
  return userRole === 'Operasional';
});

// Check if user can edit project (Operasional or Admin)
const canEditProject = computed(() => {
  const userRole = authStore.userRole;
  return userRole === 'Operasional' || userRole === 'Admin';
});

// Format date function
const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Format date with time
const formatDateTime = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) + 
         ' ' + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

// Format currency function
const formatCurrency = (value: number): string => {
  if (value === undefined || value === null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

// Format status function
const formatStatus = (status: number): string => {
  switch (status) {
    case 0: return 'Diajukan';
    case 1: return 'Diproses';
    case 2: return 'Dalam Pengiriman';
    case 3: return 'Selesai';
    case 4: return 'Dibatalkan';
    default: return 'Unknown';
  }
};

// Get resource name
const getResourceName = (resourceId: string): string => {
  // Add an index signature type to make TypeScript happy
  const typedResourceNames: { [key: string]: string } = resourceNames;
  return typedResourceNames[resourceId] || `Resource ${resourceId}`;
};

// Define ProjectResource interface
interface ProjectResource {
  resourceId: string;
  sellPrice: number;
  resourceStockUsed: number;
}

// Calculate total product cost
const getTotalProductCost = (): number => {
  if (!projectData.value.projectUseResource) return 0;
  
  // Use ProjectResource interface in reduce function
  return projectData.value.projectUseResource.reduce((total: number, resource: ProjectResource) => {
    return total + (resource.sellPrice * resource.resourceStockUsed * 0.8);
  }, 0);
};

// Calculate net profit
const getNetProfit = (): number => {
  return projectData.value.projectTotalPemasukkan || 0;
};

// Calculate total profit
const getProfit = (): number => {
  const revenue = projectData.value.projectTotalPemasukkan || 0;
  const cost = getTotalProductCost();
  return revenue - cost;
};

// Load data from API
const loadData = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    // Fetch project data
    const response = await axios.get(`${API_URLS.PROJECT}/project/${projectId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    console.log('API URL:', `${API_URLS.PROJECT}/project/${projectId}`);
    console.log('Response:', response?.data);
    
    if (response.data && response.data.status === 200) {
      project.value = response.data.data;
      // Extract the nested data object
      projectData.value = response.data.data.data || {};
      console.log('Project data loaded:', projectData.value);
      
      // Fetch client name if needed
      if (projectData.value.projectClientId) {
        await fetchClientName(projectData.value.projectClientId);
      }
    } else {
      error.value = 'Gagal memuat data proyek';
    }
  } catch (err) {
    console.error('Error loading project data:', err);
    
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      router.replace('/not-found');
      return;
    }
    
    error.value = 'Terjadi kesalahan saat memuat data. Silakan coba lagi.';
  } finally {
    isLoading.value = false;
  }
};

// Fetch client name
const fetchClientName = async (clientId: string) => {
  try {
    // In a real implementation, you'd make an API call to get the client name
    // For this demo, we'll just set a placeholder
    clientName.value = 'Pedlar'; 
  } catch (err) {
    console.error('Error fetching client name:', err);
    clientName.value = 'Unknown Client';
  }
};

// Action methods for buttons
const cancelProject = () => {
  // Implement cancel project functionality
  console.log('Cancel project');
  // You would typically show a confirmation modal and then call an API
};

const updateProject = () => {
  // Implement update project functionality
  console.log('Update project');
  router.push(`/project/edit/${projectId}`);
};

const editDistributionInfo = () => {
  // Implement edit distribution info functionality
  console.log('Edit distribution info');
  // This could open a modal or navigate to an edit page
};

const editAssets = () => {
  // Implement edit assets functionality
  console.log('Edit assets');
  // This could open a modal or navigate to an assets edit page
};

onMounted(async () => {
  await loadData();
});
</script>