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
        4단계(AI 뉴스 선정)가 연결되면 매일 아침 자동으로 채워져요.
        <br />
        지금은 개발 서버를 끄고 <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm">npm run db:seed</code>를
        실행하면 예시 뉴스가 들어가요.
      </p>
    </div>
  );
}
