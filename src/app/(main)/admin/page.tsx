import { Suspense } from "react";
import CategoryBadge from "@/components/CategoryBadge";
import { PageLoading } from "@/components/States";
import { getLatestRanking, getNoteByDate, getTodayPick, listJobRuns, listRecentArticles } from "@/db/queries";
import type { TopIssueLog } from "@/jobs/select";
import { formatDateTime } from "@/lib/format";
import type { Article, Category } from "@/lib/types";
import { pickArticle } from "./actions";
import CollectPanel from "./CollectPanel";
import SelectPanel from "./SelectPanel";

const CATEGORIES: Category[] = ["시사", "경제", "IT"];
const STATUS_LABEL = {
  success: { text: "성공", className: "bg-emerald-50 text-emerald-700" },
  partial: { text: "일부 실패", className: "bg-amber-50 text-amber-700" },
  failed: { text: "실패", className: "bg-rose-50 text-rose-700" },
} as const;
const JOB_LABEL = { collect: "뉴스 수집", select: "뉴스 선정" } as const;

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">관리</h1>
        <p className="mt-1 text-zinc-500">뉴스 수집 → 오늘의 뉴스 선정 순서로 실행해요. 6단계부터는 매일 아침 자동으로 돌아가요.</p>
      </div>

      <CollectPanel />

      <Suspense fallback={<PageLoading />}>
        <AdminContent />
      </Suspense>
    </div>
  );
}

async function AdminContent() {
  const [pick, ranking, runs, recent] = await Promise.all([
    getTodayPick(),
    getLatestRanking(),
    listJobRuns(10),
    listRecentArticles(24),
  ]);
  const locked = pick ? (await getNoteByDate(pick.date)) !== null : false;
  const top = (ranking?.detail as { top?: TopIssueLog[] } | null)?.top ?? [];
  const byCategory = Object.fromEntries(
    CATEGORIES.map((category) => [category, recent.filter((a) => a.category === category)]),
  ) as Record<Category, Article[]>;

  return (
    <>
      {/* 오늘의 뉴스 선정 */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h2 className="text-lg font-bold">오늘의 뉴스 선정</h2>
            {pick ? (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <CategoryBadge category={pick.article.category} />
                  <span className="text-sm text-zinc-500">{pick.article.source}</span>
                </div>
                <p className="mt-1 font-semibold">{pick.article.title}</p>
                <p className="mt-1 text-sm text-zinc-500">💡 {pick.reason}</p>
              </div>
            ) : (
              <p className="mt-1 text-zinc-500">아직 오늘의 뉴스가 없어요. 수집한 뒤 자동 선정을 눌러 주세요.</p>
            )}
            {locked && <p className="mt-2 text-sm text-amber-700">오늘 글을 이미 써서 뉴스를 바꿀 수 없어요.</p>}
          </div>
          <div className="shrink-0">
            <SelectPanel hasPick={pick !== null} locked={locked} />
          </div>
        </div>

        {top.length > 0 && (
          <div className="mt-6 border-t border-zinc-100 pt-5">
            <p className="mb-3 text-sm font-semibold text-zinc-500">
              마지막 자동 선정의 점수 순위 ({formatDateTime(ranking!.startedAt)})
            </p>
            <ol className="space-y-3">
              {top.map((issue, i) => (
                <li key={issue.articleId} className="flex gap-4">
                  <span className="w-6 shrink-0 text-right font-bold tabular-nums text-zinc-400">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={issue.category} />
                      <p className="truncate font-medium">{issue.title}</p>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {issue.breakdown.map((item) => (
                        <span
                          key={item.label}
                          className={`rounded-md px-2 py-0.5 text-xs ${item.points >= 0 ? "bg-zinc-100 text-zinc-600" : "bg-rose-50 text-rose-600"}`}
                        >
                          {item.label} {item.points > 0 ? "+" : ""}
                          {item.points}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="shrink-0 text-lg font-bold tabular-nums">{issue.score}점</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* 실행 기록 */}
      <section>
        <h2 className="mb-3 text-lg font-bold">최근 실행 기록</h2>
        {runs.length === 0 ? (
          <p className="rounded-2xl border border-zinc-200 bg-white px-6 py-8 text-center text-zinc-500">
            아직 실행 기록이 없어요. 위의 &quot;지금 수집하기&quot;를 눌러 보세요.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <table className="w-full table-fixed">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-sm text-zinc-500">
                <tr>
                  <th className="w-36 px-5 py-3 font-medium">시각</th>
                  <th className="w-28 px-5 py-3 font-medium">작업</th>
                  <th className="w-28 px-5 py-3 font-medium">결과</th>
                  <th className="px-5 py-3 font-medium">내용</th>
                  <th className="w-24 px-5 py-3 text-right font-medium">걸린 시간</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {runs.map((run) => (
                  <tr key={run.id}>
                    <td className="px-5 py-3 tabular-nums text-zinc-500">{formatDateTime(run.startedAt)}</td>
                    <td className="px-5 py-3">{JOB_LABEL[run.job]}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-sm font-semibold ${STATUS_LABEL[run.status].className}`}>
                        {STATUS_LABEL[run.status].text}
                      </span>
                    </td>
                    <td className="truncate px-5 py-3">{run.summary}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-zinc-500">
                      {(run.durationMs / 1000).toFixed(1)}초
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 후보 기사 */}
      <section>
        <h2 className="mb-1 text-lg font-bold">최근 24시간 후보 기사 {recent.length}개</h2>
        <p className="mb-4 text-zinc-500">자동 선정이 마음에 안 들면 여기서 &quot;선정&quot;을 눌러 직접 고를 수 있어요.</p>
        <div className="grid gap-6 lg:grid-cols-3">
          {CATEGORIES.map((category) => (
            <div key={category} className="rounded-2xl border border-zinc-200 bg-white">
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
                <CategoryBadge category={category} />
                <span className="text-sm text-zinc-500">{byCategory[category].length}개</span>
              </div>
              <ul className="max-h-[560px] divide-y divide-zinc-100 overflow-y-auto">
                {byCategory[category].map((article) => (
                  <li key={article.id} className="flex items-start gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="line-clamp-2 text-[15px] font-medium leading-snug hover:text-indigo-600 hover:underline"
                      >
                        {article.title}
                      </a>
                      <p className="mt-1 text-xs text-zinc-400">
                        {article.source} · {formatDateTime(article.publishedAt)}
                      </p>
                    </div>
                    {pick?.article.id === article.id ? (
                      <span className="shrink-0 rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                        오늘의 뉴스
                      </span>
                    ) : (
                      !locked && (
                        <form action={pickArticle} className="shrink-0">
                          <input type="hidden" name="articleId" value={article.id} />
                          <button
                            type="submit"
                            className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-600 hover:border-indigo-400 hover:text-indigo-600"
                          >
                            선정
                          </button>
                        </form>
                      )
                    )}
                  </li>
                ))}
                {byCategory[category].length === 0 && (
                  <li className="px-5 py-8 text-center text-sm text-zinc-400">아직 없어요</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
