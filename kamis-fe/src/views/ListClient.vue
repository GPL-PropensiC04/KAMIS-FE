<template>
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-6xl mx-auto bg-white p-3 rounded-lg shadow-md mb-4">
      <div class="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
        <VSearchBar v-model="searchName" placeholder="Cari Nama Klien..." />
        <VOptionInput v-model="typeClient" :options="['Semua', 'Perusahaan', 'Perorangan']"/>
        <VButton v-if="isOperational" class="ml-auto" label="+ Tambah Klien" @click="goToAddClient"/>
      </div>
    </div>
    <div class="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md mb-4">
      <table class="custom-table">
        <thead class="text-xs text-white bg-[#1E3A5F] rounded-t-lg">
          <tr>
            <th class="px-6 py-3 table-header">Nama Klien</th>
            <th class="px-6 py-3 table-header">Tipe Klien</th>
            <th class="px-6 py-3 table-header">Perusahaan</th>
            <th v-if="isOperational" class="px-6 py-3 table-header">Jumlah Proyek</th>
            <th v-if="isFinance" class="px-6 py-3 table-header">Total Profit</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="client in clientStore.clientList"
            :key="client.id"
            class="bg-white border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
            @click="goToDetailClient(client)"
          >
            <td class="px-6 py-4">{{ client.nameClient }}</td>
            <td class="px-6 py-4">
              {{ client.typeClient === true ? 'Perusahaan' : client.typeClient === false ? 'Individu' : client.typeClient }}
            </td>
            <td class="px-6 py-4">{{ client.companyClient || '-' }}</td>
            <td v-if="isOperational" class="px-6 py-4">{{ client.projectCount ?? 0 }} Aktivitas</td>
            <td v-if="isFinance" class="px-6 py-4">{{ client.totalProfit != null ? 'Rp' + client.totalProfit.toLocaleString('id-ID') : 'Rp0' }}</td>
          </tr>
          <tr v-if="clientStore.clientList.length === 0">
            <td :colspan="isOperational && isFinance ? 5 : isOperational || isFinance ? 4 : 3" class="text-center text-gray-500">
              Data klien tidak ditemukan.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useClientStore } from '@/stores/client';
import { useAuthStore } from '@/stores/auth';
import VButton from '@/components/VButton.vue';
import type { ClientListResponseInterface } from '@/interfaces/client.interface';
import VSearchBar from '@/components/VSearchBar.vue';
import VOptionInput from '@/components/VOptionInput.vue';

const searchName = ref('');
const clientStore = useClientStore();
const authStore = useAuthStore();
const router = useRouter();
const typeClient = ref('Semua');

// Fungsi untuk filter client
const fetchFilteredClients = async () => {
  let type = undefined;
  if (typeClient.value === 'Perusahaan') type = true;
  else if (typeClient.value === 'Perorangan') type = false;
  await clientStore.viewAllClient({
    nameClient: searchName.value,
    typeClient: type
  });
};

let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

watch(searchName, () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    fetchFilteredClients();
  }, 400);
});

watch(typeClient, () => {
  let type = undefined;
  if (typeClient.value === 'Perusahaan') type = true;
  else if (typeClient.value === 'Perorangan') type = false;
  clientStore.viewAllClient({
    nameClient: searchName.value,
    typeClient: type
  });
});

function goToAddClient() {
  router.push('/client/add');
}

function goToDetailClient(client: ClientListResponseInterface) {
  if (client.id) {
    router.push(`/client/${client.id}`);
  }
}

const isFinance = computed(() => authStore.userRole === 'Finance');
const isOperational = computed(() => authStore.userRole === 'Operasional');

onMounted(() => {
  clientStore.viewAllClient();
});
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Lato:wght@700&display=swap');

  .custom-table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 8px;
    overflow: hidden;
    font-family: 'Lato', sans-serif;
  }

  .custom-table thead {
    background-color: #1E3A5F;
    color: white;
  }

  .custom-table th {
    font-family: 'Lato', sans-serif;
    font-size: 16px;
    padding: 16px 0;
    text-align: center;
  }

  .custom-table td {
    font-family: 'Lato', sans-serif;
    font-size: 18px;
    background-color: #E5EAF2;
    text-align: center;
    padding: 16px 0;
  }

  .custom-table tr {
    border-bottom: 2px solid #B0BED9;
  }

  .custom-table tbody tr {
    background-color: #E5EAF2;
    transition: background 0.2s;
  }

  .custom-table tbody tr:hover {
    background-color: #d1d9e6;
  }

  .table-header {
    font-family: 'Lato', sans-serif;
    font-size: 16px;
  }
</style>