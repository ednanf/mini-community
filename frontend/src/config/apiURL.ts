export const API_BASE_URL =
    import.meta.env.VITE_ENV === 'development'
        ? import.meta.env.VITE_API_BASE_URL_DEV
        : import.meta.env.VITE_API_BASE_URL_PROD;
