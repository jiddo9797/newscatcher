const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** "2026-10-21" → "10월 21일 (수)" */
export function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${month}월 ${day}일 (${weekday})`;
}
