
export interface AccountInterface {
    email: string; //Account ID
    username: string;
    role: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AddAccountInterface {
    username: string;
    email: string;
    role: string;
    password: string;
}

export interface UpdateAccountInterface {
    username : string;
    email : string;
    password: string;
}