<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Breadcrumb -->
    <Breadcrumb />
    
    <!-- Main Container -->
    <div class="container mx-auto px-4 py-6 max-w-7xl">
      <!-- Header Section -->
      <div class="mb-6 flex justify-between items-center">
        <!-- Back Button -->
        <router-link 
          to="/project" 
          class="text-[#1E3A5F] hover:text-[#1a325a] text-2xl flex items-center transition-colors"
        >
          <span class="mr-2">←</span>
          <span class="text-base font-medium">Kembali</span>
        </router-link>
        
        <!-- Action Buttons -->
        <div class="flex gap-3">
          <!-- Payment Status Buttons -->
          <VSuccessButton 
            v-if="canViewFinancialInfo && showPaymentUpdateButton && projectData.projectPaymentStatus === 0" 
            label="Bayar" 
            @click="openPaymentModal"
          />
          <VCancelButton 
            v-if="canViewFinancialInfo && projectData.projectStatus === 3 && projectData.projectPaymentStatus === 1" 
            label="Kembalikan" 
            @click="openPaymentModal"
          />
          
          <!-- Project Action Buttons -->
          <template v-if="canEditProject && projectData.projectType === true">
            <VCancelButton 
              v-if="projectData.projectStatus < 2" 
              label="Batal" 
              @click="cancelProject" 
            />
            <VSuccessButton 
              v-if="projectData.projectStatus < 2" 
              label="Update" 
              @click="updateProject"
            />
          </template>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div class="flex flex-col items-center">
          <div class="animate-pulse mb-4">
            <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
          <p class="text-gray-600">Memuat data...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div class="flex flex-col items-center">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span class="text-red-600 text-xl">⚠</span>
          </div>
          <p class="text-red-600 mb-4">{{ error }}</p>
          <button 
            @click="loadData" 
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <template v-else>
        <!-- Distribution Project Details -->
        <div v-if="projectData.projectType === true" class="space-y-6">
          <!-- Project Information Card -->
          <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div class="bg-[#1E3A5F] px-6 py-4 flex justify-between items-center">
              <h2 class="text-xl font-semibold text-white">
                Informasi Distribusi - {{ projectData.id }}
              </h2>
              <VSuccessButton
                v-if="canEditProject"
                label="Ubah"
                @click="editDistributionInfo"
                class="text-sm"
              />
            </div>

            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="space-y-1">
                  <p class="text-sm font-medium text-gray-500">Nama Atribusi</p>
                  <p class="text-base font-semibold text-gray-900">
                    {{ projectData.projectUseAsset && projectData.projectUseAsset[0] ? projectData.projectUseAsset[0].platNomor : '-' }}
                  </p>
                </div>
                
                <div class="space-y-1">
                  <p class="text-sm font-medium text-gray-500">Nama Klien</p>
                  <p class="text-base font-semibold text-gray-900">{{ projectData.projectName }}</p>
                </div>
                
                <div class="space-y-1">
                  <p class="text-sm font-medium text-gray-500">Tanggal Mulai</p>
                  <p class="text-base font-semibold text-gray-900">{{ formatDate(projectData.projectStartDate) }}</p>
                </div>
                
                <div class="space-y-1">
                  <p class="text-sm font-medium text-gray-500">Jumlah PHL</p>
                  <p class="text-base font-semibold text-gray-900">{{ projectData.projectPHLCount }}</p>
                </div>
                
                <div class="space-y-1">
                  <p class="text-sm font-medium text-gray-500">Status</p>
                  <p class="text-base font-semibold text-gray-900">{{ formatStatus(projectData.projectStatus) }}</p>
                </div>
                
                <div class="space-y-1">
                  <p class="text-sm font-medium text-gray-500">Tanggal Selesai</p>
                  <p class="text-base font-semibold text-gray-900">
                    {{ projectData.projectEndDate ? formatDate(projectData.projectEndDate) : '-' }}
                  </p>
                </div>
                
                <div class="space-y-1 md:col-span-2 lg:col-span-1">
                  <p class="text-sm font-medium text-gray-500">Alamat Pengambilan</p>
                  <p class="text-base font-semibold text-gray-900">{{ projectData.projectPickupAddress }}</p>
                </div>
                
                <div class="space-y-1 md:col-span-2 lg:col-span-1">
                  <p class="text-sm font-medium text-gray-500">Alamat Pengiriman</p>
                  <p class="text-base font-semibold text-gray-900">{{ projectData.projectDeliveryAddress }}</p>
                </div>
                
                <div v-if="projectData.projectUseAsset && projectData.projectUseAsset.length" class="space-y-1">
                  <p class="text-sm font-medium text-gray-500">Aset yang digunakan</p>
                  <p class="text-base font-semibold text-gray-900">{{ projectData.projectUseAsset.length }} aset</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Assets Used Table -->
          <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div class="bg-[#1E3A5F] px-6 py-4 flex justify-between items-center">
              <h2 class="text-xl font-semibold text-white">Aset Yang Digunakan</h2>
              <VSuccessButton
                v-if="canEditProject"
                label="Ubah"
                @click="editAssets"
                class="text-sm"
              />
            </div>
            
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nomor Polisi
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jenis
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(asset, index) in projectData.projectUseAsset" :key="index" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ index + 1 }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ asset.platNomor }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Truk
                    </td>
                  </tr>
                  <tr v-if="!projectData.projectUseAsset || projectData.projectUseAsset.length === 0">
                    <td colspan="3" class="px-6 py-8 text-center text-sm text-gray-500">
                      Tidak ada data aset yang digunakan
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Financial Information -->
          <div v-if="canViewFinancialInfo" class="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div class="bg-[#1E3A5F] px-6 py-4">
              <h2 class="text-xl font-semibold text-white">Informasi Keuangan</h2>
            </div>
            
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-sm font-medium text-gray-500 mb-1">Jumlah Pengeluaran</p>
                  <p class="text-lg font-bold text-gray-900">{{ formatCurrency(projectData.projectTotalPengeluaran) }}</p>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-sm font-medium text-gray-500 mb-1">Total Upah PHL</p>
                  <p class="text-lg font-bold text-gray-900">{{ formatCurrency(projectData.projectPHLPay * projectData.projectPHLCount) }}</p>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-sm font-medium text-gray-500 mb-1">Total Pemasukkan Bersih</p>
                  <p class="text-lg font-bold text-gray-900">{{ formatCurrency(projectData.projectTotalPemasukkan) }}</p>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-sm font-medium text-gray-500 mb-1">Total Profit</p>
                  <p class="text-lg font-bold" :class="{
                    'text-red-600': (projectData.projectTotalPemasukkan - projectData.projectTotalPengeluaran) < 0,
                    'text-green-600': (projectData.projectTotalPemasukkan - projectData.projectTotalPengeluaran) > 0,
                    'text-gray-900': (projectData.projectTotalPemasukkan - projectData.projectTotalPengeluaran) === 0
                  }">
                    {{ formatCurrency(projectData.projectTotalPemasukkan - projectData.projectTotalPengeluaran) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Log Distribusi -->
          <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div class="bg-[#1E3A5F] px-6 py-4">
              <h2 class="text-xl font-semibold text-white">Log Distribusi</h2>
            </div>
            
            <div class="p-6">
              <div class="relative">
                <!-- Timeline vertical line -->
                <div class="absolute left-6 top-0 bottom-0 w-px bg-gray-300"></div>

                <!-- Timeline items -->
                <div v-for="(log, index) in projectData.projectLogs" :key="index" 
                     class="relative flex pb-8 last:pb-0">
                  <!-- Timeline dot -->
                  <div class="absolute left-4 w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow"></div>
                  
                  <!-- Content -->
                  <div class="ml-12 flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-2">
                      <div class="text-xs text-gray-500">
                        {{ formatDateTime(log.actionDate) }}
                      </div>
                    </div>
                    
                    <div class="bg-gray-50 rounded-lg p-4">
                      <div class="mb-2">
                        <span class="text-sm font-medium text-gray-700">User:</span>
                        <span class="text-sm text-gray-900 ml-2">{{ log.user }}</span>
                      </div>
                      
                      <div>
                        <span class="text-sm font-medium text-gray-700">Action:</span>
                        <p class="text-sm text-gray-900 mt-1">{{ log.action }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Empty state -->
                <div v-if="!projectData.projectLogs || projectData.projectLogs.length === 0" 
                     class="text-center py-8 text-gray-500">
                  Tidak ada log aktivitas
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sales Project Details -->
        <div v-else-if="projectData.projectType === false" class="space-y-6">
          <!-- Project Information Card -->
          <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div class="bg-[#1E3A5F] px-6 py-4">
              <h2 class="text-xl font-semibold text-white">
                Informasi Penjualan - {{ projectData.id }}
              </h2>
            </div>

            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="space-y-1">
                  <p class="text-sm font-medium text-gray-500">Nama Atribusi</p>
                  <p class="text-base font-semibold text-gray-900">{{ projectData.projectName || 'Klien - Jatin' }}</p>
                </div>
                
                <div class="space-y-1">
                  <p class="text-sm font-medium text-gray-500">Nama Klien</p>
                  <p class="text-base font-semibold text-gray-900">{{ clientName || 'Pedlar' }}</p>
                </div>
                
                <div class="space-y-1">
                  <p class="text-sm font-medium text-gray-500">Tanggal Mulai</p>
                  <p class="text-base font-semibold text-gray-900">{{ formatDate(projectData.projectStartDate) }}</p>
                </div>
                
                <div class="space-y-1 md:col-span-2 lg:col-span-1">
                  <p class="text-sm font-medium text-gray-500">Alamat Pengiriman</p>
                  <p class="text-base font-semibold text-gray-900">{{ projectData.projectDeliveryAddress || 'Jalan Sudirman' }}</p>
                </div>
                
                <div class="space-y-1">
                  <p class="text-sm font-medium text-gray-500">Status</p>
                  <p class="text-base font-semibold text-gray-900">{{ formatStatus(projectData.projectStatus) }}</p>
                </div>
                
                <div class="space-y-1">
                  <p class="text-sm font-medium text-gray-500">Tanggal Selesai</p>
                  <p class="text-base font-semibold text-gray-900">
                    {{ projectData.projectEndDate ? formatDate(projectData.projectEndDate) : '-' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Products Sold Table -->
          <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div class="bg-[#1E3A5F] px-6 py-4">
              <h2 class="text-xl font-semibold text-white">Barang Yang Terjual</h2>
            </div>
            
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(resource, index) in projectData.projectUseResource" :key="index" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ index + 1 }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ getResourceName(resource.resourceId) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {{ resource.resourceStockUsed }}
                    </td>
                  </tr>
                  <tr v-if="!projectData.projectUseResource || projectData.projectUseResource.length === 0">
                    <td colspan="3" class="px-6 py-8 text-center text-sm text-gray-500">
                      Tidak ada data barang yang terjual
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Financial Information -->
          <div v-if="canViewFinancialInfo" class="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div class="bg-[#1E3A5F] px-6 py-4">
              <h2 class="text-xl font-semibold text-white">Informasi Keuangan</h2>
            </div>
            
            <div class="p-6">
              <div class="space-y-4">
                <div class="flex justify-between items-center py-3 border-b border-gray-200">
                  <p class="text-sm font-medium text-gray-600">Jumlah Pemasukkan:</p>
                  <p class="text-lg font-semibold text-gray-900">{{ formatCurrency(projectData.projectTotalPemasukkan) }}</p>
                </div>
                
                <div class="flex justify-between items-center py-3 border-b border-gray-200">
                  <p class="text-sm font-medium text-gray-600">Total Harga Barang:</p>
                  <p class="text-lg font-semibold text-gray-900">{{ formatCurrency(getTotalProductCost()) }}</p>
                </div>
                
                <div class="flex justify-between items-center py-3 border-b border-gray-200">
                  <p class="text-sm font-medium text-gray-600">Total Pemasukkan Bersih:</p>
                  <p class="text-lg font-semibold text-gray-900">{{ formatCurrency(getNetProfit()) }}</p>
                </div>
                
                <div class="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-4">
                  <p class="text-sm font-medium text-gray-600">Total Profit:</p>
                  <p class="text-lg font-bold" :class="{
                    'text-red-600': getProfit() < 0,
                    'text-green-600': getProfit() > 0,
                    'text-gray-900': getProfit() === 0
                  }">
                    {{ formatCurrency(getProfit()) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Log Penjualan -->
          <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div class="bg-[#1E3A5F] px-6 py-4">
              <h2 class="text-xl font-semibold text-white">Log Penjualan</h2>
            </div>
            
            <div class="p-6">
              <div class="relative">
                <!-- Timeline vertical line -->
                <div class="absolute left-6 top-0 bottom-0 w-px bg-gray-300"></div>

                <!-- Timeline items -->
                <div v-for="(log, index) in projectData.projectLogs" :key="index" 
                     class="relative flex pb-8 last:pb-0">
                  <!-- Timeline dot -->
                  <div class="absolute left-4 w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow"></div>
                  
                  <!-- Content -->
                  <div class="ml-12 flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-2">
                      <div class="text-xs text-gray-500">
                        {{ formatDateTime(log.actionDate) }}
                      </div>
                    </div>
                    
                    <div class="bg-gray-50 rounded-lg p-4">
                      <div class="mb-2">
                        <span class="text-sm font-medium text-gray-700">User:</span>
                        <span class="text-sm text-gray-900 ml-2">{{ log.user }}</span>
                      </div>
                      
                      <div>
                        <span class="text-sm font-medium text-gray-700">Action:</span>
                        <p class="text-sm text-gray-900 mt-1">{{ log.action }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Empty state -->
                <div v-if="!projectData.projectLogs || projectData.projectLogs.length === 0" 
                     class="text-center py-8 text-gray-500">
                  Tidak ada log aktivitas
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Payment Modal -->
    <VModal v-model="showPaymentModal">
      <div class="bg-white rounded-lg p-6 max-w-md mx-auto">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          Konfirmasi Perubahan Status Pembayaran
        </h3>
        <p class="mb-6 text-gray-600 leading-relaxed">
          {{ getPaymentModalMessage }}
        </p>
        
        <div class="flex justify-end gap-3">
          <VCancelButton label="Tidak" @click="closePaymentModal" />
          <VSuccessButton label="Ya" @click="updatePaymentStatus" />
        </div>
      </div>
    </VModal>
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