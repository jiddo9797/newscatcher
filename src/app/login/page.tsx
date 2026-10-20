import Link from "next/link";

// 1단계: 모양만 만든 로그인 화면. 6단계에서 실제 비밀번호 확인을 붙인다.
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold tracking-tight">
          News<span className="text-indigo-600">Catcher</span>
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          오늘의 뉴스를 읽고, 요약하고, 피드백 받기
        </p>

        <form className="mt-8 space-y-3">
          <label htmlFor="password" className="sr-only">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            placeholder="비밀번호"
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
          <Link
            href="/"
            className="block w-full rounded-xl bg-indigo-600 px-4 py-3 text-center font-semibold text-white hover:bg-indigo-700"
          >
            들어가기
          </Link>
        </form>
      </div>
    </main>
  );
}
