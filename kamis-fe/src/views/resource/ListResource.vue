<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-full mx-auto bg-white p-3 rounded-lg shadow-md mb-4">
      <div class="flex justify-between items-center gap-2">
        <VSearchBar v-model="searchName" placeholder="Cari Nama Resource..." />
        <VButton v-if="showAddButton" label="+ Tambah Resource" @click="goToAddResource" />
      </div>
    </div>
    
    <div class="max-w-full mx-auto bg-white p-6 rounded-lg shadow-md">
      <div v-if="loading" class="flex justify-center items-center py-14">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="custom-table">
          <thead class="text-white bg-[#1E3A5F] rounded-t-lg">
            <tr>
              <th class="px-3 py-4 table-header text-base" style="width: 60px;">No</th>
              <th class="px-6 py-4 table-header cursor-pointer text-base" @click="sortBy('resourceName')">
                <div class="flex items-center justify-center gap-2">
                  <span>Nama Resource</span>
                  <span v-if="sortField === 'resourceName'" class="sort-indicator">
                    <span v-if="sortOrder === 'asc'" class="text-white">▲</span>
                    <span v-else class="text-white">▼</span>
                  </span>
                </div>
              </th>
              <th class="px-6 py-4 table-header cursor-pointer text-base" @click="sortBy('resourceStock')">
                <div class="flex items-center justify-center gap-2">
                  <span>Stok</span>
                  <span v-if="sortField === 'resourceStock'" class="sort-indicator">
                    <span v-if="sortOrder === 'asc'" class="text-white">▲</span>
                    <span v-else class="text-white">▼</span>
                  </span>
                </div>
              </th>
              <th v-if="showHargaJual" class="px-6 py-4 table-header text-base">Harga Jual</th>
              <th class="px-6 py-4 table-header text-base">Deskripsi</th>
              <th v-if="showAction" class="px-6 py-4 table-header text-base">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(resource, index) in sortedAndFilteredResources" 
              :key="resource.id"
              class="bg-white border-b border-gray-200 hover:bg-gray-50 cursor-pointer text-base"
            >
              <td class="px-3 py-5 font-medium text-gray-600" style="width: 60px;">{{ index + 1 }}</td>
              <td class="px-6 py-5">{{ resource.resourceName }}</td>
              <td class="px-6 py-5">{{ resource.resourceStock }}</td>
              <td v-if="showHargaJual" class="px-6 py-5 font-bold">{{ formatCurrency(resource.resourcePrice) }}</td>
              <td class="px-6 py-5">{{ resource.resourceDescription }}</td>
              <td v-if="showAction" class="px-6 py-5">
                <VSuccessButton
                  label="Update"
                  @click="goToUpdateResource(resource.id!)"
                />
              </td>
            </tr>
            
            <tr v-if="sortedAndFilteredResources.length === 0">
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
const sortField = ref<string>('');
const sortOrder = ref<'asc' | 'desc'>('asc');

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

// Sorting function
const sortBy = (field: string) => {
  if (sortField.value === field) {
    // Toggle sort order if same field
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Set new field and default to ascending
    sortField.value = field;
    sortOrder.value = 'asc';
  }
};

// Sorted and filtered resources
const sortedAndFilteredResources = computed(() => {
  const resources = [...filteredResources.value];
  
  if (sortField.value) {
    resources.sort((a, b) => {
      let aValue = a[sortField.value as keyof typeof a];
      let bValue = b[sortField.value as keyof typeof b];
      
      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      // Handle number comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string comparison
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortOrder.value === 'asc' ? 1 : -1;
      if (bValue == null) return sortOrder.value === 'asc' ? -1 : 1;
      if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  return resources;
});

// Dynamic colspan for empty state message
const getColspan = computed(() => {
  let colspan = 4; // Base columns (no, name, stock, description)
  if (showHargaJual.value) colspan++;
  if (showAction.value) colspan++;
  return colspan;
});

// Navigasi
const goToAddResource = () => router.push("/resource/add");
const goToUpdateResource = (id: number, event?: Event) => {
  if (event) event.stopPropagation();
  router.push(`/resource/update/${id}`);
};

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

.custom-table tbody tr:nth-child(odd) {
  background-color: #ffffff;
}

.custom-table tbody tr:nth-child(even) {
  background-color: #f9fafb;
}

.custom-table tbody tr:hover {
  background-color: #f3f4f6;
}

.table-header:hover {
  background-color: #32486B;
}

.sort-indicator {
  font-size: 12px;
  line-height: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 12px;
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