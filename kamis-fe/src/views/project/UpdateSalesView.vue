<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import axios from 'axios';
import { API_URLS } from '@/config/api.config';
import type { UpdateProjectFormData, ProjectInterface } from '@/interfaces/project/project.interface';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { useProjectStore } from '@/stores/project';

// Router & Toast
const router = useRouter();
const route = useRoute();
const toast = useToast();
const projectId = route.params.id as string;
const projectStore = useProjectStore();

// Form data
const formData = ref<UpdateProjectFormData | null>(null);
const isLoading = ref(true);

// Client data
interface Client {
  id: string;
  name: string;
}

const clients = ref<Client[]>([]);

// Product data
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface CartProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

const availableProducts = ref<Product[]>([]);
const productList = ref<CartProduct[]>([]);
const selectedProduct = ref('');
const selectedQuantity = ref<number | null>(null);
const selectedPrice = ref(0);

// Helper functions
const getStatusText = (status: number): string => {
  switch (status) {
    case 0: return 'Direncanakan';
    case 1: return 'Dilaksanakan';
    case 2: return 'Selesai';
    case 3: return 'Telah Dibayar';
    default: return 'Unknown';
  }
};

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

// Computed values
const totalRevenue = computed(() => {
  return productList.value.reduce((sum, product) => sum + (product.price * product.quantity), 0);
});

// Fetch project details
const fetchProjectDetails = async () => {
  isLoading.value = true;
  try {
    const projectData = await projectStore.fetchProjectById(projectId) as ProjectInterface;
    
    
    // Check if this is a sales project (not distribution)
    if (projectData.projectType) {
      toast.error('Halaman ini hanya untuk proyek penjualan.');
      router.push('/project');
      return;
    }
    
    // Format the dates to YYYY-MM-DD with safe date parsing
    let formattedStartDate = '';
    if (projectData.projectStartDate) {
      try {
        const startDate = new Date(projectData.projectStartDate);
        if (!isNaN(startDate.getTime())) { // Check if date is valid
          formattedStartDate = startDate.toISOString().split('T')[0];
        }
      } catch {
        console.error('Invalid start date:', projectData.projectStartDate);
      }
    }
    
    let formattedEndDate = '';
    if (projectData.projectEndDate) {
      try {
        const endDate = new Date(projectData.projectEndDate);
        if (!isNaN(endDate.getTime())) { // Check if date is valid
          formattedEndDate = endDate.toISOString().split('T')[0];
        }
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
      projectDeliveryAddress: projectData.projectDeliveryAddress || '',
      projectTotalPemasukkan: projectData.projectTotalPemasukkan || 0,
      projectUseResource: projectData.projectUseResource 
    };
    
    // Load related data
    await loadResourceData();
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
      name: client.nameClient
    }));
  } catch (error) {
    console.error('Error fetching clients:', error);
    toast.error('Gagal mengambil data klien');
  }
};

// Load resource data for sales projects
const loadResourceData = async () => {
  if (!formData.value || !formData.value.projectUseResource) return;
  
  try {
    // Fetch all resources
    await fetchProducts();
    
    // Process project resources
    productList.value = [];
    
    
    for (const resourceData of formData.value.projectUseResource) {
      // Clean the resourceId - trim whitespace and convert to string
      const cleanId = String(resourceData.resourceId).trim();
      
      // Find the resource details
      const resource = availableProducts.value.find(p => String(p.id).trim() === cleanId);
      
      if (resource) {
        productList.value.push({
          id: resource.id,
          name: resource.name,
          quantity: resourceData.resourceStockUsed,
          price: resourceData.sellPrice
        });
      } else {
        // If resource not found, still add it with a placeholder name
        productList.value.push({
          id: cleanId,
          name: `Resource ${cleanId}`,
          quantity: resourceData.resourceStockUsed,
          price: resourceData.sellPrice
        });
      }
    }
    
  } catch (error) {
    console.error('Error loading resource data:', error);
    toast.error('Gagal memuat data barang');
  }
};

// Fetch products (resources) from API
const fetchProducts = async () => {
  try {
    const response = await axios.get(`${API_URLS.RESOURCE}/resource/viewall`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    console.log('Raw resource data from API:', response.data.data);
    
    // Define interface for resource response
    interface ResourceResponse {
      id: string | number;
      resourceName: string;
      resourcePrice?: number;
      resourceStock?: number;
    }
    
    // Assuming the API returns resources with this structure
    availableProducts.value = response.data.data.map((resource: ResourceResponse) => {
      console.log(`Resource ${resource.id} (${resource.resourceName}) sell price:`, resource.resourcePrice);
      
      return {
        id: String(resource.id).trim(), // Convert to string and trim whitespace
        name: resource.resourceName,
        price: resource.resourcePrice || 0,
        stock: resource.resourceStock || 0
      };
    });
    
    console.log('Processed available products with prices:', 
      availableProducts.value.map(p => ({ id: p.id, name: p.name, price: p.price }))
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    toast.error('Gagal mengambil data produk');
  }
};

// Watch selected product to update price
watch(selectedProduct, (newValue) => {
  if (newValue) {
    console.log(`Selected product changed to: ${newValue}`);
    const product = availableProducts.value.find(p => p.id === newValue);
    if (product) {
      console.log(`Found product: ${product.name}, price: ${product.price}`);
      selectedPrice.value = product.price;
    } else {
      console.log(`No product found with id: ${newValue}`);
      selectedPrice.value = 0;
    }
  } else {
    selectedPrice.value = 0;
  }
});

// Add product to cart
const addProduct = () => {
  if (!selectedProduct.value || !selectedQuantity.value) {
    toast.error('Pilih nama barang dan jumlah terlebih dahulu');
    return;
  }
  
  const product = availableProducts.value.find(p => p.id === selectedProduct.value);
  
  if (!product) {
    toast.error('Barang tidak ditemukan');
    return;
  }
  
  if (selectedPrice.value <= 0) {
    toast.error('Harga barang harus lebih dari 0');
    return;
  }
  
  if (selectedQuantity.value <= 0) {
    toast.error('Jumlah harus lebih dari 0');
    return;
  }
  
  if (selectedQuantity.value > product.stock) {
    toast.error(`Stok barang tidak cukup. Sisa stok: ${product.stock}`);
    return;
  }
  
  // Check if product already exists in cart
  const existingIndex = productList.value.findIndex(p => p.id === product.id);
  
  if (existingIndex >= 0) {
    // Update existing product
    const newQuantity = productList.value[existingIndex].quantity + selectedQuantity.value;
    
    if (newQuantity > product.stock) {
      toast.error(`Stok barang tidak cukup. Sisa stok: ${product.stock}`);
      return;
    }
    
    productList.value[existingIndex].quantity = newQuantity;
  } else {
    // Add new product
    productList.value.push({
      id: product.id,
      name: product.name,
      quantity: selectedQuantity.value,
      price: selectedPrice.value
    });
  }
  
  // Reset selection
  selectedProduct.value = '';
  selectedQuantity.value = null;
  selectedPrice.value = 0;
  
  // Update form data
  updateFormData();
};

// Remove product from cart
const removeProduct = (index: number) => {
  productList.value.splice(index, 1);
  updateFormData();
};

// Update form data with current lists
const updateFormData = () => {
  if (!formData.value) return;

  formData.value.projectTotalPemasukkan = totalRevenue.value;
  formData.value.projectUseResource = productList.value.map(product => ({
    resourceId: product.id,
    resourceStockUsed: product.quantity,
    sellPrice: product.price
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
  
  if (formData.value.projectStatus === 0 && productList.value.length === 0) {
    toast.error('Minimal satu barang harus ditambahkan');
    return;
  }
  
  // Update form data before submitting
  updateFormData();
  
  // Create a copy of the data to avoid modifying the original
  const requestData = { ...formData.value };
  
  // Limit the size of any large arrays to prevent log message overflow
  if (requestData.projectUseResource && requestData.projectUseResource.length > 5) {
    console.log(`Limiting projectUseResource array to prevent log overflow (original size: ${requestData.projectUseResource.length})`);
    // Keep a reference to the original array for local state
    const originalResources = [...requestData.projectUseResource];
    // Truncate to 5 items for the API request
    requestData.projectUseResource = requestData.projectUseResource.slice(0, 5);
    // Add a note in console but don't add a summary item to avoid type errors
    console.log(`Removed ${originalResources.length - 5} items to prevent log overflow`);
  }
  
  try {
    await axios.put(
      `${API_URLS.PROJECT}/project/update/${requestData.id}`,
      requestData,
      {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      }
    );
    
    toast.success('Proyek berhasil diperbarui');
    // Redirect to project detail page
    router.push(`/project/${requestData.id}`);
  } catch (error) {
    console.error('Error updating project:', error);
    toast.error('Gagal memperbarui proyek');
  }
};

// Load data on component mount
onMounted(() => {
  fetchClients();
  fetchProjectDetails();
});
</script> 

<template>
    <Breadcrumb/>
    <div class="min-h-screen bg-gray-100 p-6">
      <!-- Navigation header -->
      <div class="mb-4 flex justify-between items-center">
      </div>
      
      <!-- Main Form -->
      <div class="bg-white rounded-lg shadow-md p-6" v-if="formData">
        <!-- Form header with back button and update button -->
        <div class="flex justify-between mb-6">
          <router-link to="/project" class="text-[#1E3A5F] hover:text-[#1a325a] text-2xl flex items-center">
          <span>←</span>
        </router-link>
          <button 
            @click="submitForm" 
            class="bg-[#2D6A4F] hover:bg-[#216043] text-white px-4 py-2 rounded-md"
            :disabled="formData.projectStatus >= 2"
          >
            Update
          </button>
        </div>
  
        <!-- Project Status Banner -->
        <div class="mb-6" :class="{
          'bg-blue-100 text-blue-800': formData.projectStatus === 0,
          'bg-yellow-100 text-yellow-800': formData.projectStatus === 1,
          'bg-green-100 text-green-800': formData.projectStatus === 2,
          'bg-purple-100 text-purple-800': formData.projectStatus === 3
        }">
          <div class="p-3 font-semibold text-center rounded">
            Status: {{ getStatusText(formData.projectStatus) }}
          </div>
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
                :disabled="formData.projectStatus > 0"
              />
            </div>
  
            <!-- Klien -->
            <div>
              <label class="block text-gray-700 mb-2 font-medium">Klien</label>
              <div class="relative">
                <select 
                  v-model="formData.projectClientId"
                  class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  :disabled="formData.projectStatus > 0"
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
  
            <!-- Alamat Pengiriman -->
            <div>
              <label class="block text-gray-700 mb-2 font-medium">Alamat Pengiriman</label>
              <input 
                v-model="formData.projectDeliveryAddress"
                type="text" 
                class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan alamat pengiriman"
                :disabled="formData.projectStatus >= 1"
              />
            </div>
          </div>
  
          <!-- Right column -->
          <div class="space-y-6">
            <!-- Jenis Aktivitas - Display only -->
            <div>
              <label class="block text-gray-700 mb-2 font-medium">Jenis Aktivitas</label>
              <div class="w-full p-2 bg-gray-200 border border-gray-300 rounded text-gray-700">
                Penjualan
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
                      :disabled="formData.projectStatus >= 1"
                    />
                  </div>
                </div>
                <div class="w-1/2">
                  <div class="relative">
                    <input 
                      v-model="formData.projectEndDate"
                      type="date" 
                      class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      :disabled="formData.projectStatus >= 2"
                    />
                  </div>
                </div>
              </div>
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
                :disabled="formData.projectStatus >= 1 || formData.projectStatus === 0"
                readonly
              />
            </div>
          </div>
        </div>
  
        <!-- Products Section -->
        <div class="mt-8" v-if="formData.projectStatus < 1">
          <h2 class="text-xl font-semibold text-[#1E3A5F] mb-4">Barang Yang Dijual</h2>
          
          <!-- Product selection form -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
            <div>
              <label class="block text-gray-700 mb-2 text-sm">Nama Barang</label>
              <div class="relative">
                <select 
                  v-model="selectedProduct"
                  class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
                >
                  <option value="" disabled>Pilih Barang</option>
                  <option v-for="product in availableProducts" :key="product.id" :value="product.id">
                    {{ product.name }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg class="w-4 h-4 fill-current text-gray-400" viewBox="0 0 20 20"><path d="M7 7l3-3 3 3m0 6l-3 3-3-3"></path></svg>
                </div>
              </div>
            </div>
            
            <div>
              <label class="block text-gray-700 mb-2 text-sm">Jumlah</label>
              <div class="relative">
                <select 
                  v-model="selectedQuantity"
                  class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
                >
                  <option value="" disabled>Pilih Jumlah</option>
                  <option v-for="num in 10" :key="num" :value="num">{{ num }}</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg class="w-4 h-4 fill-current text-gray-400" viewBox="0 0 20 20"><path d="M7 7l3-3 3 3m0 6l-3 3-3-3"></path></svg>
                </div>
              </div>
            </div>
            
            <div>
              <label class="block text-gray-700 mb-2 text-sm">Harga Jual</label>
              <input 
                v-model.number="selectedPrice"
                type="number"
                min="0"
                class="w-full p-2 bg-gray-200 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                readonly
              />
            </div>
            
            <div>
              <button 
                @click="addProduct"
                class="w-full bg-[#1E3A5F] hover:bg-[#152c49] text-white p-2 rounded"
              >
                Tambah
              </button>
            </div>
          </div>
  
          <!-- Products table -->
          <div class="overflow-x-auto bg-white shadow rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-[#1E3A5F] text-white">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-medium uppercase">Nama Barang</th>
                  <th class="px-6 py-3 text-center text-sm font-medium uppercase">Jumlah</th>
                  <th class="px-6 py-3 text-right text-sm font-medium uppercase">Harga Jual</th>
                  <th class="px-6 py-3 text-center text-sm font-medium uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(product, index) in productList" :key="index" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">{{ product.name }}</td>
                  <td class="px-6 py-4 text-center whitespace-nowrap">{{ product.quantity }}</td>
                  <td class="px-6 py-4 text-right whitespace-nowrap">{{ formatCurrency(product.price) }}</td>
                  <td class="px-6 py-4 text-center whitespace-nowrap">
                    <button 
                      @click="removeProduct(index)"
                      class="text-red-600 hover:text-red-800"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr v-if="productList.length === 0">
                  <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                    Belum ada barang yang ditambahkan
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
  
        <!-- Products Section (Read-only) -->
        <div class="mt-8" v-if="formData.projectStatus >= 1">
          <h2 class="text-xl font-semibold text-[#1E3A5F] mb-4">Barang Yang Dijual</h2>
          
          <!-- Products table (read-only) -->
          <div class="overflow-x-auto bg-white shadow rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-[#1E3A5F] text-white">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-medium uppercase">Nama Barang</th>
                  <th class="px-6 py-3 text-center text-sm font-medium uppercase">Jumlah</th>
                  <th class="px-6 py-3 text-right text-sm font-medium uppercase">Harga Jual</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(product, index) in productList" :key="index" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">{{ product.name }}</td>
                  <td class="px-6 py-4 text-center whitespace-nowrap">{{ product.quantity }}</td>
                  <td class="px-6 py-4 text-right whitespace-nowrap">{{ formatCurrency(product.price) }}</td>
                </tr>
                <tr v-if="productList.length === 0">
                  <td colspan="3" class="px-6 py-4 text-center text-gray-500">
                    Tidak ada barang yang ditambahkan
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
  
        <!-- Summary -->
        <div class="mt-6 bg-gray-50 rounded-lg p-4">
          <div class="flex justify-between">
            <div class="text-lg font-bold">Total Pemasukan</div>
            <div class="text-lg font-bold">{{ formatCurrency(totalRevenue) }}</div>
          </div>
        </div>
      </div>
    </div>
  </template>