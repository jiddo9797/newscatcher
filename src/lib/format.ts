const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** "2026-10-21" → "10월 21일 (수)" */
export function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

const dateTimeFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** ISO 시각 → "10. 21. 07:30" (한국 시간) */
export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}
