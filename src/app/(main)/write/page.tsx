import Link from "next/link";
import CategoryBadge from "@/components/CategoryBadge";
import { todayPick } from "@/lib/mock-data";
import WriteForm from "./WriteForm";

export default function WritePage() {
  const { article } = todayPick;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← 오늘의 뉴스
        </Link>
        <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
            <CategoryBadge category={article.category} />
            <span>{article.source}</span>
          </div>
          <p className="font-semibold leading-snug">{article.title}</p>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-indigo-600 hover:underline"
          >
            원문 다시 보기 ↗
          </a>
        </div>
      </div>

      <WriteForm />
    </div>
  );
}
