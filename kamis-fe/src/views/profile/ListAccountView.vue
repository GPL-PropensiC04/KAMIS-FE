<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">

    <!-- Welcome Section -->
    <div class="max-w-7xl mx-auto bg-white p-5 rounded-lg shadow-md mb-4">
      <div class="welcome-message text-4xl font-bold mb-4">
        Welcome, {{ userInfo.username }}
      </div>
      
      <!-- Additional content can go here (like filter buttons) -->
    </div>

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
            :key="account.email"
            class="bg-white border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
            @click="goToUpdateAccount(account.email)"
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
import { useAccountStore } from '@/stores/account';
import VButton from '@/components/VButton.vue';
import VSearchBar from '@/components/VSearchBar.vue';
import VOptionInput from '@/components/VOptionInput.vue';
import Breadcrumb from '@/components/Breadcrumb.vue';

const router = useRouter();
const authStore = useAuthStore();
const accountStore = useAccountStore();

// State variables
const searchTerm = ref('');
const roleFilter = ref('Semua');

// Computed properties
const isAdmin = computed(() => authStore.userRole === 'Admin');
const roleOptions = ['Semua', 'Admin', 'Finance', 'Operasional', 'Direksi'];

// Get accounts and loading state from the account store
const accounts = computed(() => accountStore.accounts);
const loading = computed(() => accountStore.loading);
const error = computed(() => accountStore.error);

// Auth store
const userInfo = computed(() => {
  const user = authStore.user;
  return { username: user ? user.username : 'User' };
});

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
      (roleFilter.value === 'Operasional' && account.role?.toLowerCase() === 'operasional');
    
    return matchesSearch && matchesRole;
  });
});

// Methods
const fetchAccounts = async () => {
  // Use the store method to fetch accounts
  await accountStore.getAllAccounts();
  
  // The store automatically handles errors and loading state
  if (accountStore.error) {
    console.error('Error fetching accounts:', accountStore.error);
  }
};

const goToAddAccount = () => {
  router.push('/account/add');
};

const goToUpdateAccount = (email: string) => {
  router.push(`/account/update/${email}`);
};

// Set up watchers to filter data when inputs change
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

watch(searchTerm, () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    // Client-side filtering happens via the computed property
  }, 400);
});

watch(roleFilter, () => {
  // Client-side filtering happens via the computed property
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