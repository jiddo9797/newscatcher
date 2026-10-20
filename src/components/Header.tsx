import Link from "next/link";

export default function Header({ streak }: { streak: number }) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          News<span className="text-indigo-600">Catcher</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-zinc-600 hover:text-zinc-900">
            오늘
          </Link>
          <Link href="/history" className="text-zinc-600 hover:text-zinc-900">
            기록
          </Link>
          <span className="rounded-full bg-orange-50 px-2.5 py-1 font-semibold text-orange-600">
            🔥 {streak}일 연속
          </span>
        </nav>
      </div>
    </header>
  );
}
