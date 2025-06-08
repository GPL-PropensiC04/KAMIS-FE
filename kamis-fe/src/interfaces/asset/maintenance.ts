export interface Maintenance {
  id: number;
  platNomor: string;
  tanggalMulaiMaintenance: string;
  tanggalSelesaiMaintenance?: string;
  deskripsiPekerjaan: string;
  biaya: number;
  status: string;
  namaAset?: string;
  tanggalPengajuan?: string;
  tanggalSelesai?: string;
  catatan?: string;
}

export interface MaintenanceRequest {
  platNomor: string;
  deskripsiPekerjaan: string;
  biaya: number;
}