import { Suspense } from "react";
import Link from "next/link";
import CategoryBadge from "@/components/CategoryBadge";
import ScoreBadge, { GradeLabel } from "@/components/ScoreBadge";
import { PageLoading } from "@/components/States";
import { getStats, listNotes } from "@/db/queries";
import { formatDate } from "@/lib/format";

export default function HistoryPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <HistoryContent />
    </Suspense>
  );
}

async function HistoryContent() {
  const [allNotes, stats] = await Promise.all([listNotes(), getStats()]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">내 기록</h1>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="🔥 연속 학습" value={`${stats.streak}일`} />
        <Stat label="📝 작성한 글" value={`${stats.noteCount}개`} />
        <Stat label="📊 평균 점수" value={stats.averageScore === null ? "-" : `${stats.averageScore}점`} />
      </div>

      {allNotes.length === 0 ? (
        <p className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center text-zinc-500">
          아직 작성한 글이 없어요. 오늘의 뉴스부터 시작해 보세요!
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full table-fixed">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-sm text-zinc-500">
              <tr>
                <th className="w-40 px-5 py-3 font-medium">날짜</th>
                <th className="w-24 px-5 py-3 font-medium">분야</th>
                <th className="px-5 py-3 font-medium">기사</th>
                <th className="w-28 px-5 py-3 text-right font-medium">점수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {allNotes.map((note) => (
                <tr key={note.id} className="hover:bg-zinc-50">
                  <td className="px-5 py-4 text-zinc-500">{formatDate(note.pickDate)}</td>
                  <td className="px-5 py-4">
                    <CategoryBadge category={note.article.category} />
                  </td>
                  <td className="truncate px-5 py-4">
                    <Link href={`/notes/${note.id}`} className="font-medium hover:text-indigo-600 hover:underline">
                      {note.article.title}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {note.feedback ? (
                      <ScoreBadge score={note.feedback.totalScore} />
                    ) : (
                      <GradeLabel status={note.gradeStatus} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
