export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface TokenResponse {
    token: string;
    type: string;
    username: string;
    roles: string[];
}

export interface User {
    id: number;
    username: string;
    email: string;
    roles: string[];
}