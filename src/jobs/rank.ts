// 오늘의 뉴스 선정 알고리즘 (4단계, AI 없이 규칙으로)
//
// 0. 거르기: "이 시각 헤드라인", "8뉴스 예고" 같은 목록성 글은 후보에서 뺀다.
// 1. 묶기: 제목이 비슷한 기사를 하나의 "이슈"로 묶는다.
//    여러 언론사가 같이 보도한 이슈일수록 중요하다고 본다.
// 2. 점수: 이슈마다 아래 점수를 더한다.
//    - 보도한 언론사 수 (가장 큰 비중)
//    - 관심 키워드 가산점 / 잡음 키워드 감점 (keywords.ts)
//    - 최근 며칠과 다른 분야면 가산점, 어제와 같은 분야면 감점
//    - 최근에 뽑힌 뉴스와 비슷한 이슈는 제외
// 3. 1등 이슈에서 소개문이 가장 충실한 기사를 오늘의 뉴스로 고른다.
//
// DB를 쓰지 않는 순수한 계산이라 따로 떼어서 시험해 볼 수 있다.

import type { Category } from "@/lib/types";
import { BOOST_KEYWORDS, PENALTY_KEYWORDS } from "./keywords";

export type Candidate = {
  id: number;
  title: string;
  description: string;
  source: string;
  category: Category;
  publishedAt: string;
};

export type ScoreItem = { label: string; points: number };

export type RankedIssue = {
  representative: Candidate; // 오늘의 뉴스로 보여 줄 기사
  articles: Candidate[]; // 같은 이슈로 묶인 기사들
  sources: string[]; // 보도한 언론사 (중복 제거)
  category: Category;
  keywords: string[]; // 걸린 관심 키워드
  score: number;
  breakdown: ScoreItem[]; // 점수가 어떻게 나왔는지 (관리 화면에 표시)
};

export type RankOptions = {
  recentCategories: Category[]; // 최근 뽑힌 뉴스의 분야, 최신순 (어제가 맨 앞)
  recentTitles: string[]; // 최근 뽑힌 뉴스 제목 (비슷한 이슈 다시 안 뽑게)
};

// 제목 유사도(Dice 계수)가 이 이상이면 같은 이슈로 본다.
// 2026-10-21 실제 기사 700개로 0.3~0.5를 비교해, 엉뚱한 기사가 섞이지 않는 0.4로 정했다.
const SAME_ISSUE = 0.4;
const SOURCE_POINTS = 10; // 언론사 한 곳 늘 때마다
const MAX_BOOST = 20;
const MAX_PENALTY = 40;

/** 기사가 아닌 목록·예고·사진 글 */
const JUNK_TITLE = /이 시각 헤드라인|예고|다이제스트|말·말·말|랭킹뉴스|클로징|게시판|\[(?:포토|사진|인사|부고|게시판)\]/;

export function rankIssues(candidates: Candidate[], options: RankOptions): RankedIssue[] {
  const recentShingles = options.recentTitles.map(shingles);

  return cluster(candidates.filter((c) => !JUNK_TITLE.test(c.title)))
    .filter((group) => !recentShingles.some((s) => similarity(s, shingles(group[0].title)) >= SAME_ISSUE))
    .map((group) => scoreIssue(group, options))
    .sort((a, b) => b.score - a.score);
}

/** 비슷한 제목끼리 묶기: 먼저 나온 기사를 기준으로, 기준과 비슷하면 같은 묶음에 넣는다. */
function cluster(candidates: Candidate[]): Candidate[][] {
  const sorted = [...candidates].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
  const groups: { seed: Set<string>; members: Candidate[] }[] = [];

  for (const article of sorted) {
    const s = shingles(article.title);
    const group = groups.find((g) => similarity(g.seed, s) >= SAME_ISSUE);
    if (group) group.members.push(article);
    else groups.push({ seed: s, members: [article] });
  }
  return groups.map((g) => g.members);
}

function scoreIssue(articles: Candidate[], { recentCategories }: RankOptions): RankedIssue {
  const sources = [...new Set(articles.map((a) => a.source))];
  const category = majority(articles.map((a) => a.category));
  const titles = articles.map((a) => a.title).join(" ");
  const breakdown: ScoreItem[] = [];

  // 1) 보도한 언론사 수
  if (sources.length > 1) {
    breakdown.push({ label: `${sources.length}개 언론사 보도`, points: (sources.length - 1) * SOURCE_POINTS });
  }

  // 2) 관심 키워드 (같은 이슈의 여러 제목 중 한 번이라도 나오면)
  const keywords = matchKeywords(titles, BOOST_KEYWORDS);
  const boost = Math.min(MAX_BOOST, keywords.reduce((sum, k) => sum + BOOST_KEYWORDS[k], 0));
  if (boost > 0) breakdown.push({ label: `관심 키워드: ${keywords.join(", ")}`, points: boost });

  // 3) 잡음 키워드 (대표 기사 제목 기준)
  const noise = matchKeywords(articles[0].title, PENALTY_KEYWORDS);
  const penalty = Math.min(MAX_PENALTY, noise.reduce((sum, k) => sum + PENALTY_KEYWORDS[k], 0));
  if (penalty > 0) breakdown.push({ label: `감점 키워드: ${noise.join(", ")}`, points: -penalty });

  // 4) 분야 돌아가며
  if (recentCategories[0] === category) {
    breakdown.push({ label: `어제와 같은 분야(${category})`, points: -8 });
  } else if (!recentCategories.slice(0, 3).includes(category)) {
    breakdown.push({ label: `최근 3일간 없던 분야(${category})`, points: 5 });
  }

  // 대표 기사: 소개문이 가장 긴 기사 (읽기 전 내용을 파악하기 좋도록)
  const representative = [...articles].sort((a, b) => b.description.length - a.description.length)[0];
  if (!representative.description) breakdown.push({ label: "소개문 없음", points: -5 });

  const score = breakdown.reduce((sum, item) => sum + item.points, 0);
  return { representative, articles, sources, category, keywords, score, breakdown };
}

/** 선정 이유 문장 만들기 */
export function buildReason(issue: RankedIssue): string {
  const parts: string[] = [];
  if (issue.sources.length > 1) parts.push(`${issue.sources.length}개 언론사가 함께 보도한 이슈예요`);
  else parts.push(`최근 24시간 ${issue.category} 뉴스 중 점수가 가장 높았어요`);
  if (issue.keywords.length > 0) parts.push(`관련 키워드: ${issue.keywords.slice(0, 4).join(", ")}`);
  return parts.join(" · ");
}

// ── 제목 비교 도구 ──────────────────────────────────────────────

const TAG = /\[[^\]]*\]|\((?:종합|속보|단독|\d보|영상|포토|사진|일문일답|인터뷰|르포|그래픽)[^)]*\)/g;

/** 제목을 두 글자씩 쪼갠 조각들. "기준금리 동결" → {기준, 준금, 금리, 동결} */
export function shingles(title: string): Set<string> {
  const words = title
    .replace(TAG, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2);
  const result = new Set<string>();
  for (const word of words) {
    for (let i = 0; i < word.length - 1; i++) result.add(word.slice(i, i + 2));
  }
  return result;
}

/**
 * 두 제목이 얼마나 겹치는지 (0~1, Dice 계수).
 * 겹친 조각 수 × 2 ÷ 두 제목의 조각 수 합. 둘 다 같은 조각으로만 이루어졌으면 1.
 */
export function similarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let common = 0;
  for (const x of a) if (b.has(x)) common++;
  return (2 * common) / (a.size + b.size);
}

/**
 * 제목에 들어 있는 키워드 찾기. 단순히 글자가 포함됐는지만 보면 틀리는 경우를 막는다.
 * - 영어 키워드는 단어 단위로: "AI"가 "KAI", "KAIST" 안에서 잡히지 않게
 * - "한은"이 "신한은행" 안에서 잡히지 않게
 * - 긴 키워드에 포함된 짧은 키워드는 뺀다: "한국은행"이 잡히면 "은행"은 중복으로 안 셈
 */
export function matchKeywords(text: string, dictionary: Record<string, number>): string[] {
  const found = Object.keys(dictionary).filter((keyword) => keywordPattern(keyword).test(text));
  return found.filter((k) => !found.some((other) => other !== k && other.includes(k)));
}

function keywordPattern(keyword: string): RegExp {
  if (/^[A-Za-z]+$/.test(keyword)) return new RegExp(`(?<![A-Za-z])${keyword}(?![A-Za-z])`);
  if (keyword === "한은") return /(?<!신)한은(?!행)/;
  return new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")); // 특수문자는 글자 그대로
}

function majority<T>(items: T[]): T {
  const counts = new Map<T, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}
