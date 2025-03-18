export interface Maintenance {
    id: number;
    assetId: string; // Menggunakan platNomor
    tanggalPengajuan: string;
    tanggalSelesai: string;
    catatan: string;
  }