// 채점할 때만 원문 기사 본문을 잠깐 가져온다. (저장하지 않음 — 저작권 원칙)
// 언론사마다 페이지 구조가 달라서 Firefox "읽기 모드"와 같은 Readability로 본문만 뽑는다.

import { Readability } from "@mozilla/readability";
import { JSDOM, VirtualConsole } from "jsdom";

const TIMEOUT_MS = 10_000;
const MAX_CHARS = 4_000; // AI에게 보낼 최대 길이 (길수록 느리고 무료 한도도 빨리 씀. 핵심은 대부분 앞부분에 있음)
const MIN_CHARS = 200; // 이보다 짧으면 본문을 제대로 못 뽑은 것으로 본다

/** 본문을 가져오면 문자열, 실패하면 null */
export async function fetchArticleText(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (NewsCatcher personal reader)" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return null;

    const buffer = await response.arrayBuffer();
    const head = new TextDecoder("ascii").decode(buffer.slice(0, 2000));
    const charset =
      response.headers.get("content-type")?.match(/charset=([\w-]+)/i)?.[1] ??
      head.match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1] ??
      "utf-8";
    let html: string;
    try {
      html = new TextDecoder(charset).decode(buffer);
    } catch {
      html = new TextDecoder("utf-8").decode(buffer);
    }

    // 페이지의 스크립트는 실행하지 않고, CSS 오류 같은 잡음 로그도 숨긴다.
    const dom = new JSDOM(html, { url, virtualConsole: new VirtualConsole() });
    const article = new Readability(dom.window.document).parse();
    const text = article?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    dom.window.close();

    if (text.length < MIN_CHARS) return null;
    return text.length > MAX_CHARS ? `${text.slice(0, MAX_CHARS)}…` : text;
  } catch {
    return null;
  }
}
