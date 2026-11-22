import mysql from 'mysql2/promise';
import { hash } from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
const required = ['MYSQL_USER','MYSQL_DATABASE','SESSION_SECRET','ADMIN_EMAIL','ADMIN_PASSWORD'];
for (const key of required) if (!process.env[key]) throw new Error(`Missing ${key}`);
if (process.env.ADMIN_PASSWORD.length < 12 || process.env.SESSION_SECRET.length < 32) throw new Error('Use an admin password of at least 12 characters and session secret of at least 32.');
const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST || '127.0.0.1', port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE, ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  multipleStatements: true
});
try {
  await connection.query(await readFile(new URL('../database/schema.sql', import.meta.url), 'utf8'));
  const seed = JSON.parse(await readFile(new URL('../data/seed.json', import.meta.url), 'utf8'));
  await connection.execute('INSERT IGNORE INTO settings (id, content) VALUES (1, ?)', [JSON.stringify(seed.settings)]);
  for (const mod of seed.modules) {
    mod.poster = `/images/modules/${mod.id}.svg`;
    await connection.execute('INSERT IGNORE INTO modules (id, content) VALUES (?, ?)', [mod.id, JSON.stringify(mod)]);
  }
  await connection.execute('INSERT IGNORE INTO admins (id, email, password_hash) VALUES (?, ?, ?)', [randomUUID(), process.env.ADMIN_EMAIL.toLowerCase(), await hash(process.env.ADMIN_PASSWORD, 12)]);
  console.log('Database ready. Existing content and accounts preserved.');
} finally { await connection.end(); }
