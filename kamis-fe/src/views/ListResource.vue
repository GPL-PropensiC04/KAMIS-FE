<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useResourceStore } from "@/stores/resource";
import { useAuthStore } from "@/stores/auth";
import VSearchBar from "@/components/VSearchBar.vue";
import VButton from "@/components/VButton.vue";
import VSuccessButton from "@/components/VSuccessButton.vue";

// Store & Router
const resourceStore = useResourceStore();
const authStore = useAuthStore(); // ✅ Import auth store untuk ambil role
const router = useRouter();

// State
const searchName = ref('');

// Fetch data
const fetchResources = async () => {
  await resourceStore.viewAllResources();
};

// Rupiah formatter
const formatCurrency = (value: number) => `Rp ${value.toLocaleString("id-ID")},00`;

// Search & filter data
const filteredResources = computed(() => {
  if (!searchName.value) return resourceStore.resources;
  return resourceStore.resources.filter(res =>
    res.resourceName.toLowerCase().includes(searchName.value.toLowerCase())
  );
});

// Navigasi
const goToAddResource = () => router.push("/resource/add");
const goToUpdateResource = (id: number) => router.push(`/resource/update/${id}`);

// Role-based visibility
const showHargaJual = computed(() => authStore.userRole !== 'Operasional');
const showAction = computed(() => !['Direksi', 'Finance'].includes(authStore.userRole || ''));
// Role-based visibility tombol Tambah Resource
const showAddButton = computed(() => !['Direksi', 'Finance'].includes(authStore.userRole || ''));


// Fetch on load
onMounted(() => {
  fetchResources();
});
</script>

<template>
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md mb-4">
      <h1 class="text-2xl font-bold mb-4">Daftar Resource</h1>

      <div class="flex justify-between mb-4">
        <VSearchBar v-model="searchName" placeholder="Cari Nama Resource..." />
        <VButton v-if="showAddButton" label="Tambah Resource" @click="goToAddResource" />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left text-gray-700 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
            <thead class="text-xs text-white bg-[#1E3A5F] rounded-t-lg">
              <tr>
                  <th scope="col" class="px-6 py-3">Nama Resource</th>
                  <th scope="col" class="px-6 py-3">Stock</th>
                  <th v-if="showHargaJual" scope="col" class="px-6 py-3">Harga Jual</th>
                  <th scope="col" class="px-6 py-3">Deskripsi</th>
                  <th v-if="showAction" scope="col" class="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="resource in filteredResources" :key="resource.id"
                  class="bg-white border-b border-gray-200 hover:bg-gray-50 rounded-lg">
                  <td class="px-6 py-4">{{ resource.resourceName }}</td>
                  <td class="px-6 py-4">{{ resource.resourceStock }}</td>
                  <td v-if="showHargaJual" class="px-6 py-4">{{ formatCurrency(resource.resourcePrice) }}</td>
                  <td class="px-6 py-4">{{ resource.resourceDescription }}</td>
                  <td v-if="showAction" class="px-6 py-4">
                    <VSuccessButton
                      label="Update"
                      @click="goToUpdateResource(resource.id!)"
                    />
                  </td>
              </tr>
            </tbody>
        </table>

        <p v-if="filteredResources.length === 0" class="text-center text-gray-500 mt-4">Data tidak ditemukan.</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
* {
  font-family: 'Inter', sans-serif;
}
</style>
