export interface LapkeuInterface {
    id: string;
    activityType: number; // 0: DISTRIBUSI, 1: PENJUALAN, 2: PURCHASE, 3: MAINTENANCE
    pemasukan: number;
    pengeluaran: number;
    description: string;
    paymentDate: string; // format: 'dd-MM-yyyy'
}

export interface LapkeuSummaryResponseDTO {
  totalTransaksi: number;
  totalPemasukan: number;
  totalPengeluaran: number;
  totalProfit: number;
}

export interface ChartPengeluaranResponseDTO {
  activityType: string;         // "Pembelian", "Distribusi", "Maintenance", etc.
  totalPengeluaran: number;
}

export interface IncomeExpenseLineResponseDTO {
  period: string;
  totalPemasukan: number;
  totalPengeluaran: number;
}

export interface ActivityComparisonResponseDTO {
  period: string;
  pembelianCount: number;
  penjualanCount: number;
  distribusiCount: number;
}