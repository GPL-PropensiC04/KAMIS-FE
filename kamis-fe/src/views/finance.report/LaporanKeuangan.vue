<template>
  <Breadcrumb />
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <!-- Filter Section in separate card -->
    <div class="max-w-full mx-auto bg-white p-3 rounded-lg shadow-md mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <VDateRangeFilter v-model="dateRange" />
        <div class="flex items-center gap-2">
          <select v-model="activityType" class="border rounded p-2 w-full">
            <option value="">Semua Jenis Aktivitas</option>
            <option value="0">Penjualan</option>
            <option value="1">Distribusi</option>
            <option value="2">Pembelian</option>
            <option value="3">Maintenance</option>
          </select>
        </div>
      </div>
    </div>

    <div class="max-w-full mx-auto bg-white p-6 rounded-lg shadow-md">
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
                ? '- ' + formatCurrency(Math.abs(lapkeuStore.lapkeuSummary.totalProfit)).replace('Rp','Rp')
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
import LogoKAM from '@/assets/LogoKAM.jpg';
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
  // Create workbook
  const workbook = XLSX.utils.book_new();
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([]);
  
  // Get activity type label for title
  const activityTypeText = activityType.value !== '' 
    ? ` ${activityTypeLabel(Number(activityType.value))}` 
    : '';
  
  // Get period for title
  let periodeText = "Seluruh Periode";
  if (dateRange.value.start && dateRange.value.end) {
    periodeText = `${formatDisplayDate(dateRange.value.start)} - ${formatDisplayDate(dateRange.value.end)}`;
  }
  
  // Define cell styles
  const styles = {
    headerTitle: { font: { bold: true, size: 16, color: { rgb: "1E3A5F" } }, alignment: { horizontal: "center" } },
    subTitle: { font: { bold: true, size: 12 }, alignment: { horizontal: "center" } },
    companyInfo: { font: { size: 10, color: { rgb: "444444" } }, alignment: { horizontal: "center" } },
    tableHeader: { 
      font: { bold: true, color: { rgb: "FFFFFF" } }, 
      fill: { fgColor: { rgb: "1E3A5F" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
      }
    },
    tableCell: { 
      alignment: { vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "E0E0E0" } },
        bottom: { style: "thin", color: { rgb: "E0E0E0" } },
        left: { style: "thin", color: { rgb: "E0E0E0" } },
        right: { style: "thin", color: { rgb: "E0E0E0" } }
      }
    },
    currencyCell: { 
      alignment: { horizontal: "right", vertical: "center" },
      numFmt: '"Rp"#,##0',
      border: {
        top: { style: "thin", color: { rgb: "E0E0E0" } },
        bottom: { style: "thin", color: { rgb: "E0E0E0" } },
        left: { style: "thin", color: { rgb: "E0E0E0" } },
        right: { style: "thin", color: { rgb: "E0E0E0" } }
      }
    },
    summaryLabel: { 
      font: { bold: true },
      fill: { fgColor: { rgb: "EEF1F5" } },
      alignment: { horizontal: "left" },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
      }
    },
    summaryValue: { 
      font: { bold: true },
      fill: { fgColor: { rgb: "EEF1F5" } },
      alignment: { horizontal: "right" },
      numFmt: '"Rp"#,##0',
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
      }
    },
    profitValue: { 
      font: { bold: true, color: { rgb: (lapkeuStore.lapkeuSummary?.totalProfit ?? 0) >= 0 ? "006100" : "C00000" } },
      fill: { fgColor: { rgb: "EEF1F5" } },
      alignment: { horizontal: "right" },
      numFmt: '"Rp"#,##0',
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
      }
    },
    footer: { font: { italic: true, size: 8, color: { rgb: "777777" } } }
  };
  
  // Set column widths
  const colWidths = [
    { wch: 15 },  // Date
    { wch: 15 },  // Activity Type
    { wch: 40 },  // Description
    { wch: 20 },  // Income
    { wch: 20 }   // Expense
  ];
  worksheet['!cols'] = colWidths;
  
  // Add company header
  XLSX.utils.sheet_add_aoa(worksheet, [
    ["PT KARINA AKA MADINA"],
    ["Jl. Letda Sudjono Gg. Jambu No. 03, Kel. Bandar Selamat, Medan, Indonesia"],
    [""],
    [`LAPORAN KEUANGAN${activityTypeText.toUpperCase()}`],
    [`Periode: ${periodeText}`],
    [""]
  ], { origin: "A1" });
  
  // Apply styles to company header
  if (!worksheet['!rows']) worksheet['!rows'] = [];
  worksheet['!rows'][0] = { hpt: 30 }; // Height for title row
  
  // Apply styles to header cells
  applyStyle(worksheet, "A1", styles.headerTitle);
  applyStyle(worksheet, "A2", styles.companyInfo);
  applyStyle(worksheet, "A4", styles.subTitle);
  applyStyle(worksheet, "A5", styles.companyInfo);
  
  // Merge header cells
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },  // Company name
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },  // Address
    { s: { r: 3, c: 0 }, e: { r: 3, c: 4 } },  // Report title
    { s: { r: 4, c: 0 }, e: { r: 4, c: 4 } }   // Period
  ];
  
  // Add table header
  const headerRow = 7;
  XLSX.utils.sheet_add_aoa(worksheet, [
    ["Tanggal", "Jenis Aktivitas", "Deskripsi", "Pemasukan", "Pengeluaran"]
  ], { origin: `A${headerRow}` });
  
  // Apply styles to table header
  for (let col = 0; col < 5; col++) {
    applyStyle(worksheet, XLSX.utils.encode_cell({ r: headerRow - 1, c: col }), styles.tableHeader);
  }
  
  // Add table data
  const dataStartRow = headerRow + 1;
  lapkeuStore.lapkeuList.forEach((item, index) => {
    const rowData = [
      formatDisplayDate(item.paymentDate),
      activityTypeLabel(item.activityType),
      item.description,
      item.pemasukan,
      item.pengeluaran
    ];
    
    XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: `A${dataStartRow + index}` });
    
    // Apply styles to row data
    applyStyle(worksheet, `A${dataStartRow + index}`, styles.tableCell);
    applyStyle(worksheet, `B${dataStartRow + index}`, styles.tableCell);
    applyStyle(worksheet, `C${dataStartRow + index}`, styles.tableCell);
    applyStyle(worksheet, `D${dataStartRow + index}`, styles.currencyCell);
    applyStyle(worksheet, `E${dataStartRow + index}`, styles.currencyCell);
    
    // Add alternating row colors
    if (index % 2 === 1) {
      for (let col = 0; col < 5; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: dataStartRow + index - 1, c: col });
        if (!worksheet[cellRef].s) worksheet[cellRef].s = {};
        worksheet[cellRef].s.fill = { fgColor: { rgb: "F9FAFB" } };
      }
    }
  });
  
  // Add summary section if summary data exists
  if (lapkeuStore.lapkeuSummary) {
    const summary = lapkeuStore.lapkeuSummary;
    const summaryStartRow = dataStartRow + lapkeuStore.lapkeuList.length + 2;
    
    // Add summary header
    XLSX.utils.sheet_add_aoa(worksheet, [
      ["RINGKASAN KEUANGAN"]
    ], { origin: `A${summaryStartRow}` });
    
    // Style and merge summary header
    applyStyle(worksheet, `A${summaryStartRow}`, {
      font: { bold: true, size: 12, color: { rgb: "1E3A5F" } },
      border: { bottom: { style: "medium", color: { rgb: "1E3A5F" } } }
    });
    worksheet["!merges"].push({ s: { r: summaryStartRow - 1, c: 0 }, e: { r: summaryStartRow - 1, c: 4 } });
    
    // Add summary data
    XLSX.utils.sheet_add_aoa(worksheet, [
      ["Total Transaksi", summary.totalTransaksi, "", "", ""],
      ["Total Pemasukan", "", "", summary.totalPemasukan, ""],
      ["Total Pengeluaran", "", "", "", summary.totalPengeluaran],
      ["Total Profit", "", "", summary.totalProfit, ""]
    ], { origin: `A${summaryStartRow + 2}` });
    
    // Style summary data
    for (let i = 0; i < 4; i++) {
      const row = summaryStartRow + 2 + i;
      applyStyle(worksheet, `A${row}`, styles.summaryLabel);
      
      if (i === 0) { // Total transactions
        applyStyle(worksheet, `B${row}`, {
          ...styles.summaryValue,
          numFmt: '0 "transaksi"'
        });
      } else if (i === 1) { // Total income
        applyStyle(worksheet, `D${row}`, styles.summaryValue);
      } else if (i === 2) { // Total expense
        applyStyle(worksheet, `E${row}`, styles.summaryValue);
      } else if (i === 3) { // Total profit
        applyStyle(worksheet, `D${row}`, styles.profitValue);
      }
    }
    
    // Add footer
    const footerRow = summaryStartRow + 8;
    XLSX.utils.sheet_add_aoa(worksheet, [
      ["Catatan: Laporan ini dibuat secara otomatis oleh sistem. Untuk pertanyaan, silakan hubungi bagian keuangan."]
    ], { origin: `A${footerRow}` });
    
    // Style and merge footer
    applyStyle(worksheet, `A${footerRow}`, styles.footer);
    worksheet["!merges"].push({ s: { r: footerRow - 1, c: 0 }, e: { r: footerRow - 1, c: 4 } });
    
    // Add signature
    const signatureRow = footerRow + 2;
    XLSX.utils.sheet_add_aoa(worksheet, [
      ["Mengetahui,"],
      [""],
      [""],
      ["Divisi Finance"],
      ["Budi Santoso"]
    ], { origin: `D${signatureRow}` });
    
    // Style signature
    applyStyle(worksheet, `D${signatureRow}`, { font: { bold: true } });
    applyStyle(worksheet, `D${signatureRow + 3}`, { font: { size: 10 } });
    applyStyle(worksheet, `D${signatureRow + 4}`, { font: { bold: true } });
  }
  
  // Add the worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Keuangan');
  
  // Set file name based on period
  let periodeFile = "Seluruh Periode";
  if (dateRange.value.start && dateRange.value.end) {
    const formatFileDate = (dateString: string) => {
      const [day, month, year] = dateString.split('-').map(Number);
      return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
    };
    periodeFile = `${formatFileDate(dateRange.value.start)} - ${formatFileDate(dateRange.value.end)}`;
  }
  
  // Write the file
  XLSX.writeFile(workbook, `Laporan Keuangan ${periodeFile}.xlsx`);
};

// Helper function to apply styles to a cell
const applyStyle = (worksheet: XLSX.WorkSheet, cellRef: string, style: any) => {
  if (!worksheet[cellRef]) worksheet[cellRef] = { v: "", t: "s" };
  if (!worksheet[cellRef].s) worksheet[cellRef].s = {};
  Object.assign(worksheet[cellRef].s, style);
};

const downloadPDF = async () => {
  // Buat instance PDF dengan orientasi landscape untuk laporan keuangan
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    putOnlyUsedFonts: true,
  });

  // Tambahkan metadata dokumen
  doc.setProperties({
    title: "Laporan Keuangan PT Karina Aka Madina",
    subject: "Laporan Keuangan",
    author: "PT Karina Aka Madina",
    keywords: "laporan, keuangan, finance",
    creator: "Sistem Keuangan",
  });

  // Definisikan warna tema
  const primaryColor: [number, number, number] = [30, 58, 95]; // Biru tua - #1E3A5F
  const secondaryColor: [number, number, number] = [70, 130, 180]; // Biru muda
  const alamatPerusahaan = "Jl. Ledta Sudjono Gg. Jambu No. 03 Kel. Bandar Selamat, Medan, Indonesia";

  // Tambahkan background header
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 0, 297, 25, "F");

  // Tambahkan border bawah header
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(10, 25, 287, 25);

  // Header: Logo perusahaan (simulasi dengan teks)
  await new Promise<void>((resolve) => {
    const img = new window.Image();
    img.src = LogoKAM;
    img.onload = function () {
      doc.addImage(img, 'JPEG', 18, 5, 18, 18);
      resolve();
    };
    img.onerror = () => resolve(); // Tetap lanjut jika gagal load
  });

  // Nama perusahaan
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("PT KARINA AKA MADINA", 45, 13);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(alamatPerusahaan, 45, 19); // x=45, y=19 (di bawah nama)

  // Tanggal download
  const today = new Date();
  const tanggalCetak = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth()+1).toString().padStart(2, '0')}/${today.getFullYear()}`;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Tanggal Cetak: ${tanggalCetak}`, 287, 14, { align: "right" });

  // Judul laporan
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  let titleText = 'LAPORAN KEUANGAN';
  if (activityType.value !== '') {
    titleText += ` ${activityTypeLabel(Number(activityType.value)).toUpperCase()}`;
  }
  doc.text(titleText, 149, 35, { align: "center" });

  // Periode laporan
  let periodeText = "Seluruh Periode";
  if (dateRange.value.start && dateRange.value.end) {
    periodeText = `Periode: ${formatDisplayDate(dateRange.value.start)} - ${formatDisplayDate(dateRange.value.end)}`;
  }
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(periodeText, 149, 42, { align: "center" });

  // Tabel utama dengan styling yang lebih baik
  autoTable(doc, {
    head: [["Tanggal", "Jenis Aktivitas", "Deskripsi", "Pemasukan", "Pengeluaran"]],
    body: lapkeuStore.lapkeuList.map(item => [
      formatDisplayDate(item.paymentDate),
      activityTypeLabel(item.activityType),
      item.description,
      item.pemasukan > 0 ? formatCurrency(item.pemasukan) : "Rp0",
      item.pengeluaran > 0 ? formatCurrency(item.pengeluaran) : "Rp0",
    ]),
    startY: 50,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      lineColor: [220, 220, 220],
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 30 },
      2: { cellWidth: "auto" },
      3: { cellWidth: 40, halign: "right" },
      4: { cellWidth: 40, halign: "right" },
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    margin: { left: 14, right: 14 },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.1,
    theme: "grid",
  });

  // Summary dengan styling yang lebih menarik
  const summary = lapkeuStore.lapkeuSummary;
  if (summary) {
    const finalY = (doc as any).lastAutoTable?.finalY || 50;

    // Tambahkan jarak
    const summaryY = finalY + 15;

    // Tambahkan judul ringkasan
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("RINGKASAN KEUANGAN", 14, summaryY - 5);

    // Tambahkan garis di bawah judul
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.2);
    doc.line(14, summaryY - 3, 60, summaryY - 3);

    // Tabel ringkasan
    autoTable(doc, {
      head: [["Total Transaksi", "Total Pemasukan", "Total Pengeluaran", "Total Profit/Loss"]],
      body: [
        [
          `${summary.totalTransaksi} transaksi`,
          formatCurrency(summary.totalPemasukan),
          formatCurrency(summary.totalPengeluaran),
          summary.totalProfit < 0 ? '- ' + formatCurrency(Math.abs(summary.totalProfit)) : formatCurrency(summary.totalProfit),
        ],
      ],
      startY: summaryY,
      headStyles: {
        fillColor: secondaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        fontSize: 10,
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        3: {
          textColor: summary.totalProfit < 0 ? [192, 0, 0] : [0, 97, 0], // Merah atau hijau tua
        },
      },
      margin: { left: 14, right: 14 },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.1,
      theme: "grid",
    });

    // Tambahkan catatan kaki
    const footerY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Catatan: Laporan ini dibuat secara otomatis oleh sistem. Untuk pertanyaan, silakan hubungi bagian keuangan.",
      14,
      footerY
    );

    // Tambahkan tanda tangan
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Mengetahui,", 250, footerY);

    const signatureGap = 10;

    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    // Garis untuk tanda tangan (panjang 40mm)
    doc.line(240, footerY + signatureGap + 15, 280, footerY + signatureGap + 15);
  }

  // Tambahkan nomor halaman
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Halaman ${i} dari ${pageCount}`, 287, 200, { align: "right" });

    // Tambahkan footer dengan border atas
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(14, 195, 287, 195);

    doc.setFontSize(8);
    doc.text("PT Karina Aka Madina - Laporan Keuangan", 14, 200);
    doc.text("© " + new Date().getFullYear() + " PT Karina Aka Madina. Hak Cipta Dilindungi.", 149, 200, {
      align: "center",
    });
  }

  // Simpan PDF
  let periodeFile = "Seluruh Periode";
  if (dateRange.value.start && dateRange.value.end) {
    // Format: DD-MM-YYYY
    const formatFileDate = (dateString: string) => {
      const [day, month, year] = dateString.split('-').map(Number);
      return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
    };
    periodeFile = `${formatFileDate(dateRange.value.start)} - ${formatFileDate(dateRange.value.end)}`;
  }

  doc.save(`Laporan Keuangan ${periodeFile}.pdf`);
};


const activityTypeLabel = (type: number) => {
  switch (type) {
    case 0: return 'Penjualan';
    case 1: return 'Distribusi';
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
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
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
