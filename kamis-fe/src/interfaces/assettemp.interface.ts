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
    assetName: string;
    assetDescription: string;
    assetType: string;
    assetPrice: number;
    foto: File | string;
    fotoContentType?: string;
  }