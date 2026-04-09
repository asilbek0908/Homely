import api from './api';

export const getAIMatches = async (serviceType, district) => {
  const params = new URLSearchParams({ serviceType });
  if (district) params.append('district', district);
  const res = await api.get(`/ai/match?${params.toString()}`);
  return res.data;
};

export const sendChatMessage = async (message, history = []) => {
  const res = await api.post('/ai/chat', { message, history });
  return res.data;
};
