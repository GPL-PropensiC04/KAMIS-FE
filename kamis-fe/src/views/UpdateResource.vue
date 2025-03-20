<template>
    <div class="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6">
      <!-- Main Content -->
      <div class="bg-white rounded-lg shadow-md p-8 w-full max-w-3xl">
        <!-- Back Button -->
        <button 
          @click="router.back()" 
          class="hover:underline flex items-center mb-4 text-[28px]"
        >
          <span >←</span>
        </button>

        <!-- Form -->
        <form @submit.prevent="updateResource" class="space-y-6">
          <!-- Nama Resource -->
          <div>
            <label for="resourceName" class="block text-sm font-medium text-gray-700 mb-1">
              Nama Resource
            </label>
            <VLockedInput :value="resourceName" />
          </div>
  
          <!-- Harga Jual and Stock -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <!-- Harga Jual -->
            <div>
              <label for="resourcePrice" class="block text-sm font-medium text-gray-700 mb-1">
                Harga Jual
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  Rp
                </span>
                <input
                  id="resourcePrice"
                  v-model="resourcePrice"
                  type="number"
                  min="0"
                  required
                  class="w-full pl-10 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-[#f8fafc]"
                />
              </div>
            </div>
  
            <!-- Stock Resource -->
            <div>
              <label for="resourceStock" class="block text-sm font-medium text-gray-700 mb-1">
                Stok Saat Ini
              </label>
              <VLockedInput :value="resourceStock.toString()" />
            </div>
          </div>
  
          <!-- Deskripsi Resource -->
          <div>
            <label for="resourceDescription" class="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi Resource
            </label>
            <textarea
              id="resourceDescription"
              v-model="resourceDescription"
              rows="4"
              required
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-[#f8fafc]"
            ></textarea>
          </div>
  
          <!-- Update Button pakai VSuccessButton -->
          <div class="flex justify-center pt-4">
            <VSuccessButton
              label="Update Resource"
              type="submit"
            />
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useResourceStore } from '@/stores/resource';
  import type { ResourceInterface } from '@/interfaces/resource.interface';
  import VLockedInput from '@/components/VLockedInput.vue';
  import VSuccessButton from '@/components/VSuccessButton.vue';
  
  const router = useRouter();
  const route = useRoute();
  const resourceStore = useResourceStore();
  
  const resourceId = Number(route.params.id);
  const resourceName = ref('');
  const resourceStock = ref(0);
  const resourcePrice = ref(0);
  const resourceDescription = ref('');
  
  // Fetch existing data
  onMounted(async () => {
    await resourceStore.viewAllResources();
    const resource = resourceStore.resources.find((res) => res.id === resourceId);
    if (resource) {
      resourceName.value = resource.resourceName;
      resourceStock.value = resource.resourceStock;
      resourcePrice.value = resource.resourcePrice;
      resourceDescription.value = resource.resourceDescription;
    }
  });
  
  // Update handler sesuai store
  const updateResource = async () => {
    const body: Partial<ResourceInterface> = {
      resourcePrice: resourcePrice.value,
      resourceDescription: resourceDescription.value,
    };
  
    try {
      await resourceStore.updateResource(resourceId, body);
    } catch (error) {
      console.error('Gagal update resource:', error);
    }
  };
  </script>
  