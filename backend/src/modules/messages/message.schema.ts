import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  pgEnum,

} from "drizzle-orm/pg-core";

import { z } from "zod";
import { orders } from "../orders/order.schema";
import { stores } from "../stores/store.schema";
import { customers } from "../customers/customers.schema";

//  NEW: Conversations linked to customers, not buyers (BetterAuth users)
// import { user } from "../../auth.schema"; // agar BetterAuth users table hai

// export const conversations = pgTable("conversations", {
//   id: uuid("id").defaultRandom().primaryKey(),

//   orderId: uuid("order_id")
//     .notNull()
//     .unique()
//     .references(() => orders.id, { onDelete: "cascade" }),

//   storeId: uuid("store_id")
//     .notNull()
//     .references(() => stores.id, { onDelete: "cascade" }),

//   creatorId: text("creator_id").notNull(), // BetterAuth userId

//   buyerId: uuid("buyer_id"), // nullable for guest buyers

//   buyerEmail: text("buyer_email").notNull(),

//   isDisputed: boolean("is_disputed").default(false).notNull(),

//   createdAt: timestamp("created_at").defaultNow().notNull(),

//   updatedAt: timestamp("updated_at")
//     .defaultNow()
//     .$onUpdate(() => new Date()),
// });
export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .unique()
    .references(() => orders.id, { onDelete: "cascade" }),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  //  REMOVE creatorId (derive via store → merchant → user)
  //  NEW
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  isDisputed: boolean("is_disputed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
// import { conversations } from "./message.schema";

// sender roles enum
export const senderRoleEnum = pgEnum("sender_role", [
  "CREATOR",
  "BUYER",
  "ADMIN",
]);

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),

  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),

  senderRole: senderRoleEnum("sender_role").notNull(),

  senderId: text("sender_id").notNull(),

  content: text("content").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  deletedAt: timestamp("deleted_at"),
});


export const messageContentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(2000, "Message cannot exceed 2000 characters"),
});

export const guestMessageSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(5),
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(2000),
});
export const getMessagesQuerySchema = z.object({
  email: z.string().email("Invalid email"),
  phone: z.string().trim().min(1, "Phone is required"),
});
export const escalateDisputeSchema = z.object({
  email: z.string().email("Invalid email"),
  phone: z.string().trim().min(1, "Phone is required"),
});
export const conversationParamSchema = z.object({
  conversationId: z.string().uuid("Invalid conversationId"),
});


export const creatorConversationQuerySchema = z.object({
  isDisputed: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      return val === "true";
    }),
});

export const adminConversationQuerySchema = z.object({
  isDisputed: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      return val === "true";
    }),

  storeId: z.string().uuid("Invalid storeId").optional(),

  startDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),

  endDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
});
export const messageParamSchema = z.object({
  messageId: z.string().uuid("Invalid messageId"),
});