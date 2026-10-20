import Link from "next/link";

// 여러 화면에서 같이 쓰는 "불러오는 중" / "오늘의 뉴스 없음" 화면

export function PageLoading() {
  return <p className="py-24 text-center text-zinc-400">불러오는 중…</p>;
}

export function NoPickToday() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
      <p className="text-4xl">📭</p>
      <p className="mt-4 text-lg font-semibold">오늘의 뉴스가 아직 없어요</p>
      <p className="mt-2 text-zinc-500">
        관리 화면에서 <b>뉴스 수집</b> → <b>자동 선정</b>을 눌러 주세요.
        <br />
        6단계(배포)부터는 매일 아침 자동으로 준비돼요.
      </p>
      <Link
        href="/admin"
        className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
      >
        관리 화면으로 →
      </Link>
    </div>
  );
}
