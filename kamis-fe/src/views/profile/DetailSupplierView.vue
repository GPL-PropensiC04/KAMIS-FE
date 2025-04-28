<template>
    <Breadcrumb />
    <div class="min-h-screen bg-[#E5EAF2] p-6">
      <div class="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <button @click="router.back()" class="mb-4 text-xl font-bold">&larr;</button>
        <div class="flex justify-end items-center mb-4">
          <VButton v-if="isOperationalOrAdmin" label="Edit" @click="goToEditSupplier" />
        </div>
  
        <div v-if="loading" class="text-center py-4">Memuat data supplier...</div>
        <div v-else-if="error" class="text-center py-4 text-red-500">{{ error }}</div>
        <div v-else>
          <!-- Informasi Supplier -->
          <div class="client-info-card mb-8">
            <div class="client-info-header">Informasi Supplier</div>
            <div class="client-info-body">
              <div class="client-info-row">
                <div>
                  <p class="client-info-label">Nama PIC</p>
                  <p class="client-info-value">{{ supplierDetail?.supplierName }}</p>
                </div>
                <div>
                  <p class="client-info-label">Nomor Telepon</p>
                  <p class="client-info-value">{{ supplierDetail?.supplierPhone }}</p>
                </div>
                <div>
                  <p class="client-info-label">Alamat Email</p>
                  <p class="client-info-value">{{ supplierDetail?.supplierEmail }}</p>
                </div>
              </div>
              <div class="client-info-row">
                <div>
                  <p class="client-info-label">Perusahaan</p>
                  <p class="client-info-value">{{ supplierDetail?.supplierCompany }}</p>
                </div>
                <div class="col-span-2">
                  <p class="client-info-label">Alamat</p>
                  <p class="client-info-value">{{ supplierDetail?.supplierAddress }}</p>
                </div>
              </div>
            </div>
          </div>
  
          <!-- List Barang -->
          <h2 class="text-xl font-bold mb-2">List Barang</h2>
          <table class="custom-table mb-6">
            <thead>
              <tr>
                <th @click="sortByItem('resourceName')" class="px-6 py-3 cursor-pointer">Nama Barang</th>
                <th @click="sortByItem('resourcePrice')" class="px-6 py-3 cursor-pointer">Harga Barang</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in paginatedItems" :key="item.id">
                <td class="px-6 py-4">{{ item.resourceName }}</td>
                <td class="px-6 py-4">Rp{{ item.resourcePrice.toLocaleString('id-ID') }}</td>
              </tr>
              <tr v-if="paginatedItems.length === 0">
                <td colspan="2" class="text-center text-gray-500">Tidak ada barang.</td>
              </tr>
            </tbody>
          </table>
  
          <!-- Pagination Barang -->
          <div v-if="totalItemPages > 1" class="flex justify-center items-center space-x-4 my-4">
            <button :disabled="itemPage === 1" @click="itemPage--" class="pagination-btn">&larr; Prev</button>
            <span>Page {{ itemPage }} of {{ totalItemPages }}</span>
            <button :disabled="itemPage === totalItemPages" @click="itemPage++" class="pagination-btn">Next &rarr;</button>
          </div>
  
          <!-- Histori Pembelian -->
          <h2 class="text-xl font-bold mb-2 mt-8">Histori Pembelian</h2>
          <table class="custom-table">
            <thead>
              <tr>
                <th class="px-6 py-3">Nama Aktivitas</th>
                <th @click="sortByPurchase('purchaseSubmissionDate')" class="px-6 py-3 cursor-pointer">Tanggal Diajukan</th>
                <th class="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="purchase in paginatedPurchases" :key="purchase.purchaseId">
                <td class="px-6 py-4">{{ purchase.activityName }}</td>
                <td class="px-6 py-4">{{ formatDate(purchase.purchaseSubmissionDate) }}</td>
                <td class="px-6 py-4">{{ purchase.purchaseStatus }}</td>
              </tr>
              <tr v-if="paginatedPurchases.length === 0">
                <td colspan="3" class="text-center text-gray-500">Tidak ada histori pembelian.</td>
              </tr>
            </tbody>
          </table>
  
          <!-- Pagination Pembelian -->
          <div v-if="totalPurchasePages > 1" class="flex justify-center items-center space-x-4 my-4">
            <button :disabled="purchasePage === 1" @click="purchasePage--" class="pagination-btn">&larr; Prev</button>
            <span>Page {{ purchasePage }} of {{ totalPurchasePages }}</span>
            <button :disabled="purchasePage === totalPurchasePages" @click="purchasePage++" class="pagination-btn">Next &rarr;</button>
          </div>
  
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useSupplierStore } from '@/stores/supplier.ts';
  import { useAuthStore } from '@/stores/auth';
  import VButton from '@/components/VButton.vue';
  import Breadcrumb from '@/components/Breadcrumb.vue';
  
  const route = useRoute();
  const router = useRouter();
  const supplierStore = useSupplierStore();
  const authStore = useAuthStore();
  
  const supplierId = route.params.id as string;
  
  const loading = ref(true);
  const error = ref('');
  
  const supplierDetail = computed(() => supplierStore.supplierDetail);
  
  const isOperationalOrAdmin = computed(() => {
    return authStore.userRole === 'Operasional' || authStore.userRole === 'Admin';
  });
  
  // Fetch supplier detail
  const fetchSupplierDetail = async () => {
    loading.value = true;
    error.value = '';
    try {
      await supplierStore.getSupplierDetail(supplierId);
    } catch (e) {
      if (e instanceof Error) {
        error.value = e.message || 'Gagal memuat detail supplier';
      }
    } finally {
      loading.value = false;
    }
  };
  
  onMounted(fetchSupplierDetail);
  
  // Navigate to Edit
  const goToEditSupplier = () => {
    router.push(`/supplier/update/${supplierId}`);
  };
  
  // Items (List Barang = assets + resources)
  const items = computed(() => {
    const assetItems = supplierDetail.value?.assets.map(asset => ({
      id: asset.platNomor,
      resourceName: asset.nama,
      resourcePrice: asset.nilaiPerolehan
    })) || [];
  
    const resourceItems = supplierDetail.value?.resources.map(resource => ({
      id: resource.id,
      resourceName: resource.resourceName,
      resourcePrice: resource.resourcePrice
    })) || [];
  
    return [...assetItems, ...resourceItems];
  });
  
  // Sorting Barang
  const itemSortKey = ref('');
  const itemSortAsc = ref(true);
  
  const sortByItem = (key: string) => {
    if (itemSortKey.value === key) {
      itemSortAsc.value = !itemSortAsc.value;
    } else {
      itemSortKey.value = key;
      itemSortAsc.value = true;
    }
  };
  
  const sortedItems = computed(() => {
    return [...items.value].sort((a, b) => {
      const valA = (a as any)[itemSortKey.value];
      const valB = (b as any)[itemSortKey.value];
      if (typeof valA === 'string') {
        return itemSortAsc.value ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (typeof valA === 'number') {
        return itemSortAsc.value ? valA - valB : valB - valA;
      }
      return 0;
    });
  });
  
  // Pagination Barang
  const itemPage = ref(1);
  const itemsPerPage = 5;
  const totalItemPages = computed(() => Math.ceil(sortedItems.value.length / itemsPerPage));
  const paginatedItems = computed(() => {
    const start = (itemPage.value - 1) * itemsPerPage;
    return sortedItems.value.slice(start, start + itemsPerPage);
  });
  
  // Purchases
  const purchases = computed(() => supplierDetail.value?.purchases || []);
  
  // Sorting Purchases
  const purchaseSortKey = ref('');
  const purchaseSortAsc = ref(true);
  
  const sortByPurchase = (key: string) => {
    if (purchaseSortKey.value === key) {
      purchaseSortAsc.value = !purchaseSortAsc.value;
    } else {
      purchaseSortKey.value = key;
      purchaseSortAsc.value = true;
    }
  };
  
  const sortedPurchases = computed(() => {
    return [...purchases.value].sort((a, b) => {
      const dateA = new Date(a.purchaseSubmissionDate).getTime();
      const dateB = new Date(b.purchaseSubmissionDate).getTime();
      return purchaseSortAsc.value ? dateA - dateB : dateB - dateA;
    });
  });
  
  // Pagination Purchases
  const purchasePage = ref(1);
  const purchasesPerPage = 5;
  const totalPurchasePages = computed(() => Math.ceil(sortedPurchases.value.length / purchasesPerPage));
  const paginatedPurchases = computed(() => {
    const start = (purchasePage.value - 1) * purchasesPerPage;
    return sortedPurchases.value.slice(start, start + purchasesPerPage);
  });
  
  // Format Date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID');
  };
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
    box-shadow: 0px 2px 8px rgba(0,0,0,0.1);
  }
  .custom-table thead {
    background-color: #1E3A5F;
    color: white;
  }
  .custom-table th, .custom-table td {
    padding: 12px 16px;
    text-align: center;
  }
  .pagination-btn {
    background-color: #1E3A5F;
    color: white;
    font-weight: bold;
    padding: 8px 16px;
    border-radius: 6px;
  }
  .pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  </style>
  