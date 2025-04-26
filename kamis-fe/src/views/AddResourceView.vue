<template>
  <Breadcrumb />
  <!-- Main background with dark overlay using background blend mode -->
  <div class="min-h-screen flex items-center justify-center p-6 relative 
              bg-black bg-[url('@/assets/Background.jpg')] bg-cover bg-center bg-blend-darken">
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
      <div class="space-y-6">
        <!-- Nama Barang -->
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

        <!-- Harga Jual and Stok Barang -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Harga Jual -->
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

          <!-- Stok Barang -->
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

        <!-- Deskripsi Barang -->
        <div>
          <label for="resourceDescription" class="block text-sm font-medium text-gray-700 mb-1">
            Deskripsi Barang <span class="text-red-500">*</span>
          </label>
          <textarea
            id="resourceDescription"
            v-model="formData.resourceDescription"
            required
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
            @click="handleSubmit"
            type="submit"
            class="w-full sm:w-auto px-8 py-2 bg-[#1E3A5F] text-white rounded 
                   hover:bg-[#1a325a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Menambahkan...' : 'Tambah' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { AddResourceRequestInterface } from '@/interfaces/resource.interface';
import { useResourceStore } from '@/stores/resource';
import VPriceInput from '@/components/VPriceInput.vue';
import VNumberInput from '@/components/VNumberInput.vue';
import Breadcrumb from '@/components/Breadcrumb.vue';

const router = useRouter();
const resourceStore = useResourceStore();
const isLoading = computed(() => resourceStore.loading);

const formData = ref<AddResourceRequestInterface>({
  resourceName: '',
  resourcePrice: 0,
  resourceStock: 0,
  resourceDescription: ''
});

// Validation errors state
const validationErrors = ref({
  resourceName: '',
  resourcePrice: '',
  resourceStock: '',
  resourceDescription: ''
});

// Validate form before submission
const validateForm = (): boolean => {
  // Reset all errors
  validationErrors.value = {
    resourceName: '',
    resourcePrice: '',
    resourceStock: '',
    resourceDescription: ''
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
</script>
