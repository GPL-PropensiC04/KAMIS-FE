export interface AssetTempInterface {
    id: number;
    assetName: string;
    assetDescription: string;
    assetType: string;
    assetPrice: number;
    foto?: string | null; // Base64-encoded image string
    fotoContentType?: string | null;
  }