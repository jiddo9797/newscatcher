import Header from "@/components/Header";
import { streak } from "@/lib/mock-data";

// (main) 폴더 안의 화면(홈, 작성, 피드백, 기록)에 공통으로 헤더를 붙인다.
// 괄호로 감싼 폴더 이름은 주소에 포함되지 않는다. (/main 이 아니라 / 그대로)
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header streak={streak} />
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
    </>
  );
}
