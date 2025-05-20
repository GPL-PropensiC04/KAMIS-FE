<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">

    <div class="max-w-6xl mx-auto bg-white p-3 rounded-lg shadow-md mb-4">
      <div class="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
        <VSearchBar v-model="searchTerm" placeholder="Cari email atau nama akun..." />
        <VOptionInput v-model="roleFilter" :options="roleOptions"/>
        <VButton 
          v-if="isAdmin" 
          label="+ Tambah Akun" 
          @click="goToAddAccount"
          class="ml-auto"
        />
      </div>
    </div>
    
    <div class="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div v-if="loading" class="flex justify-center items-center py-14">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E3A5F]"></div>
      </div>
      
      <table v-else class="custom-table">
        <thead class="text-white bg-[#1E3A5F] rounded-t-lg">
          <tr>
            <th class="px-6 py-3 table-header">Email</th>
            <th class="px-6 py-3 table-header">Nama Akun</th>
            <th class="px-6 py-3 table-header">Role</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="account in filteredAccounts"
            :key="account.id"
            class="bg-white border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
          >
            <td class="px-6 py-4 text-center">{{ account.email }}</td>
            <td class="px-6 py-4 text-center">{{ account.username }}</td>
            <td class="px-6 py-4 text-center">{{ account.role }}</td>
          </tr>
          
          <!-- No Data Message -->
          <tr v-if="filteredAccounts.length === 0">
            <td colspan="3" class="text-center text-gray-500 py-6">
              <p class="italic">
                <template v-if="searchTerm">
                  Tidak ada akun dengan nama atau email "{{ searchTerm }}".
                </template>
                <template v-else-if="roleFilter !== 'Semua'">
                  Tidak ada akun dengan role {{ roleFilter }}.
                </template>
                <template v-else>
                  Data akun tidak ditemukan.
                </template>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import { API_URLS } from '@/config/api.config';
import VButton from '@/components/VButton.vue';
import VSearchBar from '@/components/VSearchBar.vue';
import VOptionInput from '@/components/VOptionInput.vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { useToast } from 'vue-toastification';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

// State variables
const accounts = ref<any[]>([]);
const loading = ref(true);
const searchTerm = ref('');
const roleFilter = ref('Semua');

// Computed properties
const isAdmin = computed(() => authStore.userRole === 'Admin');
const roleOptions = ['Semua', 'Admin', 'Finance', 'Operasional', 'Direksi'];

const filteredAccounts = computed(() => {
  return accounts.value.filter(account => {
    const matchesSearch = 
      !searchTerm.value || 
      account.email?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (account.username && account.username.toLowerCase().includes(searchTerm.value.toLowerCase()));
    
    // Handle case-insensitive role matching and special case for "Semua"
    const matchesRole = 
      roleFilter.value === 'Semua' || 
      account.role?.toLowerCase() === roleFilter.value.toLowerCase() ||
      (roleFilter.value === 'Operasional' && account.role?.toLowerCase() === 'operational');
    
    return matchesSearch && matchesRole;
  });
});

// Methods
const fetchAccounts = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_URLS.PROFILE}/profile/all`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (response.data && response.data.status === 200) {
      accounts.value = Array.isArray(response.data.data) ? response.data.data : [];
      console.log('Fetched accounts:', accounts.value);
    } else {
      toast.error('Gagal memuat data akun');
    }
  } catch (error) {
    console.error('Error fetching accounts:', error);
    toast.error('Terjadi kesalahan saat memuat data akun');
  } finally {
    loading.value = false;
  }
};

const goToAddAccount = () => {
  router.push('/account/add');
};

// Set up watchers to filter data when inputs change
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

watch(searchTerm, () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    // You could make an API call here if you want server-side filtering
    // For now, we're just using the computed property
  }, 400);
});

watch(roleFilter, () => {
  // You could make an API call here if you want server-side filtering
  // For now, we're just using the computed property
});

// Initialize component
onMounted(() => {
  fetchAccounts();
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
  padding: 12px 16px;
  text-align: center;
}

.custom-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
}

.custom-table tbody tr:hover {
  background-color: #f3f4f6;
}

.table-header {
  font-weight: 500;
}
</style>