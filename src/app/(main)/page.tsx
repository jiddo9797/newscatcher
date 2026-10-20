import { Suspense } from "react";
import Link from "next/link";
import CategoryBadge from "@/components/CategoryBadge";
import ScoreBadge from "@/components/ScoreBadge";
import { NoPickToday, PageLoading } from "@/components/States";
import { getNoteByDate, getStats, getTodayPick, listNotes } from "@/db/queries";
import { formatDate } from "@/lib/format";

export default function HomePage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const [pick, stats, recentNotes] = await Promise.all([getTodayPick(), getStats(), listNotes(5)]);
  const todayNote = pick ? await getNoteByDate(pick.date) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* 왼쪽: 오늘의 뉴스 */}
      <section>
        {pick ? (
          <>
            <p className="mb-3 font-medium text-zinc-500">{formatDate(pick.date)} · 오늘의 뉴스</p>
            <article className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-zinc-500">
                <CategoryBadge category={pick.article.category} />
                <span>{pick.article.source}</span>
              </div>
              <h1 className="text-2xl font-bold leading-snug">{pick.article.title}</h1>
              <p className="mt-4 text-[17px] leading-relaxed text-zinc-600">{pick.article.description}</p>

              <div className="mt-6 rounded-xl bg-indigo-50 px-5 py-4 leading-relaxed text-indigo-900">
                <span className="font-semibold">💡 선정 이유</span> {pick.reason}
              </div>

              <div className="mt-8 flex gap-3">
                <a
                  href={pick.article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  원문 읽기 ↗
                </a>
                {todayNote ? (
                  <Link
                    href={`/notes/${todayNote.id}`}
                    className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
                  >
                    ✅ 내 글과 피드백 보기 →
                  </Link>
                ) : (
                  <Link
                    href="/write"
                    className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
                  >
                    요약 작성하기 →
                  </Link>
                )}
              </div>
            </article>
          </>
        ) : (
          <NoPickToday />
        )}
      </section>

      {/* 오른쪽: 내 현황 + 최근 기록 */}
      <aside className="space-y-6">
        <div className="grid grid-cols-3 gap-3 lg:mt-9">
          <Stat label="연속" value={`${stats.streak}일`} />
          <Stat label="작성" value={`${stats.noteCount}개`} />
          <Stat label="평균" value={stats.averageScore === null ? "-" : `${stats.averageScore}점`} />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">최근 기록</h2>
            <Link href="/history" className="text-sm text-indigo-600 hover:underline">
              전체 보기
            </Link>
          </div>
          {recentNotes.length === 0 ? (
            <p className="rounded-xl border border-zinc-200 bg-white px-4 py-6 text-center text-sm text-zinc-500">
              아직 작성한 글이 없어요.
            </p>
          ) : (
            <ul className="space-y-2">
              {recentNotes.map((note) => (
                <li key={note.id}>
                  <Link
                    href={`/notes/${note.id}`}
                    className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-300"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-500">{formatDate(note.pickDate)}</p>
                      <p className="truncate text-[15px] font-medium">{note.article.title}</p>
                    </div>
                    {note.feedback ? (
                      <ScoreBadge score={note.feedback.totalScore} />
                    ) : (
                      <span className="shrink-0 text-xs text-zinc-400">채점 전</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-3 text-center">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
