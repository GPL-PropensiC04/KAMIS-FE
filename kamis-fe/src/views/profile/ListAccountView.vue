<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <!-- Filter Section -->
    <div class="max-w-7xl mx-auto bg-white p-4 rounded-lg shadow-md mb-4">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Search bar -->
        <div class="relative flex-grow">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Cari email atau nama akun..."
            class="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
          />
          <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </div>
          <button 
            v-if="searchTerm" 
            @click="clearSearch" 
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <span class="text-xl">×</span>
          </button>
        </div>
        
        <!-- Role filter pills -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="role in roleOptions"
            :key="role"
            @click="roleFilter = role"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              roleFilter === role 
                ? 'bg-[#1E3A5F] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ role }}
          </button>
        </div>
        
        <!-- Add Account button -->
        <VButton 
          v-if="isAdmin" 
          label="+ Tambah Akun" 
          @click="goToAddAccount"
          class="whitespace-nowrap ml-auto"
        />
      </div>
    </div>

    <!-- Main Content Section -->
    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div v-if="loading" class="flex justify-center items-center py-14">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E3A5F]"></div>
      </div>
      
      <table v-else class="custom-table">
        <thead class="text-white bg-[#1E3A5F] rounded-t-lg">
          <tr>
            <th class="px-6 py-4 table-header text-base">Email</th>
            <th class="px-6 py-4 table-header text-base">Nama Akun</th>
            <th class="px-6 py-4 table-header text-base">Role</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="account in filteredAccounts" 
            :key="account.id"
            class="bg-white border-b border-gray-200 hover:bg-gray-50 cursor-pointer text-base"
            @click="viewAccount(account)"
          >
            <td class="px-6 py-5">{{ account.email }}</td>
            <td class="px-6 py-5">{{ account.username }}</td>
            <td class="px-6 py-5">{{ account.role }}</td>
          </tr>
          
          <!-- No Data Message -->
          <tr v-if="filteredAccounts.length === 0">
            <td :colspan="isAdmin ? 4 : 3" class="text-center text-gray-500 py-6 text-base italic">
              <p>
                <template v-if="searchTerm && roleFilter !== 'Semua'">
                  Tidak ada akun dengan nama atau email "{{ searchTerm }}" dan role {{ roleFilter }}.
                </template>
                <template v-else-if="searchTerm">
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
  
  <!-- Confirm Delete Modal -->
  <VModal v-model="showDeleteModal">
    <div class="bg-white rounded-lg p-6 max-w-md mx-auto">
      <h3 class="text-lg font-bold mb-4">Konfirmasi Hapus Akun</h3>
      <p class="mb-6 text-gray-600">Apakah Anda yakin ingin menghapus akun ini? Tindakan ini tidak dapat dibatalkan.</p>
      
      <div class="flex justify-end gap-2">
        <VCancelButton label="Tidak" @click="showDeleteModal = false" />
        <VSuccessButton label="Ya" @click="deleteAccount" />
      </div>
    </div>
  </VModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import { API_URLS } from '@/config/api.config';
import VButton from '@/components/VButton.vue';
import VSuccessButton from '@/components/VSuccessButton.vue';
import VCancelButton from '@/components/VCancelButton.vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import VModal from '@/components/VModal.vue';
import VSearchBar from '@/components/VSearchBar.vue';
import VOptionInput from '@/components/VOptionInput.vue';
import { useToast } from 'vue-toastification';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

// State variables
const accounts = ref<any[]>([]);
const loading = ref(true);
const searchTerm = ref('');
const roleFilter = ref('Semua');
const showDeleteModal = ref(false);
const accountToDelete = ref<string | null>(null);

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
      (roleFilter.value === 'Operasional' && account.role?.toLowerCase() === 'operational')
    
    return matchesSearch && matchesRole;
  });
});

// Clear search function
const clearSearch = () => {
  searchTerm.value = '';
};

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
      
      // Log unique roles for debugging
      const uniqueRoles = [...new Set(accounts.value.map(a => a.role))];
      console.log('Available roles in data:', uniqueRoles);
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

const viewAccount = (account: any) => {
  // If you have a detail view, navigate to it
  // For now, this just acts as a placeholder
  console.log('View account:', account);

};

const editAccount = (id: string) => {
  router.push(`/account/edit/${id}`);
};

const confirmDeleteAccount = (id: string) => {
  accountToDelete.value = id;
  showDeleteModal.value = true;
};

const deleteAccount = async () => {
  if (!accountToDelete.value) return;
  
  try {
    const response = await axios.delete(`${API_URLS.PROFILE}/delete/${accountToDelete.value}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (response.data && response.data.status === 200) {
      toast.success('Akun berhasil dihapus');
      fetchAccounts(); // Refresh the list
    } else {
      toast.error('Gagal menghapus akun');
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    toast.error('Terjadi kesalahan saat menghapus akun');
  } finally {
    showDeleteModal.value = false;
    accountToDelete.value = null;
  }
};

const handleRoleChange = (newRole: string) => {
  console.log('Role filter changed to:', newRole);
  roleFilter.value = newRole;
};

// Watch for filter changes
watch([searchTerm, roleFilter], () => {
  // No need to fetch again, just filter the existing data
  // If you want to fetch from the API with filter parameters, uncomment below
  // fetchAccounts();
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