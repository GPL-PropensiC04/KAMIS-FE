export interface AssetTempInterface {
    id: number;
    assetNameString: string;
    assetDescription: string;
    assetType: string;
    assetPrice: number;
    foto?: Blob; // Base64-encoded image string
    fotoContentType?: string | null;
    fotoUrl?: string;
  }

export interface AddAssetTemp {
    assetId?: number;
    assetName: string;
    assetDescription: string;
    assetType: string;
    assetPrice: number;
    foto?: File; // ONLY accepts File objects as per backend requirements
    fotoContentType?: string;
    originalFile?: File; // Store the original File object
  }