/**
 * Booking controller unit tests
 * Models are mocked — no real DB connection needed.
 */

jest.mock('../models/Booking');
jest.mock('../models/Worker');
jest.mock('../models/User');
jest.mock('../utils/telegramBot', () => ({
  sendNewBookingNotification: jest.fn(),
  sendBookingConfirmedNotification: jest.fn(),
  sendBookingCancelledNotification: jest.fn(),
}));

const Booking = require('../models/Booking');
const Worker = require('../models/Worker');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = (overrides = {}) => ({
  body: {},
  params: {},
  user: { _id: 'user123', role: 'customer' },
  app: { get: jest.fn().mockReturnValue(null) },
  ...overrides,
});

const { createBooking, getCustomerBookings, updateBookingStatus } = require('../controllers/booking.controller');

// ─── createBooking ────────────────────────────────────────────────────────────

describe('createBooking', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates a booking and returns 201', async () => {
    const booking = { _id: 'b1', service: 'Plumbing', status: 'pending' };
    Booking.create.mockResolvedValue(booking);
    Worker.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ user: { telegramChatId: '' } }),
    });

    const req = mockReq({
      body: { worker: 'w1', service: 'Plumbing', scheduledDate: '2026-05-01', scheduledTime: '10:00', address: 'Test', price: 100000 },
    });
    const res = mockRes();
    await createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('stores 10% commission on the booking', async () => {
    const booking = { _id: 'b1', commission: 10000 };
    Booking.create.mockResolvedValue(booking);
    Worker.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ user: {} }),
    });

    const req = mockReq({
      body: { worker: 'w1', service: 'Plumbing', price: 100000 },
    });
    await createBooking(req, mockRes());

    expect(Booking.create).toHaveBeenCalledWith(expect.objectContaining({ commission: 10000 }));
  });

  it('returns 500 on database error', async () => {
    Booking.create.mockRejectedValue(new Error('DB error'));

    const req = mockReq({ body: { worker: 'w1', service: 'Plumbing', price: 50000 } });
    const res = mockRes();
    await createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── getCustomerBookings ──────────────────────────────────────────────────────

describe('getCustomerBookings', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns bookings for logged-in customer', async () => {
    const bookings = [{ _id: 'b1', service: 'Plumbing', status: 'pending' }];
    Booking.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(bookings),
    });

    const res = mockRes();
    await getCustomerBookings(mockReq(), res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, bookings }));
    expect(Booking.find).toHaveBeenCalledWith({ customer: 'user123' });
  });

  it('returns empty list when no bookings', async () => {
    Booking.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
    });

    const res = mockRes();
    await getCustomerBookings(mockReq(), res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, bookings: [] }));
  });
});

// ─── updateBookingStatus ──────────────────────────────────────────────────────

describe('updateBookingStatus', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 404 when booking not found', async () => {
    Booking.findById.mockResolvedValue(null);

    const req = mockReq({ params: { id: 'nonexistent' }, body: { status: 'confirmed' }, user: { _id: 'w1', role: 'worker' } });
    const res = mockRes();
    await updateBookingStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 403 when customer tries to confirm a booking', async () => {
    Booking.findById.mockResolvedValue({
      _id: 'b1',
      status: 'pending',
      worker: 'w1',
      customer: 'user123',
      save: jest.fn(),
    });

    // Customer trying to set status to 'confirmed' — only 'cancelled' is allowed
    const req = mockReq({ params: { id: 'b1' }, body: { status: 'confirmed' }, user: { _id: 'user123', role: 'customer' } });
    const res = mockRes();
    await updateBookingStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('allows customer to cancel a pending booking', async () => {
    const booking = {
      _id: 'b1',
      status: 'pending',
      worker: 'w1',
      customer: 'user123',
      save: jest.fn().mockResolvedValue(true),
    };
    Booking.findById.mockResolvedValue(booking);
    Worker.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ user: { telegramChatId: '' } }),
      select: jest.fn().mockResolvedValue({ user: 'workerUser1' }),
    });

    const req = mockReq({ params: { id: 'b1' }, body: { status: 'cancelled' }, user: { _id: 'user123', role: 'customer' } });
    const res = mockRes();
    await updateBookingStatus(req, res);

    expect(booking.status).toBe('cancelled');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
