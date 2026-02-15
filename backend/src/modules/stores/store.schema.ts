
import {

  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,

} from "drizzle-orm/pg-core";

export const stores = pgTable("stores", {

  id: uuid("id").defaultRandom().primaryKey(),

  userId: varchar("user_id", { length: 255 }).notNull().unique(),

  username: varchar("username", { length: 30 }).notNull().unique(),

  name: varchar("name", { length: 80 }).notNull(),

  description: varchar("description", { length: 500 }),

  avatarUrl: text("avatar_url"),

  bannerUrl: text("banner_url"),

  isPublic: boolean("is_public").default(true),

  isVacationMode: boolean("is_vacation_mode").default(false),

  announcementText: varchar("announcement_text", { length: 200 }),

  announcementEnabled: boolean("announcement_enabled").default(false),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),

  deletedAt: timestamp("deleted_at"),

});