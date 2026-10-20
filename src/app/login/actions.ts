"use server";

import { and, count, eq, gte, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { loginAttempts } from "@/db/schema";
import { verifyPassword } from "@/lib/password";
import { authConfigured, createSessionToken, SESSION_COOKIE, SESSION_DAYS } from "@/lib/session";

const MAX_FAILURES = 5; // 이 횟수만큼 틀리면
const LOCK_MINUTES = 15; // 이 시간 동안 로그인 막기

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!authConfigured()) return { error: "비밀번호가 아직 설정되지 않았어요. (npm run setup-secrets)" };

  const db = await getDb();
  const [{ failures }] = await db
    .select({ failures: count() })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.success, false),
        gte(loginAttempts.attemptedAt, sql`now() - make_interval(mins => ${LOCK_MINUTES})`),
      ),
    );
  if (failures >= MAX_FAILURES) {
    return { error: `비밀번호를 여러 번 틀려서 ${LOCK_MINUTES}분 동안 로그인할 수 없어요.` };
  }

  const password = String(formData.get("password") ?? "");
  const ok = password !== "" && (await verifyPassword(password, process.env.APP_PASSWORD_HASH!));
  await db.insert(loginAttempts).values({ success: ok });
  if (!ok) {
    const left = MAX_FAILURES - failures - 1;
    return { error: left > 0 ? `비밀번호가 틀렸어요. (${left}번 더 틀리면 잠시 잠겨요)` : `비밀번호가 틀렸어요. ${LOCK_MINUTES}분 뒤에 다시 시도해 주세요.` };
  }

  (await cookies()).set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true, // 자바스크립트로 쿠키를 읽을 수 없게
    secure: process.env.NODE_ENV === "production", // 배포 환경에서는 HTTPS로만 전송
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  redirect("/");
}

export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
