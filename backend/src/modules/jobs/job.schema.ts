
import {
  pgEnum,
  pgTable,
  uuid,
  jsonb,
  integer,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { z } from "zod";

  // ENUMS (Single Source of Truth)

export const jobTypeValues = ["EMAIL", "PAYOUT_ELIGIBILITY"] as const;

export const jobTypeEnum = pgEnum("job_type", jobTypeValues);

export const jobStatusEnum = pgEnum("job_status", [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);

  // TABLE

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),

  type: jobTypeEnum("type").notNull(),

  payload: jsonb("payload").notNull(),

  status: jobStatusEnum("status").default("PENDING").notNull(),

  attempts: integer("attempts").default(0).notNull(),

  lastError: text("last_error"),

  runAt: timestamp("run_at").defaultNow().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

  // ZOD VALIDATION

// Zod enum (reuse values)
const jobTypeZodEnum = z.enum(jobTypeValues);

  // EMAIL payload
const emailPayloadSchema = z.object({
  to: z.string().email(),
  template: z.enum([
    "ORDER_CREATED",
    "ORDER_STATUS_UPDATED",
    "DISPUTE_ESCALATED",
    "PAYOUT_RELEASED",
  ]),
  data: z.record(z.string(), z.any()),
});


  // PAYOUT ELIGIBILITY payload

const payoutEligibilityPayloadSchema = z.object({
  payoutId: z.string().uuid(),
});


  // MAIN JOB SCHEMA

export const createJobSchema = z
  .object({
    type: jobTypeZodEnum,
    payload: z.unknown(), // safer than any
    runAt: z.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "EMAIL") {
      const result = emailPayloadSchema.safeParse(data.payload);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid EMAIL payload structure",
        });
      }
    }

    if (data.type === "PAYOUT_ELIGIBILITY") {
      const result = payoutEligibilityPayloadSchema.safeParse(data.payload);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid PAYOUT_ELIGIBILITY payload structure",
        });
      }
    }
  });





// import { pgEnum, pgTable, uuid, jsonb, integer, text, timestamp } from "drizzle-orm/pg-core";
// import { z } from "zod";

// // ENUMS

// export const jobTypeEnum = pgEnum("job_type", [
//   "EMAIL",
//   "PAYOUT_ELIGIBILITY",
// ]);

// export const jobStatusEnum = pgEnum("job_status", [
//   "PENDING",
//   "PROCESSING",
//   "COMPLETED",
//   "FAILED",
// ]);

// // TABLE

// export const jobs = pgTable("jobs", {
//   id: uuid("id").primaryKey().defaultRandom(),

//   type: jobTypeEnum("type").notNull(),

//   payload: jsonb("payload").notNull(),

//   status: jobStatusEnum("status").default("PENDING").notNull(),

//   attempts: integer("attempts").default(0).notNull(),

//   lastError: text("last_error"),

//   runAt: timestamp("run_at").defaultNow().notNull(),

//   createdAt: timestamp("created_at").defaultNow().notNull(),

//   updatedAt: timestamp("updated_at")
//     .defaultNow()
//     .$onUpdate(() => new Date())
//     .notNull(),
// });

// // ZOD VALIDATION

// // EMAIL payload
// const emailPayloadSchema = z.object({
//   to: z.string().email(),
//   template: z.enum([
//     "ORDER_CREATED",
//     "ORDER_STATUS_UPDATED",
//     "DISPUTE_ESCALATED",
//     "PAYOUT_RELEASED",
//   ]),
//   data: z.record(z.string(), z.any()),
// });
// // PAYOUT ELIGIBILITY payload
// const payoutEligibilityPayloadSchema = z.object({
//   payoutId: z.string().uuid(),
// });

// // Main job insert schema
// export const createJobSchema = z.object({
//   type: z.enum(["EMAIL", "PAYOUT_ELIGIBILITY"]),
//   payload: z.any(),
//   runAt: z.date().optional(),
// }).superRefine((data, ctx) => {
//   if (data.type === "EMAIL") {
//     const result = emailPayloadSchema.safeParse(data.payload);
//     if (!result.success) {
//       ctx.addIssue({   

//         code: z.ZodIssueCode.custom,
//         message: "Invalid EMAIL payload",
//       });
//     }
//   }

//   if (data.type === "PAYOUT_ELIGIBILITY") {
//     const result = payoutEligibilityPayloadSchema.safeParse(data.payload);
//     if (!result.success) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "Invalid PAYOUT_ELIGIBILITY payload",
//       });
//     }
//   }
// });