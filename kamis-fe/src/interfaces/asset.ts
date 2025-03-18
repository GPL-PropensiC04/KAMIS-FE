export interface Aset {
    platNomor: string;
    nama: string;
    jenisAset: string;
    status: string;
    tanggalPerolehan: string;
    nilaiPerolehan: number;
    deskripsi: string;
    assetMaintenance: string;
    gambarAset?: string; // Akan menyimpan URL gambar atau base64 string
    isDeleted: boolean;
    deletedAt?: string;
  }