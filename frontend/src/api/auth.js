import { apiClient } from './client';

export const getMe = async () => {
  const res = await apiClient.get('/api/auth/me');
  return res.data;
};

export const login = async ({ email, password }) => {
  const res = await apiClient.post('/api/auth/login', { email, password });
  return res.data;
};

export const register = async ({ email, password }) => {
  const res = await apiClient.post('/api/auth/register', { email, password });
  return res.data;
};

export const logout = async () => {
  const res = await apiClient.post('/api/auth/logout');
  return res.data;
};