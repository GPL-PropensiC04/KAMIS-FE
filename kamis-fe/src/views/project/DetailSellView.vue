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
        
        <!-- Project Action Buttons for Sales -->
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
      <!-- Sales Details Section -->
      <div class="space-y-6">
        <!-- Header -->
        <div class="bg-[#E5EAF2] rounded-lg shadow-md overflow-hidden">
          <div class="bg-[#1E3A5F] p-4">
            <h2 class="text-xl font-bold text-white">Informasi Penjualan - {{ projectData.id }}</h2>
          </div>

          <!-- Basic Info -->
          <div class="grid grid-cols-3 gap-4 p-4">
            <div>
              <p class="text-gray-600 text-sm">Nama Atribusi</p>
              <p class="font-semibold">{{ projectData.projectName  }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Nama Klien</p>
              <p class="font-semibold">{{ clientName  }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Tanggal Mulai</p>
              <p class="font-semibold">{{ formatDate(projectData.projectStartDate) }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Alamat Pengiriman</p>
              <p class="font-semibold">{{ projectData.projectDeliveryAddress  }}</p>
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
                  <td class="px-6 py-3">Total Pemasukkan Penjualan</td>
                  <td class="px-6 py-3 text-right">{{ formatCurrency(projectData.projectTotalPemasukkan) }}</td>
                  <td class="px-6 py-3 text-right">-</td>
                </tr>
                
                <!-- Expense items -->
                <tr>
                  <td class="px-6 py-3">Harga Modal Barang</td>
                  <td class="px-6 py-3 text-right">-</td>
                  <td class="px-6 py-3 text-right">{{ formatCurrency(getTotalProductCost()) }}</td>
                </tr>
                
                <!-- Totals row with border-top -->
                <tr class="border-t-2 border-gray-300 font-medium">
                  <td class="px-6 py-3">Total</td>
                  <td class="px-6 py-3 text-right text-green-600 ">{{ formatCurrency(projectData.projectTotalPemasukkan) }} </td>
                  <td class="px-6 py-3 text-right text-red-600">{{ formatCurrency(getTotalProductCost()) }}</td>
                </tr>
                
                <!-- Profit/Loss row with special styling -->
                <tr class="bg-gray-50">
                  <td class="px-6 py-3 font-medium">Total Profit</td>
                  <td colspan="2" :class="{
                    'px-6 py-3 text-right font-bold': true,
                    'text-red-600': getProfit() < 0,
                    'text-green-600': getProfit() > 0
                  }">
                    {{ formatCurrency(getProfit()) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
    </div>
      <!-- Log Penjualan -->
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
    </template>

      </div>
      

      
      
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
const clientName = ref<string>('');
const isLoading = ref(true);
const error = ref('');

// Add a reactive ref for resource names
const resourceNames = ref<Record<string, string>>({});

// Get resource name function using real API data
const getResourceName = (resourceId: string): string => {
  return resourceNames.value[resourceId] || `Resource ${resourceId}`;
};

// Add function to fetch resource names
const fetchResourceNames = async () => {
  if (!projectData.value || !projectData.value.projectUseResource) return;
  
  try {
    // Process each resource in the project
    for (const resource of projectData.value.projectUseResource) {
      if (!resource.resourceId) continue;
      
      // Skip if we already have this resource name
      if (resourceNames.value[resource.resourceId]) continue;
      
      // Fetch resource details from API
      const response = await axios.get(`${API_URLS.RESOURCE}/resource/${resource.resourceId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.data && response.data.status === 200 && response.data.data) {
        resourceNames.value[resource.resourceId] = response.data.data.resourceName || 
                                                  response.data.data.name || 
                                                  `Resource ${resource.resourceId}`;
      }
    }
  } catch (err) {
    console.error('Error fetching resource names:', err);
  }
};

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
      
      // Verify this is a sales project
      if (projectData.value.projectType !== false) {
        router.replace(`/project/distribution/${projectId}`);
        return;
      }
      
      console.log('Project data loaded:', projectData.value);
      
      // Fetch client name if needed
      if (projectData.value.projectClientId) {
        await fetchClientName(projectData.value.projectClientId);
      }

      // Fetch resource names
      await fetchResourceNames();
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

// Update fetchClientName function
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