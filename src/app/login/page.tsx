import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold tracking-tight">
          News<span className="text-indigo-600">Catcher</span>
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">오늘의 뉴스를 읽고, 요약하고, 피드백 받기</p>
        <LoginForm />
      </div>
    </main>
  );
}
