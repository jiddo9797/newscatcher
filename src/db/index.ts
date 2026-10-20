// DB 연결. 개발 중에는 PGlite(프로젝트 폴더 안에서 돌아가는 PostgreSQL)를 쓴다.
// 6단계(배포)에서 Vercel의 PostgreSQL로 바꿀 때 이 파일만 고치면 된다.

import { mkdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle, type PgliteDatabase } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "./schema";

type Db = PgliteDatabase<typeof schema> & { $client: PGlite };

const DATA_DIR = path.join(process.cwd(), ".data", "pglite");
const MIGRATIONS_DIR = path.join(process.cwd(), "drizzle");

// 개발 서버는 코드를 고칠 때마다 파일을 다시 불러온다.
// 그때마다 DB를 새로 열지 않도록 globalThis에 한 번만 만들어 둔다.
const globalForDb = globalThis as unknown as { dbPromise?: Promise<Db> };

async function open(): Promise<Db> {
  mkdirSync(DATA_DIR, { recursive: true });
  const db = drizzle(new PGlite(DATA_DIR), { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS_DIR }); // 아직 적용 안 된 테이블 변경만 적용
  return db;
}

export function getDb(): Promise<Db> {
  globalForDb.dbPromise ??= open();
  return globalForDb.dbPromise;
}

export async function closeDb() {
  if (!globalForDb.dbPromise) return;
  const db = await globalForDb.dbPromise;
  await db.$client.close();
  globalForDb.dbPromise = undefined;
}
