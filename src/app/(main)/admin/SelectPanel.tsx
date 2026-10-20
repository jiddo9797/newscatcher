"use client";

import { useActionState } from "react";
import { selectNow, type SelectState } from "./actions";

export default function SelectPanel({ hasPick, locked }: { hasPick: boolean; locked: boolean }) {
  const [state, formAction, pending] = useActionState<SelectState, FormData>(selectNow, {});
  const { result, error } = state;

  return (
    <div className="flex w-72 flex-col items-end">
      <form action={formAction}>
        {/* 오늘의 뉴스가 없으면 "자동 선정", 있으면 "다시 선정"(force) */}
        <input type="hidden" name="force" value={hasPick ? "1" : "0"} />
        <button
          type="submit"
          disabled={pending || locked}
          className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {pending ? "고르고 있어요…" : hasPick ? "다시 자동 선정" : "자동 선정"}
        </button>
      </form>
      {error && <p className="mt-3 line-clamp-3 break-all text-right text-sm font-medium text-rose-600">오류: {error}</p>}
      {result && (
        <p
          className={`mt-3 line-clamp-3 break-all text-right text-sm font-medium ${result.status === "success" ? "text-emerald-700" : "text-rose-600"}`}
        >
          {result.status === "success" ? "✅" : "❌"} {result.summary}
        </p>
      )}
    </div>
  );
}
