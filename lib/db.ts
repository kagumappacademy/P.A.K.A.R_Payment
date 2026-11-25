import type { Client, InValue, Row } from '@libsql/client';
import { createDatabaseClient } from './turso';
import type { Settings, Module, Registration } from './types';
import {defaultCollaborators,defaultCollaboratorTitle,defaultCollaboratorDescription} from './collaborators';
import {trackVisible} from './tracks';
import {moduleSessions} from './module-sessions';
const globalDb = globalThis as unknown as { pakarTurso?: {url:string;client:Client} };
export function db() {
  const url=process.env.TURSO_DATABASE_URL||'';
  if(globalDb.pakarTurso?.url===url&&!globalDb.pakarTurso.client.closed)return globalDb.pakarTurso.client;
  globalDb.pakarTurso?.client.close();
  const client=createDatabaseClient();globalDb.pakarTurso={url,client};return client;
}
interface DatabaseRow {
  id:string;content:string;reference:string;status:string;email:string;access_hash:string;
  created_at:string;updated_at:string;password_hash:string;is_private:number;hits:number;
  name:string;mime:string;data:ArrayBuffer;
}
export async function rows(sql: string, values: InValue[] = []): Promise<DatabaseRow[]> {
  const result = await db().execute(sql, values); return result.rows as unknown as DatabaseRow[];
}
export async function getConfiguration(includeInactive = false, includePrivate = false) {
  const [s, mods] = await Promise.all([rows('SELECT content FROM settings WHERE id=1'), rows('SELECT content FROM modules')]);
  if (!s[0]) throw new Error('Jalankan npm run db:setup dahulu.');
  const settings = JSON.parse(s[0].content) as Settings;
  settings.organizerLogo??='/images/brand/kagum-academy.png';
  settings.collaborators??=defaultCollaborators;
  settings.collaboratorTitle??=defaultCollaboratorTitle;
  settings.collaboratorDescription??=defaultCollaboratorDescription;
  settings.whatsappGroups=includePrivate?{menengah:settings.whatsappGroups?.menengah||'',universiti:settings.whatsappGroups?.universiti||''}:{menengah:'',universiti:''};
  const modules = mods.map(r => {const m=JSON.parse(r.content) as Module;return {...m,cover:m.cover||m.poster,sessions:moduleSessions(m)};}).filter(m => includeInactive || (m.active&&trackVisible(settings,m.track))).sort((a,b) => a.sortOrder-b.sortOrder);
  return { settings, modules };
}
export async function getInterfaceText():Promise<NonNullable<Settings['interfaceText']>> {
  try {const result=await rows('SELECT content FROM settings WHERE id=1');return JSON.parse(result[0]?.content||'{}').interfaceText||{};}
  catch {return {};}
}
export async function getSiteAppearance():Promise<Pick<Settings,'interfaceText'|'visualDesign'>> {
 try {const result=await rows('SELECT content FROM settings WHERE id=1');const s=JSON.parse(result[0]?.content||'{}');return {interfaceText:s.interfaceText||{},visualDesign:s.visualDesign};}catch{return {};}
}
export function parseRegistration(row: Row|DatabaseRow): Registration {
  return { ...JSON.parse(String(row.content)), id:String(row.id), reference:String(row.reference), status:String(row.status),
    createdAt: new Date(String(row.created_at)).toISOString(), updatedAt: new Date(String(row.updated_at)).toISOString() };
}
