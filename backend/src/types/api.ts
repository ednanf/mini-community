// Generic API responses
export interface ApiResponse<T = never> {
    status: 'success' | 'error';
    data: T;
}

// Error types
export interface ApiError {
    message: string;
}

export interface MongoDatabaseError {
    code: number;
    message: string;
}

// User API responses
export interface RegisterUserSuccess {
    message: string;
    user: string;
    token: string;
}
