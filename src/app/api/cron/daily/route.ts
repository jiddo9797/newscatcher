// 매일 아침 자동 실행: 뉴스 수집 → 오늘의 뉴스 선정
// Vercel Cron이 vercel.json의 시간표대로 이 주소를 부른다.
// 아무나 부르지 못하도록, Vercel이 함께 보내는 CRON_SECRET 값을 확인한다.

import { runCollect } from "@/jobs/collect";
import { runSelect } from "@/jobs/select";

export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const collect = await runCollect();
  const select = await runSelect();
  return Response.json({ collect: collect.summary, select: select.summary });
}
