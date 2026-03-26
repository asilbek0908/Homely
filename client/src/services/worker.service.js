import api from './api';

export const getAllWorkers = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await api.get(`/workers?${params}`);
  return res.data;
};

export const getWorkerById = async (id) => {
  const res = await api.get(`/workers/${id}`);
  return res.data;
};

export const createWorkerProfile = async (data) => {
  const res = await api.post('/workers', data);
  return res.data;
};

export const updateWorkerProfile = async (data) => {
  const res = await api.put('/workers/profile', data);
  return res.data;
};

export const getWorkerStats = async () => {
  const res = await api.get('/workers/stats/me');
  return res.data;
};
