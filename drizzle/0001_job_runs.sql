CREATE TABLE "job_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"job" text NOT NULL,
	"status" text NOT NULL,
	"summary" text NOT NULL,
	"detail" jsonb,
	"started_at" timestamp with time zone NOT NULL,
	"duration_ms" integer NOT NULL
);
