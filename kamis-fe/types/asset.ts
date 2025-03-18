export interface Asset {
  platNomor: string;
  nama: string;
  jenisAset: string;
  status: string;
  tanggalPerolehan: string;
  nilaiPerolehan: number;
  deskripsi: string;
  assetMaintenance: string;
  gambarAsetBase64?: string;
}

export interface Maintenance {
  tanggalPengajuan: string;
  tanggalSelesai: string;
  catatan: string;
} 