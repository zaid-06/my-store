
import {

  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,

} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {user } from "../users/user.schema";

import { merchants } from "../merchants/merchant.schema";
export const stores = pgTable("stores", {
  id: uuid("id").defaultRandom().primaryKey(),

  // userId: varchar("user_id", { length: 255 }).notNull().unique(),
  merchantId: uuid("merchant_id")
    .notNull()
    .unique() // one store per merchant (keep if required)
    .references(() => merchants.id, { onDelete: "cascade" }),
  username: varchar("username", { length: 30 }).notNull().unique(),

  name: varchar("name", { length: 80 }).notNull(),

  description: varchar("description", { length: 500 }),

  avatarUrl: text("avatar_url"),

  bannerUrl: text("banner_url"),
  isPublic: boolean("is_public").default(true),
  isVacationMode: boolean("is_vacation_mode").default(false),
  announcementText: varchar("announcement_text", { length: 200 }),
  announcementEnabled: boolean("announcement_enabled").default(false),
  isSuspended: boolean("is_suspended").default(false).notNull(),
  suspensionReason: text("suspension_reason"),
  suspendedAt: timestamp("suspended_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const storesRelations = relations(stores, ({ one }) => ({
  merchant: one(merchants, {
    fields: [stores.merchantId],
    references: [merchants.id],
  }),
}));

import { z } from "zod";


const usernameRegex = /^[a-z0-9-]+$/;

export const createStoreSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(usernameRegex, "Only lowercase, alphanumeric and hyphen allowed"),

  name: z
    .string()
    .min(1, "Name is required")
    .max(80, "Name must be at most 80 characters"),

  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),

  announcementText: z
    .string()
    .max(200, "Announcement must be at most 200 characters")
    .optional(),

  avatarUrl: z.string().url("Invalid URL").optional(),

  bannerUrl: z.string().url("Invalid URL").optional(),
});

// export const updateStoreSchema = createStoreSchema
//   .omit({ username: true }) //  username cannot be updated
//   .partial(); //  all fields optional 

export const updateStoreSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  avatarUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  isPublic: z.boolean().optional(),
  isVacationMode: z.boolean().optional(),
  announcementText: z.string().optional(),
  announcementEnabled: z.boolean().optional(),
});