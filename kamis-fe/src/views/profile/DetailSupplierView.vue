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
                @click="router.back()" 
                class="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white hover:scale-105 transform"
                title="Kembali"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <div>
                <h1 class="text-2xl font-bold text-white">Detail Supplier</h1>
                <p class="text-blue-100 mt-1">Informasi lengkap supplier dan histori pembelian</p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <VButton 
                v-if="isOperationalOrAdmin" 
                label="Edit Supplier" 
                @click="goToEditSupplier"
                class="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 transition-all duration-200"
              />
              <div class="flex items-center space-x-2 text-white/80">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div class="flex items-center justify-center py-12">
          <div class="flex items-center space-x-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A5F]"></div>
            <span class="text-gray-600 font-medium">Memuat data supplier...</span>
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
      <div v-else class="grid grid-cols-12 gap-6">
        <!-- Main Content - Supplier Information -->
        <div class="col-span-8">
          <!-- Supplier Info Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div class="bg-gradient-to-r bg-[#1e3a5f] px-8 py-4">
              <div class="flex items-center">
                <div class="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mr-3">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <h2 class="text-xl font-bold text-white">Informasi Supplier</h2>
              </div>
            </div>
            
            <div class="p-8">
              <div class="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <div class="mb-6">
                    <label class="info-label">Nama PIC</label>
                    <p class="info-value">{{ supplierDetail?.supplierName }}</p>
                  </div>
                  
                  <div class="mb-6">
                    <label class="info-label">Nomor Telepon</label>
                    <p class="info-value">{{ supplierDetail?.supplierPhone }}</p>
                  </div>
                </div>
                
                <div>
                  <div class="mb-6">
                    <label class="info-label">Perusahaan</label>
                    <p class="info-value">{{ supplierDetail?.supplierCompany || '-' }}</p>
                  </div>
                  <div class="mb-6">
                    <label class="info-label">Alamat Email</label>
                    <p class="info-value break-all">{{ supplierDetail?.supplierEmail }}</p>
                  </div>
                </div>
              </div>
              
              <div class="pt-6 border-t border-gray-100">
                <div>
                  <label class="info-label">Alamat Lengkap</label>
                  <p class="info-value leading-relaxed">{{ supplierDetail?.supplierAddress }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Items List Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div class="bg-gradient-to-r bg-[#1e3a5f] px-8 py-4">
              <div class="flex items-center">
                <div class="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mr-3">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                </div>
                <h2 class="text-xl font-bold text-white">List Barang</h2>
              </div>
            </div>

            <div class="p-8">
              <div v-if="!items || items.length === 0" class="text-center py-12">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Belum Ada Barang</h3>
                <p class="text-gray-500">Supplier ini belum memiliki daftar barang.</p>
              </div>

              <div v-else>
                <div class="overflow-hidden rounded-lg border border-gray-200 mb-6">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th @click="sortByItem('resourceName')" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                          <div class="flex items-center space-x-1">
                            <span>Nama Barang</span>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                            </svg>
                          </div>
                        </th>
                        <th @click="sortByItem('resourcePrice')" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                          <div class="flex items-center space-x-1">
                            <span>Harga Barang</span>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                            </svg>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr 
                        v-for="item in paginatedItems" 
                        :key="item.id"
                        class="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td class="px-6 py-4">
                          <div class="text-sm font-medium text-gray-900">{{ item.resourceName }}</div>
                        </td>
                        <td class="px-6 py-4">
                          <div class="text-sm font-medium text-gray-900">Rp{{ item.resourcePrice.toLocaleString('id-ID') }}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Pagination Barang -->
                <div v-if="totalItemPages > 1" class="flex justify-center items-center space-x-4">
                  <button 
                    :disabled="itemPage === 1" 
                    @click="itemPage--" 
                    class="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Previous
                  </button>
                  <span class="text-sm text-gray-700">
                    Page <span class="font-medium">{{ itemPage }}</span> of <span class="font-medium">{{ totalItemPages }}</span>
                  </span>
                  <button 
                    :disabled="itemPage === totalItemPages" 
                    @click="itemPage++" 
                    class="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Next
                    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Purchase History Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-4">
              <div class="flex items-center">
                <div class="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mr-3">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                </div>
                <h2 class="text-xl font-bold text-white">Histori Pembelian</h2>
              </div>
            </div>

            <div class="p-8">
              <div v-if="!purchases || purchases.length === 0" class="text-center py-12">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Belum Ada Pembelian</h3>
                <p class="text-gray-500">Supplier ini belum memiliki histori pembelian.</p>
              </div>

              <div v-else>
                <div class="overflow-hidden rounded-lg border border-gray-200 mb-6">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Aktivitas</th>
                        <th @click="sortByPurchase('purchaseSubmissionDate')" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                          <div class="flex items-center space-x-1">
                            <span>Tanggal Diajukan</span>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                            </svg>
                          </div>
                        </th>
                        <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr 
                        v-for="purchase in paginatedPurchases" 
                        :key="purchase.purchaseId"
                        class="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td class="px-6 py-4">
                          <div class="text-sm font-medium text-gray-900">{{ purchase.activityName }}</div>
                        </td>
                        <td class="px-6 py-4">
                          <div class="text-sm text-gray-900">{{ formatDate(purchase.purchaseSubmissionDate) }}</div>
                        </td>
                        <td class="px-6 py-4">
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {{ purchase.purchaseStatus }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Pagination Pembelian -->
                <div v-if="totalPurchasePages > 1" class="flex justify-center items-center space-x-4">
                  <button 
                    :disabled="purchasePage === 1" 
                    @click="purchasePage--" 
                    class="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Previous
                  </button>
                  <span class="text-sm text-gray-700">
                    Page <span class="font-medium">{{ purchasePage }}</span> of <span class="font-medium">{{ totalPurchasePages }}</span>
                  </span>
                  <button 
                    :disabled="purchasePage === totalPurchasePages" 
                    @click="purchasePage++" 
                    class="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Next
                    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar - Summary Info -->
        <div class="col-span-4">
          <div class="sticky top-6">
            <!-- Quick Stats Card -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Ringkasan</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                      </svg>
                    </div>
                    <span class="text-sm font-medium text-gray-700">Total Barang</span>
                  </div>
                  <span class="text-lg font-bold text-purple-600">{{ items?.length || 0 }}</span>
                </div>

                <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                      </svg>
                    </div>
                    <span class="text-sm font-medium text-gray-700">Total Pembelian</span>
                  </div>
                  <span class="text-lg font-bold text-green-600">{{ purchases?.length || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- Supplier Metadata -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Informasi Tambahan</h3>
              <div class="text-sm space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Status:</span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Aktif
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Kategori:</span>
                  <span class="font-medium text-gray-900">Supplier</span>
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
  import { ref, onMounted, computed } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useSupplierStore } from '@/stores/supplier';
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* Info Label dan Value Classes */
.info-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
  line-height: 1.625;
}

/* Table Styling */
.custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.custom-table thead {
  background-color: #f9fafb;
}

.custom-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
}

.custom-table td {
  padding: 1rem 1.5rem;
  white-space: nowrap;
  font-size: 0.875rem;
  color: #111827;
  border-bottom: 1px solid #f3f4f6;
}

.custom-table td:last-child {
  border-bottom: 0;
}

.custom-table tbody tr {
  transition: background-color 0.2s ease;
}

.custom-table tbody tr:hover {
  background-color: #f9fafb;
}

/* Status Badge Variants */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-completed {
  background-color: #dbeafe;
  color: #1e40af;
}

/* Button Styles */
.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #1E3A5F;
  color: white;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.btn-primary:hover {
  background-color: #2A4A6B;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: white;
  color: #374151;
  font-weight: 500;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.btn-secondary:hover {
  background-color: #f9fafb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Pagination Styles */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f9fafb;
  color: #374151;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.875rem;
  color: #374151;
  padding: 0.5rem 1rem;
}

/* Loading Animation */
.loading-spinner {
  animation: spin 1s linear infinite;
  border-radius: 50%;
  height: 2rem;
  width: 2rem;
  border: 2px solid #d1d5db;
  border-top-color: #1E3A5F;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Empty State Styling */
.empty-state {
  text-align: center;
  padding: 4rem 0;
}

.empty-state-icon {
  width: 5rem;
  height: 5rem;
  background-color: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.empty-state-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
}

.empty-state-description {
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.625;
}

/* Summary Cards */
.summary-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.summary-card:hover {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.summary-card-purple {
  background-color: #faf5ff;
}

.summary-card-purple:hover {
  background-color: #f3e8ff;
}

.summary-card-green {
  background-color: #f0fdf4;
}

.summary-card-green:hover {
  background-color: #dcfce7;
}

.summary-card-blue {
  background-color: #eff6ff;
}

.summary-card-blue:hover {
  background-color: #dbeafe;
}

.summary-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.summary-icon-purple {
  background-color: #e9d5ff;
  color: #7c3aed;
}

.summary-icon-green {
  background-color: #bbf7d0;
  color: #059669;
}

.summary-icon-blue {
  background-color: #bfdbfe;
  color: #2563eb;
}

/* Back Button Special Styling */
.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  transition: all 0.2s ease;
  color: white;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.back-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

/* Card Shadow Variants */
.shadow-soft {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s ease;
}

.shadow-soft:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.shadow-medium {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s ease;
}

.shadow-medium:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Responsive Grid Adjustments */
@media (max-width: 1024px) {
  .grid-responsive {
    grid-template-columns: 1fr;
  }
  
  .sidebar-sticky {
    position: static;
  }
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Text Gradient */
.text-gradient {
  background: linear-gradient(to right, #1E3A5F, #2A4A6B);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Focus States */
.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(30, 58, 95, 0.5);
}

/* Interactive Elements */
.interactive-element {
  transition: all 0.2s ease;
}

.interactive-element:hover {
  transform: scale(1.05);
}

.interactive-element:active {
  transform: scale(0.95);
}

/* Additional utility classes */
.break-all {
  word-break: break-all;
}

.leading-relaxed {
  line-height: 1.625;
}
</style>