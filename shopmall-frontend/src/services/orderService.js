import api from './api';

const orderService = {
  checkout: async (data) => {
    const response = await api.post('/orders/checkout', data);
    return response.data;
  },
  
  getHistory: async (matk) => {
    const response = await api.get(`/orders/history/${matk}`);
    return response.data;
  },

  getOrderDetails: async (mahd) => {
    const response = await api.get(`/orders/details/${mahd}`);
    return response.data;
  },

  cancelOrder: async (mahd, matk) => {
    const response = await api.post('/orders/cancel', { mahd, matk });
    return response.data;
  },

  receiveOrder: async (mahd, matk) => {
    const response = await api.put('/orders/receive', { mahd, matk });
    return response.data;
  }
};

export default orderService;
