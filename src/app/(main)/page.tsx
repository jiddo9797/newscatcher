import Link from "next/link";
import CategoryBadge from "@/components/CategoryBadge";
import ScoreBadge from "@/components/ScoreBadge";
import { formatDate } from "@/lib/format";
import { notes, todayPick, todayStatus } from "@/lib/mock-data";

export default function HomePage() {
  const { article, reason, date } = todayPick;
  const recentNotes = notes.slice(0, 3);

  return (
    <div className="space-y-8">
      <section>
        <p className="mb-2 text-sm font-medium text-zinc-500">
          {formatDate(date)} · 오늘의 뉴스
        </p>
        <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm text-zinc-500">
            <CategoryBadge category={article.category} />
            <span>{article.source}</span>
          </div>
          <h1 className="text-xl font-bold leading-snug">{article.title}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-600">
            {article.description}
          </p>

          <div className="mt-4 rounded-xl bg-indigo-50 px-4 py-3 text-sm leading-relaxed text-indigo-900">
            <span className="font-semibold">💡 선정 이유</span> {reason}
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-xl border border-zinc-300 px-4 py-3 text-center font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              원문 읽기 ↗
            </a>
            <Link
              href="/write"
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-center font-semibold text-white hover:bg-indigo-700"
            >
              요약 작성하기 →
            </Link>
          </div>
        </article>

        <p className="mt-3 text-center text-sm text-zinc-500">
          {todayStatus === "done" ? "✅ 오늘의 학습을 마쳤어요" : "⏳ 아직 작성 전이에요"}
        </p>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">최근 기록</h2>
          <Link href="/history" className="text-sm text-indigo-600 hover:underline">
            전체 보기
          </Link>
        </div>
        <ul className="space-y-2">
          {recentNotes.map((note) => (
            <li key={note.id}>
              <Link
                href={`/notes/${note.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-300"
              >
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500">{formatDate(note.pickDate)}</p>
                  <p className="truncate font-medium">{note.article.title}</p>
                </div>
                <ScoreBadge score={note.feedback.totalScore} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
