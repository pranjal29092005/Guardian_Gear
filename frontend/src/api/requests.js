import apiClient from './client';

export const requestAPI = {
    create: async (data) => {
        const response = await apiClient.post('/requests', data);
        return response.data.data;
    },

    getKanban: async (equipmentId = null) => {
        const url = equipmentId ? `/requests/kanban?equipmentId=${equipmentId}` : '/requests/kanban';
        const response = await apiClient.get(url);
        return response.data.data;
    },

    getCalendar: async () => {
        const response = await apiClient.get('/requests/calendar');
        return response.data.data;
    },

    updateStage: async (id, stage) => {
        const response = await apiClient.put(`/requests/${id}/stage`, { stage });
        return response.data.data;
    },

    assign: async (id, technicianId = null) => {
        const response = await apiClient.put(`/requests/${id}/assign`, { technicianId });
        return response.data.data;
    },

    complete: async (id, durationHours) => {
        const response = await apiClient.put(`/requests/${id}/complete`, { durationHours });
        return response.data.data;
    },

    scrap: async (id) => {
        const response = await apiClient.put(`/requests/${id}/scrap`);
        return response.data.data;
    },

    assignTechnician: async (requestId, technicianId) => {
        const response = await apiClient.post(`/requests/${requestId}/assign-technician`, { technicianId });
        return response.data.data;
    },

    updateStatus: async (requestId, status) => {
        const response = await apiClient.put(`/requests/${requestId}/update-status`, { status });
        return response.data.data;
    },

    getAvailableTechnicians: async () => {
        const response = await apiClient.get('/requests/available-technicians');
        return response.data.data;
    },

    getDashboardStats: async () => {
        const response = await apiClient.get('/requests/dashboard-stats');
        return response.data.data;
    },

    updateTeamAndTechnician: async (requestId, teamId, technicianId) => {
        const response = await apiClient.put(`/requests/${requestId}/update-team-technician`, { teamId, technicianId });
        return response.data.data;
    }
};
