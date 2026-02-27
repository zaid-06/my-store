// stores/store.db.ts
import { db } from "../../config/db";
import { stores } from "./store.schema";
import { eq, desc } from "drizzle-orm";

// CREATE
export const dbCreateStore = (data: any) => {
  return db.insert(stores).values(data).returning();
};

// READ
export const dbGetStoreByUserId = (userId: string) => {
  return db.query.stores.findFirst({
    where: eq(stores.userId, userId),
  });
};

export const dbGetStoreByUsername = (username: string) => {
  return db.query.stores.findFirst({
    where: eq(stores.username, username),
    
  });
};

export const dbGetStoreById = (id: string) => {
  return db.query.stores.findFirst({
    where: eq(stores.id, id),
  });
};

export const dbListStores = () => {
  return db.query.stores.findMany({
    orderBy: (stores, { desc }) => [desc(stores.createdAt)],
  });
};

// UPDATE
export const dbUpdateStoreByUserId = (userId: string, data: any) => {
  return db
    .update(stores)
    .set(data)
    .where(eq(stores.userId, userId))
    .returning();
};

export const dbSoftDeleteStoreByUserId = (userId: string) => {
  return db
    .update(stores)
    .set({ deletedAt: new Date() })
    .where(eq(stores.userId, userId));
};

export const dbRestoreStoreById = (id: string) => {
  return db
    .update(stores)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(stores.id, id))
    .returning();
};