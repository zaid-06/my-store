import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import {
  listStoresController,
  getStoreByIdController,
  restoreStoreController,
} from "../../src/modules/admin/admin.stores.controller";

const mockStoreService = vi.hoisted(() => ({
  listStores: vi.fn(),
  getStoreById: vi.fn(),
  restoreStore: vi.fn(),
}));

vi.mock("../../src/modules/stores/store.service", () => mockStoreService);

function mockRes(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnThis();
  res.json = vi.fn().mockReturnThis();
  return res;
}

function mockReq(overrides: Partial<Request> = {}): Request {
  return { params: {}, ...overrides } as Request;
}

describe("Admin stores controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("List stores", () => {
    it("returns all stores (public, private, soft-deleted)", async () => {
      const stores = [
        { id: "1", username: "a", isPublic: true, deletedAt: null },
        { id: "2", username: "b", isPublic: false, deletedAt: null },
        { id: "3", username: "c", isPublic: true, deletedAt: new Date() },
      ];
      mockStoreService.listStores.mockResolvedValue(stores);

      const req = mockReq();
      const res = mockRes();

      await listStoresController(req, res);

      expect(mockStoreService.listStores).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(stores);
    });
  });

  describe("Get store by ID", () => {
    it("returns 404 when store does not exist", async () => {
      mockStoreService.getStoreById.mockResolvedValue(null);

      const req = mockReq({ params: { id: "missing-id" } });
      const res = mockRes();

      await getStoreByIdController(req as Request<{ id: string }>, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Store not found" })
      );
    });

    it("returns store when found", async () => {
      const store = { id: "store-1", username: "adminstore", name: "Store" };
      mockStoreService.getStoreById.mockResolvedValue(store);

      const req = mockReq({ params: { id: "store-1" } });
      const res = mockRes();

      await getStoreByIdController(req as Request<{ id: string }>, res);

      expect(res.json).toHaveBeenCalledWith(store);
    });
  });

  describe("Restore store", () => {
    it("restores store when deletedAt is set and does not change isPublic/isVacationMode", async () => {
      const deletedStore = {
        id: "store-1",
        username: "deleted",
        deletedAt: new Date(),
        isPublic: false,
        isVacationMode: true,
      };
      const restored = {
        ...deletedStore,
        deletedAt: null,
        updatedAt: new Date(),
      };
      mockStoreService.getStoreById.mockResolvedValue(deletedStore);
      mockStoreService.restoreStore.mockResolvedValue(restored);

      const req = mockReq({ params: { id: "store-1" } });
      const res = mockRes();

      await restoreStoreController(req as Request<{ id: string }>, res);

      expect(mockStoreService.restoreStore).toHaveBeenCalledWith("store-1");
      expect(res.json).toHaveBeenCalledWith(restored);
    });

    it("returns 400 when store is not deleted", async () => {
      const store = { id: "store-1", username: "live", deletedAt: null };
      mockStoreService.getStoreById.mockResolvedValue(store);

      const req = mockReq({ params: { id: "store-1" } });
      const res = mockRes();

      await restoreStoreController(req as Request<{ id: string }>, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining("not deleted"),
        })
      );
      expect(mockStoreService.restoreStore).not.toHaveBeenCalled();
    });

    it("returns 404 when store does not exist", async () => {
      mockStoreService.getStoreById.mockResolvedValue(null);

      const req = mockReq({ params: { id: "missing" } });
      const res = mockRes();

      await restoreStoreController(req as Request<{ id: string }>, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(mockStoreService.restoreStore).not.toHaveBeenCalled();
    });
  });
});
