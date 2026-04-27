/**
 * Admin controller unit tests
 * Models are mocked — no real DB connection needed.
 */

jest.mock("../models/Worker");
jest.mock("../models/User");
jest.mock("../models/Booking");

const Worker = require("../models/Worker");
const User = require("../models/User");
const Booking = require("../models/Booking");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const {
  getPendingVerifications,
  approveWorker,
  rejectWorker,
} = require("../controllers/admin.controller");

// getPendingVerifications

describe("getPendingVerifications", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns empty list when no pending workers", async () => {
    Worker.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue([]),
    });

    const res = mockRes();
    await getPendingVerifications({}, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, workers: [] }),
    );
  });

  it("returns pending workers with user info", async () => {
    const workers = [
      {
        _id: "w1",
        user: { name: "Ali", email: "ali@test.com" },
        services: ["Plumbing"],
        idDocument: "",
      },
    ];
    Worker.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(workers),
    });

    const res = mockRes();
    await getPendingVerifications({}, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, workers }),
    );
  });
});

// approveWorker

describe("approveWorker", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 404 when worker not found", async () => {
    Worker.findByIdAndUpdate.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    const req = { params: { id: "nonexistent" } };
    const res = mockRes();
    await approveWorker(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("approves worker and sets isVerified", async () => {
    const worker = {
      _id: "w1",
      isVerified: true,
      verificationStatus: "approved",
      user: { name: "Ali" },
    };
    Worker.findByIdAndUpdate.mockReturnValue({
      populate: jest.fn().mockResolvedValue(worker),
    });

    const req = { params: { id: "w1" } };
    const res = mockRes();
    await approveWorker(req, res);

    expect(Worker.findByIdAndUpdate).toHaveBeenCalledWith(
      "w1",
      { isVerified: true, verificationStatus: "approved" },
      { new: true },
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });
});

//  rejectWorker 

describe("rejectWorker", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 404 when worker not found", async () => {
    Worker.findByIdAndUpdate.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    const req = { params: { id: "nonexistent" } };
    const res = mockRes();
    await rejectWorker(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("rejects worker and sets status to rejected", async () => {
    const worker = {
      _id: "w1",
      verificationStatus: "rejected",
      user: { name: "Ali" },
    };
    Worker.findByIdAndUpdate.mockReturnValue({
      populate: jest.fn().mockResolvedValue(worker),
    });

    const req = { params: { id: "w1" } };
    const res = mockRes();
    await rejectWorker(req, res);

    expect(Worker.findByIdAndUpdate).toHaveBeenCalledWith(
      "w1",
      { verificationStatus: "rejected" },
      { new: true },
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });
});
