import { Suspense } from "react";
import CategoryBadge from "@/components/CategoryBadge";
import { PageLoading } from "@/components/States";
import { listJobRuns, listRecentArticles } from "@/db/queries";
import { formatDateTime } from "@/lib/format";
import type { Article, Category } from "@/lib/types";
import CollectPanel from "./CollectPanel";

const CATEGORIES: Category[] = ["시사", "경제", "IT"];
const STATUS_LABEL = {
  success: { text: "성공", className: "bg-emerald-50 text-emerald-700" },
  partial: { text: "일부 실패", className: "bg-amber-50 text-amber-700" },
  failed: { text: "실패", className: "bg-rose-50 text-rose-700" },
} as const;
const JOB_LABEL = { collect: "뉴스 수집", select: "AI 선정" } as const;

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">관리</h1>
        <p className="mt-1 text-zinc-500">뉴스 수집 상태와 자동 작업 기록을 확인해요.</p>
      </div>

      <CollectPanel />

      <Suspense fallback={<PageLoading />}>
        <AdminContent />
      </Suspense>
    </div>
  );
}

async function AdminContent() {
  const [runs, recent] = await Promise.all([listJobRuns(10), listRecentArticles(24)]);
  const byCategory = Object.fromEntries(
    CATEGORIES.map((category) => [category, recent.filter((a) => a.category === category)]),
  ) as Record<Category, Article[]>;

  return (
    <>
      {/* 실행 기록 */}
      <section>
        <h2 className="mb-3 text-lg font-bold">최근 실행 기록</h2>
        {runs.length === 0 ? (
          <p className="rounded-2xl border border-zinc-200 bg-white px-6 py-8 text-center text-zinc-500">
            아직 실행 기록이 없어요. 위의 &quot;지금 수집하기&quot;를 눌러 보세요.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <table className="w-full">
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
                    <td className="px-5 py-3">{run.summary}</td>
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
        <p className="mb-4 text-zinc-500">4단계에서 AI가 이 중 하나를 오늘의 뉴스로 골라요.</p>
        <div className="grid gap-6 lg:grid-cols-3">
          {CATEGORIES.map((category) => (
            <div key={category} className="rounded-2xl border border-zinc-200 bg-white">
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
                <CategoryBadge category={category} />
                <span className="text-sm text-zinc-500">{byCategory[category].length}개</span>
              </div>
              <ul className="max-h-[560px] divide-y divide-zinc-100 overflow-y-auto">
                {byCategory[category].map((article) => (
                  <li key={article.id} className="px-5 py-3">
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
