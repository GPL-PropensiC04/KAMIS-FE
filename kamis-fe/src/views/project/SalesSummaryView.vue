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
                <h1 class="text-2xl font-bold text-white">Konfirmasi Data Penjualan</h1>
                <p class="text-blue-100 mt-1">Periksa kembali data penjualan sebelum mengirim</p>
              </div>
            </div>

            <div class="flex space-x-3">
              <button 
                @click="goBack" 
                class="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 font-medium border border-white/30 hover:scale-105 transform"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
                </svg>
                <span>Kembali</span>
              </button>
              <button 
                @click="submitForm" 
                class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
                <span>Kirim</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Project Information Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div class="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-800">Informasi Umum</h2>
          </div>
        </div>

        <div class="p-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Left Column -->
            <div class="space-y-6">
              <div class="group">
                <div class="flex items-center space-x-2 mb-3">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                  <span class="text-sm font-semibold text-gray-500 uppercase">Nama Aktivitas</span>
                </div>
                <p class="text-lg font-bold text-gray-900">{{ formData.projectName }}</p>
              </div>

              <div class="group">
                <div class="flex items-center space-x-2 mb-3">
                  <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0v-2a2 2 0 00-2-2H7a2 2 0 00-2 2v2"></path>
                  </svg>
                  <span class="text-sm font-semibold text-gray-500 uppercase">Nama Klien</span>
                </div>
                <p class="text-lg font-bold text-gray-900">{{ getClientName(formData.projectClientId) }}</p>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
              <div class="group">
                <div class="flex items-center space-x-2 mb-3">
                  <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"></path>
                  </svg>
                  <span class="text-sm font-semibold text-gray-500 uppercase">Tanggal Aktivitas</span>
                </div>
                <p class="text-lg font-bold text-gray-900">{{ formatDate(formData.projectStartDate) }}</p>
              </div>

              <div class="group">
                <div class="flex items-center space-x-2 mb-3">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span class="text-sm font-semibold text-gray-500 uppercase">Alamat Pengiriman</span>
                </div>
                <p class="text-lg font-bold text-gray-900">{{ formData.projectDeliveryAddress }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div class="bg-[#1E3A5F] px-8 py-5">
          <div class="flex items-center space-x-3">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <h2 class="text-xl font-bold text-white">Barang yang Dijual</h2>
          </div>
        </div>

        <div class="p-8">
          <div class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-[#1E3A5F] text-white">
                    <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider rounded-tl-lg">
                      <div class="flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                        </svg>
                        <span>No</span>
                      </div>
                    </th>
                    <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      <div class="flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                        <span>Nama Barang</span>
                      </div>
                    </th>
                    <th class="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                      <div class="flex items-center justify-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                        </svg>
                        <span>Jumlah</span>
                      </div>
                    </th>
                    <th class="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">
                      <div class="flex items-center justify-end space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                        </svg>
                        <span>Harga Satuan</span>
                      </div>
                    </th>
                    <th class="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider rounded-tr-lg">
                      <div class="flex items-center justify-end space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                        </svg>
                        <span>Total</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(product, index) in productList" :key="index" class="hover:bg-blue-50 transition-colors duration-150">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                        <span class="text-sm font-bold text-blue-600">{{ index + 1 }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center space-x-3">
                        <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                          <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                          </svg>
                        </div>
                        <span class="text-sm font-medium text-gray-900">{{ product.resourceName }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-center whitespace-nowrap">
                      <span class="text-sm font-medium text-gray-900">{{ product.resourceQuantity }}</span>
                    </td>
                    <td class="px-6 py-4 text-right whitespace-nowrap">
                      <span class="text-sm font-semibold text-gray-900">{{ formatCurrency(product.resourcePrice) }}</span>
                    </td>
                    <td class="px-6 py-4 text-right whitespace-nowrap">
                      <span class="text-sm font-bold text-gray-900">{{ formatCurrency(product.resourcePrice * product.resourceQuantity) }}</span>
                    </td>
                  </tr>
                  <tr v-if="productList.length === 0">
                    <td colspan="5" class="px-6 py-12 text-center">
                      <div class="flex flex-col items-center space-y-3">
                        <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                        </svg>
                        <div class="text-center">
                          <h3 class="text-sm font-medium text-gray-700 mb-1">Tidak ada barang yang ditambahkan</h3>
                          <p class="text-xs text-gray-500">Belum ada data barang untuk ditampilkan</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Financial Summary Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
              <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800">Ringkasan Keuangan</h3>
          </div>
        </div>

        <div class="p-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Total Harga Barang -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div class="flex items-center space-x-3 mb-3">
                <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-blue-700">Total Harga Barang</p>
                  <p class="text-xs text-blue-600">{{ productList.length }} barang terjual</p>
                </div>
              </div>
              <p class="text-2xl font-bold text-blue-800">{{ formatCurrency(totalProductCost) }}</p>
            </div>

            <!-- Total Pemasukan -->
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div class="flex items-center space-x-3 mb-3">
                <div class="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-green-700">Total Pemasukan</p>
                  <p class="text-xs text-green-600">Revenue dari penjualan</p>
                </div>
              </div>
              <p class="text-2xl font-bold text-green-800">{{ formatCurrency(formData.projectTotalPemasukkan) }}</p>
            </div>
          </div>

          <!-- Estimasi Keuntungan -->
          <div class="mt-8 pt-6 border-t border-gray-200">
            <div class="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-yellow-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl">
                    <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="text-lg font-bold text-yellow-800">Estimasi Keuntungan</p>
                    <p class="text-sm text-yellow-700">Total pendapatan penjualan</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-3xl font-bold" :class="estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ formatCurrency(estimatedProfit) }}
                  </p>
                  <p class="text-sm" :class="estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ estimatedProfit >= 0 ? 'Profit' : 'Loss' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useProjectStore } from '@/stores/project';
import type { SalesFormData, ProjectResource } from '@/interfaces/project/project.interface';
import Breadcrumb from '@/components/Breadcrumb.vue';

const router = useRouter();
const toast = useToast();
const projectStore = useProjectStore();

const formData = ref<SalesFormData>(JSON.parse(localStorage.getItem('salesFormData') || '{}'));
const clients = ref<Array<{id: string, nameClient: string}>>([]);
const productList = ref<Array<ProjectResource>>([]);

// Computed values
const totalProductCost = computed(() => {
  return productList.value.reduce((sum, product) => sum + (product.resourcePrice * product.resourceQuantity), 0);
});

const estimatedProfit = computed(() => {
  return formData.value.projectTotalPemasukkan;
});

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value || 0);
};

// Format date
const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Get client name from client id
const getClientName = (clientId: string): string => {
  const client = clients.value.find(c => c.id === clientId);
  return client ? client.nameClient : clientId; // Changed client.name to client.nameClient
};

// Navigation
const goBack = () => {
  router.push('/project/add/sales');
};

// Form submission
const submitForm = async () => {
  try {
    // Call the store method to submit data
    await projectStore.addSalesProject(formData.value);
    
    // Clear stored form data
    localStorage.removeItem('salesFormData');
    
    // Navigate to project list
    router.push('/project');
  } catch (error) {
    console.error('Error submitting sales project:', error);
    // Error handling is done in the store
  }
};

// Load stored product data
const loadProductData = () => {
  try {
    const storedProductList = localStorage.getItem('salesProductList');
    if (storedProductList) {
      productList.value = JSON.parse(storedProductList);
    }
    
    const storedClients = localStorage.getItem('clientList');
    if (storedClients) {
      clients.value = JSON.parse(storedClients);
    }
  } catch (error) {
    console.error('Error loading stored product data:', error);
  }
};

// Check if we have form data
onMounted(() => {
  if (!formData.value.projectName) {
    toast.error('Data penjualan tidak ditemukan. Mohon isi formulir terlebih dahulu.');
    router.push('/project/add/sales');
    return;
  }
  
  loadProductData();
  
  // Update total income in form data based on products
  formData.value.projectTotalPemasukkan = totalProductCost.value;
});
</script>

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

/* Responsive design */
@media (max-width: 1024px) {
    .grid-cols-1.lg\\:grid-cols-2 {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .grid-cols-1.md\\:grid-cols-2 {
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
</style>