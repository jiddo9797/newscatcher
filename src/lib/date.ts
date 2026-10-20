/** 한국 시간 기준 오늘 날짜 "YYYY-MM-DD" */
export function todayKST(): string {
  // en-CA 형식이 YYYY-MM-DD로 출력된다.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

/** "2026-10-21" + 1 → "2026-10-22" */
export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + days));
  return d.toISOString().slice(0, 10);
}
