// 비밀 값 준비: npm run setup-secrets
//
// 1. 로그인 비밀번호를 입력받아 해시(APP_PASSWORD_HASH)로 바꾼다. 비밀번호 원문은 어디에도 저장하지 않는다.
// 2. 로그인 쿠키 서명용 SESSION_SECRET, 자동 실행 보호용 CRON_SECRET을 무작위로 만든다.
// 3. 세 값을 .env.local에 저장한다. (이미 있으면 바꿈)
// 배포할 때는 .env.local의 같은 값을 Vercel 환경 변수에 넣는다.

import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import readline from "node:readline";
import { hashPassword } from "../src/lib/password";

const ENV_FILE = ".env.local";

/** 입력한 글자가 화면에 보이지 않게 비밀번호 받기 */
function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const output = rl as unknown as { _writeToOutput: (s: string) => void };
    process.stdout.write(question);
    output._writeToOutput = (s: string) => {
      if (s.includes("\n") || s.includes("\r")) process.stdout.write("\n");
    };
    rl.question("", (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function setEnv(content: string, key: string, value: string): string {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  return pattern.test(content) ? content.replace(pattern, line) : `${content.trimEnd()}\n${line}\n`;
}

async function main() {
  const password = await askHidden("사용할 로그인 비밀번호 (8자 이상): ");
  if (password.length < 8) {
    console.log("❌ 8자 이상으로 정해 주세요.");
    process.exit(1);
  }
  const confirm = await askHidden("한 번 더 입력: ");
  if (password !== confirm) {
    console.log("❌ 두 비밀번호가 달라요.");
    process.exit(1);
  }

  let env = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf-8") : "";
  env = setEnv(env, "APP_PASSWORD_HASH", await hashPassword(password));
  env = setEnv(env, "SESSION_SECRET", randomBytes(32).toString("base64url"));
  env = setEnv(env, "CRON_SECRET", randomBytes(32).toString("base64url"));
  writeFileSync(ENV_FILE, env, "utf-8");

  console.log(`\n✅ ${ENV_FILE}에 APP_PASSWORD_HASH, SESSION_SECRET, CRON_SECRET을 저장했어요.`);
  console.log("   개발 서버를 다시 켜면 로그인이 필요해져요.");
  console.log("   배포할 때 이 세 값과 GEMINI_API_KEY를 Vercel 환경 변수에 그대로 넣으면 돼요.");
}

main();
