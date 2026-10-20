// 1단계용 가짜 데이터. 화면을 먼저 만들어 보기 위한 예시이며,
// 2단계(DB 연결)에서 Supabase에서 불러오는 코드로 교체한다.
// 기사 내용은 실제 뉴스가 아닌 예시 문장이다.

import type { DailyPick, Note } from "./types";

export const todayPick: DailyPick = {
  date: "2026-10-21",
  article: {
    id: 105,
    title: "금융당국, 은행권 생성형 AI 활용 가이드라인 발표 (예시 기사)",
    description:
      "금융당국이 은행의 생성형 AI 도입 시 지켜야 할 보안·책임 기준을 담은 가이드라인을 내놓았다. 고객 정보 보호와 AI 판단에 대한 설명 책임이 핵심이다.",
    url: "https://example.com/news/105",
    source: "예시경제",
    category: "경제",
    publishedAt: "2026-10-21T06:30:00+09:00",
  },
  reason:
    "금융권 AI 도입은 은행 IT 면접 단골 주제예요. 보안과 책임이라는 두 키워드를 정리해 두기 좋아요.",
};

export const todayStatus: "not-started" | "done" = "not-started";

export const notes: Note[] = [
  {
    id: 4,
    pickDate: "2026-10-20",
    article: {
      id: 98,
      title: "정부, 공공기관 시스템 클라우드 전환 2단계 착수 (예시 기사)",
      description:
        "정부가 공공기관 정보시스템을 민간 클라우드로 옮기는 2단계 사업에 들어간다. 보안 인증과 장애 대응 체계가 과제로 꼽힌다.",
      url: "https://example.com/news/98",
      source: "예시일보",
      category: "IT",
      publishedAt: "2026-10-20T07:10:00+09:00",
    },
    summary:
      "정부가 공공기관 시스템을 민간 클라우드로 옮기는 2단계 사업을 시작한다. 비용 절감과 유연한 운영이 목적이다. 다만 보안 인증과 장애 대응이 과제로 남아 있다.",
    opinion:
      "클라우드 전환은 피할 수 없는 흐름이라고 생각한다. 하지만 공공 서비스는 멈추면 안 되기 때문에 장애 대응 훈련이 함께 가야 한다.",
    unknownTerms: ["CSAP"],
    createdAt: "2026-10-20T08:40:00+09:00",
    feedback: {
      totalScore: 82,
      scores: { accuracy: 27, keyPoints: 24, conciseness: 13, opinion: 18 },
      goodPoints: [
        "사업의 목적(비용 절감, 유연한 운영)과 과제(보안, 장애 대응)를 균형 있게 담았어요.",
        "세 문장으로 군더더기 없이 정리했어요.",
      ],
      improvements: [
        "1단계와 비교해 무엇이 달라지는지가 빠져 있어요.",
        "의견에서 '장애 대응 훈련'의 구체적인 예를 하나 들면 설득력이 커져요.",
      ],
      missedKeywords: ["보안 인증(CSAP)", "단계별 전환"],
      modelSummary:
        "정부가 공공기관 정보시스템을 민간 클라우드로 옮기는 2단계 사업에 착수했다. 1단계보다 대상 시스템이 늘어나며, 비용 절감과 운영 유연성이 기대된다. 다만 클라우드 보안 인증과 장애 발생 시 대응 체계 마련이 과제로 꼽힌다.",
      interviewTip: {
        question: "공공 시스템을 클라우드로 옮길 때 가장 우려되는 점은 무엇인가요?",
        tip: "보안과 서비스 연속성 두 축으로 답하고, 이중화나 장애 훈련 같은 대응책까지 말해 보세요.",
      },
      termExplanations: [
        {
          term: "CSAP",
          explanation:
            "클라우드 서비스 보안 인증. 공공기관에 클라우드를 제공하려면 이 인증을 받아야 해요.",
        },
      ],
    },
  },
  {
    id: 3,
    pickDate: "2026-10-19",
    article: {
      id: 91,
      title: "한국은행, 기준금리 동결 결정 (예시 기사)",
      description:
        "한국은행 금융통화위원회가 기준금리를 동결했다. 물가는 안정세지만 가계부채와 환율 변동성을 고려했다는 설명이다.",
      url: "https://example.com/news/91",
      source: "예시경제",
      category: "경제",
      publishedAt: "2026-10-19T10:00:00+09:00",
    },
    summary:
      "한국은행이 기준금리를 동결했다. 물가가 안정되고 있지만 아직 불확실성이 크다고 판단했다.",
    opinion: "금리가 내려가야 경기가 살아날 것 같은데 아쉽다.",
    unknownTerms: [],
    createdAt: "2026-10-19T21:15:00+09:00",
    feedback: {
      totalScore: 64,
      scores: { accuracy: 25, keyPoints: 17, conciseness: 12, opinion: 10 },
      goodPoints: ["동결이라는 결정과 물가 안정이라는 배경을 정확히 썼어요."],
      improvements: [
        "'불확실성'이 무엇인지(가계부채, 환율) 구체적으로 써야 핵심이 살아나요.",
        "의견이 감상에 가까워요. 금리 동결이 누구에게 어떤 영향을 주는지 근거를 들어 보세요.",
      ],
      missedKeywords: ["가계부채", "환율 변동성", "금융통화위원회"],
      modelSummary:
        "한국은행 금융통화위원회가 기준금리를 동결했다. 물가는 안정세를 보이고 있으나, 가계부채 증가와 환율 변동성을 고려해 인하를 미뤘다.",
      interviewTip: {
        question: "금리 변화가 은행 IT 부서 업무에 어떤 영향을 줄 수 있을까요?",
        tip: "금리 변경 시 상품·이자 계산 시스템 반영, 대출 수요 변화에 따른 시스템 부하 등을 연결해 보세요.",
      },
    },
  },
  {
    id: 2,
    pickDate: "2026-10-18",
    article: {
      id: 85,
      title: "개인정보위, 대규모 유출 기업에 과징금 부과 (예시 기사)",
      description:
        "개인정보보호위원회가 해킹으로 고객 정보를 유출한 기업에 과징금을 부과했다. 접근 통제와 암호화 조치 미흡이 원인으로 지적됐다.",
      url: "https://example.com/news/85",
      source: "예시일보",
      category: "시사",
      publishedAt: "2026-10-18T09:20:00+09:00",
    },
    summary:
      "개인정보위가 고객 정보를 유출한 기업에 과징금을 부과했다. 접근 통제와 암호화가 제대로 되어 있지 않았던 것이 문제였다. 기업의 보안 투자 필요성이 다시 강조됐다.",
    opinion:
      "보안은 사고가 나기 전에는 비용으로만 보이지만, 사고가 나면 신뢰를 잃는다. 개발 단계부터 암호화와 권한 관리를 기본으로 설계해야 한다고 느꼈다.",
    unknownTerms: [],
    createdAt: "2026-10-18T22:05:00+09:00",
    feedback: {
      totalScore: 88,
      scores: { accuracy: 28, keyPoints: 26, conciseness: 13, opinion: 21 },
      goodPoints: [
        "원인(접근 통제, 암호화 미흡)을 정확히 짚었어요.",
        "의견을 개발자 관점(설계 단계의 보안)으로 연결한 점이 좋아요.",
      ],
      improvements: ["과징금 규모나 유출 건수 같은 수치를 하나 넣으면 더 구체적이에요."],
      missedKeywords: ["과징금"],
      modelSummary:
        "개인정보보호위원회가 해킹으로 고객 정보를 유출한 기업에 과징금을 부과했다. 접근 통제와 암호화 등 안전조치 의무를 지키지 않은 점이 근거가 됐다.",
    },
  },
  {
    id: 1,
    pickDate: "2026-10-17",
    article: {
      id: 77,
      title: "국내 반도체 수출, 3개월 연속 증가 (예시 기사)",
      description:
        "AI 서버용 메모리 수요가 늘면서 반도체 수출이 3개월 연속 증가했다.",
      url: "https://example.com/news/77",
      source: "예시경제",
      category: "경제",
      publishedAt: "2026-10-17T08:00:00+09:00",
    },
    summary: "반도체 수출이 늘었다. AI 때문이다.",
    opinion: "좋은 소식이다.",
    unknownTerms: ["HBM"],
    createdAt: "2026-10-17T23:30:00+09:00",
    feedback: {
      totalScore: 51,
      scores: { accuracy: 22, keyPoints: 14, conciseness: 10, opinion: 5 },
      goodPoints: ["핵심 원인(AI 수요)은 맞게 짚었어요."],
      improvements: [
        "'3개월 연속', 'AI 서버용 메모리'처럼 기사의 구체적인 정보가 빠졌어요.",
        "의견에 이유가 없어요. 왜 좋은 소식인지, 우려할 점은 없는지 써 보세요.",
      ],
      missedKeywords: ["3개월 연속", "AI 서버용 메모리"],
      modelSummary:
        "AI 서버용 고성능 메모리 수요가 늘면서 국내 반도체 수출이 3개월 연속 증가했다.",
      termExplanations: [
        {
          term: "HBM",
          explanation:
            "고대역폭 메모리. 여러 메모리 칩을 쌓아 데이터를 빠르게 주고받게 만든 반도체로, AI 서버에 많이 쓰여요.",
        },
      ],
    },
  },
];

/** 연속 학습일 (1단계에서는 고정값, 2단계에서 기록으로 계산) */
export const streak = 4;

export function getNote(id: number): Note | undefined {
  return notes.find((note) => note.id === id);
}
