import type { LogProjectInterface } from "./logproject.interface";

export interface ProjectInterface {
  id: string;
  projectType: boolean; // Value false = Penjualan, Value true = Pengiriman
  projectStatus: number; // Status yang mungkin: direncanakan, dilaksanakan, selesai, telah dibayar
  projectPaymentStatus: number;
  projectName: string;
  projectDescription: string;
  projectClientId: string;
  projectClientName?: string; // Added client name property
  
  projectStartDate: string; // ISO date string
  projectEndDate: string; // ISO date string
  projectTotalPemasukkan: number;
  projectTotalPengeluaran: number;
  projectProfit?: number;
  projectPHLCount?: number;
  projectPHLPay?: number;
  projectPickupAddress?: string;
  projectDeliveryAddress?: string;
  projectUseAsset?: Array<AssetUsageDTO>;
  projectUseResource?: Array<ResourceUsageDTO>;
  data?: ProjectInterface; // For nested responses
  projectLogs: LogProjectInterface[];
  projectPaymentDate?: string; // ISO date string
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
  tipeAset: string;
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
  projectUseAsset: Array<AssetUsageDTO>;
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
  projectUseResource: Array<ResourceUsageDTO>;
}

// Interface for updating project forms
export interface UpdateProjectFormData {
  id: string;
  projectName: string;
  projectClientId: string;
  projectType: boolean;
  projectStatus: number; // 0: Direncanakan, 1: Dilaksanakan, 2: Selesai, 3: Telah Dibayar
  projectStartDate: string;
  projectEndDate?: string;
  projectPHLCount?: number;
  projectPHLPay?: number;
  projectPickupAddress?: string;
  projectDeliveryAddress: string;
  projectTotalPemasukkan: number;
  projectTotalPengeluaran?: number;
  projectUseAsset?: Array<AssetUsageDTO>;
  projectUseResource?: Array<ResourceUsageDTO>;
}

export interface UpdateProjectStatusInterface {
  idProject: string;
  projectStatus: number;
}

export interface UpdateProjectPaymentStatusInterface {
  idProject: string;
  projectPaymentStatus: number;
}