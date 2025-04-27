import type { AddResourceTempRequestInterface, ResourceTempInterface } from "../resourcetemp.interface";
import type { AssetTempInterface } from "./assettemp.interface";
import type { LogPurchaseInterface } from "../project/logproject.interface";

export interface PurchaseInterface {
    id: string;
    purchaseId: string;
    purchaseSupplier: string;
    purchaseType: string; // false = Aset, true = Resource
    purchaseStatus: string;
    purchasePrice: number;
    purchaseNote: string;
    purchaseSubmissionDate: string; // ISO string format (YYYY-MM-DDTHH:MM:SSZ)
    purchaseUpdateDate: string; // ISO string format (YYYY-MM-DDTHH:MM:SSZ)
    purchaseResource: ResourceTempInterface[];
    purchaseAsset?: AssetTempInterface | null;
    purchasePaymentDate?: string | null; // ISO string format (YYYY-MM-DDTHH:MM:SSZ)
    purchaseLogs: LogPurchaseInterface[];
}

export interface AddPurchaseRequestInterface {
    purchaseSupplier: string;
    purchaseType: boolean; // false = Aset, true = Resource
    purchaseAsset?: number | null; // Only for purchaseType = false
    purchaseResource?: AddResourceTempRequestInterface[]; // Only for purchaseType = true
    purchaseNote?: string;
}

export interface UpdatePurchaseRequestInterface {
    purchaseSupplier: string;               // Supplier pembelian (wajib diisi)
    purchaseResource?: ResourceTempInterface[]; // List resource (hanya untuk purchaseType = 1)
    purchaseNote?: string;                   // Catatan pembelian (opsional)
}

export interface UpdatePurchaseStatusRequestInterface {
    purchaseNote: string;                   // Catatan pembelian 
    platNomor?: string;                      // Plat nomor kendaraan
}


