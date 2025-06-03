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
            Total: {{ accounts.length }} akun
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
                v-for="(account) in accounts"
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
              <tr v-if="accounts.length === 0" class="bg-slate-50">
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
          
          <!-- Pagination Controls -->
          <div v-if="totalPages > 1 || accounts.length > 0" class="mt-6">
            <div class="flex flex-col md:flex-row justify-between items-center gap-4 p-6">
              <!-- Page Size Selector -->
              <div class="flex items-center space-x-2">
                <label for="pageSizeSelect" class="text-sm text-gray-700 whitespace-nowrap">Item per halaman:</label>
                <select 
                  id="pageSizeSelect" 
                  v-model="selectedPageSize" 
                  @change="handlePageSizeChange"
                  class="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                >
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
                </select>
              </div>
              
              <!-- Page Navigation -->
              <div class="flex items-center justify-center space-x-2">
                <button
                  @click="changePage(currentPage)"
                  :disabled="currentPage === 0"
                  class="bg-[#1E3A5F] text-white px-4 py-2 rounded-md font-medium text-center transition hover:bg-[#2A4A6B] disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                
                <template v-for="pageNumber in pageNavigation" :key="pageNumber">
                  <button
                    v-if="typeof pageNumber === 'number'"
                    @click="changePage(pageNumber)"
                    :class="[
                      'px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 cursor-pointer', 
                      pageNumber === currentPage + 1 ? 
                        'bg-[#2D6A4F] text-white border border-[#2D6A4F]' : 
                        'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    ]"
                  >
                    {{ pageNumber }}
                  </button>
                  <span v-else class="px-2 py-2 text-sm font-medium text-gray-600">{{ pageNumber }}</span>
                </template>
                
                <button
                  @click="changePage(currentPage + 2)"
                  :disabled="currentPage >= totalPages - 1"
                  class="bg-[#1E3A5F] text-white px-4 py-2 rounded-md font-medium text-center transition hover:bg-[#2A4A6B] disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
              
              <!-- Item Count Display -->
              <p v-if="accounts.length > 0" class="text-sm text-gray-700 text-center">
                Menampilkan <span class="font-medium">{{ (currentPage * selectedPageSize) + 1 }}</span>
                sampai <span class="font-medium">{{ Math.min((currentPage * selectedPageSize) + accounts.length, totalItems) }}</span> hasil
              </p>
              <p v-else class="text-sm text-gray-700">Tidak ada data untuk ditampilkan</p>
            </div>
          </div>
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
const selectedPageSize = ref(accountStore.pageSize || 3);
const currentPage = computed(() => accountStore.currentPage || 0);
const totalPages = computed(() => accountStore.totalPages);

// Computed properties
const isAdmin = computed(() => authStore.userRole === 'Admin');
const roleOptions = ['Semua', 'Admin', 'Finance', 'Operasional', 'Direksi'];

// Get accounts and loading state from the account store (now using backend filtered data)
const accounts = computed(() => accountStore.accounts);
const loading = computed(() => accountStore.loading);

// Auth store
const userInfo = computed(() => {
  const user = authStore.user;
  return { username: user ? user.username : 'User' };
});

const totalItems = computed(() => {
  return Math.max(totalPages.value * selectedPageSize.value, accounts.value.length);
});

const pageNavigation = computed(() => {
  const current = currentPage.value + 1; // 1-indexed
  const total = totalPages.value;
  
  if (total <= 1) {
    return total === 1 ? [1] : [];
  }
  
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  
  const delta = 1;
  const range = [];
  const rangeWithDots: (number | string)[] = [];
  let l: number | undefined;

  range.push(1);
  
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }
  
  if (total > 1) {
    range.push(total);
  }

  const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

  for (let i = 0; i < uniqueRange.length; i++) {
    const current = uniqueRange[i];
    
    if (l !== undefined) {
      if (current - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (current - l > 2) {
        rangeWithDots.push('...');
      }
    }
    
    rangeWithDots.push(current);
    l = current;
  }
  
  return rangeWithDots;
});

// Get current filters for API calls
const getCurrentFilters = () => {
  const filters: any = {};
  
  if (searchTerm.value && searchTerm.value.trim()) {
    const trimmedSearch = searchTerm.value.trim();
    
    // If search contains @, always search in email field
    // This covers cases like "@gmail", "gmail.com", "user@domain.com", etc.
    if (trimmedSearch.includes('@')) {
      filters.email = trimmedSearch;
    } else {
      // If no @, search in username field
      filters.username = trimmedSearch;
    }
  }
  
  if (roleFilter.value && roleFilter.value !== 'Semua') {
    filters.userType = roleFilter.value;
  }
  
  console.log('getCurrentFilters result:', filters); // Add this for debugging
  return filters;
};

// Methods
const fetchAccounts = async (page: number = 1) => {
  await accountStore.getAllAccountsWithPagination(
    page - 1, 
    selectedPageSize.value,
    getCurrentFilters()
  );
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

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value + 1) {
    return;
  }
  fetchAccounts(page);
};

const handlePageSizeChange = () => {
  accountStore.pageSize = selectedPageSize.value;
  fetchAccounts(1);
};

// Set up watchers for backend filtering
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

watch(searchTerm, () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    fetchAccounts(1); // Reset to first page with new search
  }, 400);
});

watch(roleFilter, () => {
  fetchAccounts(1); // Reset to first page with new role filter
});

// Initialize component
onMounted(() => {
  if (accountStore.pageSize) {
    selectedPageSize.value = 10;
  }
  fetchAccounts(1);
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