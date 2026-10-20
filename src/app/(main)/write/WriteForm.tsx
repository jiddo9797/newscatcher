"use client";

// 입력할 때마다 글자 수가 바뀌는 등 브라우저에서 반응해야 하는 부분이라
// 클라이언트 컴포넌트("use client")로 만든다.

import { useState } from "react";
import { useRouter } from "next/navigation";

const SUMMARY_MAX = 500;
const OPINION_MAX = 1000;

export default function WriteForm() {
  const router = useRouter();
  const [summary, setSummary] = useState("");
  const [opinion, setOpinion] = useState("");
  const [terms, setTerms] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = summary.trim() !== "" && opinion.trim() !== "" && !submitting;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    // 1단계: 아직 AI가 연결되지 않아 예시 피드백 화면으로 이동한다.
    // 5단계에서 실제로 저장하고 Claude에게 채점을 요청하는 코드로 바꾼다.
    setTimeout(() => router.push("/notes/4"), 1200);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field
        id="summary"
        label="📝 요약"
        hint="기사의 핵심을 3~5문장으로 정리해 보세요."
        value={summary}
        max={SUMMARY_MAX}
        rows={6}
        onChange={setSummary}
      />
      <Field
        id="opinion"
        label="💭 내 의견 · 느낀 점"
        hint="근거를 들어 내 생각을 쓰고, 지원 직무와 연결해 보면 더 좋아요."
        value={opinion}
        max={OPINION_MAX}
        rows={6}
        onChange={setOpinion}
      />

      <div>
        <label htmlFor="terms" className="font-semibold">
          🔤 모르는 용어 <span className="text-sm font-normal text-zinc-400">(선택)</span>
        </label>
        <p className="mt-1 text-sm text-zinc-500">쉼표로 구분해서 적으면 피드백 때 설명해 줘요.</p>
        <input
          id="terms"
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          placeholder="예: 가계부채, 환율"
          className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {submitting ? "AI가 채점하고 있어요…" : "제출하고 피드백 받기"}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  value,
  max,
  rows,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  max: number;
  rows: number;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="font-semibold">
          {label}
        </label>
        <span className="text-sm tabular-nums text-zinc-400">
          {value.length} / {max}
        </span>
      </div>
      <p className="mt-1 text-sm text-zinc-500">{hint}</p>
      <textarea
        id={id}
        value={value}
        maxLength={max}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 leading-relaxed outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}
