// import { describe, it, expect, vi, beforeEach } from "vitest";


// //  HOISTED MOCKS

// const mocks = vi.hoisted(() => ({
//   findPayoutById: vi.fn(),
//   releasePayout: vi.fn(),
// }));

// vi.mock("../../src/modules/payouts/payout.db", () => ({
//   findPayoutById: mocks.findPayoutById,
//   releasePayout: mocks.releasePayout,
// }));


// // IMPORT AFTER MOCKS

// import * as payoutService from "../../src/modules/payouts/payout.service";

// describe("Release Payout Service", () => {

//   beforeEach(() => {
//     vi.resetAllMocks();
//   });

  
//   //  TEST 1: payout not found
  
//   it("should throw error if payout not found", async () => {

//     mocks.findPayoutById.mockResolvedValue(null);

//     await expect(
//       payoutService.releasePayoutService("p1")
//     ).rejects.toThrow("Payout not found");
//   });

  
//   //  TEST 2: idempotency (already released)
  
//   it("should return payout if already RELEASED", async () => {

//     const payout = {
//       id: "p2",
//       status: "RELEASED",
//     };

//     mocks.findPayoutById.mockResolvedValue(payout);

//     const result = await payoutService.releasePayoutService("p2");

//     expect(result).toEqual(payout);
//     expect(mocks.releasePayout).not.toHaveBeenCalled();
//   });

  
//   //  TEST 3: not eligible
  
//   it("should throw error if payout is not ELIGIBLE", async () => {

//     mocks.findPayoutById.mockResolvedValue({
//       id: "p3",
//       status: "LOCKED",
//     });

//     await expect(
//       payoutService.releasePayoutService("p3")
//     ).rejects.toThrow("Payout not eligible for release");
//   });

  
// //  TEST 4: success case

//   it("should release payout if status is ELIGIBLE", async () => {

//     mocks.findPayoutById.mockResolvedValue({
//       id: "p4",
//       status: "ELIGIBLE",
//     });

//     mocks.releasePayout.mockResolvedValue({
//       id: "p4",
//       status: "RELEASED",
//     });

//     const result = await payoutService.releasePayoutService("p4");

//     expect(mocks.releasePayout).toHaveBeenCalledWith("p4");

//     expect(result).toEqual({
//       id: "p4",
//       status: "RELEASED",
//     });
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

describe("Release Payout Service", () => {

  beforeEach(() => {
    vi.resetAllMocks();
  });

  // ❌ TEST 1: payout not found
  it("should throw error if payout not found", async () => {

    mocks.findPayoutWithCreator.mockResolvedValue(null);

    await expect(
      payoutService.releasePayoutService("p1", "admin_1")
    ).rejects.toThrow("Payout not found");
  });

  // 🔁 TEST 2: idempotency (already released)
  it("should return payout if already RELEASED", async () => {

    const payout = {
      id: "p2",
      status: "RELEASED",
      isFrozen: false,
      store: {
        user: { email: "test@mail.com" },
      },
    };

    mocks.findPayoutWithCreator.mockResolvedValue(payout);

    const result = await payoutService.releasePayoutService("p2", "admin_1");

    expect(result).toEqual(payout);
    expect(mocks.releasePayout).not.toHaveBeenCalled();
  });

  // ❌ TEST 3: frozen payout
  it("should throw error if payout is frozen", async () => {

    mocks.findPayoutWithCreator.mockResolvedValue({
      id: "p3",
      status: "ELIGIBLE",
      isFrozen: true,
      store: {
        user: { email: "test@mail.com" },
      },
    });

    await expect(
      payoutService.releasePayoutService("p3", "admin_1")
    ).rejects.toThrow("frozen");
  });

  // ❌ TEST 4: not eligible
  it("should throw error if payout is not ELIGIBLE", async () => {

    mocks.findPayoutWithCreator.mockResolvedValue({
      id: "p4",
      status: "LOCKED",
      isFrozen: false,
      store: {
        user: { email: "test@mail.com" },
      },
    });

    await expect(
      payoutService.releasePayoutService("p4", "admin_1")
    ).rejects.toThrow("not eligible");
  });

  // ✅ TEST 5: success case
  it("should release payout if status is ELIGIBLE", async () => {

    mocks.findPayoutWithCreator.mockResolvedValue({
      id: "p5",
      status: "ELIGIBLE",
      isFrozen: false,
      netAmount: 100,
      store: {
        user: { email: "test@mail.com" },
      },
    });

    mocks.releasePayout.mockResolvedValue({
      id: "p5",
      status: "RELEASED",
    });

    const result = await payoutService.releasePayoutService("p5", "admin_1");

    expect(mocks.releasePayout).toHaveBeenCalledWith("p5");

    expect(mocks.createJob).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "EMAIL",
        payload: expect.objectContaining({
          to: "test@mail.com",
        }),
      })
    );

    expect(result).toEqual({
      id: "p5",
      status: "RELEASED",
    });
  });
  
});