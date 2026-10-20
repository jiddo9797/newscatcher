"use client";

// 입력할 때마다 글자 수가 바뀌는 등 브라우저에서 반응해야 하는 부분이라
// 클라이언트 컴포넌트("use client")로 만든다.

import { useActionState, useState } from "react";
import { submitNote, type WriteState } from "./actions";
import { LIMITS } from "./limits";

export default function WriteForm() {
  const [summary, setSummary] = useState("");
  const [opinion, setOpinion] = useState("");
  const [terms, setTerms] = useState("");
  // formAction을 <form action>에 넘기면 제출 시 서버의 submitNote가 실행된다.
  // pending은 서버가 처리하는 동안 true가 된다.
  const [state, formAction, pending] = useActionState<WriteState, FormData>(submitNote, {});

  const canSubmit = summary.trim() !== "" && opinion.trim() !== "" && !pending;

  return (
    <form action={formAction} className="space-y-8">
      <Field
        id="summary"
        label="📝 요약"
        hint="기사의 핵심을 3~5문장으로 정리해 보세요."
        value={summary}
        max={LIMITS.summary}
        rows={7}
        onChange={setSummary}
      />
      <Field
        id="opinion"
        label="💭 내 의견 · 느낀 점"
        hint="근거를 들어 내 생각을 쓰고, 지원 직무와 연결해 보면 더 좋아요."
        value={opinion}
        max={LIMITS.opinion}
        rows={9}
        onChange={setOpinion}
      />

      <div>
        <label htmlFor="terms" className="text-lg font-semibold">
          🔤 모르는 용어 <span className="text-sm font-normal text-zinc-400">(선택)</span>
        </label>
        <p className="mt-1 text-zinc-500">쉼표로 구분해서 적으면 피드백 때 설명해 줘요.</p>
        <input
          id="terms"
          name="terms"
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          placeholder="예: 가계부채, 환율"
          className="mt-3 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 font-medium text-rose-700">
          {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-xl bg-indigo-600 px-8 py-3.5 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {pending ? "저장하고 있어요…" : "제출하고 피드백 받기"}
        </button>
      </div>
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
        <label htmlFor={id} className="text-lg font-semibold">
          {label}
        </label>
        <span className="text-sm tabular-nums text-zinc-400">
          {value.length} / {max}
        </span>
      </div>
      <p className="mt-1 text-zinc-500">{hint}</p>
      <textarea
        id={id}
        name={id}
        value={value}
        maxLength={max}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3 w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 text-[16px] leading-relaxed outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}
