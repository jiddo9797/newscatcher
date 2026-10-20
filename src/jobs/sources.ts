// 뉴스를 가져올 언론사 RSS 목록 (2026-10-21 동작 확인)
// 한 곳이 막혀도 나머지로 수집되도록 분야마다 여러 곳을 둔다.

import type { Category } from "@/lib/types";

export type FeedSource = {
  source: string; // 화면에 보일 언론사 이름
  url: string;
  category: Category;
};

export const FEED_SOURCES: FeedSource[] = [
  // 시사
  { source: "연합뉴스", url: "https://www.yna.co.kr/rss/politics.xml", category: "시사" },
  { source: "연합뉴스", url: "https://www.yna.co.kr/rss/society.xml", category: "시사" },
  { source: "SBS", url: "https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=03", category: "시사" },

  // 경제
  { source: "연합뉴스", url: "https://www.yna.co.kr/rss/economy.xml", category: "경제" },
  { source: "한국경제", url: "https://www.hankyung.com/feed/economy", category: "경제" },
  { source: "한국경제", url: "https://www.hankyung.com/feed/finance", category: "경제" },
  { source: "매일경제", url: "https://www.mk.co.kr/rss/30100041/", category: "경제" },

  // IT
  { source: "전자신문", url: "https://rss.etnews.com/Section901.xml", category: "IT" },
  { source: "ZDNet Korea", url: "https://feeds.feedburner.com/zdkorea", category: "IT" },
  { source: "블로터", url: "https://www.bloter.net/rss/allArticle.xml", category: "IT" },
  { source: "한국경제", url: "https://www.hankyung.com/feed/it", category: "IT" },
  { source: "아이뉴스24", url: "https://www.inews24.com/rss/news_it.xml", category: "IT" },
];
