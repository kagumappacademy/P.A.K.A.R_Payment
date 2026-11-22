import mysql, { type RowDataPacket } from 'mysql2/promise';
import type { Settings, Module, Registration } from './types';
const globalDb = globalThis as unknown as { pakarPool?: mysql.Pool };
export function db() {
  if (!process.env.MYSQL_DATABASE) throw new Error('MySQL belum dikonfigurasi. Jalankan npm run db:setup.');
  return globalDb.pakarPool ??= mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1', port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE, connectionLimit: 5, waitForConnections: true,
    charset: 'utf8mb4', timezone: 'Z', decimalNumbers: true,
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: true } : undefined
  });
}
export async function rows(sql: string, values: (string | number | boolean | null | Buffer)[] = []): Promise<RowDataPacket[]> {
  const [result] = await db().execute<RowDataPacket[]>(sql, values); return result;
}
export async function getConfiguration(includeInactive = false) {
  const [s, mods] = await Promise.all([rows('SELECT content FROM settings WHERE id=1'), rows('SELECT content FROM modules')]);
  if (!s[0]) throw new Error('Jalankan npm run db:setup dahulu.');
  const settings = JSON.parse(s[0].content) as Settings;
  const modules = mods.map(r => JSON.parse(r.content) as Module).filter(m => includeInactive || m.active).sort((a,b) => a.sortOrder-b.sortOrder);
  return { settings, modules };
}
export function parseRegistration(row: RowDataPacket): Registration {
  return { ...JSON.parse(row.content), id: row.id, reference: row.reference, status: row.status,
    createdAt: new Date(row.created_at).toISOString(), updatedAt: new Date(row.updated_at).toISOString() };
}
