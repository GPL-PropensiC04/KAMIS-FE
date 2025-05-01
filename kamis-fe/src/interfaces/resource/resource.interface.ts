export interface ResourceInterface {
  id?: number;
  resourceName: string;
  resourcePrice: number;
  resourceStock: number;
  resourceDescription: string;
}

export interface AddResourceRequestInterface {
  resourceName: string;
  resourcePrice: number;
  resourceStock: number;
  resourceDescription: string;
  resourceSupplierId: string;
}

export interface ResourceResponseInterface {
  status: number;
  message: string;
  timestamp: string;
  data: ResourceInterface;
}   

export interface UpdateResourceRequestInterface {
  resourcePrice: number;
  resourceDescription: string;
  resourceStock: number;
}