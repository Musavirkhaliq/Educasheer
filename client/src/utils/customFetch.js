import axios from "axios";

const customFetch = axios.create({
    baseURL: "/api/v1",
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to requests
customFetch.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('customFetch - Adding auth token to request');
        } else {
            console.log('customFetch - No auth token available');
        }
        return config;
    },
    (error) => {
        console.error('customFetch - Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor for debugging
customFetch.interceptors.response.use(
    (response) => {
        console.log(`customFetch - Response from ${response.config.url}:`, response.status);
        return response;
    },
    (error) => {
        console.error('customFetch - Response error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

export default customFetch;