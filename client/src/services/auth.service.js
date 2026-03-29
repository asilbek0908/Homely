import api from './api';

export const registerUser = async (data) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const verifyEmail = async (token) => {
  const res = await api.get(`/auth/verify-email?token=${token}`);
  return res.data;
};

export const resendVerification = async () => {
  const res = await api.post('/auth/resend-verification');
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
};

export const resetPassword = async (token, password) => {
  const res = await api.post('/auth/reset-password', { token, password });
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.put('/auth/profile', data);
  return res.data;
};
