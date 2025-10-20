// This file sets up a custom Axios instance for making API requests.
// It handles the base URL and response structure and can be reused across the application.
// The backend is expected to return responses in the following format:
//
// {
//     "status": "success" | "error",
//     "data": { ... } // payload or error details
// }
//

import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/apiURL.ts';

// This instance will automatically prepend the base URL to all requests
const api = axios.create({
    baseURL: API_BASE_URL,
});

// Interceptor to handle responses.
// It checks the response structure and extracts the payload or handles errors.
api.interceptors.response.use(
    (response) => {
        const { status, data } = response.data;

        if (status === 'success') {
            return data; // payload
        }

        // Handle backend-defined "error" status
        return Promise.reject({
            message: data?.message || 'An unknown error occurred.',
            raw: response.data,
        });
    },
    (error) => {
        // This handles network errors and non-2xx responses from the server
        if (axios.isAxiosError(error)) {
            // Server responded with a status code that falls out of the range of 2xx
            if (error.response) {
                const errorMessage =
                    error.response.data?.data?.message ||
                    error.response.data?.message ||
                    error.message;
                return Promise.reject({
                    message: errorMessage,
                    raw: error.response.data,
                });
            } else if (error.request) {
                // The request was made but no response was received
                return Promise.reject({
                    message: 'Cannot connect to the server. Please check your network connection.',
                    raw: error,
                });
            }
        }
        // Something happened in setting up the request that triggered an Error
        return Promise.reject({
            message: error.message || 'An unexpected error occurred.',
            raw: error,
        });
    },
);

// Interceptor to handle requests.
// Used to add auth tokens or custom headers.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// CRUD helpers
export const getUnwrapped = <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.get(url, config) as Promise<T>;

export const getUnwrappedWithParams = <T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig,
): Promise<T> => api.get(url, { ...config, params }) as Promise<T>;

export const postUnwrapped = <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
): Promise<T> => api.post(url, data, config) as Promise<T>;

export const putUnwrapped = <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
): Promise<T> => api.put(url, data, config) as Promise<T>;

export const patchUnwrapped = <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
): Promise<T> => api.patch(url, data, config) as Promise<T>;

export const deleteUnwrapped = <T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
): Promise<T> => api.delete(url, config) as Promise<T>;

export default api;
