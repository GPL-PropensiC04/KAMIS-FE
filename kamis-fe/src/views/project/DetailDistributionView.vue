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
          <VCancelButton v-if="projectData.projectStatus < 2" label="Batal" @click="openCancelModal" />
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
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            <div class="break-words">
              <p class="text-gray-600 text-sm">Nama Kegiatan</p>
              <p class="font-semibold">{{ projectData.projectName }}</p>
            </div>
            <div class="break-words">
              <p class="text-gray-600 text-sm">Nama Klien</p>
              <p class="font-semibold">{{ clientName }}</p>
            </div>
            <div class="break-words">
              <p class="text-gray-600 text-sm">Tanggal Mulai</p>
              <p class="font-semibold">{{ formatDate(projectData.projectStartDate) }}</p>
            </div>
            <div class="break-words">
              <p class="text-gray-600 text-sm">Jumlah PHL</p>
              <p class="font-semibold">{{ projectData.projectPHLCount }}</p>
            </div>
            <div class="break-words">
              <p class="text-gray-600 text-sm">Status</p>
              <p class="font-semibold">{{ formatStatus(projectData.projectStatus) }}</p>
            </div>
            <div class="break-words">
              <p class="text-gray-600 text-sm">Tanggal Selesai</p>
              <p class="font-semibold">{{ projectData.projectEndDate ? formatDate(projectData.projectEndDate) : '-' }}</p>
            </div>
            <div class="break-words">
              <p class="text-gray-600 text-sm">Alamat Pengambilan</p>
              <p class="font-semibold">{{ projectData.projectPickupAddress }}</p>
            </div>
            <div class="break-words">
              <p class="text-gray-600 text-sm">Alamat Pengiriman</p>
              <p class="font-semibold">{{ projectData.projectDeliveryAddress }}</p>
            </div>
            <div class="break-words">
              <p class="text-gray-600 text-sm">Status Pembayaran</p>
              <p class="font-semibold">{{ formatPaymentStatus(projectData.projectPaymentStatus) }}</p>
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
                  <td class="px-6 py-4">
                    <template v-if="assetTypes[asset.platNomor]">
                      {{ assetTypes[asset.platNomor] }}
                    </template>
                    <template v-else>
                      <span class="text-gray-400">Loading...</span>
                    </template>
                  </td>
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
                  <td class="px-6 py-3 text-right text-green-600">{{ formatCurrency(projectData.projectTotalPemasukkan) }}</td>
                  <td class="px-6 py-3 text-right text-red-600">{{ formatCurrency(projectData.projectTotalPengeluaran) }}</td>
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
      <div v-if="projectData.projectLogs.length" class="mt-10">
            <h2 class="text-lg font-bold font-lato mb-2">Log Distribusi</h2>
            <hr class="border-t-1 border-black mb-4" />

            <div class="flex flex-col space-y-6 relative">
                <div 
                    v-for="(log, index) in paginatedLogs" 
                    :key="log.id" 
                    class="relative flex items-start gap-3"
                    :class="{
                        'flex-row-reverse pr-6': log.user === currentUsername,
                        'pl-6': log.user !== currentUsername
                    }"
                >
                    <!-- Icon bulat -->
                    <div class="w-3 h-3 bg-[#1E3A5F] rounded-full mt-1.5 flex-shrink-0"></div>

                    <!-- Isi log -->
                    <div class="flex flex-col max-w-[80%]">
                        <p class="text-[#1E3A5F] font-semibold text-sm mb-1"
                        :class="{
                        'text-right': log.user === currentUsername,
                        'text-left': log.user !== currentUsername
                        }">
                            {{ formatTime(log.actionDate) }} - {{ formatDate(log.actionDate) }}
                        </p>
                        <div class="bg-[#E5EAF2] p-4 rounded-md text-sm whitespace-pre-line">
                            <p>
                                <strong>User</strong> : 
                                {{ log.user === currentUsername ? log.user + ' (You) - ' + userRole : log.user + " - " + userRole }}
                            </p>
                            <p class="mt-1"><strong>Action</strong> :</p>
                            <p>{{ log.action }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Search + Pagination di bawah dan sejajar -->
            <div class="flex flex-wrap justify-between items-center mt-6 gap-4">
                <!-- Search Input -->
                <input 
                    v-model="searchLog" 
                    placeholder="Cari log..." 
                    class="w-full sm:w-[250px] px-3 py-1 border border-[#1E3A5F] rounded-md text-sm bg-[#F8FAFC]"
                />

                <!-- Pagination Controls -->
                <div class="flex items-center gap-2">
                    <button
                        @click="currentPage--"
                        :disabled="currentPage === 1"
                        class="px-3 py-1 rounded bg-[#1E3A5F] text-white disabled:opacity-50"
                    >
                        ‹
                    </button>

                    <span class="text-sm font-semibold text-[#1E3A5F]">
                        Halaman {{ currentPage }} dari {{ totalPages }}
                    </span>

                    <button
                        @click="currentPage++"
                        :disabled="currentPage === totalPages"
                        class="px-3 py-1 rounded bg-[#1E3A5F] text-white disabled:opacity-50"
                    >
                        ›
                    </button>
                </div>
            </div>
            <!-- END -->
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
  <VModal v-model="showStatusModal">
    <div class="bg-white rounded-lg p-6 max-w-md mx-auto">
      <h3 class="text-lg font-bold mb-4">Konfirmasi Update Status</h3>
      <p class="mb-6 text-gray-600">{{ getStatusModalMessage }}</p>
      
      <div class="flex justify-end gap-2">
        <VCancelButton label="Tidak" @click="closeStatusModal" />
        <VSuccessButton label="Ya" @click="confirmStatusUpdate" />
      </div>
    </div>
  </VModal>
  <VModal v-model="showCancelModal">
    <div class="bg-white rounded-lg p-6 max-w-md mx-auto">
      <h3 class="text-lg font-bold mb-4">Konfirmasi Pembatalan Proyek</h3>
      <p class="mb-6 text-gray-600">Apakah Anda yakin ingin membatalkan proyek ini?</p>
      
      <div class="flex justify-end gap-2">
        <VCancelButton label="Tidak" @click="closeCancelModal" />
        <VSuccessButton label="Ya" @click="confirmCancelProject" />
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
const showStatusModal = ref(false);
const showCancelModal = ref(false);
const newStatusToUpdate = ref<number | null>(null);
const projectStore = useProjectStore();

// Add these methods
const openCancelModal = () => {
  showCancelModal.value = true;
};

const closeCancelModal = () => {
  showCancelModal.value = false;
};

const confirmCancelProject = async () => {
  await cancelProject();
};

const getStatusModalMessage = computed(() => {
  const nextStatus = formatStatus(newStatusToUpdate.value || 0);
  return `Apakah Anda yakin ingin mengubah status proyek menjadi "${nextStatus}"?`;
});

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
// const totalVehicleCosts = computed(() => {
//   return totalAssetUseCost.value + totalAssetFuelCost.value;
// });

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
// const formatDateTime = (dateString: string): string => {
//   if (!dateString) return '-';
//   const date = new Date(dateString);
//   return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) + 
//          ' ' + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
// };

// Format currency function
const formatCurrency = (value: number): string => {
  if (value === undefined || value === null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

// Format status function
const formatStatus = (status: number): string => {
  switch (status) {
    case 0: return 'Diajukan';
    case 1: return 'Sedang Dikerjakan';
    case 2: return 'Selesai';
    case 3: return 'Dibatalkan';
    default: return 'Unknown';
  }
};

const formatPaymentStatus = (paymentStatus: number): string => {
  switch (paymentStatus) {
    case 0: return 'Belum bayar';
    case 1: return 'Sudah bayar';
    case 2: return 'Dikembalikan';
    default: return 'Unknown';
  }
};

// Update fetchClientName function to use real API data
const fetchClientName = async (clientId: string) => {
  if (!clientId) {
    clientName.value = '-';
    return;
  }
  
  try {
    // Make a real API call to fetch client data
    const response = await axios.get(`${API_URLS.PROFILE}/client/${clientId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (response.data && response.data.status === 200 && response.data.data) {
      // Extract the client name from the response data
      clientName.value = response.data.data.nameClient || response.data.data.clientName || '';
      console.log('Fetched client name:', clientName.value);
    } else {
      console.error('Client data not found or invalid format');
      clientName.value = `Client ${clientId.substring(0, 8)}`;
    }
  } catch (err) {
    console.error('Error fetching client name:', err);
    clientName.value = 'Unknown Client';
  }
};

// Add this new ref to store asset types
const assetTypes = ref<Record<string, string>>({});

// Updated fetchAssetTypes function
const fetchAssetTypes = async () => {
  if (!projectData.value || !projectData.value.projectUseAsset) return;
  
  try {
    for (const asset of projectData.value.projectUseAsset) {
      if (!asset.platNomor) continue;
      
      // Skip if we already have this asset type
      if (assetTypes.value[asset.platNomor]) continue;
      
      console.log(`Fetching asset type for plate number: ${asset.platNomor}`);
      
      // Fetch asset details from API
      const response = await axios.get(`${API_URLS.ASSET}/asset/${asset.platNomor}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      console.log(`Response for ${asset.platNomor}:`, response.data);
      
      if (response.data && response.data.status === 200 && response.data.data) {
        // Extract the jenisAset field from the response
        const assetData = response.data.data;
        
        if (assetData.jenisAset) {
          assetTypes.value[asset.platNomor] = assetData.jenisAset;
          console.log(`Found jenisAset: ${assetData.jenisAset} for ${asset.platNomor}`);
        } else if (assetData.assetType) {
          assetTypes.value[asset.platNomor] = assetData.assetType;
          console.log(`Using assetType fallback: ${assetData.assetType} for ${asset.platNomor}`);
        } else if (assetData.type) {
          assetTypes.value[asset.platNomor] = assetData.type;
          console.log(`Using type fallback: ${assetData.type} for ${asset.platNomor}`);
        } else {
          // Only if all possible fields are missing
          assetTypes.value[asset.platNomor] = '-';
          console.log(`No type information found for ${asset.platNomor}`);
        }
      } else {
        console.error(`Failed to get asset data for ${asset.platNomor}:`, response.data);
        assetTypes.value[asset.platNomor] = 'Error';
      }
    }
  } catch (err) {
    console.error('Error fetching asset types:', err);
    // In case of error, don't set any default values
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
      
      // Fetch asset types if assets are available
      if (projectData.value.projectUseAsset && projectData.value.projectUseAsset.length > 0) {
        await fetchAssetTypes();
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

// Update cancelProject method
const cancelProject = async () => {
  try {
    await projectStore.updateProjectStatus(projectData.value.id, 3); // 3 is cancelled status
    await loadData(); // Refresh data after cancellation
    closeCancelModal();
  } catch (error) {
    console.error('Failed to cancel project:', error);
  }
};

const updateProject = async () => {
  try {
    // Get current status
    const currentStatus = projectData.value.projectStatus;

    // Sequential status update logic
    if (currentStatus === 0) { // Diajukan -> Kirim
      newStatusToUpdate.value = 1;
    } else if (currentStatus === 1) { // Kirim -> Selesai
      newStatusToUpdate.value = 2;
    } else {
      return;
    }
    showStatusModal.value = true;
  } catch (error) {
    console.error('Failed to update project status:', error);
  }
};

const closeStatusModal = () => {
  showStatusModal.value = false;
  newStatusToUpdate.value = null;
};

const confirmStatusUpdate = async () => {
  try {
    if (newStatusToUpdate.value === null) return;
    
    await projectStore.updateProjectStatus(projectData.value.id, newStatusToUpdate.value);
    await loadData(); // Refresh data after update
    closeStatusModal();
  } catch (error) {
    console.error('Failed to update project status:', error);
  }
};

const editDistributionInfo = () => {
  // Navigate to the update distribution view
  router.push(`/project/update/distribution/${projectData.value.id}`);
};

const editAssets = () => {
  // Navigate to the update distribution view (same page since assets are edited there too)
  router.push(`/project/update/distribution/${projectData.value.id}`);
};

/// 
// Handle Log //
///
const userRole = computed(() => authStore.userRole)

const searchLog = ref('');

const currentUsername = computed(() => authStore.currentUsername);

// Format Jam dari ISO (jam:menit)
const formatTime = (iso: string): string => {
    const date = new Date(iso);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
};

// Urutkan log terbaru ke terlama
const sortedLogs = computed(() => {
    console.log(projectData.value.projectLogs)
    return [...(projectData.value?.projectLogs || [])].sort((a, b) =>
        new Date(b.actionDate).getTime() - new Date(a.actionDate).getTime()
    );
});

const logsPerPage = 3;
const currentPage = ref(1);

const filteredLogs = computed(() => {
    const search = searchLog.value.toLowerCase();
    return sortedLogs.value.filter(log =>
        log.action.toLowerCase().includes(search) || 
        log.user.toLowerCase().includes(search)
    );
});

const totalPages = computed(() => {
    return Math.ceil(filteredLogs.value.length / logsPerPage);
});

const paginatedLogs = computed(() => {
    const start = (currentPage.value - 1) * logsPerPage;
    return filteredLogs.value.slice(start, start + logsPerPage);
});

/// 
// End //

onMounted(async () => {
  await loadData();
});
</script>