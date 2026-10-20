import Link from "next/link";
import CategoryBadge from "@/components/CategoryBadge";
import ScoreBadge from "@/components/ScoreBadge";
import { formatDate } from "@/lib/format";
import { notes } from "@/lib/mock-data";

export default function HistoryPage() {
  const average = Math.round(
    notes.reduce((sum, note) => sum + note.feedback.totalScore, 0) / notes.length,
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">내 기록</h1>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="작성한 글" value={`${notes.length}개`} />
        <Stat label="평균 점수" value={`${average}점`} />
      </div>

      <ul className="space-y-2">
        {notes.map((note) => (
          <li key={note.id}>
            <Link
              href={`/notes/${note.id}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 hover:border-zinc-300"
            >
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500">
                  <span>{formatDate(note.pickDate)}</span>
                  <CategoryBadge category={note.article.category} />
                </div>
                <p className="truncate font-medium">{note.article.title}</p>
              </div>
              <ScoreBadge score={note.feedback.totalScore} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
