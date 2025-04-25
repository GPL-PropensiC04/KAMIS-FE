<template>
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md mb-4">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Daftar Klien</h1>
        <VButton
          label="+ Tambah Klien"
          @click="goToAddClient"
        />
      </div>

      <div v-if="clientStore.loading" class="text-center py-4">
        <span>Memuat data klien...</span>
      </div>
      <div v-else-if="clientStore.error" class="text-center py-4 text-red-500">
        {{ clientStore.error }}
      </div>
      <div v-else>
        <table class="custom-table">
          <thead class="text-xs text-white bg-[#1E3A5F] rounded-t-lg">
            <tr>
              <th class="px-6 py-3">Nama Klien</th>
              <th class="px-6 py-3">Tipe Klien</th>
              <th class="px-6 py-3">Perusahaan</th>
              <th v-if="isOperational" class="px-6 py-3">Jumlah Proyek</th>
              <th v-if="isFinance" class="px-6 py-3">Total Profit</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="client in clientStore.clientList"
              :key="client.nameClient"
              class="bg-white border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
              @click="goToDetailClient(client)"
            >
              <td class="px-6 py-4">{{ client.nameClient }}</td>
              <td class="px-6 py-4">
                {{ client.typeClient === true ? 'Perusahaan' : client.typeClient === false ? 'Individu' : client.typeClient }}
              </td>
              <td class="px-6 py-4">{{ client.companyClient || '-' }}</td>
              <td v-if="isOperational" class="px-6 py-4">{{ client.projectCount ?? 0 }}</td>
              <td v-if="isFinance" class="px-6 py-4">{{ client.totalProfit != null ? 'Rp' + client.totalProfit.toLocaleString('id-ID') : 'Rp0' }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="clientStore.clientList.length === 0" class="text-center text-gray-500 mt-4">Data klien tidak ditemukan.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useClientStore } from '@/stores/client';
import { useAuthStore } from '@/stores/auth';
import VButton from '@/components/VButton.vue';
import type { ClientListResponseInterface } from '@/interfaces/client.interface';

const clientStore = useClientStore();
const authStore = useAuthStore();
const router = useRouter();

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
  .custom-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  }
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

  .custom-table thead {
    background-color: #1E3A5F;
    color: white;
  }

  .custom-table th, .custom-table td {
    padding: 12px 16px;
  }
</style>