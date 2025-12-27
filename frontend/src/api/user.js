import apiClient from './client';

export const userAPI = {
    // Get current user profile
    getMe: () => apiClient.get('/users/me').then(res => res.data.data),

    // Get all users (for admin/manager)
    getAllUsers: () => apiClient.get('/users').then(res => res.data.data),

    // Update user profile
    updateProfile: (data) => apiClient.put('/users/profile', data).then(res => res.data),

    // Change password
    changePassword: (data) => apiClient.put('/users/password', data).then(res => res.data)
};
