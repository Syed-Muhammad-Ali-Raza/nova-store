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

export const verifyEmail = async (token) => {
  const res = await apiClient.get('/api/auth/verify-email', { params: { token } });
  return res.data;
};

export const resendVerification = async ({ email }) => {
  const res = await apiClient.post('/api/auth/resend-verification', { email });
  return res.data;
};

export const forgotPassword = async ({ email }) => {
  const res = await apiClient.post('/api/auth/forgot-password', { email });
  return res.data;
};

export const resetPassword = async ({ token, password }) => {
  const res = await apiClient.post('/api/auth/reset-password', { token, password });
  return res.data;
};

export const verifyTwoFactor = async ({ challenge, otp }) => {
  const res = await apiClient.post('/api/auth/verify-2fa', { challenge, otp });
  return res.data;
};

export const resendTwoFactor = async ({ challenge }) => {
  const res = await apiClient.post('/api/auth/resend-2fa', { challenge });
  return res.data;
};

export const enableTwoFactorSend = async () => {
  const res = await apiClient.post('/api/auth/two-factor/send');
  return res.data;
};

export const confirmEnableTwoFactor = async ({ challenge, otp }) => {
  const res = await apiClient.post('/api/auth/two-factor/enable', { challenge, otp });
  return res.data;
};

export const disableTwoFactor = async ({ password }) => {
  const res = await apiClient.post('/api/auth/two-factor/disable', { password });
  return res.data;
};
