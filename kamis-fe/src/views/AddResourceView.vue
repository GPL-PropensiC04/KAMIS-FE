<template>
  <div class="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6">
    <!-- Main Content -->
    <div class="bg-white rounded-lg shadow-md p-8 w-full max-w-3xl">
      <!-- Back Button -->
      <button 
        @click="router.back()" 
        class="mb-6 text-[#1E3A5F] hover:text-[#1a325a] flex items-center gap-2"
      >
        <span class="text-2xl">←</span>
      </button>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Nama Barang -->
        <div>
          <label for="resourceName" class="block text-sm font-medium text-gray-700 mb-1">
            Nama Barang
          </label>
          <input
            id="resourceName"
            v-model="formData.resourceName"
            type="text"
            required
            class="w-full p-2 border border-[#1E3A5F] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-[#E5EAF2]"
          />
        </div>

        <!-- Harga Jual and Stok Barang in same row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Harga Jual -->
          <div>
            <label for="price" class="block text-sm font-medium text-gray-700 mb-1">
              Harga Jual
            </label>
            <VPriceInput
              id="resourcePrice"
              v-model="formData.resourcePrice"
              :min="0"
              :step="10000"
            />
          </div>

          <!-- Stok Barang -->
          <div>
            <label for="stock" class="block text-sm font-medium text-gray-700 mb-1">
              Stok barang
            </label>
            <VNumberInput
              id="resourceStock"
              v-model="formData.resourceStock"
              :min="0"
            />
          </div>
        </div>

        <!-- Deskripsi Barang -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
            Deskripsi Barang
          </label>
          <textarea
            id="resourceDescription"
            v-model="formData.resourceDescription"
            required
            class="w-full p-2 border border-[#1E3A5F] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-[#E5EAF2]"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-center pt-4">
          <button
            type="submit"
            class="w-full sm:w-auto px-8 py-2 bg-[#1E3A5F] text-white rounded hover:bg-[#1a325a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { AddResourceRequestInterface } from '@/interfaces/resource.interface';
import { useResourceStore } from '@/stores/resource';
import VPriceInput from '@/components/VPriceInput.vue';
import VNumberInput from '@/components/VNumberInput.vue';

const router = useRouter();
const resourceStore = useResourceStore();
const isLoading = computed(() => resourceStore.loading);

const formData = ref<AddResourceRequestInterface>({
  resourceName: '',
  resourcePrice: 0,
  resourceStock: 0,
  resourceDescription: ''
});

const handleSubmit = async () => {
  await resourceStore.addResource(formData.value);
};
</script>
