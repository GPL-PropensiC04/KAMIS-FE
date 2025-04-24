<template>
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <button @click="router.back()" class="mb-4 text-xl font-bold">&larr;</button>
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Detail Klien</h1>
        <VButton label="Edit Klien" @click="goToEditClient" />
      </div>

      <div v-if="loading" class="text-center py-4">Memuat data klien...</div>
      <div v-else-if="error" class="text-center py-4 text-red-500">{{ error }}</div>
      <div v-else>
        <!-- Info Klien -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p class="font-semibold">Nama Klien</p>
            <p>{{ client.nameClient }}</p>
          </div>
          <div>
            <p class="font-semibold">No. Telepon</p>
            <p>{{ client.noTelpClient }}</p>
          </div>
          <div>
            <p class="font-semibold">Email</p>
            <p>{{ client.emailClient }}</p>
          </div>
          <div>
            <p class="font-semibold">Perusahaan Asal</p>
            <p>{{ client.companyClient || '-' }}</p>
          </div>
          <div class="col-span-2">
            <p class="font-semibold">Alamat</p>
            <p>{{ client.addressClient }}</p>
          </div>
        </div>

        <!-- Tabel Proyek -->
        <h2 class="text-xl font-bold mb-2">Proyek Terkait</h2>
        <table class="custom-table">
          <thead>
            <tr>
              <th class="px-6 py-3">Nama Proyek</th>
              <th class="px-6 py-3">Tanggal Mulai</th>
              <th class="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="project in client.projects" :key="project.id">
              <td class="px-6 py-4">{{ project.name }}</td>
              <td class="px-6 py-4">{{ formatDate(project.startDate) }}</td>
              <td class="px-6 py-4">{{ project.status }}</td>
            </tr>
            <tr v-if="!client.projects || client.projects.length === 0">
              <td colspan="3" class="text-center text-gray-500">Belum ada proyek terkait.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { API_URLS } from '@/config/api.config';
import VButton from '@/components/VButton.vue';

const route = useRoute();
const router = useRouter();
const clientId = route.params.id as string;

const loading = ref(true);
const error = ref('');
const client = ref<any>({});

const formatDate = (date: string) => {
if (!date) return '-';
const d = new Date(date);
return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

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
} catch (e: any) {
  error.value = e.message || 'Gagal memuat data klien';
} finally {
  loading.value = false;
}
};

function goToEditClient() {
router.push(`/client/update/${clientId}`);
}

onMounted(fetchClientDetail);
</script>
  
<style scoped>
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