<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <!-- Filter Section in separate card -->
    <div class="max-w-7xl mx-auto bg-white p-3 rounded-lg shadow-md mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <VDateRangeFilter v-model="dateRange" />
        <div class="flex items-center gap-2">
          <select v-model="activityType" class="border rounded p-2 w-full">
            <option value="">Semua Jenis Aktivitas</option>
            <option value="0">Distribusi</option>
            <option value="1">Penjualan</option>
            <option value="2">Pembelian</option>
            <option value="3">Maintenance</option>
          </select>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <div>
          <h1 class="text-2xl font-bold mb-1 text-[#1E3A5F]">
            {{
              activityType === '' || activityType === null || activityType === undefined
                ? 'Laporan Keuangan'
                : `Laporan Keuangan ${activityTypeLabel(Number(activityType))}`
            }}
          </h1>
          <div class="text-gray-600 text-base">
            {{
              dateRange.start && dateRange.end
                ? `Periode ${formatDisplayDate(dateRange.start)} - ${formatDisplayDate(dateRange.end)}`
                : 'Seluruh Periode'
            }}
          </div>
        </div>
        <div class="relative self-start md:self-auto">
          <VButton
            label="Unduh"
            
            @click.stop="toggleDropdown"
          >
            <template #default>
              Unduh
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </template>
          </VButton>
          <div
            v-if="showDropdown"
            class="absolute right-0 mt-2 w-36 bg-white border rounded shadow z-10"
            @click.stop
          >
            <button @click="() => { downloadPDF(); showDropdown = false }" class="block w-full text-left px-4 py-2 hover:bg-gray-100">PDF</button>
            <button @click="() => { downloadXLSX(); showDropdown = false }" class="block w-full text-left px-4 py-2 hover:bg-gray-100">Excel (.xlsx)</button>
          </div>
        </div>
      </div>
      <!-- Table Section -->
      <div v-if="lapkeuStore.loading" class="flex justify-center items-center py-14">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
      <table v-else class="custom-table">
        <thead class="text-white bg-[#1E3A5F] rounded-t-lg">
          <tr>
            <th @click="sortTable('paymentDate')" class="px-6 py-4 table-header cursor-pointer text-base">
              Tanggal
              <span v-if="sortKey === 'paymentDate' && sortOrder === 'asc'">▲</span>
              <span v-if="sortKey === 'paymentDate' && sortOrder === 'desc'">▼</span>
            </th>
            <th class="px-6 py-4 table-header text-base">Jenis Aktivitas</th>
            <th class="px-6 py-4 table-header text-base">Deskripsi</th>
            <th @click="sortTable('pemasukan')" class="px-6 py-4 table-header cursor-pointer text-base">
              Pemasukan
              <span v-if="sortKey === 'pemasukan' && sortOrder === 'asc'">▲</span>
              <span v-if="sortKey === 'pemasukan' && sortOrder === 'desc'">▼</span>
            </th>
            <th @click="sortTable('pengeluaran')" class="px-6 py-4 table-header cursor-pointer text-base">
              Pengeluaran
              <span v-if="sortKey === 'pengeluaran' && sortOrder === 'asc'">▲</span>
              <span v-if="sortKey === 'pengeluaran' && sortOrder === 'desc'">▼</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in sortedLapkeu" :key="item.id" class="bg-white border-b border-gray-200 hover:bg-gray-50">
            <td class="px-6 py-5">{{ formatDisplayDate(item.paymentDate) }}</td>
            <td class="px-6 py-5">{{ activityTypeLabel(item.activityType) }}</td>
            <td class="px-6 py-5">{{ item.description }}</td>
            <td class="px-6 py-5 text-green-700 font-semibold">{{ formatCurrency(item.pemasukan) }}</td>
            <td class="px-6 py-5 text-red-700 font-semibold">{{ formatCurrency(item.pengeluaran) }}</td>
          </tr>
          <tr v-if="lapkeuStore.lapkeuList.length === 0">
            <td colspan="5" class="text-center text-gray-500 py-6 text-base">{{ lapkeuStore.error }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="lapkeuStore.lapkeuSummary"
        class="mt-8 p-6 bg-[#FFFFF] rounded shadow grid grid-cols-1 md:grid-cols-4 gap-4 justify-between"
      >
        <div class="text-center">
          <div class="font-bold text-gray-700 mb-1">Total Transaksi</div>
          <div class="text-xl font-semibold">{{ lapkeuStore.lapkeuSummary.totalTransaksi }} transaksi</div>
        </div>
        <div class="text-center">
          <div class="font-bold text-gray-700 mb-1">Total Pemasukan</div>
          <div class="text-xl font-semibold text-green-600">{{ formatCurrency(lapkeuStore.lapkeuSummary.totalPemasukan) }}</div>
        </div>
        <div class="text-center">
          <div class="font-bold text-gray-700 mb-1">Total Pengeluaran</div>
          <div class="text-xl font-semibold text-red-600">{{ formatCurrency(lapkeuStore.lapkeuSummary.totalPengeluaran) }}</div>
        </div>
        <div class="text-center">
          <div class="font-bold text-gray-700 mb-1">Total Profit</div>
          <div
            class="text-xl font-semibold"
            :class="{
              'text-green-600': lapkeuStore.lapkeuSummary.totalProfit > 0,
              'text-red-600': lapkeuStore.lapkeuSummary.totalProfit < 0,
              'text-blue-600': lapkeuStore.lapkeuSummary.totalProfit === 0
            }"
          >
            {{
              lapkeuStore.lapkeuSummary.totalProfit < 0
                ? formatCurrency(Math.abs(lapkeuStore.lapkeuSummary.totalProfit))
                : formatCurrency(lapkeuStore.lapkeuSummary.totalProfit)
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useFinanceReportStore } from '@/stores/financereport';
import VDateRangeFilter from '@/components/VDateRangeFilter.vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import VButton from '@/components/VButton.vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const lapkeuStore = useFinanceReportStore();
const showDropdown = ref(false);
const dateRange = ref<{ start: string; end: string }>({ start: '', end: '' });
const activityType = ref<string | number>('');
const sortKey = ref<'paymentDate' | 'pemasukan' | 'pengeluaran'>('paymentDate');
const sortOrder = ref<'asc' | 'desc'>('desc');

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

watch([dateRange, activityType], fetchData, { deep: true });

const downloadXLSX = () => {
  const headers = ['Tanggal', 'Jenis Aktivitas', 'Deskripsi', 'Pemasukan', 'Pengeluaran'];
  const data = lapkeuStore.lapkeuList.map(item => [
    formatDisplayDate(item.paymentDate),
    activityTypeLabel(item.activityType),
    item.description,
    item.pemasukan,
    item.pengeluaran
  ]);
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Keuangan');
  XLSX.writeFile(workbook, 'laporan-keuangan.xlsx');
};

const downloadPDF = () => {
  const doc = new jsPDF();

  // Nama perusahaan (paling atas)
  doc.setFontSize(14);
  doc.text('PT Karina Aka Madina', 14, 14);

  // Judul laporan
  doc.setFontSize(12);
  doc.text('Laporan Keuangan', 14, 24);

  // Periode
  let periodeText = 'Seluruh Periode';
  if (dateRange.value.start && dateRange.value.end) {
    periodeText = `Periode ${formatDisplayDate(dateRange.value.start)} - ${formatDisplayDate(dateRange.value.end)}`;
  }
  doc.setFontSize(11);
  doc.text(periodeText, 14, 32);

  // Summary
  const summary = lapkeuStore.lapkeuSummary;
  let y = 40;
  if (summary) {
    doc.setFontSize(10);
    doc.text(`Total Transaksi: ${summary.totalTransaksi} transaksi`, 14, y);
    y += 7;
    doc.text(`Total Pemasukan: ${formatCurrency(summary.totalPemasukan)}`, 14, y);
    y += 7;
    doc.text(`Total Pengeluaran: ${formatCurrency(summary.totalPengeluaran)}`, 14, y);
    y += 7;
    doc.text(`Total Profit: ${formatCurrency(summary.totalProfit)}`, 14, y);
    y += 5;
  }

  // Tabel
  autoTable(doc, {
    head: [['Tanggal', 'Jenis Aktivitas', 'Deskripsi', 'Pemasukan', 'Pengeluaran']],
    body: lapkeuStore.lapkeuList.map(item => [
      formatDisplayDate(item.paymentDate),
      activityTypeLabel(item.activityType),
      item.description,
      formatCurrency(item.pemasukan),
      formatCurrency(item.pengeluaran)
    ]),
    startY: y + 4, // Mulai di bawah summary
    styles: { fontSize: 9 }
  });

  doc.save('laporan-keuangan.pdf');
};

const activityTypeLabel = (type: number) => {
  switch (type) {
    case 0: return 'Distribusi';
    case 1: return 'Penjualan';
    case 2: return 'Pembelian';
    case 3: return 'Maintenance';
    default: return '-';
  }
};

const formatCurrency = (val: number) => {
  if (!val) return 'Rp0';
  return 'Rp' + val.toLocaleString('id-ID');
};

// Format date to display as "DD / MM / YYYY"
const formatDisplayDate = (dateString: string) => {
  const [day, month, year] = dateString.split('-').map(Number);
  return `${String(day).padStart(2, '0')} / ${String(month).padStart(2, '0')} / ${year}`;
};

const sortTable = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key as 'paymentDate' | 'pemasukan' | 'pengeluaran';
    sortOrder.value = 'asc';
  }
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
    
    let modifier = 1;
    if (sortOrder.value === 'desc') modifier = -1;
    
    if (aVal < bVal) return -1 * modifier;
    if (aVal > bVal) return 1 * modifier;
    return 0;
  });
  
  return arr;
});

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

watch(showDropdown, (val) => {
  if (!val) return;
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
