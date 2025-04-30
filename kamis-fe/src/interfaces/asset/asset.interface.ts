export interface AsetInterface {
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

export interface AsetListInterface {
  platNomor: string;
  nama: string;
  jenisAset: string;
  status: string;
  nilaiPerolehan: number;
  supplierId: string; // UUID will be represented as string in TypeScript
  lastMaintenance: string;
}