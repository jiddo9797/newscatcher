import { Suspense } from "react";
import Link from "next/link";
import { getStats } from "@/db/queries";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          News<span className="text-indigo-600">Catcher</span>
        </Link>
        <nav className="flex items-center gap-6 text-[15px]">
          <Link href="/" className="text-zinc-600 hover:text-zinc-900">
            오늘의 뉴스
          </Link>
          <Link href="/history" className="text-zinc-600 hover:text-zinc-900">
            내 기록
          </Link>
          <Link href="/admin" className="text-zinc-600 hover:text-zinc-900">
            관리
          </Link>
          {/* 연속 학습일은 DB를 읽어야 해서 따로 불러온다. 나머지 헤더는 바로 보인다. */}
          <Suspense fallback={<span className="w-24" />}>
            <StreakBadge />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}

async function StreakBadge() {
  const { streak } = await getStats();
  return (
    <span className="rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-600">
      🔥 {streak}일 연속
    </span>
  );
}
