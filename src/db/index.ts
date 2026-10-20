// DB 연결
// - 배포(Vercel): 환경 변수 DATABASE_URL이 있으면 Neon(PostgreSQL)에 연결한다.
//   테이블 변경(마이그레이션)은 배포 빌드 때 scripts/migrate.ts가 적용한다.
// - 내 컴퓨터: DATABASE_URL이 없으면 PGlite(내 컴퓨터에서 바로 돌아가는 PostgreSQL)를 쓰고,
//   앱이 켜질 때 마이그레이션을 자동 적용한다.
// 둘 다 PostgreSQL이라 나머지 코드는 어느 쪽인지 신경 쓰지 않아도 된다.

import { mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { PGlite } from "@electric-sql/pglite";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

// DB 파일은 OneDrive 밖(사용자 폴더\.newscatcher\pglite)에 둔다.
// OneDrive 폴더 안에 두면 동기화 때문에 파일이 읽기 전용으로 바뀌어 DB가 열리지 않는다.
const DATA_DIR = process.env.PGLITE_DIR ?? path.join(os.homedir(), ".newscatcher", "pglite");
const MIGRATIONS_DIR = path.join(process.cwd(), "drizzle");

// 개발 서버는 코드를 고칠 때마다 파일을 다시 불러온다.
// 그때마다 DB를 새로 열지 않도록 globalThis에 한 번만 만들어 둔다.
const globalForDb = globalThis as unknown as { dbPromise?: Promise<Db>; pglite?: PGlite };

async function open(): Promise<Db> {
  if (DATABASE_URL) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    return drizzle(neon(DATABASE_URL), { schema }) as unknown as Db;
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  mkdirSync(DATA_DIR, { recursive: true });
  const client = new PGlite(DATA_DIR);
  globalForDb.pglite = client;
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS_DIR }); // 아직 적용 안 된 테이블 변경만 적용
  return db as unknown as Db;
}

export function getDb(): Promise<Db> {
  globalForDb.dbPromise ??= open();
  return globalForDb.dbPromise;
}

/** 스크립트가 끝날 때 PGlite를 닫는다. (Neon은 요청마다 연결이라 닫을 것이 없음) */
export async function closeDb() {
  await globalForDb.pglite?.close();
  globalForDb.pglite = undefined;
  globalForDb.dbPromise = undefined;
}

/** DELETE/UPDATE로 바뀐 줄 수 (드라이버마다 이름이 달라서 맞춰 줌) */
export function affectedRows(result: unknown): number {
  const r = result as { affectedRows?: number; rowCount?: number };
  return r.affectedRows ?? r.rowCount ?? 0;
}
