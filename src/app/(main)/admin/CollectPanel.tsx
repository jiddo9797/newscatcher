"use client";

import { useActionState } from "react";
import { collectNow, type CollectState } from "./actions";

export default function CollectPanel() {
  const [state, formAction, pending] = useActionState<CollectState>(collectNow, {});
  const { result, error } = state;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-bold">뉴스 수집</h2>
          <p className="mt-1 text-zinc-500">
            언론사 RSS에서 최근 24시간 기사를 모아요. 6단계부터는 매일 아침 자동으로 실행돼요.
          </p>
        </div>
        <form action={formAction}>
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:bg-zinc-300"
          >
            {pending ? "수집하고 있어요…" : "지금 수집하기"}
          </button>
        </form>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 font-medium text-rose-700">
          수집 중 오류가 났어요: {error}
        </p>
      )}

      {result && (
        <div className="mt-5 border-t border-zinc-100 pt-5">
          <p className="font-semibold">
            {result.status === "success" ? "✅" : result.status === "partial" ? "⚠️" : "❌"} {result.summary}
            <span className="ml-2 text-sm font-normal text-zinc-400">({(result.durationMs / 1000).toFixed(1)}초)</span>
          </p>
          <table className="mt-3 w-full text-sm">
            <thead className="text-left text-zinc-500">
              <tr>
                <th className="py-1.5 font-medium">출처</th>
                <th className="py-1.5 font-medium">결과</th>
                <th className="py-1.5 text-right font-medium">RSS 기사</th>
                <th className="py-1.5 text-right font-medium">최근 24시간</th>
                <th className="py-1.5 text-right font-medium">새로 저장</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {result.sources.map((s) => (
                <tr key={s.url}>
                  <td className="py-1.5">
                    {s.source}
                    <span className="ml-1.5 text-xs text-zinc-400">{new URL(s.url).pathname}</span>
                  </td>
                  <td className="py-1.5">
                    {s.ok ? (
                      <span className="text-emerald-600">성공{s.attempts > 1 && ` (${s.attempts}번째 시도)`}</span>
                    ) : (
                      <span className="text-rose-600">실패: {s.error}</span>
                    )}
                  </td>
                  <td className="py-1.5 text-right tabular-nums">{s.fetched}</td>
                  <td className="py-1.5 text-right tabular-nums">{s.recent}</td>
                  <td className="py-1.5 text-right font-semibold tabular-nums">{s.inserted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
