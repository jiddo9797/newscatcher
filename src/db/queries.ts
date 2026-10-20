// 화면에서 쓰는 DB 조회 함수 모음.
//
// 모든 조회 함수는 먼저 connection()을 부른다. 이걸 빼먹으면 Next.js가 빌드할 때
// DB를 한 번 읽어서 결과를 고정된 화면으로 굳혀 버려, 새 글을 써도 화면이 안 바뀐다.

import { connection } from "next/server";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { addDays, todayKST } from "@/lib/date";
import type { Article, DailyPick, Note } from "@/lib/types";
import { getDb } from "./index";
import { articles, dailyPicks, jobRuns, notes } from "./schema";

async function db() {
  await connection();
  return getDb();
}

type ArticleRow = typeof articles.$inferSelect;
type NoteRow = typeof notes.$inferSelect;

function toArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    url: row.url,
    source: row.source,
    category: row.category,
    publishedAt: row.publishedAt,
  };
}

function toNote(row: NoteRow, article: ArticleRow): Note {
  return {
    id: row.id,
    pickDate: row.pickDate,
    article: toArticle(article),
    summary: row.summary,
    opinion: row.opinion,
    unknownTerms: row.unknownTerms,
    createdAt: row.createdAt,
    feedback: row.feedback,
    gradeStatus: row.gradeStatus,
    gradeError: row.gradeError,
  };
}

/** 오늘의 뉴스 (아직 선정되지 않았으면 null) */
export async function getTodayPick(): Promise<DailyPick | null> {
  const database = await db();
  const [row] = await database
    .select()
    .from(dailyPicks)
    .innerJoin(articles, eq(dailyPicks.articleId, articles.id))
    .where(eq(dailyPicks.date, todayKST()));
  if (!row) return null;
  return { date: row.daily_picks.date, reason: row.daily_picks.reason, article: toArticle(row.articles) };
}

/** 특정 날짜 뉴스에 대해 쓴 글 (없으면 null) */
export async function getNoteByDate(date: string): Promise<Note | null> {
  const database = await db();
  const [row] = await database
    .select()
    .from(notes)
    .innerJoin(dailyPicks, eq(notes.pickDate, dailyPicks.date))
    .innerJoin(articles, eq(dailyPicks.articleId, articles.id))
    .where(eq(notes.pickDate, date));
  return row ? toNote(row.notes, row.articles) : null;
}

export async function getNote(id: number): Promise<Note | null> {
  if (!Number.isInteger(id)) return null;
  const database = await db();
  const [row] = await database
    .select()
    .from(notes)
    .innerJoin(dailyPicks, eq(notes.pickDate, dailyPicks.date))
    .innerJoin(articles, eq(dailyPicks.articleId, articles.id))
    .where(eq(notes.id, id));
  return row ? toNote(row.notes, row.articles) : null;
}

/** 내가 쓴 글 전체, 최신순 */
export async function listNotes(limit?: number): Promise<Note[]> {
  const database = await db();
  const query = database
    .select()
    .from(notes)
    .innerJoin(dailyPicks, eq(notes.pickDate, dailyPicks.date))
    .innerJoin(articles, eq(dailyPicks.articleId, articles.id))
    .orderBy(desc(notes.pickDate));
  const rows = limit ? await query.limit(limit) : await query;
  return rows.map((row) => toNote(row.notes, row.articles));
}

export type Stats = {
  noteCount: number;
  averageScore: number | null; // 채점된 글이 없으면 null
  streak: number;
};

/** 기록 요약: 작성한 글 수, 평균 점수, 연속 학습일 */
export async function getStats(): Promise<Stats> {
  const all = await listNotes();
  const scored = all.filter((note) => note.feedback !== null);
  const averageScore = scored.length
    ? Math.round(scored.reduce((sum, note) => sum + note.feedback!.totalScore, 0) / scored.length)
    : null;

  return { noteCount: all.length, averageScore, streak: countStreak(all.map((note) => note.pickDate)) };
}

/**
 * 연속 학습일: 오늘부터 하루씩 거슬러 올라가며 글이 있는 날을 센다.
 * 오늘 아직 안 썼다면 어제부터 센다. (오늘 하루가 끝나기 전까지는 연속 기록이 유지되도록)
 */
function countStreak(dates: string[]): number {
  const written = new Set(dates);
  let day = todayKST();
  if (!written.has(day)) day = addDays(day, -1);

  let streak = 0;
  while (written.has(day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

export type JobRun = typeof jobRuns.$inferSelect;

/** 자동 작업 실행 기록, 최신순 */
export async function listJobRuns(limit = 10): Promise<JobRun[]> {
  const database = await db();
  return database.select().from(jobRuns).orderBy(desc(jobRuns.startedAt)).limit(limit);
}

/** 최근 N시간 안에 나온 후보 기사, 최신순 */
export async function listRecentArticles(hours = 24): Promise<Article[]> {
  const database = await db();
  const rows = await database
    .select()
    .from(articles)
    .where(gte(articles.publishedAt, sql`now() - make_interval(hours => ${hours})`))
    .orderBy(desc(articles.publishedAt));
  return rows.map(toArticle);
}

/** 가장 최근의 자동 선정 기록 (점수 순위가 담겨 있음) */
export async function getLatestRanking(): Promise<JobRun | null> {
  const database = await db();
  const [row] = await database
    .select()
    .from(jobRuns)
    .where(and(eq(jobRuns.job, "select"), sql`${jobRuns.detail} ? 'top'`))
    .orderBy(desc(jobRuns.startedAt))
    .limit(1);
  return row ?? null;
}
