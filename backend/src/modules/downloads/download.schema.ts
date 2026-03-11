import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { orders } from "../orders/order.schema";
import { products } from "../products/product.schema";

export const digitalDownloads = pgTable("digital_downloads", {
  id: uuid("id").primaryKey().defaultRandom(),

  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),

  variantId: uuid("variant_id"),

  // hashed token (preferred)
  token: varchar("token", { length: 128 }).notNull().unique(),

  maxDownloads: integer("max_downloads"),

  downloadCount: integer("download_count")
    .notNull()
    .default(0),

  expiresAt: timestamp("expires_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});




export const downloadLogs = pgTable("download_logs", {
  id: uuid("id").primaryKey().defaultRandom(),

  digitalDownloadId: uuid("digital_download_id")
    .notNull()
    .references(() => digitalDownloads.id),

  ipAddress: varchar("ip_address", { length: 255 }),

  userAgent: varchar("user_agent", { length: 512 }),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});


// retlation
export const downloadLogsRelations = relations(downloadLogs, ({ one }) => ({
  digitalDownload: one(digitalDownloads, {
    fields: [downloadLogs.digitalDownloadId],
    references: [digitalDownloads.id],
  }),
}));

export const digitalDownloadsRelations = relations(
  digitalDownloads,
  ({ one }) => ({
    order: one(orders, {
      fields: [digitalDownloads.orderId],
      references: [orders.id],
    }),
  })
);