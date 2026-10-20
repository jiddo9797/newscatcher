"use client";

// 채점 중이면 5초마다 화면을 새로 불러와서, 채점이 끝나는 순간 결과가 나타나게 한다.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { GradeStatus } from "@/lib/types";
import { regrade } from "./actions";

const POLL_MS = 5000;
const SLOW_AFTER_SEC = 180; // 이만큼 지나도 안 끝나면 "다시 채점" 버튼을 보여 준다

export default function GradingStatus({
  noteId,
  status,
  error,
}: {
  noteId: number;
  status: GradeStatus;
  error: string | null;
}) {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const inProgress = status === "pending" || status === "grading";

  useEffect(() => {
    if (!inProgress) return;
    const started = Date.now();
    const tick = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    const poll = setInterval(() => router.refresh(), POLL_MS);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, [inProgress, router]);

  if (inProgress) {
    return (
      <section className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        <p className="mt-4 font-semibold text-indigo-900">AI가 채점하고 있어요</p>
        <p className="mt-1 text-sm text-indigo-700">
          무료 AI라 보통 1~2분 걸려요 · <span className="tabular-nums">{elapsed}초</span>
        </p>
        <p className="mt-1 text-xs text-indigo-500">다른 화면에 갔다 와도 채점은 계속돼요.</p>
        {elapsed >= SLOW_AFTER_SEC && <RegradeButton noteId={noteId} label="너무 오래 걸리면 다시 채점" />}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center">
      <p className="text-3xl">⚠️</p>
      <p className="mt-3 font-semibold text-rose-900">채점에 실패했어요</p>
      {error && <p className="mt-2 break-all text-sm text-rose-700">{error}</p>}
      <RegradeButton noteId={noteId} label="다시 채점하기" />
    </section>
  );
}

function RegradeButton({ noteId, label }: { noteId: number; label: string }) {
  return (
    <form action={regrade} className="mt-4">
      <input type="hidden" name="noteId" value={noteId} />
      <button
        type="submit"
        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        {label}
      </button>
    </form>
  );
}
