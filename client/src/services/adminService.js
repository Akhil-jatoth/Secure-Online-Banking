import api from './api.js';

export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  freezeAccount: async (id, reason) => {
    const response = await api.patch(`/admin/accounts/${id}/freeze`, { reason });
    return response.data;
  },

  unfreezeAccount: async (id) => {
    const response = await api.patch(`/admin/accounts/${id}/unfreeze`);
    return response.data;
  },

  getTransactions: async (params = {}) => {
    const response = await api.get('/admin/transactions', { params });
    return response.data;
  },

  getAuditLogs: async (params = {}) => {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  },
};
