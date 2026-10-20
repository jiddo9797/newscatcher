// DB 테이블 정의 (기획서 7.4).
// 이 파일을 고친 뒤 `npm run db:generate`를 실행하면 drizzle/ 폴더에 SQL 파일이 생기고,
// 앱이 켜질 때 그 SQL이 자동으로 적용된다.

import { date, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import type { Category, Feedback } from "@/lib/types";

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
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});
