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
  tipeAset: string;
  status: string;
  nilaiPerolehan: number;
  supplierId: string; // UUID will be represented as string in TypeScript
  lastMaintenance: string;
  tanggalPerolehan: string;
}

export interface Asset {
  platNomor: string;
  nama: string;
  tipeAset: string;
  status: string;
  nilaiPerolehan: number;
  tanggalPerolehan?: string;
  lokasi?: string;
  merek?: string;
  
  tipe?: string;
}


export interface AssetResponseDTO {
  status: number;
  message: string;
  data: Asset[] | Asset;
  timestamp: string;
}

export interface AssetAvailabilityRequest {
  platNomors: string[];
  startDate: Date;
  endDate: Date;
  excludeProjectId?: string;
}

export interface AssetReservationRequest {
  platNomors: string[];
  projectId: string;
  startDate: Date;
  endDate: Date;
}

export interface AssetAvailabilityResponse {
  status: number;
  message: string;
  data: Record<string, boolean>;
  timestamp: string;
}