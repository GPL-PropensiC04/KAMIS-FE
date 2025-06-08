<template>
  <Breadcrumb />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Main Content -->
    <div class="max-w-full mx-auto px-8 py-6">
      <!-- Header Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div class="bg-[#1E3A5F] px-8 py-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button 
                @click="router.push('/client')"
                class="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white hover:scale-105 transform"
                title="Kembali"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <div>
                <h1 class="text-2xl font-bold text-white">Detail Klien</h1>
                <p class="text-blue-100 mt-1">Informasi lengkap klien dan histori proyek</p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <VButton 
                v-if="isOperational" 
                label="Edit Klien" 
                @click="goToEditClient"
                class="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div class="flex items-center justify-center py-12">
          <div class="flex items-center space-x-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A5F]"></div>
            <span class="text-gray-600 font-medium">Memuat data klien...</span>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h3>
            <p class="text-red-600">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Client Info Card - Full Width at Top -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div class="bg-gradient-to-r bg-[#1E3A5F] px-8 py-4">
            <div class="flex items-center">
              <div class="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mr-3">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h2 class="text-xl font-bold text-white">Informasi Klien</h2>
            </div>
          </div>
          
          <div class="p-8">
            <!-- Layout 3 Kolom -->
            <div class="grid grid-cols-3 gap-8 mb-6">
              <!-- Kolom 1: Nama Klien & Nomor Telepon -->
              <div>
                <div class="mb-6">
                  <label class="info-label">Nama Klien</label>
                  <p class="info-value">{{ client.nameClient }}</p>
                </div>
                <div>
                  <label class="info-label">Nomor Telepon</label>
                  <p class="info-value">{{ client.noTelpClient }}</p>
                </div>
              </div>
              
              <!-- Kolom 2: Tipe Klien & Alamat Email -->
              <div>
                <div class="mb-6">
                  <label class="info-label">Tipe Klien</label>
                  <p class="info-value">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                          :class="client.typeClient ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                      {{ client.typeClient ? 'Perusahaan' : 'Perorangan' }}
                    </span>
                  </p>
                </div>
                <div>
                  <label class="info-label">Alamat Email</label>
                  <p class="info-value break-all">{{ client.emailClient }}</p>
                </div>
              </div>
              
              <!-- Kolom 3: Nama Perusahaan -->
              <div>
                <div>
                  <label class="info-label">Nama Perusahaan</label>
                  <p class="info-value">{{ client.companyClient || '-' }}</p>
                </div>
              </div>
            </div>
            
            <!-- Alamat Lengkap (Full Width) -->
            <div class="pt-6 border-t border-gray-100">
              <div class="w-full">
                <label class="info-label">Alamat Lengkap</label>
                <p class="info-value leading-relaxed">{{ client.addressClient }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Section: History & Summary -->
        <div class="grid grid-cols-12 gap-6">
          <!-- Left Column: Projects History -->
          <div class="col-span-8">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-4">
                <div class="flex items-center">
                  <div class="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mr-3">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                  <h2 class="text-xl font-bold text-white">Histori Distribusi & Penjualan</h2>
                </div>
              </div>

              <div class="p-8">
                <div v-if="!client.projects || client.projects.length === 0" class="text-center py-12">
                  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Belum Ada Proyek</h3>
                  <p class="text-gray-500">Klien ini belum memiliki histori proyek distribusi atau penjualan.</p>
                </div>

                <div v-else class="overflow-hidden rounded-lg border border-gray-200">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Proyek</th>
                        <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                        <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th v-if="isFinance" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pemasukan</th>
                        <th v-if="isFinance" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengeluaran</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr 
                        v-for="project in client.projects" 
                        :key="project.id" 
                        class="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                      >
                        <td class="px-6 py-4">
                          <div class="text-sm font-medium text-gray-900">{{ project.projectName }}</div>
                        </td>
                        <td class="px-6 py-4">
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                :class="project.projectType === true ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'">
                            {{ project.projectType === true ? 'Distribusi' : project.projectType === false ? 'Penjualan' : project.projectType }}
                          </span>
                        </td>
                        <td class="px-6 py-4">
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                :class="getStatusClass(Number(project.projectStatus))">
                            {{ getStatusText(Number(project.projectStatus), project.projectType) }}
                          </span>
                        </td>
                        <td v-if="isFinance" class="px-6 py-4 text-sm text-green-600 font-medium">
                          {{ project.projectTotalPemasukkan != null ? 'Rp' + project.projectTotalPemasukkan.toLocaleString('id-ID') : 'Rp0' }}
                        </td>
                        <td v-if="isFinance" class="px-6 py-4 text-sm text-red-600 font-medium">
                          {{ project.projectTotalPengeluaran != null ? 'Rp' + project.projectTotalPengeluaran.toLocaleString('id-ID') : 'Rp0' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Summary -->
          <div class="col-span-4">
            <div class="sticky top-6">
              <!-- Quick Stats Card -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Ringkasan</h3>
                <div class="text-center py-4">
                  <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                      </div>
                      <span class="text-sm font-medium text-gray-700">Total Aktivitas</span>
                    </div>
                    <span class="text-lg font-bold text-blue-600">{{ client.projects?.length || 0 }}</span>
                  </div>

                  <div v-if="client.projects && client.projects.length > 0" class="mt-4">
                    <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg mb-2">
                      <span class="text-sm font-medium text-gray-700">Distribusi</span>
                      <span class="text-sm font-bold text-green-600">
                        {{ client.projects.filter(p => p.projectType === true).length }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span class="text-sm font-medium text-gray-700">Penjualan</span>
                      <span class="text-sm font-bold text-purple-600">
                        {{ client.projects.filter(p => p.projectType === false).length }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { API_URLS } from '@/config/api.config';
import VButton from '@/components/VButton.vue';
import type { ClientDetailInterface } from '@/interfaces/profile/client.interface';
import Breadcrumb from '@/components/Breadcrumb.vue';

const route = useRoute();
const router = useRouter();
const clientId = route.params.id as string;

const loading = ref(true);
const error = ref('');
const client = ref<ClientDetailInterface>({
  id: '',
  nameClient: '',
  noTelpClient: '',
  emailClient: '',
  typeClient: false,
  companyClient: '',
  addressClient: '',
  createdDate: '',
  updatedDate: '',
  projects: []
});

const authStore = useAuthStore();
const isFinance = computed(() => authStore.userRole === 'Finance');
const isOperational = computed(() => authStore.userRole === 'Operasional');

const fetchClientDetail = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await axios.get(`${API_URLS.PROFILE}/client/${clientId}`);
    if (res.data.status === 200) {
      client.value = res.data.data;
    } else {
      error.value = res.data.message || 'Gagal memuat data klien';
    }
  } catch (e) {
    if (e instanceof Error) {
      error.value = e.message || 'Gagal memuat data klien';
    } else {
      error.value = 'Gagal memuat data klien';
    }
  } finally {
    loading.value = false;
  }
};

function goToEditClient() {
  router.push(`/client/update/${clientId}`);
}

function getStatusText(status: number, type: boolean) {
  if (status === 0) return "Direncanakan";
  if (status === 1) return type ? "Dilaksanakan" : "Dalam Pengiriman";
  if (status === 2) return "Selesai";
  if (status === 3) return "Batal";
  return "-";
}

function getStatusClass(status: number) {
  if (status === 0) return "bg-yellow-100 text-yellow-800";
  if (status === 1) return "bg-blue-100 text-blue-800";
  if (status === 2) return "bg-green-100 text-green-800";
  if (status === 3) return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
}


onMounted(fetchClientDetail);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700&display=swap');

* {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.info-item {
  margin-bottom: 1rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
  display: block;
}

.info-value {
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
}

/* Hover effects */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* Smooth transitions */
.transition-all {
  transition: all 0.2s ease;
}

.transition-colors {
  transition: color 0.2s ease, background-color 0.2s ease;
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Custom spacing utilities */
.mr-2 {
  margin-right: 0.5rem;
}

.mr-3 {
  margin-right: 0.75rem;
}

.mr-4 {
  margin-right: 1rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mt-4 {
  margin-top: 1rem;
}

/* Responsive improvements */
@media (max-width: 1024px) {
  .grid-cols-12 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .col-span-8,
  .col-span-4 {
    grid-column: span 1;
  }
}

@media (max-width: 640px) {
  .grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .px-8 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>