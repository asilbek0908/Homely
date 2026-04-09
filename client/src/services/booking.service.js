import api from './api';

export const createBooking = async (data) => {
  const res = await api.post('/bookings', data);
  return res.data;
};

export const getCustomerBookings = async () => {
  const res = await api.get('/bookings/customer');
  return res.data;
};

export const getWorkerBookings = async () => {
  const res = await api.get('/bookings/worker');
  return res.data;
};

export const updateBookingStatus = async (id, status, finalPrice = null) => {
  const body = { status };
  if (finalPrice != null) body.finalPrice = finalPrice;
  const res = await api.put(`/bookings/${id}/status`, body);
  return res.data;
};

export const getBookingById = async (id) => {
  const res = await api.get(`/bookings/${id}`);
  return res.data;
};

export const rescheduleBooking = async (id, scheduledDate, scheduledTime) => {
  const res = await api.put(`/bookings/${id}/reschedule`, { scheduledDate, scheduledTime });
  return res.data;
};
