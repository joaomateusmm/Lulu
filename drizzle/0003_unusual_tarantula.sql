ALTER TABLE "category" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "product" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "product_variant" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "category" CASCADE;--> statement-breakpoint
DROP TABLE "product" CASCADE;--> statement-breakpoint
DROP TABLE "product_variant" CASCADE;--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_email_unique";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone" text NOT NULL;--> statement-breakpoint
ALTER TABLE "appointment" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "appointment" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_phone_unique" UNIQUE("phone");