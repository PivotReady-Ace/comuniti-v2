CREATE TABLE "ambassador_businesses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ambassador_id" varchar NOT NULL,
	"business_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ambassadors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"whatsapp" text NOT NULL,
	"platform" text NOT NULL,
	"follower_count" integer NOT NULL,
	"country" text NOT NULL,
	"profile_image_url" text,
	"list_name" text NOT NULL,
	"page_url" text NOT NULL,
	"tagline" text,
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "ambassadors_email_unique" UNIQUE("email"),
	CONSTRAINT "ambassadors_page_url_unique" UNIQUE("page_url")
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"whatsapp" text NOT NULL,
	"email" text,
	"city" text NOT NULL,
	"description" text,
	"verified" boolean DEFAULT false,
	"rating" integer DEFAULT 0,
	"review_count" integer DEFAULT 0,
	"service_tags" text[],
	"recently_added" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ambassador_id" varchar NOT NULL,
	"business_id" varchar NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" varchar NOT NULL,
	"identity_tag" text NOT NULL,
	"rating" integer NOT NULL,
	"feedback" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ambassador_businesses" ADD CONSTRAINT "ambassador_businesses_ambassador_id_ambassadors_id_fk" FOREIGN KEY ("ambassador_id") REFERENCES "public"."ambassadors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ambassador_businesses" ADD CONSTRAINT "ambassador_businesses_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_ambassador_id_ambassadors_id_fk" FOREIGN KEY ("ambassador_id") REFERENCES "public"."ambassadors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;