import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryBadge from "@/components/CategoryBadge";
import { scoreColor } from "@/components/ScoreBadge";
import { PageLoading } from "@/components/States";
import { getNote } from "@/db/queries";
import { formatDate } from "@/lib/format";
import { RUBRIC, type Feedback, type Note } from "@/lib/types";
import GradingStatus from "./GradingStatus";

// 다시 채점 버튼의 AI 채점(after)이 끝날 때까지 기다릴 수 있는 최대 시간(초)
export const maxDuration = 300;

// 주소의 [id] 값(params)은 요청이 들어와야 알 수 있으므로
// 그 값을 읽는 부분을 <Suspense>로 감싼다. (Next.js 16 Cache Components 규칙)
export default function NotePage({ params }: PageProps<"/notes/[id]">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <NoteDetail params={params} />
    </Suspense>
  );
}

async function NoteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await getNote(Number(id));
  if (!note) notFound();

  const { article, feedback } = note;

  return (
    <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
      {/* 왼쪽: 기사 정보 + 점수 (스크롤해도 따라옴) */}
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <Link href="/history" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← 내 기록
        </Link>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
            <CategoryBadge category={article.category} />
            <span>{formatDate(note.pickDate)}</span>
            <span>· {article.source}</span>
          </div>
          <h1 className="font-bold leading-snug">{article.title}</h1>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline"
          >
            원문 보기 ↗
          </a>
        </div>
        {feedback ? (
          <ScorePanel feedback={feedback} />
        ) : (
          <GradingStatus noteId={note.id} status={note.gradeStatus} error={note.gradeError} />
        )}
      </aside>

      {/* 오른쪽: 피드백 내용 */}
      <div className="space-y-8">
        {feedback ? <FeedbackDetail note={note} feedback={feedback} /> : <MyWriting note={note} />}
      </div>
    </div>
  );
}

function ScorePanel({ feedback }: { feedback: Feedback }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6">
      <p className="text-center">
        <span className={`text-6xl font-extrabold tabular-nums ${scoreColor(feedback.totalScore)}`}>
          {feedback.totalScore}
        </span>
        <span className="text-xl text-zinc-400"> / 100</span>
      </p>
      <ul className="mt-6 space-y-3">
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
                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(score / max) * 100}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function FeedbackDetail({ note, feedback }: { note: Note; feedback: Feedback }) {
  return (
    <>
      {feedback.basis && (
        <p className="text-sm text-zinc-500">
          {feedback.basis === "article"
            ? "📰 원문 기사 본문을 바탕으로 채점했어요."
            : "⚠️ 원문 본문을 가져오지 못해 기사 소개문을 바탕으로 채점했어요. 정확성 점수는 참고만 해 주세요."}
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        <FeedbackList title="👍 잘한 점" items={feedback.goodPoints} />
        <FeedbackList title="🔧 개선할 점" items={feedback.improvements} />
      </div>

      {feedback.missedKeywords.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">📌 놓친 핵심 키워드</h2>
          <div className="flex flex-wrap gap-2">
            {feedback.missedKeywords.map((keyword) => (
              <span key={keyword} className="rounded-full bg-rose-50 px-3 py-1 font-medium text-rose-700">
                #{keyword}
              </span>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold">✍️ 모범 요약과 비교</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5">
            <p className="mb-2 text-xs font-semibold text-indigo-500">AI 모범 요약</p>
            <p className="leading-relaxed">{feedback.modelSummary}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="mb-2 text-xs font-semibold text-zinc-400">내 요약</p>
            <p className="leading-relaxed text-zinc-700">{note.summary}</p>
          </div>
        </div>
      </section>

      {feedback.interviewTip && (
        <section className="rounded-2xl bg-indigo-50 p-6">
          <h2 className="mb-2 text-lg font-bold text-indigo-900">💬 면접 연결 팁</h2>
          <p className="font-medium text-indigo-900">Q. {feedback.interviewTip.question}</p>
          <p className="mt-2 leading-relaxed text-indigo-800">{feedback.interviewTip.tip}</p>
        </section>
      )}

      {feedback.termExplanations && feedback.termExplanations.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">🔤 용어 설명</h2>
          <dl className="space-y-2">
            {feedback.termExplanations.map(({ term, explanation }) => (
              <div key={term} className="rounded-xl border border-zinc-200 bg-white px-5 py-4">
                <dt className="font-semibold">{term}</dt>
                <dd className="mt-1 leading-relaxed text-zinc-600">{explanation}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <details className="group rounded-2xl border border-zinc-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 font-bold">
          📄 내가 쓴 의견 보기
          <span className="text-zinc-400 transition group-open:rotate-180">▾</span>
        </summary>
        <p className="border-t border-zinc-100 px-6 py-4 leading-relaxed">{note.opinion}</p>
      </details>
    </>
  );
}

function MyWriting({ note }: { note: Note }) {
  return (
    <>
      <WritingBlock title="📝 내 요약" text={note.summary} />
      <WritingBlock title="💭 내 의견" text={note.opinion} />
      {note.unknownTerms.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">🔤 모르는 용어</h2>
          <div className="flex flex-wrap gap-2">
            {note.unknownTerms.map((term) => (
              <span key={term} className="rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-700">
                {term}
              </span>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function WritingBlock({ title, text }: { title: string; text: string }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      <p className="whitespace-pre-wrap rounded-2xl border border-zinc-200 bg-white px-6 py-5 leading-relaxed">
        {text}
      </p>
    </section>
  );
}

function FeedbackList({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="rounded-xl border border-zinc-200 bg-white px-5 py-4 leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
