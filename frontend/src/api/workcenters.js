import apiClient from './client';

export const workcenterAPI = {
    getAll: async () => {
        const response = await apiClient.get('/workcenters');
        return response.data.data;
    },

    getActive: async () => {
        const response = await apiClient.get('/workcenters/active');
        return response.data.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`/workcenters/${id}`);
        return response.data.data;
    },

    create: async (data) => {
        const response = await apiClient.post('/workcenters', data);
        return response.data.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`/workcenters/${id}`, data);
        return response.data.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/workcenters/${id}`);
        return response.data.data;
    }
};
