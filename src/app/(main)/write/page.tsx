import { Suspense } from "react";
import Link from "next/link";
import CategoryBadge from "@/components/CategoryBadge";
import { NoPickToday, PageLoading } from "@/components/States";
import { getNoteByDate, getTodayPick } from "@/db/queries";
import { formatDate } from "@/lib/format";
import { RUBRIC } from "@/lib/types";
import WriteForm from "./WriteForm";

// 제출 후 뒤에서 도는 AI 채점(after)이 끝날 때까지 기다릴 수 있는 최대 시간(초)
export const maxDuration = 300;

export default function WritePage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <WriteContent />
    </Suspense>
  );
}

async function WriteContent() {
  const pick = await getTodayPick();
  if (!pick) return <NoPickToday />;

  const existing = await getNoteByDate(pick.date);
  if (existing) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center">
        <p className="text-4xl">✅</p>
        <p className="mt-4 text-lg font-semibold">오늘의 글은 이미 제출했어요</p>
        <Link
          href={`/notes/${existing.id}`}
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          내 글과 피드백 보기 →
        </Link>
      </div>
    );
  }

  const { article } = pick;

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
      {/* 왼쪽: 기사 정보 + 작성 가이드 (스크롤해도 따라옴) */}
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← 오늘의 뉴스
        </Link>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
            <CategoryBadge category={article.category} />
            <span>{article.source}</span>
            <span>· {formatDate(pick.date)}</span>
          </div>
          <p className="font-semibold leading-snug">{article.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">{article.description}</p>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline"
          >
            원문 다시 보기 ↗
          </a>
        </div>

        <div className="rounded-2xl bg-zinc-100 p-5 text-sm">
          <p className="mb-3 font-semibold">채점 기준</p>
          <ul className="space-y-1.5 text-zinc-600">
            {RUBRIC.map(({ key, label, max }) => (
              <li key={key} className="flex justify-between">
                <span>{label}</span>
                <span className="tabular-nums">{max}점</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* 오른쪽: 작성 폼 */}
      <WriteForm />
    </div>
  );
}
