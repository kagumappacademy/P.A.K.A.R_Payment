import mysql from 'mysql2/promise';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const seed=JSON.parse(await readFile(new URL('../data/seed.json',import.meta.url),'utf8'));
const connection=await mysql.createConnection({host:process.env.MYSQL_HOST||'127.0.0.1',port:Number(process.env.MYSQL_PORT||3306),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE,ssl:process.env.MYSQL_SSL==='true'?{rejectUnauthorized:true}:undefined});
try {
  await connection.beginTransaction();
  const [records]=await connection.execute('SELECT content FROM settings WHERE id=1 FOR UPDATE');
  if(!records[0]) throw new Error('Run npm run db:setup first.');
  const settings=JSON.parse(records[0].content);
  const [moduleRows]=await connection.execute('SELECT id,content FROM modules FOR UPDATE');
  const backupDir=new URL('../.local/',import.meta.url);await mkdir(backupDir,{recursive:true});
  await writeFile(new URL(`before-school-holiday-${Date.now()}.json`,backupDir),JSON.stringify({settings,modules:moduleRows.map(m=>JSON.parse(m.content))},null,2));
  for(const key of ['eyebrow','heroTitle','heroHighlight','heroDescription','aboutTitle','aboutDescription','benefits','faqs']) settings[key]=seed.settings[key];
  settings.tracks.menengah={...settings.tracks.menengah,description:seed.settings.tracks.menengah.description};
  await connection.execute('UPDATE settings SET content=? WHERE id=1',[JSON.stringify(settings)]);
  for(const row of moduleRows){
    const mod=JSON.parse(row.content),source=seed.modules.find(m=>m.id===row.id&&m.track==='menengah');
    if(!source||mod.track!=='menengah')continue;
    mod.subtitle=source.subtitle;mod.description=source.description;
    await connection.execute('UPDATE modules SET content=? WHERE id=?',[JSON.stringify(mod),row.id]);
  }
  await connection.commit();
  console.log('School holiday content updated. Existing prices, payments, schedules, uploads and registrations preserved. Backup saved under .local.');
}catch(error){await connection.rollback();throw error;}finally{await connection.end();}
