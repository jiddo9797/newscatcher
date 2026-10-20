import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryBadge from "@/components/CategoryBadge";
import { scoreColor } from "@/components/ScoreBadge";
import { formatDate } from "@/lib/format";
import { getNote } from "@/lib/mock-data";
import { RUBRIC } from "@/lib/types";

// 주소의 [id] 값(params)은 요청이 들어와야 알 수 있으므로
// 그 값을 읽는 부분을 <Suspense>로 감싼다. (Next.js 16 Cache Components 규칙)
export default function NotePage({ params }: PageProps<"/notes/[id]">) {
  return (
    <Suspense fallback={<p className="py-20 text-center text-zinc-400">불러오는 중…</p>}>
      <NoteDetail params={params} />
    </Suspense>
  );
}

async function NoteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = getNote(Number(id));
  if (!note) notFound();

  const { article, feedback } = note;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/history" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← 기록
        </Link>
        <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
          <CategoryBadge category={article.category} />
          <span>{formatDate(note.pickDate)}</span>
          <span>· {article.source}</span>
        </div>
        <h1 className="mt-2 text-lg font-bold leading-snug">{article.title}</h1>
      </div>

      {/* 총점 + 항목별 점수 */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <p className="text-center">
          <span className={`text-5xl font-extrabold tabular-nums ${scoreColor(feedback.totalScore)}`}>
            {feedback.totalScore}
          </span>
          <span className="text-lg text-zinc-400"> / 100</span>
        </p>
        <ul className="mt-5 space-y-3">
          {RUBRIC.map(({ key, label, max }) => {
            const score = feedback.scores[key];
            return (
              <li key={key}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{label}</span>
                  <span className="tabular-nums text-zinc-500">
                    {score} / {max}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${(score / max) * 100}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <FeedbackList title="👍 잘한 점" items={feedback.goodPoints} />
      <FeedbackList title="🔧 개선할 점" items={feedback.improvements} />

      {feedback.missedKeywords.length > 0 && (
        <section>
          <h2 className="mb-2 font-bold">📌 놓친 핵심 키워드</h2>
          <div className="flex flex-wrap gap-2">
            {feedback.missedKeywords.map((keyword) => (
              <span key={keyword} className="rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700">
                #{keyword}
              </span>
            ))}
          </div>
        </section>
      )}

      <Collapsible title="✍️ 모범 요약과 비교하기">
        <p className="mb-1 text-xs font-semibold text-zinc-400">AI 모범 요약</p>
        <p className="leading-relaxed">{feedback.modelSummary}</p>
        <p className="mb-1 mt-4 text-xs font-semibold text-zinc-400">내 요약</p>
        <p className="leading-relaxed text-zinc-600">{note.summary}</p>
      </Collapsible>

      {feedback.interviewTip && (
        <section className="rounded-2xl bg-indigo-50 p-5">
          <h2 className="mb-2 font-bold text-indigo-900">💬 면접 연결 팁</h2>
          <p className="font-medium text-indigo-900">Q. {feedback.interviewTip.question}</p>
          <p className="mt-2 text-sm leading-relaxed text-indigo-800">{feedback.interviewTip.tip}</p>
        </section>
      )}

      {feedback.termExplanations && feedback.termExplanations.length > 0 && (
        <section>
          <h2 className="mb-2 font-bold">🔤 용어 설명</h2>
          <dl className="space-y-2">
            {feedback.termExplanations.map(({ term, explanation }) => (
              <div key={term} className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
                <dt className="font-semibold">{term}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-zinc-600">{explanation}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <Collapsible title="📄 내가 쓴 글 전체 보기">
        <p className="mb-1 text-xs font-semibold text-zinc-400">요약</p>
        <p className="leading-relaxed">{note.summary}</p>
        <p className="mb-1 mt-4 text-xs font-semibold text-zinc-400">의견</p>
        <p className="leading-relaxed">{note.opinion}</p>
      </Collapsible>
    </div>
  );
}

function FeedbackList({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h2 className="mb-2 font-bold">{title}</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[15px] leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-2xl border border-zinc-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-bold">
        {title}
        <span className="text-zinc-400 transition group-open:rotate-180">▾</span>
      </summary>
      <div className="border-t border-zinc-100 px-5 py-4 text-[15px]">{children}</div>
    </details>
  );
}
