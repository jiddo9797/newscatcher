# NewsCatcher

AI가 매일 골라준 뉴스 1개를 읽고, 직접 요약하고 의견을 쓰면, AI가 채점하고 첨삭해 주는 개인 뉴스 학습 웹 서비스.

- 기획: [기획서.md](기획서.md)
- 포트폴리오 정리: [포트폴리오_정리.md](포트폴리오_정리.md)

## 기술 스택
Next.js 16 · TypeScript · Tailwind CSS · PostgreSQL (PGlite / Neon) · Drizzle ORM · Gemini API · Vercel

## 진행 상황
- [x] 1단계: 프로젝트 뼈대, 가짜 데이터로 화면 5개 구성
- [x] 2단계: DB 연결 (PGlite), 글 저장과 불러오기
- [x] 3단계: RSS 뉴스 수집 (12개 언론사 피드, 재시도, 실행 기록), 관리 화면
- [x] 4단계: 규칙 기반 뉴스 선정 (이슈 묶기 + 점수), 직접 선택
- [ ] 5단계: AI 채점
- [ ] 6단계: 비밀번호 보호, 배포, 매일 자동 실행

## 내 컴퓨터에서 실행하기
```bash
npm install
npm run db:seed   # 예시 데이터 넣기 (처음 한 번)
npm run dev
```
브라우저에서 http://localhost:3000 접속.

## DB 명령어
| 명령어 | 하는 일 |
|---|---|
| `npm run db:seed` | 데이터를 모두 지우고 예시 데이터를 다시 넣음 (실행한 날이 "오늘") |
| `npm run db:generate` | `src/db/schema.ts`를 고친 뒤 실행 → `drizzle/`에 SQL 파일 생성 (개발 서버를 **다시 켜면** 자동 적용) |
| `npm run db:studio` | 브라우저에서 DB 내용을 표로 보기 |

⚠️ DB 파일은 OneDrive 밖인 `사용자 폴더/.newscatcher/pglite`에 저장돼요. OneDrive 안에 두면 동기화 때문에 DB가 열리지 않아요. (위치를 바꾸려면 환경 변수 `PGLITE_DIR`) PGlite는 한 번에 한 프로그램만 DB를 열 수 있어서, `db:seed`와 `db:studio`는 **개발 서버를 끈 상태에서** 실행해야 해요.

## 폴더 구조
```
src/
├─ app/
│  ├─ (main)/            헤더가 붙는 화면들 (괄호 폴더는 주소에 안 나타남)
│  │  ├─ page.tsx        홈: 오늘의 뉴스            → /
│  │  ├─ write/          요약·의견 작성             → /write
│  │  ├─ notes/[id]/     AI 피드백 보기             → /notes/4
│  │  ├─ history/        내 기록 목록               → /history
│  │  └─ admin/          수집·선정 실행, 점수 순위, 작업 기록 → /admin
│  ├─ login/             로그인                     → /login
│  ├─ not-found.tsx      없는 주소로 들어왔을 때 화면
│  ├─ layout.tsx         모든 화면의 공통 틀 (폰트 등)
│  └─ globals.css        공통 스타일
├─ components/           여러 화면에서 같이 쓰는 UI 조각
├─ jobs/
│  ├─ sources.ts         뉴스를 가져올 언론사 RSS 목록
│  ├─ collect.ts         뉴스 수집 작업 (재시도, 중복 제거, 실행 기록)
│  ├─ rank.ts            선정 알고리즘 (이슈 묶기, 점수 계산) — DB 없이 계산만
│  ├─ keywords.ts        가산점/감점 키워드 사전 (써 보면서 조정)
│  └─ select.ts          오늘의 뉴스 선정 작업 (자동/직접, 실행 기록)
├─ db/
│  ├─ schema.ts          테이블 정의 (기사, 오늘의 뉴스, 내 글, 작업 기록)
│  ├─ index.ts           DB 연결
│  └─ queries.ts         화면에서 쓰는 조회 함수
└─ lib/
   ├─ types.ts           데이터 모양 정의 (기획서 7.4)
   ├─ date.ts            한국 시간 기준 날짜 계산
   └─ format.ts          날짜 표시 도우미 함수
scripts/seed.ts          예시 데이터 넣는 스크립트
drizzle/                 테이블 생성 SQL (자동 생성)
```
