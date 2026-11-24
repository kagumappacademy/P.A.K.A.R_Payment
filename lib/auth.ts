import {SignJWT,jwtVerify} from 'jose';
import {cookies} from 'next/headers';
import {createHash} from 'node:crypto';
import {sessionSecret} from './session-secret';
import {db} from './db';
export const SESSION_COOKIE='pakar_admin',FINANCE_COOKIE='pakar_finance';
export type StaffRole='admin'|'finance';
export const credentialVersion=(hash:string)=>createHash('sha256').update(hash).digest('hex');
const key=()=>new TextEncoder().encode(sessionSecret());
export async function createSession(id:string,_email:string,role:StaffRole='admin',version=''){return new SignJWT({role,version}).setProtectedHeader({alg:'HS256'}).setSubject(id).setIssuer('pakar').setAudience('pakar-staff-v2').setIssuedAt().setExpirationTime('8h').sign(key());}
async function session(role:StaffRole){const token=(await cookies()).get(role==='admin'?SESSION_COOKIE:FINANCE_COOKIE)?.value;if(!token)return null;try{const {payload}=await jwtVerify(token,key(),{algorithms:['HS256'],issuer:'pakar',audience:'pakar-staff-v2'});if(payload.role!==role||!payload.sub)return null;const {rows}=await db().execute('SELECT id,role,code_hash FROM staff_accounts WHERE id=? AND role=?',[payload.sub,role]);const account=rows[0];if(!account||payload.version!==credentialVersion(String(account.code_hash)))return null;return {id:String(account.id),role,email:role==='admin'?'Admin':'Finance'};}catch{return null;}}
export const getAdmin=()=>session('admin');
export const getStaff=async()=>await session('admin')||await session('finance');
