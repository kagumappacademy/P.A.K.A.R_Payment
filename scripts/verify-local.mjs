import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import mysql from 'mysql2/promise';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3000';
if(!['127.0.0.1','localhost'].includes(new URL(base).hostname))throw new Error('This verification runs on localhost only.');
const connection=await mysql.createConnection({host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE});
const fixtureIds=[],fileIds=[];let cookie='',original,originalModule;let checks=0;
async function request(path,{body,method='GET',auth=false,expected=200,headers={}}={}){
 const res=await fetch(base+path,{method,headers:{'x-forwarded-for':'127.0.0.250',...(body instanceof FormData?{}:{'Content-Type':'application/json'}),...(auth?{cookie}:{}),...headers},body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body)});
 assert.equal(res.status,expected,`${method} ${path}: ${await res.clone().text()}`);checks++;
 return res;
}
try{
 original=(await (await request('/api/config')).json());originalModule=original.modules[0];
 await request('/api/admin/registrations',{expected:401});
 await request('/api/admin/settings',{method:'PUT',body:original.settings,expected:403,headers:{origin:'https://another-site.invalid'}});
 await request('/api/auth/login',{method:'POST',body:{email:process.env.ADMIN_EMAIL,password:'wrong-password'},expected:401});
 const login=await request('/api/auth/login',{method:'POST',body:{email:process.env.ADMIN_EMAIL,password:process.env.ADMIN_PASSWORD}});
 cookie=login.headers.get('set-cookie').split(';')[0];assert.ok(cookie.includes('pakar_admin='));assert.ok(login.headers.get('set-cookie').includes('HttpOnly'));
 const input={fullName:'Peserta Ujian Automatik',email:'pakar-test@example.invalid',phone:'0123456789',institution:'Institusi Ujian',age:16,guardianName:'Penjaga Ujian',guardianPhone:'0198765432',track:'menengah',learningMode:'Online',moduleIds:['ai-game-builder','creative-visual','smart-ulangkaji'],consent:true,idempotencyKey:randomUUID(),expectedTotal:93.6};
 await request('/api/registrations',{method:'POST',body:{...input,guardianName:''},expected:400});
 await request('/api/registrations',{method:'POST',body:{...input,moduleIds:['research']},expected:400});
 await request('/api/registrations',{method:'POST',body:{...input,expectedTotal:1},expected:409});
 const created=await (await request('/api/registrations',{method:'POST',body:input,expected:201})).json();fixtureIds.push(created.registration.id);assert.equal(created.registration.total,93.6);assert.equal(created.registration.discountPercent,20);
 const repeated=await (await request('/api/registrations',{method:'POST',body:input})).json();assert.equal(repeated.registration.id,created.registration.id);assert.equal(repeated.accessToken,created.accessToken);
 const [dbRows]=await connection.execute('SELECT content,status FROM registrations WHERE id=?',[created.registration.id]);assert.equal(dbRows.length,1);assert.equal(dbRows[0].status,'awaiting_payment');
 await request('/api/registrations/lookup',{method:'POST',body:{reference:created.registration.reference,email:'wrong@example.invalid'},expected:404});
 const lookedUp=await (await request('/api/registrations/lookup',{method:'POST',body:{reference:created.registration.reference,email:input.email}})).json();assert.equal(lookedUp.registration.total,93.6);
 const badForm=new FormData();badForm.set('file',new Blob(['not an image'],{type:'image/png'}),'unsafe.png');await request('/api/admin/upload',{method:'POST',body:badForm,auth:true,expected:400});
 const tinyPng=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a8V8AAAAASUVORK5CYII=','base64');
 const imageForm=new FormData();imageForm.set('file',new Blob([tinyPng],{type:'image/png'}),'local-test.png');const uploaded=await (await request('/api/admin/upload',{method:'POST',body:imageForm,auth:true})).json();fileIds.push(uploaded.id);
 const temporarySettings={...original.settings,paymentQr:uploaded.url,paymentName:'UJIAN TEMPATAN — BUKAN QR BAYARAN'};
 await request('/api/admin/settings',{method:'PUT',body:temporarySettings,auth:true});assert.equal((await(await request('/api/config')).json()).settings.paymentName,temporarySettings.paymentName);
 const receipt=()=>{const form=new FormData();form.set('registrationId',created.registration.id);form.set('accessToken',created.accessToken);form.set('paymentReference','LOCAL-TEST-ONLY');form.set('file',new Blob([tinyPng],{type:'image/png'}),'local-test-receipt.png');return form;};
 const invalidReceipt=receipt();invalidReceipt.set('accessToken','0'.repeat(64));await request('/api/registrations/receipt',{method:'POST',body:invalidReceipt,expected:403});
 const submitted=await (await request('/api/registrations/receipt',{method:'POST',body:receipt()})).json();fileIds.push(submitted.registration.receiptId);assert.equal(submitted.registration.status,'pending');
 await request(`/api/files/${submitted.registration.receiptId}`,{expected:401});await request(`/api/files/${submitted.registration.receiptId}`,{auth:true});
 await request('/api/admin/review',{method:'POST',body:{id:created.registration.id,status:'rejected',note:''},auth:true,expected:400});
 await request('/api/admin/review',{method:'POST',body:{id:created.registration.id,status:'rejected',note:'Ujian: sila muat naik semula.'},auth:true});
 const resent=await (await request('/api/registrations/receipt',{method:'POST',body:receipt()})).json();fileIds.push(resent.registration.receiptId);assert.equal(resent.registration.status,'pending');
 await request('/api/admin/review',{method:'POST',body:{id:created.registration.id,status:'approved',note:'Ujian tempatan berjaya.'},auth:true});
 await request('/api/admin/review',{method:'POST',body:{id:created.registration.id,status:'approved',note:''},auth:true,expected:409});
 await request('/api/registrations/receipt',{method:'POST',body:receipt(),expected:409});
 const final=await (await request('/api/registrations/lookup',{method:'POST',body:{reference:created.registration.reference,email:input.email}})).json();assert.equal(final.registration.status,'approved');
 await request('/api/admin/modules',{method:'PUT',body:{...originalModule,price:42.5},auth:true});assert.equal((await(await request('/api/config')).json()).modules.find(m=>m.id===originalModule.id).price,42.5);
 const csv=await (await request('/api/admin/export',{auth:true})).text();assert.ok(csv.includes(created.registration.reference));
 console.log(`PASS: ${checks} API checks, MySQL persistence, combo pricing, idempotency, private receipts, rejection/resubmission, approval, module editing and CSV export.`);
}finally{
 if(original){await connection.execute('UPDATE settings SET content=? WHERE id=1',[JSON.stringify(original.settings)]);}
 if(originalModule)await connection.execute('UPDATE modules SET content=? WHERE id=?',[JSON.stringify(originalModule),originalModule.id]);
 for(const id of fixtureIds){await connection.execute('DELETE FROM audit_logs WHERE target=?',[id]);await connection.execute('DELETE FROM files WHERE registration_id=?',[id]);await connection.execute('DELETE FROM registrations WHERE id=?',[id]);}
 for(const id of fileIds)await connection.execute('DELETE FROM files WHERE id=?',[id]);
 for(const scope of ['login','register','lookup','receipt'])await connection.execute('DELETE FROM rate_limits WHERE id=?',[createHash('sha256').update(`${scope}:127.0.0.250`).digest('hex')]);
 await connection.end();console.log('Temporary fixtures removed; original settings restored.');
}
