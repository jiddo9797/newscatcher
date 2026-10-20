// DB 테이블 정의 (기획서 7.4).
// 이 파일을 고친 뒤 `npm run db:generate`를 실행하면 drizzle/ 폴더에 SQL 파일이 생기고,
// 앱이 켜질 때 그 SQL이 자동으로 적용된다.

import { date, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import type { Category, Feedback, GradeStatus } from "@/lib/types";

/** 수집한 기사 후보 */
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull().unique(), // 같은 기사가 두 번 저장되지 않도록
  source: text("source").notNull(),
  category: text("category").$type<Category>().notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true, mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

/** 오늘의 뉴스: 날짜마다 기사 하나 */
export const dailyPicks = pgTable("daily_picks", {
  date: date("date", { mode: "string" }).primaryKey(),
  articleId: integer("article_id")
    .notNull()
    .references(() => articles.id),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

/**
 * 자동 작업 실행 기록 (기획서 S-2)
 * 뉴스 수집·선정이 언제 돌았고, 성공했는지, 실패했다면 왜인지 남긴다.
 */
export const jobRuns = pgTable("job_runs", {
  id: serial("id").primaryKey(),
  job: text("job").$type<"collect" | "select" | "grade">().notNull(),
  status: text("status").$type<"success" | "partial" | "failed">().notNull(),
  summary: text("summary").notNull(), // 한 줄 요약 (예: "12곳 중 12곳 성공, 새 기사 85개")
  detail: jsonb("detail"), // 출처별 결과 등 자세한 내용
  startedAt: timestamp("started_at", { withTimezone: true, mode: "string" }).notNull(),
  durationMs: integer("duration_ms").notNull(),
});

/** 내가 쓴 글과 AI 피드백: 오늘의 뉴스 하나당 글 하나 */
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  pickDate: date("pick_date", { mode: "string" })
    .notNull()
    .unique()
    .references(() => dailyPicks.date),
  summary: text("summary").notNull(),
  opinion: text("opinion").notNull(),
  unknownTerms: text("unknown_terms").array().notNull().default([]),
  totalScore: integer("total_score"), // 채점 전에는 비어 있음
  feedback: jsonb("feedback").$type<Feedback>(), // 채점 전에는 비어 있음
  // 채점 상태: pending(대기) → grading(채점 중) → done(완료) / failed(실패)
  gradeStatus: text("grade_status").$type<GradeStatus>().notNull().default("pending"),
  gradeError: text("grade_error"), // 실패했을 때 이유
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});
