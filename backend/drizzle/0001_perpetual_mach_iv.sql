CREATE TABLE "stores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"username" varchar(30) NOT NULL,
	"name" varchar(80) NOT NULL,
	"description" varchar(500),
	"avatar_url" text,
	"banner_url" text,
	"is_public" boolean DEFAULT true,
	"is_vacation_mode" boolean DEFAULT false,
	"announcement_text" varchar(200),
	"announcement_enabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "stores_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "stores_username_unique" UNIQUE("username")
);
