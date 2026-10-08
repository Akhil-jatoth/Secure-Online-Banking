import api from './api.js';

export const billService = {
  getBills: async () => {
    const response = await api.get('/bills');
    return response.data;
  },

  payBill: async (data) => {
    const response = await api.post('/bills/pay', data);
    return response.data;
  },
};
