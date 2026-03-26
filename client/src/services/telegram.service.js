import api from './api';

export const connectTelegram = async (telegramChatId) => {
  const res = await api.post('/telegram/connect', { telegramChatId });
  return res.data;
};

export const disconnectTelegram = async () => {
  const res = await api.post('/telegram/disconnect');
  return res.data;
};
