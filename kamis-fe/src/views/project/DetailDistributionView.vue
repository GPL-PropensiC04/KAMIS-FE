<template>
  <Breadcrumb />
  <div class="min-h-screen bg-gray-100 p-6">
    <!-- Back Button -->
    <div class="mb-4 flex justify-between items-center">
      <router-link to="/project" class="text-[#1E3A5F] hover:text-[#1a325a] text-2xl flex items-center">
        <span>←</span>
      </router-link>
      
      <div class="flex gap-2">
        <!-- Payment Status Button -->
        <VSuccessButton v-if="canViewFinancialInfo && showPaymentUpdateButton && projectData.projectPaymentStatus === 0" label="Bayar" @click="openPaymentModal"/>
        <VCancelButton v-if="canViewFinancialInfo && projectData.projectStatus === 3 && projectData.projectPaymentStatus === 1" label="Kembalikan" @click="openPaymentModal"/>
        
        <!-- Project Action Buttons -->
        <template v-if="canEditProject">
          <VCancelButton v-if="projectData.projectStatus < 2" label="Batal" @click="cancelProject" />
          <VSuccessButton v-if="projectData.projectStatus < 2" label="Update" @click="updateProject"/>
        </template>
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
      <div class="space-y-6">
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
              <p class="text-gray-600 text-sm">Nama Proyek</p>
              <p class="font-semibold">{{ projectData.projectName }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Nama Klien</p>
              <p class="font-semibold">{{ clientName}}</p>
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
          
          <div class="p-4">
            <table class="min-w-full border-collapse">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-medium text-gray-600">Nama Akun</th>
                  <th class="px-6 py-3 text-right text-sm font-medium text-gray-600">Pemasukkan</th>
                  <th class="px-6 py-3 text-right text-sm font-medium text-gray-600">Pengeluaran</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <!-- Income items -->
                <tr>
                  <td class="px-6 py-3">Total Pemasukkan</td>
                  <td class="px-6 py-3 text-right">{{ formatCurrency(projectData.projectTotalPemasukkan) }}</td>
                  <td class="px-6 py-3 text-right">-</td>
                </tr>
                
                <!-- Expense items -->
                <tr>
                  <td class="px-6 py-3">Biaya Pakai Kendaraan</td>
                  <td class="px-6 py-3 text-right">-</td>
                  <td class="px-6 py-3 text-right">{{ formatCurrency(totalAssetUseCost) }}</td>
                </tr>
                
                <tr>
                  <td class="px-6 py-3">Biaya Bensin</td>
                  <td class="px-6 py-3 text-right">-</td>
                  <td class="px-6 py-3 text-right">{{ formatCurrency(totalAssetFuelCost) }}</td>
                </tr>
                
                <tr>
                  <td class="px-6 py-3">Upah PHL</td>
                  <td class="px-6 py-3 text-right">-</td>
                  <td class="px-6 py-3 text-right">{{ formatCurrency(projectData.projectPHLPay * projectData.projectPHLCount) }}</td>
                </tr>
                
                <!-- Totals row with border-top -->
                <tr class="border-t-2 border-gray-300 font-medium">
                  <td class="px-6 py-3">Total</td>
                  <td class="px-6 py-3 text-right">{{ formatCurrency(projectData.projectTotalPemasukkan) }}</td>
                  <td class="px-6 py-3 text-right">{{ formatCurrency(projectData.projectTotalPengeluaran) }}</td>
                </tr>
                
                <!-- Profit/Loss row with special styling -->
                <tr class="bg-gray-50">
                  <td class="px-6 py-3 font-medium">Total Profit</td>
                  <td colspan="2" :class="{
                    'px-6 py-3 text-right font-bold': true,
                    'text-red-600': (projectData.projectTotalPemasukkan - projectData.projectTotalPengeluaran) < 0,
                    'text-green-600': (projectData.projectTotalPemasukkan - projectData.projectTotalPengeluaran) > 0
                  }">
                    {{ formatCurrency(projectData.projectTotalPemasukkan - projectData.projectTotalPengeluaran) }}
                  </td>
                </tr>
              </tbody>
            </table>
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
    </template>
  </div>
  <VModal v-model="showPaymentModal">
    <div class="bg-white rounded-lg p-6 max-w-md mx-auto">
      <h3 class="text-lg font-bold mb-4">Konfirmasi Perubahan Status Pembayaran</h3>
      <p class="mb-6 text-gray-600">{{ getPaymentModalMessage }}</p>
      
      <div class="flex justify-end gap-2">
        <VCancelButton label="Tidak" @click="closePaymentModal" />
        <VSuccessButton label="Ya" @click="updatePaymentStatus" />
      </div>
    </div>
  </VModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { API_URLS } from '@/config/api.config';
import { useAuthStore } from '@/stores/auth';
import VSuccessButton from '@/components/VSuccessButton.vue';
import VCancelButton from '@/components/VCancelButton.vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import VModal from '@/components/VModal.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const projectId = route.params.id as string;

// State variables
const project = ref<any>({});
const projectData = ref<any>({});
const isLoading = ref(true);
const error = ref('');
const clientName = ref<string>('');

// Role-based permission computed properties
const canViewFinancialInfo = computed(() => {
  const userRole = authStore.userRole;
  return userRole === 'Direksi' || userRole === 'Finance';
});

const showPaymentModal = ref(false);
const projectStore = useProjectStore();

// Add these computed properties
const showPaymentUpdateButton = computed(() => {
  if (!projectData.value) return false;
  
  const paymentStatus = projectData.value.projectPaymentStatus;
  const projectStatus = projectData.value.projectStatus;
  
  // Show "Lunasi" button if: payment status is 0 (unpaid) and project is not cancelled
  if (paymentStatus === 0 && projectStatus !== 3) return true;
  
  // Show "Kembalikan" button if: payment status is 1 (paid) and project status is 3 (cancelled)
  if (paymentStatus === 1 && projectStatus === 3) return true;
  
  return false;
});

const getPaymentModalMessage = computed(() => {
  if (!projectData.value) return '';
  
  return projectData.value.projectPaymentStatus === 0 
    ? 'Apakah Anda yakin ingin update status pembayaran ini?' 
    : 'Apakah Anda yakin ingin mengembalikan pembayaran ini?';
});

// First, define an interface for the asset structure
interface ProjectAsset {
  platNomor: string;
  assetUseCost: number;
  assetFuelCost: number;
}

// Now update both computed properties with proper type annotations
const totalAssetUseCost = computed(() => {
  if (!projectData.value || !projectData.value.projectUseAsset) return 0;
  
  return projectData.value.projectUseAsset.reduce((total: number, asset: ProjectAsset) => {
    return total + (asset.assetUseCost || 0);
  }, 0);
});

const totalAssetFuelCost = computed(() => {
  if (!projectData.value || !projectData.value.projectUseAsset) return 0;
  
  return projectData.value.projectUseAsset.reduce((total: number, asset: ProjectAsset) => {
    return total + (asset.assetFuelCost || 0);
  }, 0);
});

// Calculate total vehicle costs (usage + fuel)
const totalVehicleCosts = computed(() => {
  return totalAssetUseCost.value + totalAssetFuelCost.value;
});

const openPaymentModal = () => {
  showPaymentModal.value = true;
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
};

const updatePaymentStatus = async () => {
  try {
    const newStatus = projectData.value.projectPaymentStatus === 0 ? 1 : 2;
    await projectStore.updateProjectPayment(projectData.value.id, newStatus);
    
    // Refresh project data
    await loadData();
    closePaymentModal();
  } catch (error) {
    console.error('Failed to update payment status:', error);
  }
};

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
    case 1: return 'Dalam Pengiriman';
    case 2: return 'Selesai';
    case 3: return 'Dibatalkan';
    default: return 'Unknown';
  }
};

// Add this function to fetch client name
const fetchClientName = async (clientId: string) => {
  try {
    // In a real implementation, you'd make an API call to get the client name
    // For example:
    // const response = await axios.get(`${API_URLS.CLIENT}/client/${clientId}`);
    // clientName.value = response.data.data.clientName;
    
    // For now, we'll just set a placeholder based on the ID
    // Replace this with your actual API call when available
    clientName.value = `Client ${clientId.substring(0, 8)}`;
  } catch (err) {
    console.error('Error fetching client name:', err);
    clientName.value = 'Unknown Client';
  }
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
      
      // Verify this is a distribution project
      if (projectData.value.projectType !== true) {
        router.replace(`/project/sale/${projectId}`);
        return;
      }
      
      // Fetch client name if clientId is available
      if (projectData.value.projectClientId) {
        await fetchClientName(projectData.value.projectClientId);
      }
      
      console.log('Project data loaded:', projectData.value);
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

// Action methods for buttons
const cancelProject = async () => {
  try {
    await projectStore.updateProjectStatus(projectData.value.id, 3); // 3 is cancelled status
    await loadData(); // Refresh data after cancellation
  } catch (error) {
    console.error('Failed to cancel project:', error);
  }
};

const updateProject = async () => {
  try {
    // Get current status
    const currentStatus = projectData.value.projectStatus;
    let newStatus;

    // Sequential status update logic
    if (currentStatus === 0) { // Diajukan -> Kirim
      newStatus = 1;
    } else if (currentStatus === 1) { // Kirim -> Selesai
      newStatus = 2;
    } else {
      return;
    }

    await projectStore.updateProjectStatus(projectData.value.id, newStatus);
    await loadData(); // Refresh data after update
  } catch (error) {
    console.error('Failed to update project status:', error);
  }
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