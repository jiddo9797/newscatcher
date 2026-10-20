"use server";

// 서버 액션: 브라우저에서 제출 버튼을 누르면 이 함수가 "서버에서" 실행된다.
// 브라우저에서 보낸 값은 조작될 수 있으므로, 화면에서 이미 막았더라도 여기서 한 번 더 검사한다. (기획서 S-4)

import { redirect } from "next/navigation";
import { after } from "next/server";
import { getDb } from "@/db";
import { getNoteByDate, getTodayPick } from "@/db/queries";
import { notes } from "@/db/schema";
import { gradeNote } from "@/jobs/grade";
import { LIMITS } from "./limits";

export type WriteState = { error?: string };

export async function submitNote(_prev: WriteState, formData: FormData): Promise<WriteState> {
  const summary = String(formData.get("summary") ?? "").trim();
  const opinion = String(formData.get("opinion") ?? "").trim();
  const unknownTerms = String(formData.get("terms") ?? "")
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean);

  if (!summary) return { error: "요약을 입력해 주세요." };
  if (!opinion) return { error: "의견을 입력해 주세요." };
  if (summary.length > LIMITS.summary) return { error: `요약은 ${LIMITS.summary}자까지 쓸 수 있어요.` };
  if (opinion.length > LIMITS.opinion) return { error: `의견은 ${LIMITS.opinion}자까지 쓸 수 있어요.` };
  if (unknownTerms.length > LIMITS.termCount) return { error: `모르는 용어는 ${LIMITS.termCount}개까지 적을 수 있어요.` };
  if (unknownTerms.some((term) => term.length > LIMITS.termLength)) {
    return { error: `용어 하나는 ${LIMITS.termLength}자까지 쓸 수 있어요.` };
  }

  const pick = await getTodayPick();
  if (!pick) return { error: "오늘의 뉴스가 아직 없어요." };
  if (await getNoteByDate(pick.date)) return { error: "오늘의 글은 이미 제출했어요." };

  const db = await getDb();
  const [note] = await db
    .insert(notes)
    .values({ pickDate: pick.date, summary, opinion, unknownTerms })
    .returning({ id: notes.id });

  // AI 채점은 30초~1분 걸려서, 화면부터 넘기고 응답을 보낸 "뒤에" 채점한다.
  after(() => gradeNote(note.id));

  redirect(`/notes/${note.id}`);
}
