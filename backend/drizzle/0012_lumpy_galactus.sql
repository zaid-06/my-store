ALTER TABLE "stores" ADD COLUMN "is_suspended" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "suspension_reason" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "suspended_at" timestamp;