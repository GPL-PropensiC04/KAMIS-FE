<template>
  <Breadcrumb/>
  <div class="min-h-screen bg-gray-100 p-6">
    <!-- Navigation header -->
    <div class="mb-4 flex justify-between items-center">
      <router-link to="/project" class="text-[#1E3A5F] hover:text-[#1a325a] text-2xl flex items-center">
        <span>←</span>
      </router-link>
      
    </div>

    <!-- Main Content -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- Header with action buttons -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-bold text-[#1E3A5F]">Konfirmasi Data Penjualan</h2>
          <p class="text-gray-500">Periksa kembali data penjualan sebelum mengirim</p>
        </div>
        <div class="flex space-x-3">
          <button @click="goBack" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700">
            Kembali
          </button>
          <button 
            @click="submitForm" 
            class="px-4 py-2 bg-[#2D6A4F] hover:bg-[#216043] text-white rounded-md"
          >
            Kirim
          </button>
        </div>
      </div>

      <!-- Project Information -->
      <div class="mb-8 border-b pb-6">
        <h3 class="text-lg font-semibold mb-4 text-[#1E3A5F]">Informasi Umum</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-gray-600 text-sm">Nama Aktivitas</p>
            <p class="font-semibold">{{ formData.projectName }}</p>
          </div>
          <div>
            <p class="text-gray-600 text-sm">Nama Klien</p>
            <p class="font-semibold">{{ getClientName(formData.projectClientId) }}</p>
          </div>
          <div>
            <p class="text-gray-600 text-sm">Tanggal Mulai</p>
            <p class="font-semibold">{{ formatDate(formData.projectStartDate) }}</p>
          </div>
          <div>
            <p class="text-gray-600 text-sm">Tanggal Selesai</p>
            <p class="font-semibold">{{ formData.projectEndDate ? formatDate(formData.projectEndDate) : '-' }}</p>
          </div>
          <div>
            <p class="text-gray-600 text-sm">Alamat Pengiriman</p>
            <p class="font-semibold">{{ formData.projectDeliveryAddress }}</p>
          </div>
        </div>
      </div>

      <!-- Products Table -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-[#1E3A5F]">Barang yang Dijual</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Barang</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Satuan</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(product, index) in productList" :key="index" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">{{ index + 1 }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ product.resourceName }}</td>
                <td class="px-6 py-4 text-center whitespace-nowrap">{{ product.resourceQuantity }}</td>
                <td class="px-6 py-4 text-right whitespace-nowrap">{{ formatCurrency(product.resourcePrice) }}</td>
                <td class="px-6 py-4 text-right whitespace-nowrap font-medium">{{ formatCurrency(product.resourcePrice * product.resourceQuantity) }}</td>
              </tr>
              <tr v-if="productList.length === 0">
                <td colspan="5" class="px-6 py-4 text-center">Tidak ada barang yang ditambahkan</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Financial Summary -->
      <div class="rounded-lg bg-gray-50 p-4">
        <h3 class="text-lg font-semibold mb-3 text-[#1E3A5F]">Ringkasan Keuangan</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div class="flex justify-between border-t border-gray-300 mt-2 pt-2">
            <span class="text-gray-600">Total Harga Barang:</span>
            <span class="font-semibold">{{ formatCurrency(totalProductCost) }}</span>
          </div>
          <div class="flex justify-between border-t border-gray-300 mt-2 pt-2">
            <span class="text-gray-600">Total Pemasukan:</span>
            <span class="font-semibold">{{ formatCurrency(formData.projectTotalPemasukkan) }}</span>
          </div>
          <div class="flex justify-between md:col-span-2 border-t border-gray-300 mt-2 pt-2">
            <span class="font-bold text-[#1E3A5F]">Estimasi Keuntungan:</span>
            <span class="font-bold" :class="estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ formatCurrency(estimatedProfit) }}
            </span>
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