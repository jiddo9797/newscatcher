// 배포 빌드 때 Neon DB에 테이블 변경(drizzle/ 폴더의 SQL)을 적용한다.
// package.json의 build 스크립트에서 next build 전에 실행된다.
// 내 컴퓨터(DATABASE_URL 없음)에서는 PGlite가 앱 시작 때 스스로 적용하므로 건너뛴다.

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

async function main() {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) {
    console.log("ℹ️  DATABASE_URL이 없어서 마이그레이션을 건너뜀 (로컬은 PGlite가 자동 적용)");
    return;
  }
  await migrate(drizzle(neon(url)), { migrationsFolder: "drizzle" });
  console.log("✅ Neon DB 마이그레이션 완료");
}

main().catch((error) => {
  console.error("❌ 마이그레이션 실패:", error);
  process.exit(1);
});
