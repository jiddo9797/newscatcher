import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl">🔍</p>
      <h1 className="mt-4 text-xl font-bold">페이지를 찾을 수 없어요</h1>
      <p className="mt-2 text-zinc-500">주소가 잘못되었거나 삭제된 글이에요.</p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
      >
        오늘의 뉴스로 가기
      </Link>
    </main>
  );
}
