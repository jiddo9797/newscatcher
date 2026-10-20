// 비밀번호 해시 (기획서 S-1)
// 비밀번호 원문은 어디에도 저장하지 않는다. scrypt로 만든 해시만 환경 변수 APP_PASSWORD_HASH에 둔다.
// scrypt는 일부러 계산이 오래 걸리게 만든 함수라, 해시가 유출돼도 하나씩 대입해 보는 공격이 어렵다.
// 형식: "scrypt:소금(hex):해시(hex)"  ($는 .env 파일에서 변수로 해석되므로 쓰지 않음)

import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;
const KEY_LENGTH = 32;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, saltHex, hashHex] = stored.split(":");
  if (algorithm !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}
