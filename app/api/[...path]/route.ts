import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { z, ZodError } from 'zod';
import { db, getConfiguration, parseRegistration, rows } from '@/lib/db';
import { createSession, getAdmin, SESSION_COOKIE } from '@/lib/auth';
import { sessionSecret } from '@/lib/session-secret';
import { registrationSchema, moduleSchema, settingsSchema, interfaceTextSchema, visualDesignSchema } from '@/lib/validation';
import { calculatePrice } from '@/lib/pricing';
import { readFile, saveFile } from '@/lib/files';
import { participantGroup, receiptSnapshot } from '@/lib/receipts';
import type { Registration } from '@/lib/types';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ path: string[] }> };
class HttpError extends Error { constructor(public status:number,message:string) {super(message);} }
const hash = (s:string) => createHash('sha256').update(s).digest('hex');
const accessToken = (id:string) => createHmac('sha256', sessionSecret()).update(`registration:${id}`).digest('hex');
const reply = (data:unknown,status=200) => NextResponse.json(data,{status,headers:{'Cache-Control':'no-store'}});
async function rateLimit(request:NextRequest,scope:string,limit:number,windowMs=15*60*1000) {
  const ip=request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  const id=hash(`${scope}:${ip}`), now=Date.now();
  await db().execute('INSERT INTO rate_limits (id,hits,expires) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET hits=CASE WHEN expires<? THEN 1 ELSE hits+1 END, expires=CASE WHEN expires<? THEN ? ELSE expires END',[id,now+windowMs,now,now,now+windowMs]);
  if(Number((await rows('SELECT hits FROM rate_limits WHERE id=?',[id]))[0]?.hits)>limit) throw new HttpError(429,'Terlalu banyak cubaan. Sila cuba semula selepas 15 minit.');
}
async function requireAdmin() { const admin=await getAdmin(); if(!admin)throw new HttpError(401,'Sila log masuk sebagai admin.');return admin; }
async function audit(adminId:string,action:string,target:string) { await db().execute('INSERT INTO audit_logs (id,admin_id,action,target) VALUES (?,?,?,?)',[randomUUID(),adminId,action,target]); }
function verifyOrigin(request:NextRequest) {
  const origin=request.headers.get('origin');
  const requestUrl=new URL(request.url);
  const host=request.headers.get('host');
  const allowed=[requestUrl.origin,process.env.APP_URL,host?`${requestUrl.protocol}//${host}`:null].filter(Boolean);
  if(process.env.NODE_ENV!=='production') {
    const port=requestUrl.port?`:${requestUrl.port}`:'';
    allowed.push(`http://127.0.0.1${port}`,`http://localhost${port}`);
  }
  if(origin && !allowed.includes(origin))throw new HttpError(403,'Permintaan dari laman lain tidak dibenarkan.');
}
async function handle(request:NextRequest,context:Context) {
 try {
  const path=(await context.params).path; const route=path.join('/'); const method=request.method;
  if(method!=='GET') verifyOrigin(request);
  const size=Number(request.headers.get('content-length')||0);
  if(size>3.5*1024*1024)throw new HttpError(413,'Fail terlalu besar. Had muat naik ialah 3MB.');
  if(route==='config' && method==='GET') return reply(await getConfiguration());
  if(route==='auth/login' && method==='POST') {
    await rateLimit(request,'login',10);
    const input=z.object({email:z.email().max(190),password:z.string().min(1).max(200)}).parse(await request.json());
    const admin=(await rows('SELECT * FROM admins WHERE email=?',[input.email.toLowerCase()]))[0];
    const valid=await compare(input.password,admin?.password_hash || '$2b$12$04JBK5rRY35/5sYSu2Xk9O8kCmAn.zvPYJ84HDmj04zK0fGWJPgZi');
    if(!admin || !valid)throw new HttpError(401,'E-mel atau kata laluan tidak tepat.');
    const response=reply({ok:true});
    response.cookies.set(SESSION_COOKIE,await createSession(admin.id,admin.email),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:8*60*60});
    return response;
  }
  if(route==='auth/logout' && method==='POST') { const response=reply({ok:true});response.cookies.delete(SESSION_COOKIE);return response; }
  if(route==='registrations' && method==='POST') {
    await rateLimit(request,'register',20);
    const input=registrationSchema.parse(await request.json());
    const token=accessToken(input.idempotencyKey);
    const existing=(await rows('SELECT * FROM registrations WHERE id=?',[input.idempotencyKey]))[0];
    if(existing) {
      if(existing.email!==input.email)throw new HttpError(409,'Pendaftaran ini sudah wujud.');
      return reply({registration:parseRegistration(existing),accessToken:token});
    }
    const {settings,modules}=await getConfiguration();
    if(!settings.registrationOpen)throw new HttpError(400,'Pendaftaran program ditutup buat sementara waktu.');
    const available=modules.filter(m=>m.track===input.track);
    const selected=available.filter(m=>input.moduleIds.includes(m.id));
    if(selected.length!==input.moduleIds.length)throw new HttpError(400,'Modul tidak tersedia atau tidak berada dalam track yang dipilih.');
    const price=calculatePrice(selected.map(m=>m.price),settings,available.length);
    if(Math.abs(input.expectedTotal-price.total)>0.005) throw new HttpError(409,'Harga modul telah dikemas kini. Muat semula halaman untuk melihat jumlah terkini.');
    const id=input.idempotencyKey,reference=`PKR-${randomBytes(8).toString('hex').toUpperCase()}`;
    const {moduleIds: _moduleIds,consent:_consent,idempotencyKey:_key,expectedTotal:_total,...details}=input;
    const registration={...details,id,reference,modules:selected.map(m=>({id:m.id,title:m.title,price:m.price})),...price,status:'awaiting_payment',receiptId:null,receiptName:null,adminNote:'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    try { await db().execute('INSERT INTO registrations (id,reference,access_hash,email,status,content) VALUES (?,?,?,?,?,?)',[id,reference,hash(token),input.email,'awaiting_payment',JSON.stringify(registration)]); }
    catch(error) {
      if(!String((error as {code?:string}).code).startsWith('SQLITE_CONSTRAINT')) throw error;
      const row=(await rows('SELECT * FROM registrations WHERE id=?',[id]))[0];
      if(!row || row.email!==input.email)throw new HttpError(409,'Sila cuba semula.');
      return reply({registration:parseRegistration(row),accessToken:token});
    }
    return reply({registration,accessToken:token},201);
  }
  if(route==='registrations/lookup' && method==='POST') {
    await rateLimit(request,'lookup',20);
    const {reference,email}=z.object({reference:z.string().max(40),email:z.email().max(190)}).parse(await request.json());
    const row=(await rows('SELECT * FROM registrations WHERE reference=? AND email=?',[reference.trim().toUpperCase(),email.toLowerCase().trim()]))[0];
    if(!row)throw new HttpError(404,'Pendaftaran tidak ditemui. Semak nombor pendaftaran dan e-mel anda.');
    return reply({registration:parseRegistration(row),accessToken:accessToken(row.id)});
  }
  if(route==='registrations/receipt' && method==='POST') {
    await rateLimit(request,'receipt',30);
    const form=await request.formData();
    const id=z.uuid().parse(form.get('registrationId')); const token=z.string().length(64).parse(form.get('accessToken'));
    const row=(await rows('SELECT * FROM registrations WHERE id=?',[id]))[0];
    if(!row || !timingSafeEqual(Buffer.from(row.access_hash),Buffer.from(hash(token))))throw new HttpError(403,'Akses pendaftaran tidak sah.');
    if(!['awaiting_payment','rejected'].includes(row.status))throw new HttpError(409,'Resit telah dihantar dan sedang atau telah disahkan.');
    const {settings}=await getConfiguration();
    if(!settings.paymentQr || !settings.paymentName)throw new HttpError(400,'QR pembayaran rasmi belum tersedia. Sila hubungi penganjur.');
    const file=form.get('file');if(!(file instanceof File))throw new HttpError(400,'Sila pilih fail resit.');
    const uploaded=await saveFile(file,true,id);
    const registration=parseRegistration(row);
    const submittedAt=new Date().toISOString();
    const paymentReceipt=receiptSnapshot({...registration,paymentSubmittedAt:submittedAt},settings);
    const updated={...registration,receiptId:uploaded.id,receiptName:uploaded.name,receiptMime:uploaded.mime,paymentReceipt,paymentSubmittedAt:submittedAt,paymentApprovedAt:undefined,updatedAt:submittedAt,adminNote:'',status:'pending'};
    const result=await db().execute('UPDATE registrations SET content=?,status=? WHERE id=? AND status IN (?,?)',[JSON.stringify(updated),'pending',id,'awaiting_payment','rejected']);
    if(!result.rowsAffected) { await db().execute('DELETE FROM files WHERE id=?',[uploaded.id]);throw new HttpError(409,'Status telah berubah. Sila semak semula pendaftaran.'); }
    return reply({registration:updated});
  }
  if(route==='registrations/payment-receipt' && method==='POST') {
    await rateLimit(request,'document',60);
    const input=z.object({id:z.uuid(),accessToken:z.string().length(64).optional(),format:z.enum(['json','pdf']).default('json'),language:z.enum(['bm','en']).default('bm')}).parse(await request.json());
    const row=(await rows('SELECT * FROM registrations WHERE id=?',[input.id]))[0];
    const admin=await getAdmin();
    if(!row || (!admin && (!input.accessToken || !timingSafeEqual(Buffer.from(row.access_hash),Buffer.from(hash(input.accessToken))))))throw new HttpError(403,'Akses resit pendaftaran tidak sah.');
    const registration=parseRegistration(row);
    if(!registration.receiptId || registration.status==='awaiting_payment')throw new HttpError(409,'Resit pendaftaran tersedia selepas bukti pembayaran dihantar.');
    const {settings}=await getConfiguration(false,true);
    const receipt=receiptSnapshot(registration,settings);
    if(input.format==='pdf') {
      const {createPaymentReceiptPdf}=await import('@/lib/receipt-pdf');
      const pdf=await createPaymentReceiptPdf(registration,settings,input.language);
      return new NextResponse(new Uint8Array(pdf),{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${receipt.number}.pdf"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
    }
    return reply({receipt,whatsappGroupUrl:participantGroup(registration,settings)});
  }
  if(path[0]==='files' && path[1] && method==='GET') {
    const id=z.uuid().parse(path[1]);
    const meta=(await rows('SELECT is_private FROM files WHERE id=?',[id]))[0];
    if(!meta)throw new HttpError(404,'Fail tidak ditemui.');
    if(meta.is_private)await requireAdmin();
    const file=await readFile(id);if(!file)throw new HttpError(404,'Fail tidak ditemui.');
    return new NextResponse(new Uint8Array(file.buffer),{headers:{'Content-Type':file.mime,'Content-Length':String(file.buffer.length),'Content-Disposition':`inline; filename*=UTF-8''${encodeURIComponent(file.name)}`,'Cache-Control':meta.is_private?'private, no-store':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});
  }
  if(path[0]==='admin') {
    const admin=await requireAdmin();
    if(route==='admin/config' && method==='GET')return reply(await getConfiguration(true,true));
    if(route==='admin/registrations' && method==='GET') return reply({registrations:(await rows('SELECT * FROM registrations ORDER BY created_at DESC')).map(parseRegistration)});
    if(route==='admin/review' && method==='POST') {
      const input=z.object({id:z.uuid(),status:z.enum(['approved','rejected']),note:z.string().trim().max(2000)}).parse(await request.json());
      if(input.status==='rejected' && !input.note)throw new HttpError(400,'Sila nyatakan sebab resit ditolak.');
      const connection=await db().transaction('write');
      try {
        const {rows:matches}=await connection.execute({sql:'SELECT * FROM registrations WHERE id=?',args:[input.id]});
        const row=matches[0];if(!row)throw new HttpError(404,'Pendaftaran tidak ditemui.');
        const registration=parseRegistration(row);
        if(!registration.receiptId || row.status!=='pending')throw new HttpError(409,'Hanya resit yang menunggu semakan boleh disahkan atau ditolak.');
        await connection.execute({sql:'UPDATE registrations SET status=?,content=? WHERE id=?',args:[input.status,JSON.stringify({...registration,status:input.status,adminNote:input.note,paymentApprovedAt:input.status==='approved'?new Date().toISOString():undefined}),input.id]});
        await connection.execute({sql:'INSERT INTO audit_logs (id,admin_id,action,target) VALUES (?,?,?,?)',args:[randomUUID(),admin.id,`receipt.${input.status}`,input.id]});
        await connection.commit();
      } catch(error) {if(!connection.closed)await connection.rollback();throw error;} finally {connection.close();}
      return reply({ok:true});
    }
    if(route==='admin/visual-design' && method==='PUT') {
      const value=z.object({interfaceText:interfaceTextSchema,visualDesign:visualDesignSchema}).strict().parse(await request.json());
      await db().batch([
        {sql:"UPDATE settings SET content=json_set(content,'$.interfaceText',json(?),'$.visualDesign',json(?)) WHERE id=1",args:[JSON.stringify(value.interfaceText),JSON.stringify(value.visualDesign)]},
        {sql:'INSERT INTO audit_logs (id,admin_id,action,target) VALUES (?,?,?,?)',args:[randomUUID(),admin.id,'visual-design.update','1']}
      ],'write');return reply({ok:true});
    }
    if(route==='admin/interface-text' && method==='PUT') {
      const copy=interfaceTextSchema.parse(await request.json());
      await db().batch([
        {sql:"UPDATE settings SET content=json_set(content,'$.interfaceText',json(?)) WHERE id=1",args:[JSON.stringify(copy)]},
        {sql:'INSERT INTO audit_logs (id,admin_id,action,target) VALUES (?,?,?,?)',args:[randomUUID(),admin.id,'interface-text.update','1']}
      ],'write');
      return reply({ok:true});
    }
    if(route==='admin/settings' && method==='PUT') {
      const input=await request.json(),settings=settingsSchema.parse(input);
      if(!Object.hasOwn(input,'visualDesign')||!Object.hasOwn(input,'interfaceText')){
        const current=JSON.parse((await rows('SELECT content FROM settings WHERE id=1'))[0].content);
        if(!Object.hasOwn(input,'visualDesign'))settings.visualDesign=current.visualDesign;
        if(!Object.hasOwn(input,'interfaceText'))settings.interfaceText=current.interfaceText||{};
      }
      if(settings.paymentQr && !settings.paymentName)throw new HttpError(400,'Nama penerima diperlukan bersama QR pembayaran.');
      await db().execute('UPDATE settings SET content=? WHERE id=1',[JSON.stringify(settings)]);
      await audit(admin.id,'settings.update','1');return reply({ok:true});
    }
    if(route==='admin/modules' && method==='PUT') {
      const mod=moduleSchema.parse(await request.json());
      await db().execute('INSERT INTO modules (id,content) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET content=excluded.content',[mod.id,JSON.stringify(mod)]);
      await audit(admin.id,'module.update',mod.id);return reply({ok:true});
    }
    if(route==='admin/upload' && method==='POST') {
      const form=await request.formData();const file=form.get('file');
      if(!(file instanceof File))throw new HttpError(400,'Sila pilih imej.');
      return reply(await saveFile(file,false));
    }
    if(route==='admin/password' && method==='PUT') {
      const input=z.object({currentPassword:z.string().max(200),newPassword:z.string().min(12).max(200)}).parse(await request.json());
      const row=(await rows('SELECT password_hash FROM admins WHERE id=?',[admin.id]))[0];
      if(!row || !await compare(input.currentPassword,row.password_hash))throw new HttpError(400,'Kata laluan semasa tidak tepat.');
      const {hash:passwordHash}=await import('bcryptjs');
      await db().execute('UPDATE admins SET password_hash=? WHERE id=?',[await passwordHash(input.newPassword,12),admin.id]);
      await audit(admin.id,'password.update',admin.id);return reply({ok:true});
    }
    if(route==='admin/export' && method==='GET') {
      const records=(await rows('SELECT * FROM registrations ORDER BY created_at DESC')).map(parseRegistration);
      const escape=(v:unknown)=>`"${String(v??'').replace(/^[=+@\-\t\r]/,"'$&").replace(/"/g,'""')}"`;
      const csv=[['Rujukan','Nama','E-mel','Telefon','Institusi','Umur','Penjaga','Telefon penjaga','Track','Modul','Jumlah (RM)','Diskaun (RM)','Status','Nombor resit pendaftaran','Tarikh hantar bukti','Tarikh pengesahan','Nota admin','Tarikh daftar'],...records.map(r=>[r.reference,r.fullName,r.email,r.phone,r.institution,r.age,r.guardianName,r.guardianPhone,r.track,r.modules.map(m=>m.title).join('; '),r.total,r.discount,r.status,r.paymentReceipt?.number||'',r.paymentSubmittedAt||'',r.paymentApprovedAt||'',r.adminNote,r.createdAt])].map(line=>line.map(escape).join(',')).join('\r\n');
      return new NextResponse('\uFEFF'+csv,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="pakar-pendaftaran.csv"','Cache-Control':'no-store'}});
    }
  }
  throw new HttpError(404,'Halaman API tidak ditemui.');
 } catch(error) {
   if(error instanceof HttpError)return reply({error:error.message},error.status);
   if(error instanceof ZodError)return reply({error:error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join(' · ')},400);
   if(error instanceof Error && /Saiz fail|Format fail/.test(error.message))return reply({error:error.message},400);
   console.error('P.A.K.A.R API:',error instanceof Error?error.message:'Unknown error');
   return reply({error:'Permintaan tidak dapat diproses. Sila cuba semula atau hubungi penganjur.'},500);
 }
}
export {handle as GET,handle as POST,handle as PUT};
