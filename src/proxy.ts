// 모든 요청이 화면에 닿기 전에 로그인 여부를 확인한다. (기획서 S-1)
// - 로그인 쿠키가 없거나 위조됐으면 /login으로 보낸다.
// - 배포 환경인데 비밀번호 설정이 빠져 있으면 아무도 못 들어오게 막는다. (설정 실수로 문이 열리는 것 방지)
// - 내 컴퓨터에서 비밀번호를 설정하지 않았다면 로그인 없이 쓴다. (개발 편의)

import { NextResponse, type NextRequest } from "next/server";
import { authConfigured, SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function proxy(request: NextRequest) {
  if (!authConfigured()) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("서버 설정이 끝나지 않았어요. APP_PASSWORD_HASH와 SESSION_SECRET 환경 변수를 확인해 주세요.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    return NextResponse.next();
  }

  if (await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  // 로그인 화면, 자동 실행 주소(자체 비밀값으로 보호), Next.js 내부 파일, 파비콘은 제외
  matcher: ["/((?!login|api/cron|_next/static|_next/image|favicon.ico).*)"],
};
