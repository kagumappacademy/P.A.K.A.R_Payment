import { createDatabaseClient } from '../lib/turso.ts';
import { sessionSecret } from '../lib/session-secret.ts';
import { hash } from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
const required = ['TURSO_DATABASE_URL','ADMIN_EMAIL','ADMIN_PASSWORD'];
for (const key of required) if (!process.env[key]) throw new Error(`Missing ${key}`);
sessionSecret();
if (process.env.ADMIN_PASSWORD.length < 12) throw new Error('Use an admin password of at least 12 characters.');
const connection = createDatabaseClient();
try {
  await connection.executeMultiple(await readFile(new URL('../database/schema.sql', import.meta.url), 'utf8'));
  const seed = JSON.parse(await readFile(new URL('../data/seed.json', import.meta.url), 'utf8'));
  await connection.execute('INSERT OR IGNORE INTO settings (id, content) VALUES (1, ?)', [JSON.stringify(seed.settings)]);
  for (const mod of seed.modules) {
    mod.poster = `/images/modules/${mod.id}.svg`;
    await connection.execute('INSERT OR IGNORE INTO modules (id, content) VALUES (?, ?)', [mod.id, JSON.stringify(mod)]);
  }
  await connection.execute('INSERT OR IGNORE INTO admins (id, email, password_hash) VALUES (?, ?, ?)', [randomUUID(), process.env.ADMIN_EMAIL.toLowerCase(), await hash(process.env.ADMIN_PASSWORD, 12)]);
  console.log('Database ready. Existing content and accounts preserved.');
} finally { connection.close(); }
