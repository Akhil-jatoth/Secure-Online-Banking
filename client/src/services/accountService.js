import api from './api.js';

export const accountService = {
  getAccounts: async () => {
    const response = await api.get('/accounts');
    return response.data;
  },

  getAccountById: async (id) => {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
  },

  getAccountBalance: async (id) => {
    const response = await api.get(`/accounts/${id}/balance`);
    return response.data;
  },

  openAccount: async (accountType) => {
    const response = await api.post('/accounts/open', { accountType });
    return response.data;
  },
};
