# NewsCatcher

AI가 매일 골라준 뉴스 1개를 읽고, 직접 요약하고 의견을 쓰면, AI가 채점하고 첨삭해 주는 개인 뉴스 학습 웹 서비스.

- 기획: [기획서.md](기획서.md)
- 포트폴리오 정리: [포트폴리오_정리.md](포트폴리오_정리.md)

## 기술 스택
Next.js 16 · TypeScript · Tailwind CSS · Supabase(PostgreSQL) · Claude API · Vercel

## 진행 상황
- [x] 1단계: 프로젝트 뼈대, 가짜 데이터로 화면 5개 구성
- [ ] 2단계: Supabase DB 연결
- [ ] 3단계: RSS 뉴스 수집
- [ ] 4단계: AI 뉴스 선정
- [ ] 5단계: AI 채점
- [ ] 6단계: 비밀번호 보호, 배포, 매일 자동 실행

## 내 컴퓨터에서 실행하기
```bash
npm install
npm run dev
```
브라우저에서 http://localhost:3000 접속.

## 폴더 구조
```
src/
├─ app/
│  ├─ (main)/            헤더가 붙는 화면들 (괄호 폴더는 주소에 안 나타남)
│  │  ├─ page.tsx        홈: 오늘의 뉴스            → /
│  │  ├─ write/          요약·의견 작성             → /write
│  │  ├─ notes/[id]/     AI 피드백 보기             → /notes/4
│  │  └─ history/        내 기록 목록               → /history
│  ├─ login/             로그인                     → /login
│  ├─ layout.tsx         모든 화면의 공통 틀 (폰트 등)
│  └─ globals.css        공통 스타일
├─ components/           여러 화면에서 같이 쓰는 UI 조각
└─ lib/
   ├─ types.ts           데이터 모양 정의 (기획서 7.4)
   ├─ mock-data.ts       1단계용 가짜 데이터 (2단계에서 DB로 교체)
   └─ format.ts          날짜 표시 등 도우미 함수
```
