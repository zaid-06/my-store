CREATE TYPE "public"."role" AS ENUM('ADMIN', 'CREATOR', 'BUYER');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "role" DEFAULT 'BUYER' NOT NULL;