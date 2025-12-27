import apiClient from './client';

export const authAPI = {
    login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });
        return response.data;
    },

    register: async (name, email, password) => {
        const response = await apiClient.post('/auth/register', { name, email, password });
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token, password) => {
        const response = await apiClient.post('/auth/reset-password', { token, password });
        return response.data;
    }
};
