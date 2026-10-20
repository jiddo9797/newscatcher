// 기획서 7.4 데이터 구조를 TypeScript 타입으로 옮긴 것.
// 2단계에서 Supabase 테이블을 만들 때도 이 구조를 그대로 따른다.

export type Category = "시사" | "경제" | "IT";

/** 수집한 기사 후보 (articles 테이블) */
export type Article = {
  id: number;
  title: string;
  description: string; // RSS 소개문 (본문 전체는 저장하지 않음)
  url: string;
  source: string; // 언론사
  category: Category;
  publishedAt: string; // ISO 날짜 문자열
};

/** 오늘의 뉴스 (daily_picks 테이블) */
export type DailyPick = {
  date: string; // YYYY-MM-DD
  article: Article;
  reason: string; // AI가 이 기사를 고른 이유
};

/** 채점 항목별 점수 */
export type Scores = {
  accuracy: number; // 정확성
  keyPoints: number; // 핵심 파악
  conciseness: number; // 간결성
  opinion: number; // 의견의 깊이
};

/** AI 피드백 (기획서 5.3 출력 형식) */
export type Feedback = {
  totalScore: number;
  scores: Scores;
  goodPoints: string[];
  improvements: string[];
  missedKeywords: string[];
  modelSummary: string;
  interviewTip?: { question: string; tip: string };
  termExplanations?: { term: string; explanation: string }[];
  basis?: "article" | "description"; // 원문 본문으로 채점했는지, RSS 소개문만으로 채점했는지
};

export type GradeStatus = "pending" | "grading" | "done" | "failed";

/** 내가 쓴 글 + 피드백 (notes 테이블) */
export type Note = {
  id: number;
  pickDate: string;
  article: Article;
  summary: string;
  opinion: string;
  unknownTerms: string[];
  createdAt: string;
  feedback: Feedback | null; // 채점 전에는 null
  gradeStatus: GradeStatus;
  gradeError: string | null;
};

/** 채점 기준 (기획서 5.2 루브릭) */
export const RUBRIC: { key: keyof Scores; label: string; max: number }[] = [
  { key: "accuracy", label: "정확성", max: 30 },
  { key: "keyPoints", label: "핵심 파악", max: 30 },
  { key: "conciseness", label: "간결성", max: 15 },
  { key: "opinion", label: "의견의 깊이", max: 25 },
];
