// 오늘의 뉴스 선정 작업 (4단계)
//
// 최근 24시간 후보 기사를 rank.ts의 규칙으로 점수 매겨 1등을 오늘의 뉴스로 저장한다.
// 관리 화면에서 사람이 직접 고를 수도 있다. 어느 쪽이든 job_runs에 기록을 남긴다.

import { and, desc, eq, gte, lt, notInArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { articles, dailyPicks, jobRuns, notes } from "@/db/schema";
import { addDays, todayKST } from "@/lib/date";
import type { Category } from "@/lib/types";
import { buildReason, rankIssues, type RankedIssue } from "./rank";

const WINDOW_HOURS = 24;
const RECENT_DAYS = 7; // 최근 며칠간 뽑힌 뉴스를 참고 (분야 돌리기, 비슷한 이슈 제외)
const TOP_TO_LOG = 5;

export type TopIssueLog = {
  articleId: number;
  title: string;
  category: Category;
  score: number;
  sources: string[];
  articleCount: number;
  breakdown: RankedIssue["breakdown"];
};

export type SelectResult = {
  status: "success" | "failed";
  summary: string;
  top?: TopIssueLog[];
};

/** 규칙으로 오늘의 뉴스 선정. force가 true면 이미 뽑힌 뉴스도 다시 뽑는다. */
export async function runSelect({ force = false } = {}): Promise<SelectResult> {
  const started = new Date();
  let result: SelectResult;
  try {
    result = await select(force);
  } catch (error) {
    // 예상 못 한 오류도 실행 기록에 남긴다 (기획서 S-2)
    result = { status: "failed", summary: `오류: ${error instanceof Error ? error.message : String(error)}` };
  }
  await log(started, result);
  return result;
}

async function select(force: boolean): Promise<SelectResult> {
  const db = await getDb();
  const today = todayKST();

  const [existing] = await db.select().from(dailyPicks).where(eq(dailyPicks.date, today));
  if (existing && !force) {
    return { status: "success", summary: "오늘의 뉴스가 이미 있어서 건너뛰었어요" };
  }
  const blocked = await noteExists(today);
  if (blocked) return { status: "failed", summary: blocked };

  // 후보: 최근 24시간 기사 중 예전에 오늘의 뉴스로 뽑힌 적 없는 것
  const pickedIds = db.select({ id: dailyPicks.articleId }).from(dailyPicks);
  const candidates = await db
    .select()
    .from(articles)
    .where(
      and(
        gte(articles.publishedAt, sql`now() - make_interval(hours => ${WINDOW_HOURS})`),
        notInArray(articles.id, pickedIds),
      ),
    );
  if (candidates.length === 0) {
    return { status: "failed", summary: "후보 기사가 없어요. 먼저 뉴스를 수집해 주세요." };
  }

  // 최근 뽑힌 뉴스 (오늘 제외, 최신순)
  const recent = await db
    .select({ category: articles.category, title: articles.title })
    .from(dailyPicks)
    .innerJoin(articles, eq(dailyPicks.articleId, articles.id))
    .where(and(lt(dailyPicks.date, today), gte(dailyPicks.date, addDays(today, -RECENT_DAYS))))
    .orderBy(desc(dailyPicks.date));

  const ranked = rankIssues(candidates, {
    recentCategories: recent.map((r) => r.category),
    recentTitles: recent.map((r) => r.title),
  });
  if (ranked.length === 0) {
    return { status: "failed", summary: "고를 수 있는 기사가 없어요. (모두 제외 조건에 걸림)" };
  }

  const best = ranked[0];
  await savePick(today, best.representative.id, buildReason(best));

  return {
    status: "success",
    summary: `후보 ${candidates.length}개 → ${best.representative.title} (${best.score}점)`,
    top: ranked.slice(0, TOP_TO_LOG).map((issue) => ({
      articleId: issue.representative.id,
      title: issue.representative.title,
      category: issue.category,
      score: issue.score,
      sources: issue.sources,
      articleCount: issue.articles.length,
      breakdown: issue.breakdown,
    })),
  };
}

/** 관리 화면에서 직접 고르기 */
export async function pickManually(articleId: number): Promise<SelectResult> {
  const started = new Date();
  const db = await getDb();
  const today = todayKST();

  let result: SelectResult;
  const [article] = await db.select().from(articles).where(eq(articles.id, articleId));
  const blocked = await noteExists(today);
  if (!article) result = { status: "failed", summary: "없는 기사예요." };
  else if (blocked) result = { status: "failed", summary: blocked };
  else {
    await savePick(today, article.id, "관리 화면에서 직접 고른 기사예요");
    result = { status: "success", summary: `직접 선택 → ${article.title}` };
  }

  await log(started, result);
  return result;
}

async function savePick(date: string, articleId: number, reason: string) {
  const db = await getDb();
  await db
    .insert(dailyPicks)
    .values({ date, articleId, reason })
    .onConflictDoUpdate({ target: dailyPicks.date, set: { articleId, reason } });
}

/** 오늘 글을 이미 썼으면 뉴스를 바꿀 수 없다 (쓴 글과 기사가 어긋나므로) */
async function noteExists(date: string): Promise<string | null> {
  const db = await getDb();
  const [note] = await db.select({ id: notes.id }).from(notes).where(eq(notes.pickDate, date));
  return note ? "오늘의 글을 이미 써서 뉴스를 바꿀 수 없어요." : null;
}

async function log(started: Date, result: SelectResult) {
  const db = await getDb();
  await db.insert(jobRuns).values({
    job: "select",
    status: result.status,
    summary: result.summary,
    detail: result.top ? { top: result.top } : null,
    startedAt: started.toISOString(),
    durationMs: Date.now() - started.getTime(),
  });
}
