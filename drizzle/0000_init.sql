CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"url" text NOT NULL,
	"source" text NOT NULL,
	"category" text NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "daily_picks" (
	"date" date PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"pick_date" date NOT NULL,
	"summary" text NOT NULL,
	"opinion" text NOT NULL,
	"unknown_terms" text[] DEFAULT '{}' NOT NULL,
	"total_score" integer,
	"feedback" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notes_pick_date_unique" UNIQUE("pick_date")
);
--> statement-breakpoint
ALTER TABLE "daily_picks" ADD CONSTRAINT "daily_picks_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_pick_date_daily_picks_date_fk" FOREIGN KEY ("pick_date") REFERENCES "public"."daily_picks"("date") ON DELETE no action ON UPDATE no action;