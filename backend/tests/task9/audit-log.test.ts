import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/config/db"; // or relative path

describe("Feature Name", () => {

  beforeEach(async () => {
    // optional setup
  });

  it("should do something", async () => {
    // test logic
  });

});





// import { describe, it, expect, vi, afterEach } from "vitest";

// // 🔥 MOCKS
// vi.mock("@/modules/audit/audit.db", () => ({
//   createAuditLog: vi.fn(),
// }));

// // IMPORT AFTER MOCKS
// import * as auditDb from "@/modules/admin/admin-audit.db";

// // 👉 Example services (adjust if your names differ)
// import { suspendStoreService } from "@/modules/stores/store.service";
// import { releasePayoutService } from "@/modules/payouts/payout.service";

// vi.mock("@/modules/stores/store.db", () => ({
//   dbGetStoreById: vi.fn(),
//   updateStore: vi.fn(),
// }));

// vi.mock("@/modules/payouts/payout.db", () => ({
//   findPayoutWithCreator: vi.fn(),
//   releasePayout: vi.fn(),
// }));

// import * as storeDb from "@/modules/stores/store.db";
// import * as payoutDb from "@/modules/payouts/payout.db";

// describe("Task 9 - Admin Audit Log Creation", () => {

//   afterEach(() => {
//     vi.restoreAllMocks();
//   });

//   // =========================
//   //  STORE SUSPEND LOG
//   // =========================
//   it("should create audit log when store is suspended", async () => {

//     (storeDb.dbGetStoreById as any).mockResolvedValue({
//       id: "store_1",
//       isSuspended: false,
//     });

//     (storeDb.updateStore as any).mockResolvedValue({
//       id: "store_1",
//       isSuspended: true,
//     });

//     await suspendStoreService("store_1", "admin_1");

//     expect(auditDb.createtLog).toHaveBeenCalledWith(
//       expect.objectContaining({
//         action: "STORE_SUSPENDED",
//         actorId: "admin_1",
//         entityId: "store_1",
//       })
//     );
//   });

//   // =========================
//   //  PAYOUT RELEASE LOG
//   // =========================
//   it("should create audit log when payout is released", async () => {

//     (payoutDb.findPayoutWithCreator as any).mockResolvedValue({
//       id: "payout_1",
//       isFrozen: false,
//       status: "ELIGIBLE",
//       netAmount: "100",
//       store: {
//         user: { email: "test@test.com" },
//       },
//     });

//     (payoutDb.releasePayout as any).mockResolvedValue({
//       id: "payout_1",
//       status: "RELEASED",
//     });

//     await releasePayoutService("payout_1", "admin_1");

//     expect(auditDb.createLog).toHaveBeenCalledWith(
//       expect.objectContaining({
//         action: "PAYOUT_RELEASED",
//         actorId: "admin_1",
//         entityId: "payout_1",
//       })
//     );
//   });

// });