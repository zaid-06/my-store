import {
  pgTable,
  uuid,
  varchar,
  numeric,
  integer,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { stores } from "../stores/store.schema";
import { products } from "../products/product.schema";
import { productVariants } from "../products/product.schema";
import { decimal } from "drizzle-orm/pg-core";
import { z } from "zod";
import { customers } from "../customers/customers.schema";


// Order Lifecycle Status
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "RETURNED",
  "CANCELLED",
]);

// Payment Method
export const paymentMethodEnum = pgEnum("payment_method", [
  "ONLINE",
  "COD",
]);

//  BUYERS TABLE (Guest Support)

// export const buyers = pgTable("buyers", {
//   id: uuid("id").defaultRandom().primaryKey(),

//   email: varchar("email", { length: 255 }).notNull(),
//   phone: varchar("phone", { length: 20 }).notNull(),
//   name: varchar("name", { length: 255 }).notNull(),

//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });
  //  ORDERS TABLE
  export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),

  //  Ownership
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),

  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),

  variantId: uuid("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "restrict" }),

  //  NEW (REPLACE buyerId)
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "restrict" }),

  //  KEEP snapshot (VERY IMPORTANT)
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull(),

  //  Shipping
  shippingAddress: jsonb("shipping_address").notNull(),

  //  Pricing
  quantity: integer("quantity").notNull(),

  priceAtPurchase: numeric("price_at_purchase", {
    precision: 12,
    scale: 2,
  }).notNull(),

  totalAmount: numeric("total_amount", {
    precision: 12,
    scale: 2,
  }).notNull(),

  //  Payment
  paymentMethod: paymentMethodEnum("payment_method").notNull(),

  status: orderStatusEnum("status")
    .default("PENDING")
    .notNull(),

  //  Refund
  isRefunded: boolean("is_refunded").default(false).notNull(),

  refundAmount: numeric("refund_amount", {
    precision: 12,
    scale: 2,
  }),

  //  Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  deletedAt: timestamp("deleted_at"),
});
// export const orders = pgTable("orders", {
//   id: uuid("id").defaultRandom().primaryKey(),
//   // 🔐 Ownership
//   storeId: uuid("store_id")
//     .notNull()
//     .references(() => stores.id, { onDelete: "cascade" }),

//   productId: uuid("product_id")
//     .notNull()
//     .references(() => products.id, { onDelete: "restrict" }),

//   variantId: uuid("variant_id")
//     .notNull()
//     .references(() => productVariants.id, { onDelete: "restrict" }),

//   buyerId: uuid("buyer_id")
//     .references(() => buyers.id, { onDelete: "set null" }), // nullable (guest support)
//     //  Buyer Snapshot (Freeze Data)
//   buyerName: varchar("buyer_name", { length: 255 }).notNull(),
//   buyerEmail: varchar("buyer_email", { length: 255 }).notNull(),
//   buyerPhone: varchar("buyer_phone", { length: 20 }).notNull(),
//     //  Shipping Address (JSON)
//   shippingAddress: jsonb("shipping_address").notNull(),
//     //  Pricing
//   quantity: integer("quantity").notNull(),

//   // Freeze variant price at purchase time
//   priceAtPurchase: numeric("price_at_purchase", {
//     precision: 12,
//     scale: 2,
//   }).notNull(),

//   totalAmount: numeric("total_amount", {
//     precision: 12,
//     scale: 2,
//   }).notNull(),
//   //  Payment & Status 
//   paymentMethod: paymentMethodEnum("payment_method").notNull(),

//   status: orderStatusEnum("status")
//     .default("PENDING")
//     .notNull(),
//     //  Refund (Flag Only)
//   isRefunded: boolean("is_refunded").default(false).notNull(),

//   refundAmount: numeric("refund_amount", {
//     precision: 12,
//     scale: 2,
//   }),
//     //  Timestamps
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   updatedAt: timestamp("updated_at").defaultNow().notNull(),

//   deletedAt: timestamp("deleted_at"),
// });



  //  RELATIONS
export const ordersRelations = relations(orders, ({ one }) => ({
  store: one(stores, {
    fields: [orders.storeId],
    references: [stores.id],
  }),

  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),

  variant: one(productVariants, {
    fields: [orders.variantId],
    references: [productVariants.id],
  }),

  //  NEW
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
}));



  //  Shipping Address Schema

export const shippingAddressSchema = z.object({
  line1: z
    .string()
    .min(3, "Address line1 is required")
    .max(255),

  city: z
    .string()
    .min(2, "City is required")
    .max(100),

  state: z
    .string()
    .min(2, "State is required")
    .max(100),

  postalCode: z
    .string()
    .min(3, "Postal code is required")
    .max(20),

  country: z
    .string()
    .min(2, "Country is required")
    .max(100),
});


  //  Create Order Schema
// 
export const createOrderSchema = z.object({
  productId: z
    .string()
    .uuid("Invalid productId"),

  variantId: z
    .string()
    .uuid("Invalid variantId"),

  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1"),

  //  RENAMED (buyer → customer)
  customerName: z
    .string()
    .min(2, "Name is required")
    .max(255),

  customerEmail: z
    .string()
    .email("Invalid email format"),

  customerPhone: z
    .string()
    .min(6, "Phone number is required")
    .max(20),

  shippingAddress: shippingAddressSchema,

  paymentMethod: z.enum(["ONLINE", "COD"]),
});