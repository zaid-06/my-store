import { db } from "../../config/db";
import { merchants } from "./merchant.schema";
import { eq } from "drizzle-orm";

export const findMerchantByUserId = async (userId: string) => {
  return db.query.merchants.findFirst({
    where: eq(merchants.userId, userId),
  });
};

export const createMerchant = async (userId: string) => {
  const [merchant] = await db
    .insert(merchants)
    .values({ userId })
    .returning();

  return merchant;
};