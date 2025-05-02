<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-6xl mx-auto bg-white p-3 rounded-lg shadow-md mb-4">
      <div class="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
        <VSearchBar v-model="searchCompany" placeholder="Cari Nama Perusahaan..." />
        <VSearchBar v-model="searchPIC" placeholder="Cari Nama PIC..." />
        <VButton v-if="isOperationalOrAdmin" label="+ Tambah Supplier" @click="goToAddSupplier" />
      </div>
    </div>

    <div class="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <table class="custom-table">
        <thead class="text-xs text-white bg-[#1E3A5F] rounded-t-lg">
          <tr>
            <th @click="sortBy('companySupplier')" class="px-6 py-3 table-header cursor-pointer">Nama Perusahaan</th>
            <th @click="sortBy('nameSupplier')" class="px-6 py-3 table-header cursor-pointer">Nama PIC</th>
            <th @click="sortBy('totalPurchases')" class="px-6 py-3 table-header cursor-pointer">Jumlah Pembelian</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="supplier in sortedSuppliers"
            :key="supplier.id"
            class="bg-white border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
            @click="goToDetailSupplier(supplier.id)"
          >
            <td class="px-6 py-4">{{ supplier.companySupplier }}</td>
            <td class="px-6 py-4">{{ supplier.nameSupplier }}</td>
            <td class="px-6 py-4">{{ supplier.totalPurchases }} Pembelian</td>
          </tr>
          <tr v-if="supplierStore.suppliers.length === 0">
            <td colspan="3" class="text-center text-gray-500 py-6">Data supplier tidak ditemukan.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSupplierStore } from '@/stores/supplier';
import { useAuthStore } from '@/stores/auth';
import VButton from '@/components/VButton.vue';
import VSearchBar from '@/components/VSearchBar.vue';
import Breadcrumb from '@/components/Breadcrumb.vue';

const searchPIC = ref('');
const searchCompany = ref('');
const supplierStore = useSupplierStore();
const authStore = useAuthStore();
const router = useRouter();

const isOperationalOrAdmin = computed(() => {
  return authStore.userRole === 'Operasional' || authStore.userRole === 'Admin';
});

onMounted(() => {
  supplierStore.viewAllSuppliers();
});

let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
watch([searchPIC, searchCompany], () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    supplierStore.viewAllSuppliers({
      nameSupplier: searchPIC.value,
      companySupplier: searchCompany.value,
    });
  }, 400);
});

const sortKey = ref('');
const sortAsc = ref(true);

const sortBy = (key: string) => {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value;
  } else {
    sortKey.value = key;
    sortAsc.value = true;
  }
};

const sortedSuppliers = computed(() => {
  if (!sortKey.value) {
    return supplierStore.suppliers;
  }
  return [...supplierStore.suppliers].sort((a, b) => {
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

const goToAddSupplier = () => {
  router.push('/supplier/add');
};

const goToDetailSupplier = (supplierId: string) => {
  router.push(`/supplier/detail/${supplierId}`);
};
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
}

.custom-table thead {
  background-color: #1E3A5F;
  color: white;
}

.custom-table th, .custom-table td {
  padding: 12px 16px;
  text-align: center;
}

.table-header:hover {
  background-color: #32486B;
}
</style>