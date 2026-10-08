import api from './api.js';

export const transactionService = {
  getTransactions: async (params = {}) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  getTransactionById: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  transfer: async (transferData) => {
    const response = await api.post('/transactions/transfer', transferData);
    return response.data;
  },
};
