import { test } from 'node:test';
import assert from 'node:assert/strict';
import { participantGroup, receiptSnapshot, receiptStatus } from '../lib/receipts.ts';
import { whatsappGroupSchema } from '../lib/validation.ts';
import type { Registration, Settings } from '../lib/types.ts';
const settings={eventName:'P.A.K.A.R',dateLabel:'5-31 Disember 2026',organizer:'Kagum Academy',paymentName:'Penerima Ujian',whatsappGroups:{menengah:'https://chat.whatsapp.com/SchoolGroupTest1234',universiti:'https://chat.whatsapp.com/UniversityTest1234'}} as Settings;
const registration={reference:'PKR-1234567890ABCDEF',track:'menengah',status:'pending',receiptId:'proof',updatedAt:'2026-11-22T08:00:00.000Z'} as Registration;
test('a submitted proof receives a stable registration receipt number',()=>assert.equal(receiptSnapshot(registration,settings).number,'RCT-1234567890ABCDEF'));

test('short registration numbers produce short receipts and retain saved legacy receipt numbers',()=>{
 assert.equal(receiptSnapshot({...registration,reference:'PKR-A7K2M9'},settings).number,'RCT-A7K2M9');
 const saved=receiptSnapshot(registration,settings);
 assert.equal(receiptSnapshot({...registration,reference:'PKR-A7K2M9',paymentReceipt:saved},settings).number,'RCT-1234567890ABCDEF');
});
test('receipt snapshot preserves original payee after settings change',()=>{const paymentReceipt=receiptSnapshot(registration,settings);assert.equal(receiptSnapshot({...registration,paymentReceipt},{...settings,paymentName:'Nama Baharu'}).recipient,'Penerima Ujian');});
test('pending receipt never claims payment is approved',()=>assert.match(receiptStatus('pending').note,/belum disahkan/));
test('approved receipt explicitly reflects admin verification',()=>assert.match(receiptStatus('approved').label,/disahkan/));
test('WhatsApp group is hidden before proof upload',()=>assert.equal(participantGroup({...registration,status:'awaiting_payment',receiptId:null},settings),''));
test('submitted participants receive their own track group only',()=>assert.equal(participantGroup(registration,settings),settings.whatsappGroups.menengah));
test('university participants receive the university group',()=>assert.equal(participantGroup({...registration,track:'universiti'},settings),settings.whatsappGroups.universiti));
test('rejected proofs do not expose the group invite',()=>assert.equal(participantGroup({...registration,status:'rejected'},settings),''));
test('missing invite is handled without inventing a group',()=>assert.equal(participantGroup(registration,{...settings,whatsappGroups:{menengah:'',universiti:''}}),''));
test('only official HTTPS group invite URLs are accepted',()=>{for(const url of ['https://evil.example/invite','javascript:alert(1)','https://chat.whatsapp.com.evil.example/SchoolGroupTest1234','http://chat.whatsapp.com/SchoolGroupTest1234','https://chat.whatsapp.com@evil.example/SchoolGroupTest1234'])assert.equal(whatsappGroupSchema.safeParse(url).success,false);assert.equal(whatsappGroupSchema.safeParse(settings.whatsappGroups.menengah).success,true);});
