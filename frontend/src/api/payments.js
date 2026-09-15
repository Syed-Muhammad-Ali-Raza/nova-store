import { apiClient } from './client';

export const createPaymentIntent = async ({ amount }) => {
  const res = await apiClient.post('/api/payment/intent', { amount });
  return res.data;
};