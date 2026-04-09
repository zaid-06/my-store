import { pgTable, uuid, text, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "../users/user.schema"; // BetterAuth user table
import { relations } from "drizzle-orm";

export const merchants = pgTable(
  "merchants",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: text("user_id")
      .notNull()
      .unique(), //  ONE merchant per user

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);


export const merchantsRelations = relations(merchants, ({ one }) => ({
  user: one(user, {
    fields: [merchants.userId],
    references: [user.id],
  }),
}));

