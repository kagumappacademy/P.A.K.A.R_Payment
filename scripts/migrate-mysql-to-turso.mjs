import mysql from 'mysql2/promise';
import { createDatabaseClient } from '../lib/turso.ts';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

// Explicit, one-time copy into an EMPTY Turso database. The MySQL source is read-only.
const tables=['settings','modules','admins','registrations','files','file_chunks','rate_limits','audit_logs'];
const source=await mysql.createConnection({host:process.env.MYSQL_HOST||'127.0.0.1',port:Number(process.env.MYSQL_PORT||3306),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE,timezone:'Z',ssl:process.env.MYSQL_SSL==='true'?{rejectUnauthorized:true}:undefined});
const target=createDatabaseClient();
const scalar=value=>value instanceof Date?value.toISOString():value;
const portable=value=>Buffer.isBuffer(value)||value instanceof ArrayBuffer?{base64:Buffer.from(value).toString('base64')}:value;
const canonical=rows=>rows.map(row=>JSON.stringify(Object.fromEntries(Object.entries(row).sort(([a],[b])=>a.localeCompare(b)).map(([key,value])=>[key,portable(scalar(value))])))).sort();
try{
 await target.executeMultiple(await readFile(new URL('../database/schema.sql',import.meta.url),'utf8'));
 for(const table of tables){const r=await target.execute(`SELECT COUNT(*) AS count FROM ${table}`);if(Number(r.rows[0].count))throw new Error(`Target ${table} is not empty; migration stopped without overwriting existing data.`);}
 await source.query("SET time_zone = '+00:00'");await source.beginTransaction();
 const snapshot={};
 for(const table of tables){const [rows]=await source.execute(`SELECT * FROM ${table}`);snapshot[table]=rows.map(row=>Object.fromEntries(Object.entries(row).map(([key,value])=>[key,scalar(value)])));}
 await source.commit();
 await mkdir(new URL('../.local/',import.meta.url),{recursive:true});
 await writeFile(new URL(`../.local/mysql-before-turso-${Date.now()}.json`,import.meta.url),JSON.stringify(snapshot,(_,value)=>value?.type==='Buffer'?{base64:Buffer.from(value.data).toString('base64')}:value));
 const statements=[];
 for(const table of tables)for(const row of snapshot[table]){
  const columns=Object.keys(row);statements.push({sql:`INSERT INTO ${table} (${columns.join(',')}) VALUES (${columns.map(()=>'?').join(',')})`,args:columns.map(key=>row[key])});
 }
 if(statements.length)await target.batch(statements,'write');
 for(const table of tables){const result=await target.execute(`SELECT * FROM ${table}`);assert.deepEqual(canonical(result.rows),canonical(snapshot[table]),`${table} verification failed`);console.log(`${table}: ${result.rows.length} rows verified`);}
 console.log('Migration complete. All copied values verified; original MySQL data unchanged. Private backup saved in .local.');
}finally{await source.end();target.close();}
