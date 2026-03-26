import api from './api';

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await api.put('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const uploadIdDocument = async (file) => {
  const formData = new FormData();
  formData.append('document', file);
  const res = await api.put('/workers/document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const uploadPortfolio = async (files) => {
  const formData = new FormData();
  for (const file of files) {
    formData.append('photos', file);
  }
  const res = await api.put('/workers/portfolio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};
