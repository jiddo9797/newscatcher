import os from "node:os";
import path from "node:path";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  driver: "pglite",
  // src/db/index.ts의 DATA_DIR과 같은 위치
  dbCredentials: { url: process.env.PGLITE_DIR ?? path.join(os.homedir(), ".newscatcher", "pglite") },
});
