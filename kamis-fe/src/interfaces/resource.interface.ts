export interface ResourceInterface {
  id?: number;
  resourceName: string;
  price: number;
  stock: number;
  description: string;
}

export interface AddResourceRequestInterface {
  resourceName: string;
  price: number;
  stock: number;
  description: string;
}

export interface ResourceResponseInterface {
  status: number;
  message: string;
  timestamp: string;
  data: ResourceInterface;
}   