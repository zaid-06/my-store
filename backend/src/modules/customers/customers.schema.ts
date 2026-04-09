import {
  pgTable,
  uuid,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { uniqueIndex } from "drizzle-orm/pg-core";

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: varchar("user_id", { length: 255 }),

    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    emailPhoneUnique: uniqueIndex("customers_email_phone_unique").on(
      table.email,
      table.phone
    ),
  })
);


// export const buyers = pgTable("buyers", {
//   id: uuid("id").defaultRandom().primaryKey(),

//   email: varchar("email", { length: 255 }).notNull(),
//   phone: varchar("phone", { length: 20 }).notNull(),
//   name: varchar("name", { length: 255 }).notNull(),

//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

