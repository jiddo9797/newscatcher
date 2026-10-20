"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { after } from "next/server";
import { getDb } from "@/db";
import { notes } from "@/db/schema";
import { gradeNote } from "@/jobs/grade";

/** "다시 채점" 버튼 */
export async function regrade(formData: FormData): Promise<void> {
  const noteId = Number(formData.get("noteId"));
  if (!Number.isInteger(noteId)) return;

  const db = await getDb();
  await db.update(notes).set({ gradeStatus: "pending", gradeError: null }).where(eq(notes.id, noteId));
  after(() => gradeNote(noteId));
  refresh();
}
