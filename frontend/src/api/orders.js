import { apiClient } from './client';

export const fetchMyOrders = async (params = {}) => {
  const res = await apiClient.get('/api/orders', { params });
  return res.data;
};

export const placeOrder = async (payload) => {
  const res = await apiClient.post('/api/orders', payload);
  return res.data;
};