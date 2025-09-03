export interface ResponseWrapper<T> {
    message: string;
    data: T;
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

export interface ApiError {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    path: string;
}