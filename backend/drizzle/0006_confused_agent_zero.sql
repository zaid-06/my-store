CREATE TABLE "digital_downloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"token" varchar(128) NOT NULL,
	"max_downloads" integer,
	"download_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "digital_downloads_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "digital_downloads" ADD CONSTRAINT "digital_downloads_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_downloads" ADD CONSTRAINT "digital_downloads_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;