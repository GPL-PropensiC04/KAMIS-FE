<template>
  <Breadcrumb/>
  <div class="min-h-screen bg-gray-100 p-6">
    <!-- Navigation header -->
    <div class="mb-4 flex justify-between items-center">
      
    </div>
    
    <!-- Main Form -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- Form header with back button and next button -->
      <div class="flex justify-between mb-6">
        <router-link to="/project" class="text-[#1E3A5F] hover:text-[#1a325a] text-2xl flex items-center">
          <span>←</span>
        </router-link>
        <button 
          @click="submitForm" 
          class="bg-[#2D6A4F] hover:bg-[#216043] text-white px-4 py-2 rounded-md"
        >
          Selanjutnya
        </button>
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
            />
          </div>

          <!-- Klien -->
          <div>
            <label class="block text-gray-700 mb-2 font-medium">Klien</label>
            <div class="relative">
              <select 
                v-model="formData.projectClientId"
                class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
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
            
              <div class="w-full">
                <div class="relative">
                  <input 
                    :value="formData.projectStartDate"
                    @input="handleDateInput($event)"
                    type="date" 
                    class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg class="w-5 h-5 fill-current text-gray-400" viewBox="0 0 20 20"><path d="M10 14a4 4 0 100-8 4 4 0 000 8zm0 1A5 5 0 1110 5a5 5 0 010 10z"></path></svg>
                  </div>
                </div>
              </div>
            
          </div>
        </div>
      </div>

      <!-- Products Section -->
      <div class="mt-8">
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
                <option v-for="num in (availableProducts.find(p => p.id === selectedProduct)?.stock || 0)" :key="num" :value="num">{{ num }}</option>
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

        <!-- Summary -->
        <div class="mt-6 bg-gray-50 rounded-lg p-4">
          <div class="flex justify-between">
            <div class="text-lg font-bold">Total Pemasukan</div>
            <div class="text-lg font-bold">{{ formatCurrency(totalRevenue) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import axios from 'axios';
import { API_URLS } from '@/config/api.config';
import Breadcrumb from '@/components/Breadcrumb.vue';

// Router & Toast
const router = useRouter();
const toast = useToast();

// Form data
const formData = ref({
  projectName: '',
  projectClientId: '',
  projectType: false, // False for Sales
  projectStartDate: '',
  projectEndDate: '',
  projectDeliveryAddress: '',
  projectTotalPemasukkan: 0,
  projectUseResource: [] as Array<{ 
    resourceId: string,
    resourceStockUsed: number,
    sellPrice: number
  }>
});

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

// Computed values
const totalRevenue = computed(() => {
  return productList.value.reduce((sum, product) => sum + (product.price * product.quantity), 0);
});

// Watch selected product to update price
watch(selectedProduct, (newValue) => {
  if (newValue) {
    const product = availableProducts.value.find(p => p.id === newValue);
    if (product) {
      selectedPrice.value = product.price;
    } else {
      selectedPrice.value = 0;
    }
  } else {
    selectedPrice.value = 0;
  }
});

// Fetch clients from API
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

// Fetch products (resources) from API
const fetchProducts = async () => {
  try {
    const response = await axios.get(`${API_URLS.RESOURCE}/resource/viewall`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    // Define interface for resource response
    interface ResourceResponse {
      id: string;
      resourceName: string;
      resourcePrice?: number;
      resourceStock?: number;
    }
    
    // Assuming the API returns resources with this structure
    availableProducts.value = response.data.data.map((resource: ResourceResponse) => ({
      id: resource.id,
      name: resource.resourceName,
      price: resource.resourcePrice, 
      stock: resource.resourceStock 
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    toast.error('Gagal mengambil data produk');

  }
};

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

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
      price: product.price
    });
  }
  
  // Update total in form data
  updateFormData();
  
  // Reset selection
  selectedProduct.value = '';
  selectedQuantity.value = null;
  selectedPrice.value = 0;
};

// Remove product from cart
const removeProduct = (index: number) => {
  productList.value.splice(index, 1);
  updateFormData();
};

// Update form data with current product list
const updateFormData = () => {
  formData.value.projectTotalPemasukkan = totalRevenue.value;
  formData.value.projectUseResource = productList.value.map(product => ({
    resourceId: product.id,
    resourceStockUsed: product.quantity,
    sellPrice: product.price
  }));
  
  // Store form data in localStorage for summary page
  localStorage.setItem('salesFormData', JSON.stringify(formData.value));
  localStorage.setItem('salesProductList', JSON.stringify(productList.value));
  localStorage.setItem('clientList', JSON.stringify(clients.value));
};


// Form submission
const submitForm = async () => {
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
  
  if (productList.value.length === 0) {
    toast.error('Minimal satu barang harus ditambahkan');
    return;
  }
  formData.value.projectEndDate = formData.value.projectStartDate;
  if (formData.value.projectEndDate && formData.value.projectStartDate && formData.value.projectEndDate < formData.value.projectStartDate) {
    console.log(formData.value.projectEndDate, formData.value.projectStartDate);
    toast.error('Tanggal akhir harus lebih dari tanggal mulai');
    return;
  }

  
  // Update form data before submitting
  updateFormData();
  
  try {
    // Navigate to summary page instead of submitting directly
    router.push('/project/add/sales-summary');
  } catch (error) {
    console.error('Error navigating to summary page:', error);
    toast.error('Terjadi kesalahan. Silahkan coba lagi.');
  }
};

// Load data on component mount
onMounted(() => {
  fetchClients();
  fetchProducts();
  
  // Check for saved form data
  const savedData = localStorage.getItem('salesFormData');
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      formData.value = { ...formData.value, ...parsedData };
      
      // Restore product list if available
      if (parsedData.projectUseResource && Array.isArray(parsedData.projectUseResource)) {
        // We'd need to fetch full product details to reconstruct the product list
        // This is simplified for now
      }
    } catch (error) {
      console.error('Error parsing saved form data:', error);
    }
  }
});

// Custom date input handler
const handleDateInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target) {
    formData.value.projectStartDate = target.value;
  }
};
</script> 