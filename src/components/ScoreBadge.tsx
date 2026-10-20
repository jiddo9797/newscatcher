import type { GradeStatus } from "@/lib/types";

/** 점수 구간별 색: 80점 이상 초록, 60점 이상 노랑, 그 아래 빨강 */
export function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-rose-600";
}

export default function ScoreBadge({ score }: { score: number }) {
  return (
    <span className={`text-lg font-bold tabular-nums ${scoreColor(score)}`}>
      {score}
      <span className="text-xs font-medium text-zinc-400">점</span>
    </span>
  );
}

/** 아직 점수가 없을 때 표시 */
export function GradeLabel({ status }: { status: GradeStatus }) {
  if (status === "failed") return <span className="shrink-0 text-sm text-rose-500">채점 실패</span>;
  return <span className="shrink-0 text-sm text-indigo-500">채점 중…</span>;
}
