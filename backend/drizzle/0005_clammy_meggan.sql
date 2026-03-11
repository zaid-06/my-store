CREATE TYPE "public"."product_type" AS ENUM('PHYSICAL', 'DIGITAL');--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "product_type" "product_type" DEFAULT 'PHYSICAL' NOT NULL;