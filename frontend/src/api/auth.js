import apiClient from './client';

export const authAPI = {
    login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });
        return response.data;
    }
};
