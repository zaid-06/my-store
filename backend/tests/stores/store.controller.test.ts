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
  createStore: vi.fn(),
  getStoreByUserId: vi.fn(),
  getStoreByUsername: vi.fn(),
  updateStore: vi.fn(),
  softDeleteStore: vi.fn(),
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
      const created = [
        {
          id: "store-1",
          userId,
          username: "mystore",
          name: "My Store",
          description: null,
        },
      ];
      mockAuth.api.getSession.mockResolvedValue({ user: { id: userId } });
      mockStoreService.getStoreByUserId.mockResolvedValue(null);
      mockStoreService.getStoreByUsername.mockResolvedValue(null);
      mockStoreService.createStore.mockResolvedValue(created);

      const req = mockReq({ body: { name: "My Store", username: "mystore" } });
      const res = mockRes();

      await createStoreController(req, res);

      expect(mockStoreService.createStore).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          username: "mystore",
          name: "My Store",
        })
      );
      expect(res.status).not.toHaveBeenCalledWith(401);
      expect(res.status).not.toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    it("returns 401 when not authenticated", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      const req = mockReq({ body: { name: "My Store", username: "mystore" } });
      const res = mockRes();

      await createStoreController(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockStoreService.createStore).not.toHaveBeenCalled();
    });
  });

  describe("One-store-per-user rule", () => {
    it("returns 400 when user already has a store", async () => {
      const userId = "user-1";
      mockAuth.api.getSession.mockResolvedValue({ user: { id: userId } });
      mockStoreService.getStoreByUserId.mockResolvedValue({
        id: "existing-store",
        userId,
        username: "existing",
        name: "Existing Store",
      });
      mockStoreService.getStoreByUsername.mockResolvedValue(null);

      const req = mockReq({ body: { name: "New Store", username: "newstore" } });
      const res = mockRes();

      await createStoreController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Store already exists" })
      );
      expect(mockStoreService.createStore).not.toHaveBeenCalled();
    });
  });

  describe("Username permanence", () => {
    it("returns 400 when update body includes username (username immutable)", async () => {
      const userId = "user-1";
      const existing = {
        id: "s1",
        userId,
        username: "fixed",
        name: "Store",
        deletedAt: null,
      };
      mockAuth.api.getSession.mockResolvedValue({ user: { id: userId } });
      mockStoreService.getStoreByUserId.mockResolvedValue(existing);

      const req = mockReq({ body: { username: "newusername" } });
      const res = mockRes();

      await updateStoreController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Username cannot be changed" })
      );
      expect(mockStoreService.updateStore).not.toHaveBeenCalled();
    });
  });

  describe("Public visibility enforcement", () => {
    it("returns 404 when store is soft-deleted", async () => {
      mockStoreService.getStoreByUsername.mockResolvedValue({
        id: "s1",
        username: "deletedstore",
        isPublic: true,
        deletedAt: new Date(),
      });

      const req = mockReq({ params: { username: "deletedstore" } });
      const res = mockRes();

      await getPublicStoreController(req as Request<{ username: string }>, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Store not found" })
      );
    });

    it("returns 404 when store is private (isPublic false)", async () => {
      mockStoreService.getStoreByUsername.mockResolvedValue({
        id: "s1",
        username: "privatestore",
        isPublic: false,
        deletedAt: null,
      });

      const req = mockReq({ params: { username: "privatestore" } });
      const res = mockRes();

      await getPublicStoreController(req as Request<{ username: string }>, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Store not found" })
      );
    });

    it("returns 200 with public fields only when store is public and not deleted", async () => {
      const store = {
        id: "s1",
        username: "publicstore",
        name: "Public Store",
        description: "Desc",
        avatarUrl: null,
        bannerUrl: null,
        announcementText: null,
        announcementEnabled: false,
        isVacationMode: false,
        isPublic: true,
        deletedAt: null,
      };
      mockStoreService.getStoreByUsername.mockResolvedValue(store);

      const req = mockReq({ params: { username: "publicstore" } });
      const res = mockRes();

      await getPublicStoreController(req as Request<{ username: string }>, res);

      expect(res.status).not.toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        username: store.username,
        name: store.name,
        description: store.description,
        avatarUrl: store.avatarUrl,
        bannerUrl: store.bannerUrl,
        announcementText: store.announcementText,
        announcementEnabled: store.announcementEnabled,
        isVacationMode: store.isVacationMode,
      });
    });
  });

  describe("Soft delete", () => {
    it("sets deletedAt and returns 200", async () => {
      const userId = "user-1";
      const existing = {
        id: "s1",
        userId,
        username: "mystore",
        deletedAt: null,
      };
      mockAuth.api.getSession.mockResolvedValue({ user: { id: userId } });
      mockStoreService.getStoreByUserId.mockResolvedValue(existing);
      mockStoreService.softDeleteStore.mockResolvedValue(undefined);

      const req = mockReq();
      const res = mockRes();

      await deleteMyStoreController(req, res);

      expect(mockStoreService.softDeleteStore).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Store deleted" })
      );
    });

    it("returns 200 when store already deleted (idempotent)", async () => {
      const userId = "user-1";
      const existing = {
        id: "s1",
        userId,
        username: "mystore",
        deletedAt: new Date(),
      };
      mockAuth.api.getSession.mockResolvedValue({ user: { id: userId } });
      mockStoreService.getStoreByUserId.mockResolvedValue(existing);

      const req = mockReq();
      const res = mockRes();

      await deleteMyStoreController(req, res);

      expect(mockStoreService.softDeleteStore).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Store already deleted" })
      );
    });

    it("returns 404 when user has no store", async () => {
      mockAuth.api.getSession.mockResolvedValue({ user: { id: "user-1" } });
      mockStoreService.getStoreByUserId.mockResolvedValue(null);

      const req = mockReq();
      const res = mockRes();

      await deleteMyStoreController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(mockStoreService.softDeleteStore).not.toHaveBeenCalled();
    });
  });
});
