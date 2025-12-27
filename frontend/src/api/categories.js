import apiClient from './client';

export const categoryAPI = {
    getAll: async () => {
        const response = await apiClient.get('/categories');
        return response.data.data;
    },

    create: async (data) => {
        const response = await apiClient.post('/categories', data);
        return response.data.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`/categories/${id}`, data);
        return response.data.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/categories/${id}`);
        return response.data.data;
    }
};
