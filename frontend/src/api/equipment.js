import apiClient from './client';

export const equipmentAPI = {
    getAll: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });
        const response = await apiClient.get(`/equipment?${params}`);
        return response.data.data;
    },

    getActive: async () => {
        const response = await apiClient.get('/equipment/active');
        return response.data.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`/equipment/${id}`);
        return response.data.data;
    },

    create: async (data) => {
        const response = await apiClient.post('/equipment', data);
        return response.data.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`/equipment/${id}`, data);
        return response.data.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/equipment/${id}`);
        return response.data.data;
    }
};
