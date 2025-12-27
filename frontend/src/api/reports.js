import apiClient from './client';

export const reportsAPI = {
    getRequestsPerTeam: async () => {
        const response = await apiClient.get('/reports/requests-per-team');
        return response.data.data;
    }
};
