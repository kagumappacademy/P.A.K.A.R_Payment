import { createClient } from '@libsql/client';

export function createDatabaseClient(env:NodeJS.ProcessEnv=process.env) {
  const url=env.TURSO_DATABASE_URL;
  if(!url)throw new Error('Turso belum dikonfigurasi. Tetapkan TURSO_DATABASE_URL dan jalankan npm run db:setup.');
  const local=url.startsWith('file:');
  if(!local&&!/^(libsql|https):\/\//.test(url))throw new Error('Gunakan URL Turso libsql:// atau https://.');
  if(local&&env.VERCEL)throw new Error('Vercel memerlukan database Turso remote, bukan fail tempatan.');
  if(!local&&!env.TURSO_AUTH_TOKEN)throw new Error('TURSO_AUTH_TOKEN diperlukan untuk database remote.');
  return createClient({url,authToken:local?undefined:env.TURSO_AUTH_TOKEN,intMode:'number'});
}
