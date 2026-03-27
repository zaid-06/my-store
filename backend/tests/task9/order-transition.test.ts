import { describe, it, expect, vi, afterEach } from "vitest";

// 🔥 MOCKS
vi.mock("@/modules/stores/store.db", () => ({
  dbGetStoreByUserId: vi.fn(),
}));

vi.mock("@/modules/orders/order.db", () => ({
  findOrderByIdAndStore: vi.fn(),
  updateOrderStatus: vi.fn(),
}));

vi.mock("@/modules/payouts/payout.service", () => ({
  createPayoutForOrderService: vi.fn(),
}));

vi.mock("@/modules/admin/admin-audit.db", () => ({
  createLog: vi.fn(),
}));

vi.mock("@/modules/jobs/job.db", () => ({
  createJob: vi.fn(),
}));

// ✅ IMPORT AFTER MOCKS
import * as storeDb from "@/modules/stores/store.db";
import * as orderDb from "@/modules/orders/order.db";
import * as payoutService from "@/modules/payouts/payout.service";
import * as auditDb from "@/modules/admin/admin-audit.db";

import { updateCreatorOrderStatus } from "@/modules/orders/order.service";

describe("Task 9 - Order Transition Restrictions", () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const baseOrder = {
    id: "order_1",
    status: "PAID",
    buyerEmail: "test@test.com",
  };

  // =========================
  // 🧪 VALID TRANSITION
  // =========================
  it("should allow valid transition PAID → SHIPPED", async () => {

    (storeDb.dbGetStoreByUserId as any).mockResolvedValue({
      id: "store_1",
    });

    (orderDb.findOrderByIdAndStore as any).mockResolvedValue(baseOrder);

    (orderDb.updateOrderStatus as any).mockResolvedValue({
      ...baseOrder,
      status: "SHIPPED",
    });

    const result = await updateCreatorOrderStatus({
      creatorId: "user_1",
      orderId: "order_1",
      newStatus: "SHIPPED",
    });

    expect(result.status).toBe("SHIPPED");
  });

  // =========================
  // 🧪 INVALID TRANSITION
  // =========================
  it("should block invalid transition PAID → DELIVERED", async () => {

    (storeDb.dbGetStoreByUserId as any).mockResolvedValue({
      id: "store_1",
    });

    (orderDb.findOrderByIdAndStore as any).mockResolvedValue(baseOrder);

    await expect(
      updateCreatorOrderStatus({
        creatorId: "user_1",
        orderId: "order_1",
        newStatus: "DELIVERED",
      })
    ).rejects.toThrow("Invalid status transition");
  });

  // =========================
  // 🧪 TRIGGER PAYOUT ON DELIVERED
  // =========================
  it("should create payout when status becomes DELIVERED", async () => {

    (storeDb.dbGetStoreByUserId as any).mockResolvedValue({
      id: "store_1",
    });

    (orderDb.findOrderByIdAndStore as any).mockResolvedValue({
      ...baseOrder,
      status: "SHIPPED",
    });

    (orderDb.updateOrderStatus as any).mockResolvedValue({
      ...baseOrder,
      status: "DELIVERED",
    });

    await updateCreatorOrderStatus({
      creatorId: "user_1",
      orderId: "order_1",
      newStatus: "DELIVERED",
    });

    expect(payoutService.createPayoutForOrderService).toHaveBeenCalledWith("order_1");
  });

  // =========================
  // 🧪 AUDIT LOG CREATED
  // =========================
  it("should create audit log on status update", async () => {

    (storeDb.dbGetStoreByUserId as any).mockResolvedValue({
      id: "store_1",
    });

    (orderDb.findOrderByIdAndStore as any).mockResolvedValue(baseOrder);

    (orderDb.updateOrderStatus as any).mockResolvedValue({
      ...baseOrder,
      status: "SHIPPED",
    });

    await updateCreatorOrderStatus({
      creatorId: "user_1",
      orderId: "order_1",
      newStatus: "SHIPPED",
    });

    expect(auditDb.createLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "ORDER_STATUS_UPDATED",
        entityId: "order_1",
      })
    );
  });

});