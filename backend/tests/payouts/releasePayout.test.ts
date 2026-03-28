// import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.mock("../../src/modules/payouts/payout.db", () => ({
//   findPayoutById: vi.fn(),
//   releasePayout: vi.fn(),
// }));

// import * as payoutService from "../../src/modules/payouts/payout.service";
// import * as payoutDb from "../../src/modules/payouts/payout.db";

// describe("Release Payout Idempotency", () => {

//   beforeEach(() => {
//     vi.clearAllMocks();
//   });

//   it("should release payout if status is ELIGIBLE", async () => {

//     const payout = {
//       id: "p1",
//       status: "ELIGIBLE",
//     };

//     vi.mocked(payoutDb.findPayoutById).mockResolvedValue(payout as any);

//     await payoutService.releasePayoutService("p1");

//     expect(payoutDb.releasePayout).toHaveBeenCalledWith("p1");
//   });

//   it("should NOT release payout if already RELEASED (idempotent)", async () => {

//     const payout = {
//       id: "p2",
//       status: "RELEASED",
//     };

//     vi.mocked(payoutDb.findPayoutById).mockResolvedValue(payout as any);

//     await payoutService.releasePayoutService("p2");

//     expect(payoutDb.releasePayout).not.toHaveBeenCalled();
//   });
// it("should throw error if payout is LOCKED", async () => {

//   const payout = {
//     id: "p3",
//     status: "LOCKED",
//   };

//   vi.mocked(payoutDb.findPayoutById).mockResolvedValue(payout as any);

//   await expect(
//     payoutService.releasePayoutService("p3")
//   ).rejects.toThrow("Payout not eligible for release");

// });

//   it("should throw error if payout is CANCELLED", async () => {

//   const payout = {
//     id: "p4",
//     status: "CANCELLED",
//   };

//   vi.mocked(payoutDb.findPayoutById).mockResolvedValue(payout as any);

//   await expect(
//     payoutService.releasePayoutService("p4")
//   ).rejects.toThrow("Payout not eligible for release");

// });

//   it("should throw error if payout not found", async () => {

//     vi.mocked(payoutDb.findPayoutById).mockResolvedValue(null);

//     await expect(
//       payoutService.releasePayoutService("p5")
//     ).rejects.toThrow("Payout not found");
//   });

// });
import { describe, it, expect, vi, beforeEach } from "vitest";

// ✅ HOISTED MOCKS
const mocks = vi.hoisted(() => ({
  findPayoutWithCreator: vi.fn(),
  releasePayout: vi.fn(),
  createJob: vi.fn(),
  assertStoreNotSuspended: vi.fn(),
}));

// ✅ MOCK MODULES
vi.mock("../../src/modules/payouts/payout.db", () => ({
  findPayoutWithCreator: mocks.findPayoutWithCreator,
  releasePayout: mocks.releasePayout,
}));

vi.mock("../../src/modules/jobs/job.db", () => ({
  createJob: mocks.createJob,
}));

vi.mock("../../src/guards/store.guard", () => ({
  assertStoreNotSuspended: mocks.assertStoreNotSuspended,
}));

// ✅ IMPORT AFTER MOCKS
import * as payoutService from "../../src/modules/payouts/payout.service";

describe("Release Payout Idempotency (Updated)", () => {

  beforeEach(() => {
    vi.resetAllMocks();
  });

  // ✅ ELIGIBLE → should release
  it("should release payout if status is ELIGIBLE", async () => {

    mocks.findPayoutWithCreator.mockResolvedValue({
      id: "p1",
      status: "ELIGIBLE",
      isFrozen: false,
      netAmount: 100,
      store: {
        user: { email: "test@mail.com" },
      },
    });

    await payoutService.releasePayoutService("p1", "admin_1");

    expect(mocks.releasePayout).toHaveBeenCalledWith("p1");
    expect(mocks.createJob).toHaveBeenCalled();
  });

  // 🔁 IDEMPOTENT
  it("should NOT release payout if already RELEASED", async () => {

    mocks.findPayoutWithCreator.mockResolvedValue({
      id: "p2",
      status: "RELEASED",
      isFrozen: false,
      store: {
        user: { email: "test@mail.com" },
      },
    });

    await payoutService.releasePayoutService("p2", "admin_1");

    expect(mocks.releasePayout).not.toHaveBeenCalled();
  });

  // ❌ LOCKED
  it("should throw error if payout is LOCKED", async () => {

    mocks.findPayoutWithCreator.mockResolvedValue({
      id: "p3",
      status: "LOCKED",
      isFrozen: false,
      store: {
        user: { email: "test@mail.com" },
      },
    });

    await expect(
      payoutService.releasePayoutService("p3", "admin_1")
    ).rejects.toThrow("not eligible");
  });

  // ❌ CANCELLED
  it("should throw error if payout is CANCELLED", async () => {

    mocks.findPayoutWithCreator.mockResolvedValue({
      id: "p4",
      status: "CANCELLED",
      isFrozen: false,
      store: {
        user: { email: "test@mail.com" },
      },
    });

    await expect(
      payoutService.releasePayoutService("p4", "admin_1")
    ).rejects.toThrow("not eligible");
  });

  // ❌ FROZEN (NEW IMPORTANT CASE)
  it("should throw error if payout is frozen", async () => {

    mocks.findPayoutWithCreator.mockResolvedValue({
      id: "p5",
      status: "ELIGIBLE",
      isFrozen: true,
      store: {
        user: { email: "test@mail.com" },
      },
    });

    await expect(
      payoutService.releasePayoutService("p5", "admin_1")
    ).rejects.toThrow("frozen");
  });

  // ❌ NOT FOUND
  it("should throw error if payout not found", async () => {

    mocks.findPayoutWithCreator.mockResolvedValue(null);

    await expect(
      payoutService.releasePayoutService("p6", "admin_1")
    ).rejects.toThrow("Payout not found");
  });

});