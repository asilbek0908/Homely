/**
 * Worker controller unit tests
 * Models are mocked — no real DB connection needed.
 */

jest.mock("../models/Worker");
jest.mock("../models/User");
jest.mock("../models/Booking");

const Worker = require("../models/Worker");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const {
  getAllWorkers,
  getWorkerById,
} = require("../controllers/worker.controller");

//  getAllWorkers

describe("getAllWorkers", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns empty array when no workers found", async () => {
    Worker.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
    });

    const req = { query: {} };
    const res = mockRes();
    await getAllWorkers(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, workers: [] }),
    );
  });

  it("always filters isVerified: true", async () => {
    Worker.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
    });

    await getAllWorkers({ query: {} }, mockRes());

    expect(Worker.find).toHaveBeenCalledWith(
      expect.objectContaining({ isVerified: true }),
    );
  });

  it("filters by service when provided", async () => {
    Worker.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
    });

    await getAllWorkers({ query: { service: "Plumbing" } }, mockRes());

    expect(Worker.find).toHaveBeenCalledWith(
      expect.objectContaining({
        services: { $in: ["Plumbing"] },
      }),
    );
  });

  it("filters by district when provided", async () => {
    Worker.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
    });

    await getAllWorkers({ query: { district: "Chilonzor" } }, mockRes());

    expect(Worker.find).toHaveBeenCalledWith(
      expect.objectContaining({
        "location.district": "Chilonzor",
      }),
    );
  });

  it("returns workers list", async () => {
    const workers = [
      { _id: "1", services: ["Plumbing"], rating: 4.5 },
      { _id: "2", services: ["Electrical"], rating: 4.0 },
    ];
    Worker.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(workers),
    });

    const res = mockRes();
    await getAllWorkers({ query: {} }, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, count: 2, workers }),
    );
  });
});

// getWorkerById

describe("getWorkerById", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 404 when worker not found", async () => {
    Worker.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    const req = { params: { id: "nonexistent" } };
    const res = mockRes();
    await getWorkerById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns worker when found", async () => {
    const worker = {
      _id: "1",
      services: ["Plumbing"],
      rating: 4.5,
      user: { name: "Ali" },
    };
    Worker.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(worker),
    });

    const req = { params: { id: "1" } };
    const res = mockRes();
    await getWorkerById(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, worker }),
    );
  });
});
