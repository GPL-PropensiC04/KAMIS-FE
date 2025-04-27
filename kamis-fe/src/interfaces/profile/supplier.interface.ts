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

export interface ResourceInterface {
    id: number;
    resourceName: string;
    resourcePrice: number;
  }
  