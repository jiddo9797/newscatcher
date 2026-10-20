"use server";

import { refresh } from "next/cache";
import { runCollect, type CollectResult } from "@/jobs/collect";

export type CollectState = { result?: CollectResult; error?: string };

/** "지금 수집하기" 버튼 → 뉴스 수집 실행 */
export async function collectNow(): Promise<CollectState> {
  try {
    const result = await runCollect();
    refresh(); // 화면의 실행 기록과 후보 목록을 새로 불러오게 함
    return { result };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}
