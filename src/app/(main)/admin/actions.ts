"use server";

import { refresh } from "next/cache";
import { runCollect, type CollectResult } from "@/jobs/collect";
import { pickManually, runSelect, type SelectResult } from "@/jobs/select";

export type CollectState = { result?: CollectResult; error?: string };
export type SelectState = { result?: SelectResult; error?: string };

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

/** "자동 선정" / "다시 선정" 버튼 */
export async function selectNow(_prev: SelectState, formData: FormData): Promise<SelectState> {
  try {
    const result = await runSelect({ force: formData.get("force") === "1" });
    refresh();
    return { result };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

/** 후보 목록의 "선정" 버튼 → 그 기사를 오늘의 뉴스로 */
export async function pickArticle(formData: FormData): Promise<void> {
  const articleId = Number(formData.get("articleId"));
  if (!Number.isInteger(articleId)) return;
  await pickManually(articleId);
  refresh();
}
