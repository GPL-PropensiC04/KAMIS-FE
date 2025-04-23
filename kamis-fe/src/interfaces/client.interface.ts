export interface ClientInterface {
    id: string;
    nameClient: string;
    noTelpClient: string;
    emailClient: string;
    typeClient: string;
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
  }

  export interface ProjectInterface {
    id: string;
    name: string;
    startDate: string;
    status: string;
  }
  
  export interface ClientDetailInterface {
    id: string;
    nameClient: string;
    noTelpClient: string;
    emailClient: string;
    typeClient: string;
    companyClient: string;
    addressClient: string;
    createdDate: string;
    updatedDate: string;
    projects?: ProjectInterface[]; // Tambahkan jika backend mengirimkan
  }