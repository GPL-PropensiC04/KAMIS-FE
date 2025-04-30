<template>
  <!-- Main background with dark overlay using background blend mode -->
  <Breadcrumb />
  <div class="min-h-screen flex items-center justify-center p-6 relative 
              bg-[url('@/assets/Background.jpg')] bg-cover bg-center bg-blend-darken">
    <!-- Main Content (on top of the blended background) -->
    <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-3xl relative z-10">
    
      <!-- Header with Back Button -->
      <div class="flex justify-between items-center mb-6">
        <button 
          @click="router.back()" 
          class="hover:underline flex items-center text-[28px] text-[#1E3A5F]"
        >
          <span>←</span>
        </button>
        <h2 class="text-xl font-semibold text-[#1E3A5F]">Tambah Barang Baru</h2>
      </div>

      <!-- Form Content -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Top row: Nama Barang and Supplier -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="resourceName" class="block text-sm font-medium text-gray-700 mb-1">
              Nama Barang <span class="text-red-500">*</span>
            </label>
            <input
              id="resourceName"
              v-model="formData.resourceName"
              type="text"
              required
              class="w-full p-2 border border-[#1E3A5F] rounded-md 
                    focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-[#E5EAF2]"
            />
            <div v-if="validationErrors.resourceName" class="text-red-500 text-xs mt-1">
              {{ validationErrors.resourceName }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Supplier <span class="text-red-500">*</span>
            </label>
            <VSpecialDropDown v-model="selectedSupplier" :options="supplierOptions" />
            <div v-if="validationErrors.resourceSupplierId" class="text-red-500 text-xs mt-1">
              {{ validationErrors.resourceSupplierId }}
            </div>
          </div>
        </div>

        <!-- Middle row: Harga Jual and Stok Barang -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="resourcePrice" class="block text-sm font-medium text-gray-700 mb-1">
              Harga Jual <span class="text-red-500">*</span>
            </label>
            <VPriceInput
              id="resourcePrice"
              v-model="formData.resourcePrice"
              :min="0"
              :step="10000"
              required
            />
            <div v-if="validationErrors.resourcePrice" class="text-red-500 text-xs mt-1">
              {{ validationErrors.resourcePrice }}
            </div>
          </div>

          <div>
            <label for="resourceStock" class="block text-sm font-medium text-gray-700 mb-1">
              Stok barang <span class="text-red-500">*</span>
            </label>
            <VNumberInput
              id="resourceStock"
              v-model="formData.resourceStock"
              :min="0"
              required
            />
            <div v-if="validationErrors.resourceStock" class="text-red-500 text-xs mt-1">
              {{ validationErrors.resourceStock }}
            </div>
          </div>
        </div>

        <!-- Bottom row: Deskripsi Barang -->
        <div>
          <label for="resourceDescription" class="block text-sm font-medium text-gray-700 mb-1">
            Deskripsi Barang <span class="text-red-500">*</span>
          </label>
          <textarea
            id="resourceDescription"
            v-model="formData.resourceDescription"
            required
            rows="4"
            class="w-full p-2 border border-[#1E3A5F] rounded-md 
                   focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-[#E5EAF2]"
          ></textarea>
          <div v-if="validationErrors.resourceDescription" class="text-red-500 text-xs mt-1">
            {{ validationErrors.resourceDescription }}
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-center pt-4">
          <button 
            type="submit"
            class="w-full sm:w-auto px-12 py-3 bg-[#1E3A5F] text-white rounded 
                   hover:bg-[#1a325a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Menambahkan...' : 'Tambah' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { AddResourceRequestInterface } from '@/interfaces/resource/resource.interface';
import { useResourceStore } from '@/stores/resource';
import VPriceInput from '@/components/VPriceInput.vue';
import VNumberInput from '@/components/VNumberInput.vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import axios from "axios";
import { API_URLS } from "@/config/api.config";
import type { UUID } from "crypto";
import VSpecialDropDown from "@/components/VSpecialDropDown.vue";
import { watch } from 'vue';

const router = useRouter();
const resourceStore = useResourceStore();
const isLoading = computed(() => resourceStore.loading);
// Add this with your other ref declarations
const selectedSupplier = ref<string | undefined>(undefined);

const formData = ref<AddResourceRequestInterface>({
  resourceName: '',
  resourcePrice: 0,
  resourceStock: 0,
  resourceDescription: '',
  resourceSupplierId: '',
});

// Validation errors state
const validationErrors = ref({
  resourceName: '',
  resourcePrice: '',
  resourceStock: '',
  resourceDescription: '',
  resourceSupplierId: ''
});

// Validate form before submission
const validateForm = (): boolean => {
  
  // Reset all errors
  validationErrors.value = {
    resourceName: '',
    resourcePrice: '',
    resourceStock: '',
    resourceDescription: '',
    resourceSupplierId: ''
  };
  
  let isValid = true;

  // Validate resource name
  if (!formData.value.resourceName.trim()) {
    validationErrors.value.resourceName = 'Nama barang harus diisi';
    isValid = false;
  }

  // Validate resource price
  if (formData.value.resourcePrice <= 0) {
    validationErrors.value.resourcePrice = 'Harga jual harus lebih dari 0';
    isValid = false;
  }

  // Validate resource stock
  if (formData.value.resourceStock <= 0) {
    validationErrors.value.resourceStock = 'Stok barang tidak boleh 0';
    isValid = false;
  }

  // Validate resource description
  if (!formData.value.resourceDescription.trim()) {
    validationErrors.value.resourceDescription = 'Deskripsi barang harus diisi';
    isValid = false;
  }

  // In your validateForm function, add this check
  if (!formData.value.resourceSupplierId) {
    validationErrors.value.resourceSupplierId = 'Supplier harus dipilih';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async (e: Event) => {
  e.preventDefault(); // Explicitly prevent form submission
  
  // First validate the form
  if (!validateForm()) {
    return; // Stop submission if validation fails
  }
  
  try {
    await resourceStore.addResource(formData.value);
    // If successful, redirect to resources list
    router.push('/resource');
  } catch (error) {
    console.error('Error adding resource:', error);
  }
};

const supplierOptions = ref<{ label: string; value: UUID }[]>([]);

const fetchSuppliers = async () => {
    try {
        const response = await axios.get(`${API_URLS.PROFILE}/supplier/all`, {
            headers: { "Content-Type": "application/json" }
        });

        supplierOptions.value = response.data.data.map((item: { id: UUID; nameSupplier: string; }) => ({
            label: item.nameSupplier, // untuk ditampilkan
            value: item.id // untuk disimpan
        }));
    } catch (error) {
        console.error("Error fetching suppliers:", error);
    }
};

onMounted(() => {
  fetchSuppliers();
  
});

// Update formData when supplier changes
watch(selectedSupplier, (newValue) => {
  formData.value.resourceSupplierId = newValue || '';
});
</script>
