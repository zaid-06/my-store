import { db } from "../../config/db";

import { stores } from "./store.schema";

import { eq } from "drizzle-orm";



export const createStore = async (data: any) => {

  return db.insert(stores).values(data).returning();

};

export const getStoreByUserId = async (userId: string) => {

  return db.query.stores.findFirst({

    where: eq(stores.userId, userId),

  });

};

export const getStoreByUsername = async (username: string) => {

  return db.query.stores.findFirst({

    where: eq(stores.username, username),

  });

};

export const updateStore = async (userId: string, data: any) => {

  return db

    .update(stores)

    .set(data)

    .where(eq(stores.userId, userId))

    .returning();

};


export const softDeleteStore = async (userId: string) => {

  return db

    .update(stores)

    .set({ deletedAt: new Date() })

    .where(eq(stores.userId, userId));

};


export const listStores = async () => {
  return db.query.stores.findMany({
    orderBy: (stores, { desc }) => [desc(stores.createdAt)],
  });
};

export const getStoreById = async (id: string) => {
  return db.query.stores.findFirst({
    where: eq(stores.id, id),
  });
};

export const restoreStore = async (id: string) => {
  const store = await getStoreById(id);
  if (!store || store.deletedAt == null) return null;
  const [restored] = await db
    .update(stores)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(stores.id, id))
    .returning();
  return restored;
};