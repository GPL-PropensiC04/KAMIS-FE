<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 class="text-2xl font-bold mb-6 text-[#1E3A5F]">Laporan Keuangan</h1>

      <!-- Filter Section -->
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <VDateRangeFilter v-model="dateRange" />
        <div class="flex items-center gap-2">
          <label class="font-medium">Jenis Aktivitas</label>
          <select v-model="activityType" class="border rounded p-2">
            <option value="">Semua</option>
            <option value="0">Distribusi</option>
            <option value="1">Penjualan</option>
            <option value="2">Purchase</option>
            <option value="3">Maintenance</option>
          </select>
        </div>
        <VSortButton
          :sortKey="sortKey"
          :sortOrder="sortOrder"
          @update:sortKey="(val: 'paymentDate' | 'pemasukan' | 'pengeluaran') => sortKey = val"
          @update:sortOrder="(val: 'asc' | 'desc') => sortOrder = val"
          :options="sortOptions"
        />
        <button class="bg-[#2D6A4F] text-white px-4 py-2 rounded" @click="fetchData">Terapkan Filter</button>
      </div>

      <!-- Table Section -->
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border rounded">
          <thead>
            <tr class="bg-[#1E3A5F] text-white">
              <th class="py-2 px-4">Tanggal</th>
              <th class="py-2 px-4">Jenis Aktivitas</th>
              <th class="py-2 px-4">Deskripsi</th>
              <th class="py-2 px-4">Pemasukan</th>
              <th class="py-2 px-4">Pengeluaran</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in sortedLapkeu" :key="item.id" class="border-b">
              <td class="py-2 px-4">{{ item.paymentDate }}</td>
              <td class="py-2 px-4">
                {{ activityTypeLabel(item.activityType) }}
              </td>
              <td class="py-2 px-4">{{ item.description }}</td>
              <td class="py-2 px-4 text-green-700 font-semibold">
                {{ formatCurrency(item.pemasukan) }}
              </td>
              <td class="py-2 px-4 text-red-700 font-semibold">
                {{ formatCurrency(item.pengeluaran) }}
              </td>
            </tr>
            <tr v-if="lapkeuStore.lapkeuList.length === 0">
              <td colspan="5" class="text-center py-4 text-gray-500">Tidak ada data</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="lapkeuStore.lapkeuSummary"
        class="mt-8 p-4 bg-[#F1FAEE] rounded shadow flex flex-wrap gap-8 justify-between"
      >
        <div><span class="font-bold">Total Transaksi:</span> {{ lapkeuStore.lapkeuSummary.totalTransaksi }}</div>
        <div><span class="font-bold">Total Pemasukan:</span> {{ formatCurrency(lapkeuStore.lapkeuSummary.totalPemasukan) }}</div>
        <div><span class="font-bold">Total Pengeluaran:</span> {{ formatCurrency(lapkeuStore.lapkeuSummary.totalPengeluaran) }}</div>
        <div><span class="font-bold">Total Profit:</span> {{ formatCurrency(lapkeuStore.lapkeuSummary.totalProfit) }}</div>
      </div>

      <!-- Loading & Error -->
      <div v-if="lapkeuStore.loading" class="mt-4 text-center text-blue-600">Memuat data...</div>
      <div v-if="lapkeuStore.error" class="mt-4 text-center text-red-600">{{ lapkeuStore.error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useFinanceReportStore } from '@/stores/financereport';
import VDateRangeFilter from '@/components/VDateRangeFilter.vue';
import VSortButton from '@/components/VSortButton.vue';
import Breadcrumb from '@/components/Breadcrumb.vue';

const lapkeuStore = useFinanceReportStore();

const dateRange = ref<{ start: string; end: string }>({ start: '', end: '' });
const activityType = ref<string | number>('');
const sortKey = ref<'paymentDate' | 'pemasukan' | 'pengeluaran'>('paymentDate');
const sortOrder = ref<'asc' | 'desc'>('desc');
const sortOptions = [
  { label: 'Tanggal', value: 'paymentDate' },
  { label: 'Pemasukan', value: 'pemasukan' },
  { label: 'Pengeluaran', value: 'pengeluaran' }
];

const fetchData = () => {
  lapkeuStore.fetchLapkeu({
    startDate: dateRange.value.start,
    endDate: dateRange.value.end,
    activityType: activityType.value !== '' ? Number(activityType.value) : undefined
  });
  lapkeuStore.fetchLapkeuSummary({
    startDate: dateRange.value.start,
    endDate: dateRange.value.end,
    activityType: activityType.value !== '' ? Number(activityType.value) : undefined
  });
};

onMounted(fetchData);

const activityTypeLabel = (type: number) => {
  switch (type) {
    case 0: return 'Distribusi';
    case 1: return 'Penjualan';
    case 2: return 'Purchase';
    case 3: return 'Maintenance';
    default: return '-';
  }
};

const formatCurrency = (val: number) => {
  if (!val) return '-';
  return 'Rp ' + val.toLocaleString('id-ID');
};

const sortedLapkeu = computed(() => {
  const arr = [...lapkeuStore.lapkeuList];
  arr.sort((a, b) => {
    let aVal = a[sortKey.value];
    let bVal = b[sortKey.value];
    if (sortKey.value === 'paymentDate') {
      // Format: dd-MM-yyyy, convert to Date for sorting
      const parse = (d: string) => {
        const [day, month, year] = d.split('-').map(Number);
        return new Date(year, month - 1, day).getTime();
      };
      aVal = parse(String(aVal));
      bVal = parse(String(bVal));
    }
    if (sortOrder.value === 'asc') return Number(aVal) - Number(bVal);
    return Number(bVal) - Number(aVal);
  });
  return arr;
});
</script>