export interface ResourceTempInterface {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }  

  export interface AddResourceTempRequestInterface {
    resourceId?: number;
    resourceName: string;
    resourceTotal: number;
    resourcePrice: number;
  }