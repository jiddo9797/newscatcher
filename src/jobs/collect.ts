// 뉴스 수집 작업 (3단계)
//
// 1. 언론사 RSS를 동시에 가져온다. 일시적인 오류(시간 초과, 서버 오류)는 최대 3번까지 다시 시도한다. (기획서 S-3)
// 2. 최근 24시간 기사만 골라 articles 테이블에 넣는다. 이미 있는 주소(url)는 건너뛴다.
// 3. 일주일이 지난 후보 기사는 지운다. (오늘의 뉴스로 뽑힌 기사는 남긴다)
// 4. 결과를 job_runs 테이블에 기록한다. (기획서 S-2)
//
// 저작권을 위해 기사 본문은 가져오지 않고, RSS에 공개된 제목·짧은 소개문·링크만 저장한다.

import Parser from "rss-parser";
import { sql } from "drizzle-orm";
import { affectedRows, getDb } from "@/db";
import { articles, jobRuns } from "@/db/schema";
import { FEED_SOURCES, type FeedSource } from "./sources";

const WINDOW_HOURS = 24; // 이 시간 안에 나온 기사만 후보로
const KEEP_DAYS = 7; // 뽑히지 않은 후보는 이 기간이 지나면 삭제
const MAX_ATTEMPTS = 3;
const TIMEOUT_MS = 10_000;
const DESCRIPTION_MAX = 300;

export type SourceResult = {
  source: string;
  url: string;
  ok: boolean;
  attempts: number;
  fetched: number; // RSS에 있던 기사 수
  recent: number; // 그중 최근 24시간 기사 수
  inserted: number; // 새로 저장한 기사 수
  error?: string;
};

export type CollectResult = {
  status: "success" | "partial" | "failed";
  summary: string;
  inserted: number;
  deleted: number;
  durationMs: number;
  sources: SourceResult[];
};

type NewArticle = typeof articles.$inferInsert;

const parser = new Parser();

export async function runCollect(): Promise<CollectResult> {
  const startedAt = new Date();
  const db = await getDb();

  // collectOne은 실패해도 에러를 던지지 않고 결과에 기록하므로, 한 곳이 실패해도 나머지는 계속 진행된다.
  const sources = await Promise.all(FEED_SOURCES.map((feed) => collectOne(feed)));

  const deleted = await db.execute(sql`
    DELETE FROM articles
    WHERE created_at < now() - make_interval(days => ${KEEP_DAYS})
      AND id NOT IN (SELECT article_id FROM daily_picks)
  `);
  const deletedCount = affectedRows(deleted);

  const okCount = sources.filter((s) => s.ok).length;
  const inserted = sources.reduce((sum, s) => sum + s.inserted, 0);
  const status = okCount === sources.length ? "success" : okCount > 0 ? "partial" : "failed";
  const summary = `${sources.length}곳 중 ${okCount}곳 성공, 새 기사 ${inserted}개` +
    (deletedCount ? `, 오래된 후보 ${deletedCount}개 정리` : "");
  const durationMs = Date.now() - startedAt.getTime();

  await db.insert(jobRuns).values({
    job: "collect",
    status,
    summary,
    detail: { sources },
    startedAt: startedAt.toISOString(),
    durationMs,
  });

  return { status, summary, inserted, deleted: deletedCount, durationMs, sources };
}

async function collectOne(feed: FeedSource): Promise<SourceResult> {
  const result: SourceResult = { source: feed.source, url: feed.url, ok: false, attempts: 0, fetched: 0, recent: 0, inserted: 0 };

  try {
    const xml = await fetchWithRetry(feed.url, result);
    const parsed = await parser.parseString(xml);
    result.fetched = parsed.items.length;

    const since = Date.now() - WINDOW_HOURS * 60 * 60 * 1000;
    const rows = parsed.items
      .map((item) => toArticle(item, feed))
      .filter((row): row is NewArticle => row !== null && Date.parse(row.publishedAt) >= since);
    result.recent = rows.length;

    if (rows.length > 0) {
      const db = await getDb();
      const inserted = await db
        .insert(articles)
        .values(rows)
        .onConflictDoNothing({ target: articles.url }) // 이미 저장된 기사는 건너뜀
        .returning({ id: articles.id });
      result.inserted = inserted.length;
    }
    result.ok = true;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
  }
  return result;
}

async function fetchWithRetry(url: string, result: SourceResult): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    result.attempts = attempt;
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "NewsCatcher/0.1 (personal RSS reader)" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        // 404(주소 없음)처럼 다시 해도 똑같을 오류는 바로 포기한다.
        // 서버 오류(5xx)나 요청 과다(429)만 잠깐 쉬었다가 다시 시도할 가치가 있다.
        if (response.status < 500 && response.status !== 429) throw Object.assign(error, { retryable: false });
        throw error;
      }
      return decode(await response.arrayBuffer(), response.headers.get("content-type"));
    } catch (error) {
      lastError = error;
      if ((error as { retryable?: boolean }).retryable === false) break;
      if (attempt < MAX_ATTEMPTS) await sleep(1000 * attempt); // 1초, 2초 쉬고 다시
    }
  }
  throw lastError;
}

/** 한국 사이트 중에는 EUC-KR을 쓰는 곳도 있어서, 문자 인코딩을 확인해서 글자로 바꾼다. */
function decode(buffer: ArrayBuffer, contentType: string | null): string {
  const head = new TextDecoder("ascii").decode(buffer.slice(0, 200));
  const charset =
    contentType?.match(/charset=([\w-]+)/i)?.[1] ?? head.match(/encoding=["']([\w-]+)["']/i)?.[1] ?? "utf-8";
  try {
    return new TextDecoder(charset).decode(buffer);
  } catch {
    return new TextDecoder("utf-8").decode(buffer);
  }
}

function toArticle(item: Parser.Item, feed: FeedSource): NewArticle | null {
  const title = clean(item.title ?? "");
  const url = item.link?.trim() ?? "";
  if (!title || !/^https?:\/\//.test(url)) return null;

  const date = new Date(item.isoDate ?? item.pubDate ?? "");
  if (Number.isNaN(date.getTime())) return null;

  return {
    title,
    url,
    description: truncate(clean(item.contentSnippet ?? item.content ?? item.summary ?? ""), DESCRIPTION_MAX),
    source: feed.source,
    category: feed.category,
    publishedAt: date.toISOString(),
  };
}

/** HTML 태그와 여러 줄 공백을 정리 */
function clean(text: string): string {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
