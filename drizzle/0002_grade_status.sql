ALTER TABLE "notes" ADD COLUMN "grade_status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "grade_error" text;--> statement-breakpoint
-- 이미 피드백이 있는 글은 채점 완료로 표시
UPDATE "notes" SET "grade_status" = 'done' WHERE "feedback" IS NOT NULL;
