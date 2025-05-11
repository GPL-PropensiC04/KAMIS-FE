<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-7xl mx-auto bg-white p-3 rounded-lg shadow-md mb-4">
      <div class="flex justify-between items-center gap-2">
        <VSearchBar v-model="searchName" placeholder="Cari Nama Resource..." />
        <VButton v-if="showAddButton" label="Tambah Resource" @click="goToAddResource" />
      </div>
    </div>
    
    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div v-if="loading" class="flex justify-center items-center py-14">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="custom-table">
          <thead class="text-white bg-[#1E3A5F] rounded-t-lg">
            <tr>
              <th class="px-6 py-4 table-header cursor-pointer text-base">Nama Resource</th>
              <th class="px-6 py-4 table-header cursor-pointer text-base">Stock</th>
              <th v-if="showHargaJual" class="px-6 py-4 table-header text-base">Harga Jual</th>
              <th class="px-6 py-4 table-header text-base">Deskripsi</th>
              <th v-if="showAction" class="px-6 py-4 table-header text-base">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="resource in filteredResources" 
              :key="resource.id"
              class="bg-white border-b border-gray-200 hover:bg-gray-50 cursor-pointer text-base"
            >
              <td class="px-6 py-5">{{ resource.resourceName }}</td>
              <td class="px-6 py-5">{{ resource.resourceStock }}</td>
              <td v-if="showHargaJual" class="px-6 py-5 font-bold">{{ formatCurrency(resource.resourcePrice) }}</td>
              <td class="px-6 py-5">{{ resource.resourceDescription }}</td>
              <td v-if="showAction" class="px-6 py-5">
                <VSuccessButton
                  label="Update"
                  @click.stop="goToUpdateResource(resource.id!)"
                />
              </td>
            </tr>
            
            <tr v-if="filteredResources.length === 0">
              <td :colspan="getColspan" class="text-center text-gray-500 py-6 text-base italic">
                Data resource tidak ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useResourceStore } from "@/stores/resource";
import { useAuthStore } from "@/stores/auth";
import VSearchBar from "@/components/VSearchBar.vue";
import VButton from "@/components/VButton.vue";
import VSuccessButton from "@/components/VSuccessButton.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";

// Store & Router
const resourceStore = useResourceStore();
const authStore = useAuthStore();
const router = useRouter();

// State
const searchName = ref('');
const loading = ref(true);

// Fetch data
const fetchResources = async () => {
  loading.value = true;
  try {
    await resourceStore.viewAllResources();
  } catch (error) {
    console.error('Error fetching resources:', error);
  } finally {
    loading.value = false;
  }
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

// Dynamic colspan for empty state message
const getColspan = computed(() => {
  let colspan = 3; // Base columns (name, stock, description)
  if (showHargaJual.value) colspan++;
  if (showAction.value) colspan++;
  return colspan;
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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

.custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  table-layout: fixed;
}

.custom-table thead {
  background-color: #1E3A5F;
  color: white;
}

.custom-table th, .custom-table td {
  padding: 16px 20px;
  text-align: center;
  font-size: 15px;
}

.custom-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
}

.custom-table tbody tr:hover {
  background-color: #f9fafb;
}

.table-header:hover {
  background-color: #32486B;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
</style>