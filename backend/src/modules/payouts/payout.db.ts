import { db } from "../../config/db";
import { payouts } from "./payout.schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";

export const findPayoutByOrderId = async (orderId: string) => {
  return db.query.payouts.findFirst({
    where: eq(payouts.orderId, orderId),
  });
};

export const createPayout = async ({
  storeId,
  creatorId,
  orderId,
  grossAmount,
  commissionAmount,
  netAmount,
  eligibleAt,
}: {
  storeId: string;
  creatorId: string;
  orderId: string;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  eligibleAt: Date;
}) => {

  const [payout] = await db
    .insert(payouts)
    .values({
      storeId,
      creatorId,
      orderId,
      grossAmount: grossAmount.toString(),
      commissionAmount: commissionAmount.toString(),
      netAmount: netAmount.toString(),
      status: "LOCKED",
      eligibleAt,
    })
    .returning();

  return payout;
};



export const listPayoutsByStore = async ({
  storeId,
  status,
  startDate,
  endDate,
}: {
  storeId: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {

  const conditions = [eq(payouts.storeId, storeId)];

  if (status) {
    conditions.push(eq(payouts.status, status as any));
  }

  if (startDate) {
    conditions.push(gte(payouts.createdAt, new Date(startDate)));
  }

  if (endDate) {
    conditions.push(lte(payouts.createdAt, new Date(endDate)));
  }

  return db.query.payouts.findMany({
    where: and(...conditions),
    orderBy: (payouts, { desc }) => [desc(payouts.createdAt)],
  });
};



export const getPayoutSummaryByStore = async (storeId: string) => {

  const result = await db
    .select({
      totalGross: sql<number>`COALESCE(SUM(${payouts.grossAmount}),0)`,
      totalCommission: sql<number>`COALESCE(SUM(${payouts.commissionAmount}),0)`,
      totalNet: sql<number>`COALESCE(SUM(${payouts.netAmount}),0)`,

      lockedAmount: sql<number>`
        COALESCE(SUM(CASE WHEN ${payouts.status} = 'LOCKED' THEN ${payouts.netAmount} ELSE 0 END),0)
      `,

      eligibleAmount: sql<number>`
        COALESCE(SUM(CASE WHEN ${payouts.status} = 'ELIGIBLE' THEN ${payouts.netAmount} ELSE 0 END),0)
      `,

      releasedAmount: sql<number>`
        COALESCE(SUM(CASE WHEN ${payouts.status} = 'RELEASED' THEN ${payouts.netAmount} ELSE 0 END),0)
      `,
    })
    .from(payouts)
    .where(eq(payouts.storeId, storeId));

  return result[0];
};


export const listAllPayouts = async ({
  storeId,
  status,
  startDate,
  endDate,
}: {
  storeId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {

  const conditions: any[] = [];

  if (storeId) {
    conditions.push(eq(payouts.storeId, storeId));
  }

  if (status) {
    conditions.push(eq(payouts.status, status as any));
  }

  if (startDate) {
    conditions.push(gte(payouts.createdAt, new Date(startDate)));
  }

  if (endDate) {
    conditions.push(lte(payouts.createdAt, new Date(endDate)));
  }

  return db.query.payouts.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy: (payouts, { desc }) => [desc(payouts.createdAt)],
  });
};



export const findPayoutById = async (payoutId: string) => {
  return db.query.payouts.findFirst({
    where: eq(payouts.id, payoutId),
  });
};

export const releasePayout = async (payoutId: string) => {

  const [payout] = await db
    .update(payouts)
    .set({
      status: "RELEASED",
      releasedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(payouts.id, payoutId))
    .returning();

  return payout;
};

export const getLockedPayouts = async () => {
  return db.query.payouts.findMany({
    where: eq(payouts.status, "LOCKED"),
  });
};

export const markPayoutEligible = async (payoutId: string) => {

  await db
    .update(payouts)
    .set({
      status: "ELIGIBLE",
      updatedAt: new Date(),
    })
    .where(eq(payouts.id, payoutId));

};


export const cancelPayout = async (payoutId: string) => {

  await db
    .update(payouts)
    .set({
      status: "CANCELLED",
      netAmount: "0",
      updatedAt: new Date(),
    })
    .where(eq(payouts.id, payoutId));
};

export const updatePayoutAmounts = async ({
  payoutId,
  grossAmount,
  commissionAmount,
  netAmount,
}: {
  payoutId: string;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
}) => {

  await db
    .update(payouts)
    .set({
      grossAmount: grossAmount.toString(),
      commissionAmount: commissionAmount.toString(),
      netAmount: netAmount.toString(),
      updatedAt: new Date(),
    })
    .where(eq(payouts.id, payoutId));
};




