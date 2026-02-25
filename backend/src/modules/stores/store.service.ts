
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