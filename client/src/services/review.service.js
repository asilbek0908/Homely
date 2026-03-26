import api from './api';

export const createReview = async (data) => {
  const res = await api.post('/reviews', data);
  return res.data;
};

export const getWorkerReviews = async (workerId) => {
  const res = await api.get(`/reviews/worker/${workerId}`);
  return res.data;
};
