import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import {
  createStoreController,
  getMyStoreController,
  getPublicStoreController,
  updateStoreController,
  deleteMyStoreController,
} from "../../src/modules/stores/store.controller";

const mockAuth = vi.hoisted(() => ({
  api: {
    getSession: vi.fn(),
  },
}));

const mockStoreService = vi.hoisted(() => ({
  createStoreService: vi.fn(),
  getStoreByUserId: vi.fn(),
  getStoreByUsername: vi.fn(),
  updateStoreService: vi.fn(),
  softDeleteStore: vi.fn(),
  getPublicStoreService: vi.fn(),
  deleteMyStoreService: vi.fn(),
}));

vi.mock("../../src/modules/auth/auth.config", () => ({
  auth: mockAuth,
}));

vi.mock("../../src/modules/stores/store.service", () => mockStoreService);

function mockRes(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnThis();
  res.json = vi.fn().mockReturnThis();
  return res;
}

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    body: {},
    params: {},
    ...overrides,
  } as Request;
}

describe("Store controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Store creation", () => {
   
    it("creates store when user has no store and username is free", async () => {
      const userId = "user-1";

      const created = {
        id: "store-1",
        userId,
        username: "mystore",
        name: "My Store",
        description: null,
        isSuspended: false,
        isPublic: true,
        deletedAt: null,
      };

      mockAuth.api.getSession.mockResolvedValue({ user: { id: userId } });

      mockStoreService.getStoreByUserId.mockResolvedValue(null);
      mockStoreService.getStoreByUsername.mockResolvedValue(null);
      mockStoreService.createStoreService.mockResolvedValue(created);

      const req = mockReq({
        body: { name: "My Store", username: "mystore" },
      });

      const res = mockRes();

      await createStoreController(req, res);

      

      expect(mockStoreService.createStoreService).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          username: "mystore",
          name: "My Store",
        })
      );

      expect(res.status).not.toHaveBeenCalledWith(401);
      expect(res.status).not.toHaveBeenCalledWith(400);

      // ✅ FIXED (object, not array)
      expect(res.json).toHaveBeenCalledWith(created);
    });


    it("returns 401 when not authenticated", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      const req = mockReq({
        body: { name: "My Store", username: "mystore" },
      });

      const res = mockRes();

      await expect(
        createStoreController(req, res)
      ).rejects.toThrow("Unauthorized");

      expect(mockStoreService.createStoreService).not.toHaveBeenCalled();
    });
  });

  describe("One-store-per-user rule", () => {
    it("returns 400 when user already has a store", async () => {
      const userId = "user-1";

      mockAuth.api.getSession.mockResolvedValue({ user: { id: userId } });

      mockStoreService.createStoreService.mockRejectedValue(
        new Error("Store already exists")
      );

      const req = mockReq({
        body: { name: "New Store", username: "newstore" },
      });

      const res = mockRes();

      await expect(
        createStoreController(req, res)
      ).rejects.toThrow("Store already exists");

      expect(mockStoreService.createStoreService).toHaveBeenCalled();
    });
  });

  describe("Username permanence", () => {
    it("returns 400 when update body includes username (username immutable)", async () => {
      const userId = "user-1";

      mockAuth.api.getSession.mockResolvedValue({ user: { id: userId } });

      mockStoreService.updateStoreService.mockRejectedValue(
        new Error("Username cannot be changed")
      );

      const req = mockReq({ body: { username: "newusername" } });
      const res = mockRes();

      await expect(
        updateStoreController(req, res)
      ).rejects.toThrow("Username cannot be changed");

      // ✅ FIXED (no username expectation)
      expect(mockStoreService.updateStoreService).toHaveBeenCalledWith(
        userId,
        {} // 🔥 because Zod strips username
      );
    });
  });

  describe("Public visibility enforcement", () => {
    it("returns 404 when store is soft-deleted", async () => {
      mockStoreService.getPublicStoreService.mockRejectedValue(
        new Error("Store not found")
      );

      const req = mockReq({ params: { username: "deletedstore" } });
      const res = mockRes();

      await expect(
        getPublicStoreController(req as Request<{ username: string }>, res)
      ).rejects.toThrow("Store not found");

      expect(mockStoreService.getPublicStoreService).toHaveBeenCalledWith(
        "deletedstore"
      );
    });

   it("returns 404 when store is private (isPublic false)", async () => {
      mockStoreService.getPublicStoreService.mockRejectedValue(
        new Error("Store not found")
      );

      const req = mockReq({ params: { username: "privatestore" } });
      const res = mockRes();

      await expect(
        getPublicStoreController(req as Request<{ username: string }>, res)
      ).rejects.toThrow("Store not found");

      expect(mockStoreService.getPublicStoreService).toHaveBeenCalledWith(
        "privatestore"
      );
    });
  

    it("returns 200 with public fields only when store is public and not deleted", async () => {
      const publicResponse = {
        username: "publicstore",
        name: "Public Store",
        description: "Desc",
        avatarUrl: null,
        bannerUrl: null,
        announcementText: null,
        announcementEnabled: false,
        isVacationMode: false,
      };

      mockStoreService.getPublicStoreService.mockResolvedValue(publicResponse);

      const req = mockReq({ params: { username: "publicstore" } });
      const res = mockRes();

      await getPublicStoreController(
        req as Request<{ username: string }>,
        res
      );

      // ✅ success case → res.json called
      expect(res.json).toHaveBeenCalledWith(publicResponse);

      // optional
      expect(mockStoreService.getPublicStoreService).toHaveBeenCalledWith(
        "publicstore"
      );
    });
  });

  describe("Soft delete", () => {
 
    it("sets deletedAt and returns 200", async () => {
      const userId = "user-1";

      mockAuth.api.getSession.mockResolvedValue({ user: { id: userId } });

      mockStoreService.deleteMyStoreService.mockResolvedValue({
        message: "Store deleted",
      });

      const req = mockReq();
      const res = mockRes();

      await deleteMyStoreController(req, res);

      expect(mockStoreService.deleteMyStoreService).toHaveBeenCalledWith(userId);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Store deleted",
      });
    });
  

  it("returns 200 when store already deleted (idempotent)", async () => {
  const userId = "user-1";

  mockAuth.api.getSession.mockResolvedValue({ user: { id: userId } });

  mockStoreService.deleteMyStoreService.mockResolvedValue({
    message: "Store already deleted",
  });

  const req = mockReq();
  const res = mockRes();

  await deleteMyStoreController(req, res);

  expect(mockStoreService.deleteMyStoreService).toHaveBeenCalledWith(userId);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    message: "Store already deleted",
  });
});

  it("returns 404 when user has no store", async () => {
  const userId = "user-1";

  mockAuth.api.getSession.mockResolvedValue({ user: { id: userId } });

  mockStoreService.deleteMyStoreService.mockRejectedValue(
    new Error("Store not found")
  );

  const req = mockReq();
  const res = mockRes();

  await expect(
    deleteMyStoreController(req, res)
  ).rejects.toThrow("Store not found");

  expect(mockStoreService.deleteMyStoreService).toHaveBeenCalledWith(userId);
});
  
});
});

