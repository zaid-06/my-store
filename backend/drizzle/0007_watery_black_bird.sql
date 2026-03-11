CREATE TABLE "download_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"digital_download_id" uuid NOT NULL,
	"ip_address" varchar(255),
	"user_agent" varchar(512),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "download_logs" ADD CONSTRAINT "download_logs_digital_download_id_digital_downloads_id_fk" FOREIGN KEY ("digital_download_id") REFERENCES "public"."digital_downloads"("id") ON DELETE no action ON UPDATE no action;