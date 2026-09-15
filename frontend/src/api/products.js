import { apiClient } from './client';

export const fetchProducts = async (params = {}) => {
  const res = await apiClient.get('/api/products', { params });
  return res.data;
};