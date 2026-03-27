
import {
  dbCreateStore,
  dbGetStoreByUserId,
  dbGetStoreByUsername,
  dbGetStoreById,
  dbUpdateStoreByUserId,
  dbSoftDeleteStoreByUserId,
  dbListStores,
  dbRestoreStoreById,
} from "./store.db";

import * as storeDb from "./store.db";

import { ApiError } from "../../shared/api-error";

import * as adminAuditLogDb from "../admin/admin-audit.db";
export const createStoreService = async (
  userId: string,
  input: any
) => {
  // Check existing store
  const existingStore = await storeDb.dbGetStoreByUserId(userId);
  if (existingStore) {
    throw new ApiError("Store already exists", 400);
  }

  // Check username
  const usernameTaken = await storeDb.dbGetStoreByUsername(input.username);
  if (usernameTaken) {
    throw new ApiError("Username already taken", 400);
  }

  // Create store
  const store = await storeDb.dbCreateStore({
    ...input,
    userId,
  });

  return store;
};



export const getPublicStoreService = async (username: string) => {
  const store = await storeDb.dbGetStoreByUsername(username);

  //  ALL BUSINESS RULES HERE
  if (
    !store ||
    !store.isPublic ||
    store.deletedAt 
    // store.isSuspended //  Task 9 rule
  ) {
    throw new ApiError("Store not found", 404);
  }

  // return only public fields
  return {
    username: store.username,
    name: store.name,
    description: store.description,
    avatarUrl: store.avatarUrl,
    bannerUrl: store.bannerUrl,
    announcementText: store.announcementText,
    announcementEnabled: store.announcementEnabled,
    isVacationMode: store.isVacationMode,
  };
};

export const updateStoreService = async (
  userId: string,
  input: any
) => {
  const store = await storeDb.dbGetStoreByUserId(userId);

  if (!store) {
    throw new ApiError("Store not found", 404);
  }

  

  //  username immutable
  if (input.username !== undefined) {
    throw new ApiError("Username cannot be changed", 400);
  }

  const updatable = {
    name: input.name,
    description: input.description,
    avatarUrl: input.avatarUrl,
    bannerUrl: input.bannerUrl,
    isPublic: input.isPublic,
    isVacationMode: input.isVacationMode,
    announcementText: input.announcementText,
    announcementEnabled: input.announcementEnabled,
    updatedAt: new Date(),
  };

  const data = Object.fromEntries(
    Object.entries(updatable).filter(([, v]) => v !== undefined)
  );

  const hasUpdates = Object.keys(data).some((k) => k !== "updatedAt");

  if (!hasUpdates) {
    throw new ApiError(
      "No updatable fields provided",
      400
    );
  }

  await storeDb.dbUpdateStoreByUserId(userId, data);

  return await storeDb.dbGetStoreByUserId(userId);
};


export const deleteMyStoreService = async (userId: string) => {
  const store = await storeDb.dbGetStoreByUserId(userId);

  if (!store) {
    throw new ApiError("Store not found", 404);
  }

  // already deleted → idempotent behavior 
  if (store.deletedAt) {
    return { message: "Store already deleted" };
  }

  await storeDb.dbSoftDeleteStoreByUserId(userId);

  return { message: "Store deleted" };
};

export const createStore = async (data: any) => {
  return dbCreateStore(data);
};

export const getStoreByUserId = async (userId: string) => {
  return dbGetStoreByUserId(userId);
};

export const getStoreByUsername = async (username: string) => {
  return dbGetStoreByUsername(username);
};

export const getStoreById = async (id: string) => {
  return dbGetStoreById(id);
};

export const updateStore = async (userId: string, data: any) => {
  return dbUpdateStoreByUserId(userId, data);
};

export const softDeleteStore = async (userId: string) => {
  return dbSoftDeleteStoreByUserId(userId);
};

export const listStores = async () => {
  return dbListStores();
};

export const restoreStore = async (id: string) => {
  const store = await dbGetStoreById(id);
  if (!store || store.deletedAt == null) return null;

  const [restored] = await dbRestoreStoreById(id);
  return restored;
};

export const suspendStoreService = async ({
  storeId,
  reason,
  adminId,
}: {
  storeId: string;
  reason: string;
  adminId: string;
}) => {
  const store = await dbGetStoreById(storeId);

  if (!store) {
    throw new ApiError("Store not found", 404);
  }

  if (store.isSuspended) {
    throw new ApiError("Store already suspended", 400);
  }

  await storeDb.dbSuspendStore(storeId, reason);

  //  TASK 9: AUDIT LOG (mandatory)
  await adminAuditLogDb.createLog({
    adminId,
    action: "STORE_SUSPEND",
    entityType: "STORE",
    entityId: storeId,
    metadata: { reason },
  });

  return { message: "Store suspended successfully" };
};

export const unsuspendStoreService = async ({
  storeId,
  adminId,
}: {
  storeId: string;
  adminId: string;
}) => {
  const store = await dbGetStoreById(storeId);

  if (!store) {
    throw new ApiError("Store not found", 404);
  }

  if (!store.isSuspended) {
    throw new ApiError("Store is not suspended", 400);
  }

  await storeDb.dbUnsuspendStore(storeId);

  // AUDIT LOG
  await adminAuditLogDb.createLog({
    adminId,
    action: "STORE_UNSUSPEND",
    entityType: "STORE",
    entityId: storeId,
    metadata: {},
  });

  return { message: "Store unsuspended successfully" };
};