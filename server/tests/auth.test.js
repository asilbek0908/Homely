/**
 * Auth controller unit tests
 * Models are mocked — no real DB connection needed.
 */

jest.mock('../models/User');
jest.mock('../utils/email', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-token'),
}));

const User = require('../models/User');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = (body = {}, user = null, query = {}) => ({ body, user, query });

// Import after mocks are set up
const {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth.controller');

// ─── register ────────────────────────────────────────────────────────────────

describe('register', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when required fields are missing', async () => {
    const req = mockReq({ email: 'x@x.com' });
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when email already exists', async () => {
    User.findOne.mockResolvedValue({ _id: '123', email: 'test@test.com' });
    const req = mockReq({ name: 'Ali', email: 'test@test.com', phone: '123', password: 'pass123' });
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('creates user and returns token on success', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: 'abc', name: 'Ali', email: 'ali@test.com', phone: '998901234567',
      role: 'customer', avatar: '', location: {}, isEmailVerified: false, telegramChatId: '',
    });

    const req = mockReq({ name: 'Ali', email: 'ali@test.com', phone: '998901234567', password: 'pass123' });
    const res = mockRes();
    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      token: 'mock-token',
    }));
  });
});

// ─── login ────────────────────────────────────────────────────────────────────

describe('login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when email or password missing', async () => {
    const res = mockRes();
    await login(mockReq({ email: 'a@a.com' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 401 when user not found', async () => {
    User.findOne.mockResolvedValue(null);
    const res = mockRes();
    await login(mockReq({ email: 'no@no.com', password: 'pass' }), res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when password is wrong', async () => {
    User.findOne.mockResolvedValue({
      matchPassword: jest.fn().mockResolvedValue(false),
    });
    const res = mockRes();
    await login(mockReq({ email: 'a@a.com', password: 'wrong' }), res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns token on successful login', async () => {
    User.findOne.mockResolvedValue({
      _id: 'abc', name: 'Ali', email: 'ali@test.com', phone: '123',
      role: 'customer', avatar: '', location: {}, isEmailVerified: true, telegramChatId: '',
      matchPassword: jest.fn().mockResolvedValue(true),
    });
    const res = mockRes();
    await login(mockReq({ email: 'ali@test.com', password: 'pass123' }), res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, token: 'mock-token' }));
  });
});

// ─── verifyEmail ──────────────────────────────────────────────────────────────

describe('verifyEmail', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when token is missing', async () => {
    const res = mockRes();
    await verifyEmail(mockReq({}, null, {}), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for invalid/expired token', async () => {
    User.findOne.mockResolvedValue(null);
    const res = mockRes();
    await verifyEmail(mockReq({}, null, { token: 'bad-token' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('marks user as verified on valid token', async () => {
    const mockUser = {
      isEmailVerified: false,
      emailVerificationToken: 'valid-token',
      emailVerificationExpires: new Date(Date.now() + 10000),
      save: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(mockUser);
    const res = mockRes();
    await verifyEmail(mockReq({}, null, { token: 'valid-token' }), res);
    expect(mockUser.isEmailVerified).toBe(true);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});

// ─── forgotPassword ───────────────────────────────────────────────────────────

describe('forgotPassword', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 404 when email not found', async () => {
    User.findOne.mockResolvedValue(null);
    const res = mockRes();
    await forgotPassword(mockReq({ email: 'nobody@test.com' }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('sets reset token and returns success', async () => {
    const mockUser = {
      email: 'ali@test.com',
      resetPasswordToken: '',
      resetPasswordExpires: null,
      save: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(mockUser);
    const res = mockRes();
    await forgotPassword(mockReq({ email: 'ali@test.com' }), res);
    expect(mockUser.resetPasswordToken).toBeTruthy();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});

// ─── resetPassword ────────────────────────────────────────────────────────────

describe('resetPassword', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when token or password missing', async () => {
    const res = mockRes();
    await resetPassword(mockReq({ token: 'abc' }), res); // no password
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for invalid/expired token', async () => {
    User.findOne.mockResolvedValue(null);
    const res = mockRes();
    await resetPassword(mockReq({ token: 'bad', password: 'newpass' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('resets password on valid token', async () => {
    const mockUser = {
      password: 'oldpass',
      resetPasswordToken: 'valid',
      resetPasswordExpires: new Date(Date.now() + 10000),
      save: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(mockUser);
    const res = mockRes();
    await resetPassword(mockReq({ token: 'valid', password: 'newpass123' }), res);
    expect(mockUser.password).toBe('newpass123');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
