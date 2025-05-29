<template>
  <Breadcrumb />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-[#E8F0F7] p-6">
    <!-- Header Section -->
    <div class="max-w-7xl mx-auto mb-8">
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-slate-800 mb-2">
              Selamat datang, {{ userInfo.username }}
            </h1>
            <p class="text-slate-600">Kelola akun pengguna dengan mudah</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls Section -->
    <div class="max-w-7xl mx-auto mb-6">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div class="flex flex-col sm:flex-row gap-4 flex-1">
            <div class="flex-1 max-w-md">
              <VSearchBar 
                v-model="searchTerm" 
                placeholder="Cari berdasarkan email atau nama..."
                class="w-full"
              />
            </div>
            <div class="min-w-[180px]">
              <VOptionInput 
                v-model="roleFilter" 
                :options="roleOptions"
                class="w-full"
              />
            </div>
          </div>
          
          <VButton 
            v-if="isAdmin" 
            label="+ Tambah Akun Baru" 
            @click="goToAddAccount"
            class="bg-[#1E3A5F] hover:bg-[#2A4A6B] text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
          />
        </div>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="max-w-7xl mx-auto">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <!-- Table Header -->
        <div class="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h2 class="text-lg font-semibold text-slate-800">Daftar Akun Pengguna</h2>
          <p class="text-sm text-slate-600 mt-1">
            Total: {{ filteredAccounts.length }} akun
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div class="flex flex-col items-center space-y-4">
            <div class="animate-spin rounded-full h-12 w-12 border-3 border-[#E8F0F7] border-t-[#1E3A5F]"></div>
            <p class="text-slate-500 font-medium">Memuat data akun...</p>
          </div>
        </div>
        
        <!-- Table Content -->
        <div v-else class="overflow-x-auto">
          <table class="modern-table">
            <thead>
              <tr class="bg-[#1E3A5F] text-white">
                <th class="table-header">
                  <div class="flex items-center justify-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <span>Email</span>
                  </div>
                </th>
                <th class="table-header">
                  <div class="flex items-center justify-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Nama Akun</span>
                  </div>
                </th>
                <th class="table-header">
                  <div class="flex items-center justify-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Role</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(account) in filteredAccounts"
                :key="account.email"
                class="table-row group"
                @click="goToUpdateAccount(account.email)"
              >
                <td class="table-cell">
                  <div class="flex items-center justify-center space-x-3">
                    <div class="w-8 h-8 bg-[#E8F0F7] rounded-full flex items-center justify-center">
                      <span class="text-[#1E3A5F] font-semibold text-sm">{{ account.email.charAt(0).toUpperCase() }}</span>
                    </div>
                    <span class="font-medium text-slate-700">{{ account.email }}</span>
                  </div>
                </td>
                <td class="table-cell">
                  <span class="font-medium text-slate-800">{{ account.username }}</span>
                </td>
                <td class="table-cell">
                  <span :class="getRoleBadgeClass(account.role)">
                    {{ account.role }}
                  </span>
                </td>
              </tr>
              
              <!-- Empty State -->
              <tr v-if="filteredAccounts.length === 0" class="bg-slate-50">
                <td colspan="3" class="text-center py-12">
                  <div class="flex flex-col items-center space-y-3">
                    <div class="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                      <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239" />
                      </svg>
                    </div>
                    <div class="text-center">
                      <p class="text-slate-600 font-medium mb-1">
                        <template v-if="searchTerm">
                          Tidak ada akun dengan pencarian "{{ searchTerm }}"
                        </template>
                        <template v-else-if="roleFilter !== 'Semua'">
                          Tidak ada akun dengan role {{ roleFilter }}
                        </template>
                        <template v-else>
                          Belum ada data akun
                        </template>
                      </p>
                      <p class="text-slate-500 text-sm">Coba ubah filter atau tambah akun baru</p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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

const getRoleBadgeClass = (role: string) => {
  const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold';
  switch (role?.toLowerCase()) {
    case 'admin':
      return `${baseClasses} bg-red-100 text-red-700`;
    case 'finance':
      return `${baseClasses} bg-emerald-100 text-emerald-700`;
    case 'operasional':
      return `${baseClasses} bg-[#E8F0F7] text-[#1E3A5F]`;
    case 'direksi':
      return `${baseClasses} bg-amber-100 text-amber-700`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-700`;
  }
};

// Set up watchers to filter data when inputs change
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

watch(searchTerm, () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    // Client-side filtering happens via the computed property
  }, 300);
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.modern-table thead tr {
  background: linear-gradient(135deg, #1E3A5F 0%, #2A4A6B 100%);
}

.table-header {
  padding: 16px 24px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.table-row {
  transition: all 0.2s ease;
  cursor: pointer;
  border-bottom: 1px solid #e2e8f0;
}

.table-row:hover {
  background-color: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  padding: 20px 24px;
  text-align: center;
  vertical-align: middle;
}

/* Custom scrollbar */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Enhanced loading animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .table-header,
  .table-cell {
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .modern-table {
    min-width: 600px;
  }
}
</style>