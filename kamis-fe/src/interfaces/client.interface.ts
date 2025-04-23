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
    nameClient: string;
    typeClient: boolean;
    companyClient: string;
  }