// 로그인 세션 쿠키 (기획서 S-1)
//
// 쿠키 값 = "만료시각.서명". 서명은 SESSION_SECRET으로 만든 HMAC이라,
// 비밀값을 모르는 사람은 만료시각을 고치거나 쿠키를 지어낼 수 없다.
// proxy.ts에서도 쓰기 때문에 Node 전용 기능 없이 Web Crypto만 쓴다.

export const SESSION_COOKIE = "nc_session";
export const SESSION_DAYS = 30;

/** 비밀번호 해시와 세션 비밀값이 둘 다 설정돼 있어야 로그인 기능이 켜진다 */
export function authConfigured(): boolean {
  return Boolean(process.env.APP_PASSWORD_HASH && process.env.SESSION_SECRET);
}

export async function createSessionToken(): Promise<string> {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  return `${expires}.${await sign(String(expires))}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return timingSafeEqual(signature, await sign(expires));
}

async function sign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(process.env.SESSION_SECRET ?? ""),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
  let binary = "";
  for (const byte of signature) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); // base64url
}

/** 글자를 하나씩 끝까지 비교해서, 비교 시간으로 정답을 추측하지 못하게 한다 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
