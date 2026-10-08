import api from './api.js';

export const statementService = {
  getStatementSummary: async (params = {}) => {
    const response = await api.get('/statements', { params });
    return response.data;
  },

  downloadStatementPDF: async (params = {}) => {
    const response = await api.get('/statements/download', {
      params,
      responseType: 'blob',
    });

    // Create a temporary link element to trigger browser download
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `Bank_Statement_${Date.now()}.pdf`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) fileName = match[1];
    }
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
