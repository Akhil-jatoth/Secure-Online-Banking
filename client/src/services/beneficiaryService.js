import api from './api.js';

export const beneficiaryService = {
  getBeneficiaries: async () => {
    const response = await api.get('/beneficiaries');
    return response.data;
  },

  addBeneficiary: async (data) => {
    const response = await api.post('/beneficiaries', data);
    return response.data;
  },

  updateBeneficiary: async (id, data) => {
    const response = await api.put(`/beneficiaries/${id}`, data);
    return response.data;
  },

  deleteBeneficiary: async (id, otp) => {
    const response = await api.delete(`/beneficiaries/${id}`, { data: { otp } });
    return response.data;
  },
};
