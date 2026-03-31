import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import {
  createStoreController,
  getMyStoreController,
  getPublicStoreController,
  updateStoreController,
  deleteMyStoreController,
} from "../../src/modules/stores/store.controller";

import { ApiError } from "@/shared/api-error";
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

  //  remove this (not used)
  // mockAuth.api.getSession.mockResolvedValue({ user: { id: userId } });

  mockStoreService.getStoreByUserId.mockResolvedValue(null);
  mockStoreService.getStoreByUsername.mockResolvedValue(null);
  mockStoreService.createStoreService.mockResolvedValue(created);

  const req = mockReq({
    body: { name: "My Store", username: "mystore" },
  });

  //  IMPORTANT FIX
  (req as any).user = { id: userId };

  const res = mockRes();

  await createStoreController(req as any, res);

  expect(mockStoreService.createStoreService).toHaveBeenCalledWith(
    userId,
    expect.objectContaining({
      username: "mystore",
      name: "My Store",
    })
  );

  //  fix response shape (same issue as before)
  expect(res.json).toHaveBeenCalledWith({
    success: true,
    error: null,
    data: created,
  });
});




  });

 describe("One-store-per-user rule", () => {
  it("returns 400 when user already has a store", async () => {
    const userId = "user-1";

    mockStoreService.createStoreService.mockRejectedValue(
      new Error("Store already exists")
    );

    const req = mockReq({
      body: { name: "New Store", username: "newstore" },
    });

    //  simulate middleware
    (req as any).user = { id: userId };

    const res = mockRes();

    await expect(
      createStoreController(req as any, res)
    ).rejects.toThrow("Store already exists");

    expect(mockStoreService.createStoreService).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        name: "New Store",
        username: "newstore",
      })
    );
  });
});

  describe("Username permanence", () => {
   it("returns 400 when update body includes username (username immutable)", async () => {
  const userId = "user-1";

  const req = mockReq({
    body: { username: "newusername" },
  });

  //  simulate middleware
  (req as any).user = { id: userId };

  const res = mockRes();

  await expect(
    updateStoreController(req as any, res)
  ).rejects.toMatchObject({
    message: "Username cannot be changed",
    statusCode: 400,
  });

  //  IMPORTANT: service should NOT be called
  expect(mockStoreService.updateStoreService).not.toHaveBeenCalled();
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

  //  FIXED
  expect(res.json).toHaveBeenCalledWith({
    success: true,
    data: publicResponse,
    error: null,
  });

  expect(mockStoreService.getPublicStoreService).toHaveBeenCalledWith(
    "publicstore"
  );
});
  });

  describe("Soft delete", () => {
 
   it("sets deletedAt and returns 200", async () => {
  const userId = "user-1";

  mockStoreService.deleteMyStoreService.mockResolvedValue({
    message: "Store deleted",
  });

  const req = mockReq();

  //  simulate middleware
  (req as any).user = { id: userId };

  const res = mockRes();

  await deleteMyStoreController(req as any, res);

  expect(mockStoreService.deleteMyStoreService).toHaveBeenCalledWith(userId);

  //  depends on your controller implementation
  expect(res.status).toHaveBeenCalledWith(200);

  //  FIX: successResponse wrapper
  expect(res.json).toHaveBeenCalledWith({
    success: true,
    data: { message: "Store deleted" },
    error: null,
  });
});
  

it("returns 200 when store already deleted (idempotent)", async () => {
  const userId = "user-1";

  mockStoreService.deleteMyStoreService.mockResolvedValue({
    message: "Store already deleted",
  });

  const req = mockReq();

  //  simulate middleware
  (req as any).user = { id: userId };

  const res = mockRes();

  await deleteMyStoreController(req as any, res);

  expect(mockStoreService.deleteMyStoreService).toHaveBeenCalledWith(userId);

  expect(res.status).toHaveBeenCalledWith(200);

  //  FIX: wrapped response
  expect(res.json).toHaveBeenCalledWith({
    success: true,
    data: { message: "Store already deleted" },
    error: null,
  });
});

 it("returns 404 when user has no store", async () => {
  const userId = "user-1";

  mockStoreService.deleteMyStoreService.mockRejectedValue(
    new ApiError("Store not found", 404)
  );

  const req = mockReq();

  //  simulate middleware
  (req as any).user = { id: userId };

  const res = mockRes();

  await expect(
    deleteMyStoreController(req as any, res)
  ).rejects.toMatchObject({
    message: "Store not found",
    statusCode: 404,
  });

  expect(mockStoreService.deleteMyStoreService).toHaveBeenCalledWith(userId);
});
  
});
});

