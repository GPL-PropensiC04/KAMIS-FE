export type UserRole = 'Admin' | 'Direksi' | 'Finance' | 'Operasional'

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        email: string;
        role: UserRole;
    };
}
