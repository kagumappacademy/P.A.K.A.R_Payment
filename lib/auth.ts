import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { sessionSecret } from './session-secret';
export const SESSION_COOKIE = 'pakar_admin';
function key() {
  return new TextEncoder().encode(sessionSecret());
}
export async function createSession(id: string, email: string) {
  return new SignJWT({ email }).setProtectedHeader({ alg: 'HS256' }).setSubject(id).setIssuer('pakar').setAudience('pakar-admin').setIssuedAt().setExpirationTime('8h').sign(key());
}
export async function getAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ['HS256'], issuer: 'pakar', audience: 'pakar-admin' });
    return { id: payload.sub!, email: payload.email as string };
  } catch { return null; }
}
