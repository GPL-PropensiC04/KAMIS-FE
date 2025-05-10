export interface ClientInterface {
  id: string;
  nameClient: string;
  noTelpClient: string;
  emailClient: string;
  typeClient: boolean;
  companyClient: string;
  addressClient: string;
  createdDate: string; // ISO string format (YYYY-MM-DDTHH:MM:SSZ)
  updatedDate: string; // ISO string format (YYYY-MM-DDTHH:MM:SSZ)
}

export interface AddClientRequestInterface {
  nameClient: string;
  noTelpClient: string;
  emailClient: string;
  typeClient: boolean; // true = Perusahaan, false = Individu (misalnya)
  companyClient?: string;
  addressClient?: string;
}

export interface ClientListResponseInterface {
  id: string;
  nameClient: string;
  typeClient: boolean;
  companyClient: string;
  projectCount?: number;
  totalProfit?: number;
}

export interface ProjectInterface {
  id: string;
  projectName: string;
  projectType: boolean;
  projectStatus: string;
  projectTotalPemasukkan?: number;
  projectTotalPengeluaran?: number;
}

export interface ClientDetailInterface {
  id: string;
  nameClient: string;
  noTelpClient: string;
  emailClient: string;
  typeClient: boolean;
  companyClient: string;
  addressClient: string;
  createdDate: string;
  updatedDate: string;
  projects?: ProjectInterface[];
}

export interface UpdateClientInterface{
  nameClient: string;
  noTelpClient: string;
  emailClient: string;
  addressClient: string
}

export interface PageResponseInterface<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}