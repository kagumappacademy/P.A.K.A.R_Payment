import { randomUUID } from 'node:crypto';
import { db, rows } from './db';
export const MAX_FILE_SIZE = 3 * 1024 * 1024;
export function detectMime(buffer: Buffer) {
  if(buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'image/png';
  if(buffer[0]===255 && buffer[1]===216 && buffer[2]===255) return 'image/jpeg';
  if(buffer.subarray(0,4).toString()==='RIFF' && buffer.subarray(8,12).toString()==='WEBP') return 'image/webp';
  if(buffer.subarray(0,5).toString()==='%PDF-') return 'application/pdf';
  return null;
}
export async function saveFile(file: File, isPrivate: boolean, registrationId?: string) {
  if(!file.size || file.size > MAX_FILE_SIZE) throw new Error('Saiz fail mesti antara 1 bait hingga 3MB.');
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = detectMime(buffer);
  if(!mime || (!isPrivate && mime==='application/pdf')) throw new Error('Format fail tidak sah. Gunakan PNG, JPG, WEBP atau PDF untuk resit.');
  const id = randomUUID(); const connection = await db().getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute('INSERT INTO files (id,name,mime,is_private,registration_id) VALUES (?,?,?,?,?)', [id,file.name.replace(/[\r\n"\\]/g,'').slice(0,200),mime,isPrivate,registrationId||null]);
    for(let pos=0,index=0; pos<buffer.length;pos+=256*1024,index++) await connection.execute('INSERT INTO file_chunks (file_id,chunk_index,data) VALUES (?,?,?)',[id,index,buffer.subarray(pos,pos+256*1024)]);
    await connection.commit();
    return { id, name:file.name.slice(0,200), mime, url:`/api/files/${id}` };
  } catch(error) { await connection.rollback();throw error; }
  finally { connection.release(); }
}
export async function readFile(id: string) {
  const meta = (await rows('SELECT * FROM files WHERE id=?',[id]))[0];
  if(!meta) return null;
  const chunks = await rows('SELECT data FROM file_chunks WHERE file_id=? ORDER BY chunk_index',[id]);
  return { name:String(meta.name), mime:String(meta.mime), buffer:Buffer.concat(chunks.map(c=>c.data)) };
}
