<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <button @click="router.back()" class="mb-4 text-xl font-bold">&larr;</button>
      <div class="flex justify-end items-center mb-4">
        <VButton v-if="isOperational" label="Edit Klien" @click="goToEditClient" />
      </div>

      <div v-if="loading" class="text-center py-4">Memuat data klien...</div>
      <div v-else-if="error" class="text-center py-4 text-red-500">{{ error }}</div>
      <div v-else>
        <!-- Info Klien -->
        <div class="client-info-card mb-8">
          <div class="client-info-header">
            Informasi Klien
          </div>
          <div class="client-info-body">
            <div class="client-info-row">
              <div>
                <p class="client-info-label">Nama Klien</p>
                <p class="client-info-value">{{ client.nameClient }}</p>
              </div>
              <div>
                <p class="client-info-label">Nomor Telepon</p>
                <p class="client-info-value">{{ client.noTelpClient }}</p>
              </div>
              <div>
                <p class="client-info-label">Alamat Email</p>
                <p class="client-info-value">{{ client.emailClient }}</p>
              </div>
            </div>
            <div class="client-info-row">
              <div>
                <p class="client-info-label">Perusahaan</p>
                <p class="client-info-value">{{ client.companyClient || '-' }}</p>
              </div>
              <div class="col-span-2">
                <p class="client-info-label">Alamat</p>
                <p class="client-info-value">{{ client.addressClient }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabel Proyek -->
        <h2 class="text-xl font-bold mb-2">Histori Distribusi & Penjualan</h2>
        <table class="custom-table">
          <thead>
            <tr>
              <th class="px-6 py-3">Nama</th>
              <th class="px-6 py-3">Jenis</th>
              <th class="px-6 py-3">Status</th>
              <th v-if="isFinance" class="px-6 py-3">Total Pemasukkan</th>
              <th v-if="isFinance" class="px-6 py-3">Total Pengeluaran</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="project in client.projects" :key="project.id">
              <td class="px-6 py-4">{{ project.projectName }}</td>
              <td class="px-6 py-4">
                {{ project.projectType === true ? 'Distribusi' : project.projectType === false ? 'Penjualan' : project.projectType }}
              </td>
              <td class="px-6 py-4">
                {{ getStatusText(Number(project.projectStatus), project.projectType) }}
              </td>
              <td v-if="isFinance" class="px-6 py-4">
                {{ project.projectTotalPemasukkan != null ? 'Rp' + project.projectTotalPemasukkan.toLocaleString('id-ID') : 'Rp0' }}
              </td>
              <td v-if="isFinance" class="px-6 py-4">
                {{ project.projectTotalPengeluaran != null ? 'Rp' + project.projectTotalPengeluaran.toLocaleString('id-ID') : 'Rp0' }}
              </td>
            </tr>
            <tr v-if="!client.projects || client.projects.length === 0">
              <td :colspan="isFinance ? 5 : 3" class="text-center text-gray-500 py-4">
                Belum ada proyek terkait.
              </td>
            </tr>
          </tbody>
        </table>
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
  typeClient: '',
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

  onMounted(fetchClientDetail);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

.client-info-card {
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.client-info-header {
  background: #1E3A5F;
  color: #fff;
  font-size: 1.4rem;
  font-weight: bold;
  padding: 16px 24px;
}
.client-info-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.client-info-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}
.client-info-label {
  font-weight: 600;
  color: #1E3A5F;
  margin-bottom: 2px;
}
.client-info-value {
  color: #1E3A5F;
  font-weight: 500;
  font-size: 1.05rem;
  word-break: break-word;
}
.col-span-2 {
  grid-column: span 2;
}

.custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
}
.custom-table thead {
  background-color: #1E3A5F;
  color: white;
}
.custom-table th, .custom-table td {
  padding: 12px 16px;
}
</style>