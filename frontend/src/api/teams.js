import apiClient from './client';

export const teamAPI = {
    getAll: async () => {
        const response = await apiClient.get('/teams');
        return response.data.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`/teams/${id}`);
        return response.data.data;
    },

    create: async (data) => {
        const response = await apiClient.post('/teams', data);
        return response.data.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`/teams/${id}`, data);
        return response.data.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/teams/${id}`);
        return response.data.data;
    },

    addMember: async (teamId, userId) => {
        const response = await apiClient.post(`/teams/${teamId}/members`, { userId });
        return response.data.data;
    },

    removeMember: async (teamId, userId) => {
        const response = await apiClient.delete(`/teams/${teamId}/members/${userId}`);
        return response.data.data;
    }
};
