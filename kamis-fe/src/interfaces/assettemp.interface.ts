export interface AssetTempInterface {
    id: number;
    assetNameString: string;
    assetDescription: string;
    assetType: string;
    assetPrice: number;
    foto?: File; // Base64-encoded image string
    fotoContentType?: string | null;
  }

export interface AddAssetTemp {
    assetId?: number;
    assetName: string;
    assetDescription: string;
    assetType: string;
    assetPrice: number;
    foto?: File | FormData | string; // Can be File, base64 string, or FormData
    fotoContentType?: string;
    originalFile?: File; // Store the original File object
  }