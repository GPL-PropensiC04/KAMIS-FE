export interface SupplierInterface {
    id: string; // UUID dalam bentuk string
    nameSupplier: string;
    noTelpSupplier: string;
    emailSupplier: string;
    companySupplier: string;
    addressSupplier: string;
    resourceIds?: number[]; // Optional
    assetIds?: string[];    // Optional
    purchaseIds?: string[]; // Optional
    createdDate: string; // ISO string format (YYYY-MM-DDTHH:MM:SSZ)
    updatedDate: string; // ISO string format (YYYY-MM-DDTHH:MM:SSZ)
  }
  
export interface AddSupplierRequestInterface {
    nameSupplier: string;
    noTelpSupplier: string;
    emailSupplier: string;
    companySupplier: string;
    addressSupplier: string;
    resourceIds?: number[]; // Optional, boleh kosong
  }

  export interface UpdateSupplierRequestInterface {
    id: string; // UUID string
    addressSupplier: string;
    noTelpSupplier: string;
    emailSupplier: string;
    nameSupplier: string;
    resourceIds?: number[]; // Optional
  }

export interface ResourceInterface {
    id: number;
    resourceName: string;
    resourcePrice: number;
  }

export interface SupplierListResponseInterface {
    id: string; // UUID, tetap string di frontend
    nameSupplier: string;
    companySupplier: string;
    totalPurchases: number;
  }
  
export interface SupplierResourceInterface {
  id: number;
  resourceName: string;
  resourcePrice: number;
}

export interface SupplierAssetInterface {
  platNomor: string;
  nama: string;
  nilaiPerolehan: number;
}

export interface SupplierPurchaseInterface {
  purchaseId: string;
  purchaseSubmissionDate: string; // ISO string (YYYY-MM-DDTHH:MM:SSZ) setelah frontend formatting
  purchaseStatus: string;
  purchaseType: string;
  purchaseNote: string;
  purchasePrice: number;
  activityName: string;
}

export interface DetailSupplierInterface {
  supplierName: string;
  supplierPhone: string;
  supplierEmail: string;
  supplierCompany: string;
  supplierAddress: string;
  assets: SupplierAssetInterface[];
  purchases: SupplierPurchaseInterface[];
  resources: SupplierResourceInterface[];
}