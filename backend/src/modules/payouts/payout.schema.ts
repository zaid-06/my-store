import { z } from "zod";
import { pgEnum, pgTable, uuid, numeric, timestamp, varchar } from "drizzle-orm/pg-core";

export const payoutStatusEnum = pgEnum("payout_status", [
  "LOCKED",
  "ELIGIBLE",
  "RELEASED",
  "CANCELLED",
]);

export const payouts = pgTable("payouts", {
  id: uuid("id").primaryKey().defaultRandom(),

  storeId: uuid("store_id").notNull(),

  creatorId: varchar("creator_id", { length: 255 }).notNull(),

  orderId: uuid("order_id").notNull().unique(),

  grossAmount: numeric("gross_amount", { precision: 10, scale: 2 }).notNull(),

  commissionAmount: numeric("commission_amount", {
    precision: 10,
    scale: 2,
  }).notNull(),

  netAmount: numeric("net_amount", { precision: 10, scale: 2 }).notNull(),

  status: payoutStatusEnum("status").default("LOCKED").notNull(),

  eligibleAt: timestamp("eligible_at").notNull(),

  releasedAt: timestamp("released_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});


// Admin Release Validation

export const releasePayoutSchema = z.object({
  payoutId: z.string().uuid("Invalid payout id"),
});

// Admin Cancel Validation

export const cancelPayoutSchema = z.object({
  payoutId: z.string().uuid("Invalid payout id"),
});