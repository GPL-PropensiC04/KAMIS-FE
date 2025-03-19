import FormData from 'form-data';

export interface AssetTempInterface {
    id: number;
    assetNameString: string;
    assetDescription: string;
    assetType: string;
    assetPrice: number;
    foto?: string | null; // Base64-encoded image string
    fotoContentType?: string | null;
  }

export interface AddAssetTemp {
    assetId?: number;
    assetName: string;
    assetDescription: string;
    assetType: string;
    assetPrice: number;
    foto?: FormData;
  }