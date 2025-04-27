export interface ResourceTempInterface {
    resourceId?: number;
    resourceName: string;
    quantity: number;
    resourcePrice: number
    
    resourceTotal: number;
  }  

  export interface AddResourceTempRequestInterface {
    resourceId?: number;
    resourceName: string;
    resourceTotal: number;
    resourcePrice: number;
  }

  export interface ResourceTempResponseInterface {
    resourceId?: number;
    resourceName: string;
    resourceTotal: number;
    resourcePrice: number;
  }
  
