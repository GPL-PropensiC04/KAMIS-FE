export interface ProjectInterface {
  id: string;
  projectType: boolean; // Value false = Penjualan, Value true = Pengiriman
  projectStatus: number; // Status yang mungkin: direncanakan, dilaksanakan, selesai, telah dibayar
  projectPaymentStatus: number;
  projectName: string;
  projectDescription: string;
  projectClientId: string;
  projectStartDate: string; // ISO date string
  projectEndDate: string; // ISO date string
  projectTotalPemasukkan: number;
  projectTotalPengeluaran: number;
  projectPHLCount?: number;
  projectPHLPay?: number;
  projectPickupAddress?: string;
  projectDeliveryAddress?: string;
  projectUseAsset?: Array<{
    id: string;
    platNomor: string;
    type?: string;
  }>;
  projectUseResource?: Array<{
    resourceId: string;
    sellPrice: number;
    resourceStockUsed: number;
  }>;
  projectLogs?: Array<{
    actionDate: string;
    user: string;
    action: string;
  }>;
  data?: ProjectInterface; // For nested responses
}

export interface ProjectResponseInterface {
  status: number;
  message: string;
  timestamp: string;
  data: ProjectInterface;
}

export interface ListProjectResponseInterface {
  status: number;
  message: string;
  timestamp: string;
  data: ProjectInterface[];
}

export interface FilterProjectInterface {
  idProject?: string;
  statusProject?: string;
  tipeProject?: string;
  namaProject?: string;
  clientProject?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  startNominal?: number;
  endNominal?: number;
}
