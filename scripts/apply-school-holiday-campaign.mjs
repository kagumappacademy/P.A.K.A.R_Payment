import { createDatabaseClient } from '../lib/turso.ts';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const seed=JSON.parse(await readFile(new URL('../data/seed.json',import.meta.url),'utf8'));
const client=createDatabaseClient(),connection=await client.transaction('write');
try {
  const {rows:records}=await connection.execute('SELECT content FROM settings WHERE id=1');
  if(!records[0]) throw new Error('Run npm run db:setup first.');
  const settings=JSON.parse(records[0].content);
  const {rows:moduleRows}=await connection.execute('SELECT id,content FROM modules');
  const backupDir=new URL('../.local/',import.meta.url);await mkdir(backupDir,{recursive:true});
  await writeFile(new URL(`before-school-holiday-${Date.now()}.json`,backupDir),JSON.stringify({settings,modules:moduleRows.map(m=>JSON.parse(m.content))},null,2));
  for(const key of ['eyebrow','heroTitle','heroHighlight','heroDescription','aboutTitle','aboutDescription','benefits','faqs']) settings[key]=seed.settings[key];
  settings.tracks.menengah={...settings.tracks.menengah,description:seed.settings.tracks.menengah.description};
  await connection.execute({sql:'UPDATE settings SET content=? WHERE id=1',args:[JSON.stringify(settings)]});
  for(const row of moduleRows){
    const mod=JSON.parse(row.content),source=seed.modules.find(m=>m.id===row.id&&m.track==='menengah');
    if(!source||mod.track!=='menengah')continue;
    mod.subtitle=source.subtitle;mod.description=source.description;
    await connection.execute({sql:'UPDATE modules SET content=? WHERE id=?',args:[JSON.stringify(mod),row.id]});
  }
  await connection.commit();
  console.log('School holiday content updated. Existing prices, payments, schedules, uploads and registrations preserved. Backup saved under .local.');
}catch(error){if(!connection.closed)await connection.rollback();throw error;}finally{connection.close();client.close();}
