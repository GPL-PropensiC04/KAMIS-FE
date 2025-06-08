<!-- components/VPagination.vue -->
<template>
  <div class="flex items-center justify-between my-4 px-4">
    <!-- Informasi pagination -->
    <div class="text-sm text-gray-700">
      Menampilkan 
      <span class="font-medium">{{ startItem }}</span>
      sampai
      <span class="font-medium">{{ endItem }}</span>
      dari
      <span class="font-medium">{{ totalItems }}</span>
      hasil
    </div>
    
    <!-- Tombol navigasi -->
    <div class="flex items-center space-x-2">
      <button
        @click="onPageChange(currentPage - 1)"
        :disabled="currentPage === 0"
        class="px-3 py-1 rounded text-sm text-gray-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Sebelumnya
      </button>
      
      <!-- Tombol halaman -->
      <div class="flex items-center space-x-1">
        <!-- First Page -->
        <button
          v-if="showFirstButton"
          @click="onPageChange(0)"
          class="px-3 py-1 rounded text-sm hover:bg-blue-100"
        >
          1
        </button>
        
        <!-- Ellipsis awal -->
        <span v-if="showFirstEllipsis" class="px-2">...</span>
        
        <!-- Halaman tengah -->
        <template v-for="page in visiblePages" :key="page">
          <button
            @click="onPageChange(page)"
            :class="[
              'px-3 py-1 rounded text-sm',
              currentPage === page ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
            ]"
          >
            {{ page + 1 }}
          </button>
        </template>
        
        <!-- Ellipsis akhir -->
        <span v-if="showLastEllipsis" class="px-2">...</span>
        
        <!-- Last Page -->
        <button
          v-if="showLastButton"
          @click="onPageChange(totalPages - 1)"
          class="px-3 py-1 rounded text-sm hover:bg-blue-100"
        >
          {{ totalPages }}
        </button>
      </div>
      
      <button
        @click="onPageChange(currentPage + 1)"
        :disabled="isLastPage"
        class="px-3 py-1 rounded text-sm text-gray-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Selanjutnya
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  isLastPage: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['page-change']);

// Compute displayed item numbers
const startItem = computed(() => (props.currentPage * props.pageSize) + 1);
const endItem = computed(() => {
  const end = (props.currentPage + 1) * props.pageSize;
  return end > props.totalItems ? props.totalItems : end;
});

// Navigation logic
const onPageChange = (page: number) => {
  if (page < 0 || page >= props.totalPages) return;
  emit('page-change', page);
};

// Calculate visible page buttons with ellipsis logic
const maxVisibleButtons = 5;

const visiblePages = computed(() => {
  const halfWay = Math.floor(maxVisibleButtons / 2);
  
  // Jika total halaman lebih kecil dari jumlah tombol yang akan ditampilkan
  if (props.totalPages <= maxVisibleButtons) {
    return Array.from({ length: props.totalPages }, (_, i) => i);
  }
  
  // Jika current page dekat dengan awal
  if (props.currentPage < halfWay) {
    return Array.from({ length: maxVisibleButtons }, (_, i) => i);
  }
  
  // Jika current page dekat dengan akhir
  if (props.currentPage > props.totalPages - halfWay - 1) {
    return Array.from({ length: maxVisibleButtons }, (_, i) => props.totalPages - maxVisibleButtons + i);
  }
  
  // Jika current page di tengah-tengah
  return Array.from(
    { length: maxVisibleButtons },
    (_, i) => props.currentPage - halfWay + i
  );
});

// Logic untuk menampilkan tombol dan ellipsis
const showFirstButton = computed(() => {
  return props.totalPages > maxVisibleButtons && visiblePages.value[0] > 0;
});

const showLastButton = computed(() => {
  return props.totalPages > maxVisibleButtons && visiblePages.value[visiblePages.value.length - 1] < props.totalPages - 1;
});

const showFirstEllipsis = computed(() => {
  return showFirstButton.value && visiblePages.value[0] > 1;
});

const showLastEllipsis = computed(() => {
  return showLastButton.value && visiblePages.value[visiblePages.value.length - 1] < props.totalPages - 2;
});
</script>