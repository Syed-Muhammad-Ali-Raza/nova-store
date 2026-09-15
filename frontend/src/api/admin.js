import { apiClient } from './client';

export const fetchAdminProducts = async (params = {}) => {
  const res = await apiClient.get('/api/admin/products', { params });
  return res.data;
};

export const createProduct = async (data) => {
  const res = await apiClient.post('/api/admin/products', data);
  return res.data;
};

export const updateProduct = async ({ id, ...data }) => {
  const res = await apiClient.put(`/api/admin/products/${id}`, data);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await apiClient.delete(`/api/admin/products/${id}`);
  return res.data;
};

export const fetchAdminLogs = async (params = {}) => {
  const res = await apiClient.get('/api/admin/logs', { params });
  return res.data;
};

export const fetchAdminOrders = async (params = {}) => {
  const res = await apiClient.get('/api/admin/orders', { params });
  return res.data;
};

export const updateOrderStatus = async ({ id, ...patch }) => {
  const res = await apiClient.put(`/api/admin/orders/${id}`, patch);
  return res.data;
};