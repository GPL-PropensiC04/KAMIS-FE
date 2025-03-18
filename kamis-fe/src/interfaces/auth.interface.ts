export type UserRole = 'Admin' | 'Direksi' | 'Finance' | 'Operasional'

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponseData {
    token: string;
}

export interface LoginResponse {
    status: number;
    message: string;
    timestamp: string;
    data: LoginResponseData;
}
