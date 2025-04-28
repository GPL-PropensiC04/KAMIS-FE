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

// New interfaces for add project requests

export interface AssetUsageDTO {
  platNomor: string;
  assetUseCost?: number;
  assetFuelCost?: number;
}

export interface ResourceUsageDTO {
  resourceId: string;
  sellPrice: number;
  resourceStockUsed: number;
}

export interface AddProjectRequestDTO {
  projectType: boolean; // false = Penjualan, true = Pengiriman (Distribusi)
  projectName: string;
  projectDescription?: string;
  projectClientId: string;
  projectUseAsset?: AssetUsageDTO[];
  projectUseResource?: ResourceUsageDTO[];
  projectDeliveryAddress: string;
  projectPickupAddress?: string;
  projectPHLCount?: number;
  projectPHLPay?: number;
  projectStartDate: string;
  projectEndDate?: string;
  projectTotalPemasukkan?: number;
  projectTotalPengeluaran?: number;
}

// Interface for distribution project form
export interface DistributionFormData {
  projectName: string;
  projectClientId: string;
  projectType: boolean; // True for Distribution
  projectStartDate: string;
  projectEndDate?: string;
  projectPHLCount: number;
  projectPHLPay: number;
  projectPickupAddress: string;
  projectDeliveryAddress: string;
  projectTotalPemasukkan: number;
  projectTotalPengeluaran: number;
  projectUseAsset: Array<{ 
    id: string, 
    platNomor: string,
    assetUseCost?: number,
    assetFuelCost?: number
  }>;
}

// Interface for sales project form
export interface SalesFormData {
  projectName: string;
  projectClientId: string;
  projectType: boolean; // False for Sales
  projectStartDate: string;
  projectEndDate?: string;
  projectDeliveryAddress: string;
  projectTotalPemasukkan: number;
  projectUseResource: Array<{ 
    resourceId: string,
    resourceStockUsed: number,
    sellPrice: number
  }>;
}
