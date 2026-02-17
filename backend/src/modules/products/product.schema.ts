import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  pgEnum,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { decimal } from "drizzle-orm/pg-core";
import { z } from "zod";
import { stores } from "../stores/store.schema";

// ============ Enums (Drizzle) ============
export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "published",
  "archived",
]);

export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);

// ============ Drizzle tables ============

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 120 }).notNull(),
  description: text("description"),
  status: productStatusEnum("status").default("draft").notNull(),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 50 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [uniqueIndex("categories_store_name_unique").on(t.storeId, t.name)]
);

export const productCategories = pgTable(
  "product_categories",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.productId, t.categoryId] })]
);

export const productVariants = pgTable("product_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 50 }).notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  inventory: integer("inventory").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const productMedia = pgTable("product_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 2048 }).notNull(),
  type: mediaTypeEnum("type").notNull(),
  position: integer("position").notNull().default(0),
});

// ============ Zod validation schemas ============

export const productSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  description: z.string().max(2000).optional(),
  status: z.enum(["draft", "published", "archived"]),
  isFeatured: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;

export const variantSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  price: z.number().positive("Price must be positive"),
  inventory: z.number().int("Inventory must be an integer").min(0),
});

export type VariantInput = z.infer<typeof variantSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const mediaSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  type: z.enum(["image", "video"]),
  position: z.number().int().min(0).optional(),
});

export type MediaInput = z.infer<typeof mediaSchema>;