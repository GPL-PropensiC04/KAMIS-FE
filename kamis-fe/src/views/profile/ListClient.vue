<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-full mx-auto bg-white p-3 rounded-lg shadow-md mb-4">
      <div class="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
        <VSearchBar v-model="searchName" placeholder="Cari Nama Klien..." />
        <VOptionInput v-model="typeClient" :options="['Semua', 'Perusahaan', 'Perorangan']"/>
        <VDropDownInput v-if="isFinance || isDireksi" v-model="selectedNominal" :options="nominalOptions.map(opt => opt.label)" class="w-48"/>
        <VButton v-if="isOperational" class="ml-auto" label="+ Tambah Klien" @click="goToAddClient"/>
      </div>
    </div>
    <div class="max-w-full mx-auto bg-white p-6 rounded-lg shadow-md">
      <div v-if="clientStore.loading" class="flex justify-center items-center py-14">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
      <table v-else class="custom-table">
        <thead class="text-white bg-[#1E3A5F] rounded-t-lg">
          <tr>
            <th @click="sortBy('nameClient')" class="px-6 py-4 table-header cursor-pointer text-base">Nama Klien</th>
            <th @click="sortBy('typeClient')" class="px-6 py-4 table-header cursor-pointer text-base">Tipe Klien</th>
            <th @click="sortBy('companyClient')" class="px-6 py-4 table-header cursor-pointer text-base">Perusahaan</th>
            <th v-if="isOperational || isDireksi" @click="sortBy('projectCount')" class="px-6 py-4 table-header cursor-pointer text-base">Jumlah Aktivitas</th>
            <th v-if="isFinance || isDireksi" @click="sortBy('totalProfit')" class="px-6 py-4 table-header cursor-pointer text-base">Total Profit</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="client in sortedClients"
            :key="client.id"
            class="bg-white border-b border-gray-200 hover:bg-gray-50 cursor-pointer text-base"
            @click="goToDetailClient(client)"
          >
            <td class="px-6 py-5">{{ client.nameClient }}</td>
            <td class="px-6 py-5">{{ client.typeClient === true ? 'Perusahaan' : client.typeClient === false ? 'Perorangan' : client.typeClient }}</td>
            <td class="px-6 py-5">{{ client.companyClient || '-' }}</td>
            <td v-if="isOperational || isDireksi" class="px-6 py-5">{{ client.projectCount ?? 0 }} Aktivitas</td>
            <td v-if="isFinance || isDireksi" class="px-6 py-5" :class="{'text-green-600': (client.totalProfit ?? 0) > 0, 'text-red-600': (client.totalProfit ?? 0) < 0}">
              <template v-if="client.totalProfit != null">
                <span v-if="client.totalProfit > 0"> Rp{{ client.totalProfit.toLocaleString('id-ID') }}</span>
                <span v-else-if="client.totalProfit < 0">- Rp{{ Math.abs(client.totalProfit).toLocaleString('id-ID') }}</span>
                <span v-else>Rp0</span>
              </template>
              <template v-else>Rp0</template>
            </td>
          </tr>
          <tr v-if="sortedClients.length === 0">
            <td :colspan="3 + (isOperational || isDireksi ? 1 : 0) + (isFinance || isDireksi ? 1 : 0)" class="text-center text-gray-500 py-6 text-base">
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
import type { ClientListResponseInterface } from '@/interfaces/profile/client.interface';
import VSearchBar from '@/components/VSearchBar.vue';
import VOptionInput from '@/components/VOptionInput.vue';
import Breadcrumb from '@/components/Breadcrumb.vue'
import VDropDownInput from '@/components/VDropDownInput.vue';

const searchName = ref('');
const clientStore = useClientStore();
const authStore = useAuthStore();
const router = useRouter();
const typeClient = ref('Semua');

const sortKey = ref('');
const sortAsc = ref(true);

const nominalOptions = [
  { label: "Semua Profit", min: null, max: null },
  { label: "0 - 10 Juta", min: 0, max: 10_000_000 },
  { label: "10 Juta - 100 Juta", min: 10_000_000, max: 100_000_000 },
  { label: "100 Juta - 1 Miliar", min: 100_000_000, max: 1_000_000_000 },
  { label: "1 Miliar ke atas", min: 1_000_000_000, max: null },
];
const selectedNominal = ref(nominalOptions[0].label);

// Fungsi untuk filter client
const fetchFilteredClients = async () => {
  const selected = nominalOptions.find(opt => opt.label === selectedNominal.value);
  let type = undefined;
  if (typeClient.value === 'Perusahaan') type = true;
  else if (typeClient.value === 'Perorangan') type = false;
  await clientStore.viewAllClient({
    nameClient: searchName.value,
    typeClient: type,
    minProfit: selected?.min,
    maxProfit: selected?.max,
  });
};

watch(typeClient, fetchFilteredClients);

watch(selectedNominal, fetchFilteredClients);

let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

watch(searchName, () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    fetchFilteredClients();
  }, 400);
});

const sortBy = (key: string) => {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value;
  } else {
    sortKey.value = key;
    sortAsc.value = true;
  }
};

const sortedClients = computed(() => {
  if (!sortKey.value) {
    return clientStore.clientList;
  }
  return [...clientStore.clientList].sort((a, b) => {
    const valueA = (a as any)[sortKey.value];
    const valueB = (b as any)[sortKey.value];

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortAsc.value
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortAsc.value ? valueA - valueB : valueB - valueA;
    }

    return 0;
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
const isDireksi = computed(() => authStore.userRole === 'Direksi');

onMounted(() => {
  clientStore.viewAllClient();
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
</style>