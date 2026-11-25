import {test} from 'node:test';
import assert from 'node:assert/strict';
import {archiveRegistrationBatch} from '../lib/registration-records.ts';
import {emptyRegistrationFilters,filterRegistrations} from '../lib/registration-filters.ts';
import {defaultModuleSessions,sessionKey} from '../lib/module-sessions.ts';
import type {Registration} from '../lib/types.ts';
const session=defaultModuleSessions('ai-game-builder')[0],base={id:'a',fullName:'Ali',email:'a@example.invalid',phone:'0123456789',institution:'SMK',reference:'PKR-AAAAAA',age:18,guardianName:'',guardianPhone:'',subtotal:39,discount:0,discountPercent:0,receiptId:null,receiptName:null,adminNote:'',track:'menengah',status:'approved',total:39,modules:[{id:'ai-game-builder',title:'AI Game Builder',price:39,session}],updatedAt:'v1',createdAt:'2026-11-25T00:00:00.000Z'} as Registration;
test('Admin filters combine module, session, status, track and phone without matching the wrong module',()=>{
 const second={...base,id:'b',status:'pending' as const,modules:[{id:'creative-visual',title:'Creative Visual',price:39,session:{...session,id:'visual'}}]},legacy={...base,id:'c',modules:[{id:'ai-game-builder',title:'AI Game Builder',price:39}]};
 assert.deepEqual(filterRegistrations([base,second,legacy],{...emptyRegistrationFilters,module:'ai-game-builder',session:sessionKey(session),status:'approved',track:'menengah',search:'0123456'}).map(r=>r.id),['a']);
 assert.deepEqual(filterRegistrations([base,second,legacy],{...emptyRegistrationFilters,module:'ai-game-builder',session:'unscheduled'}).map(r=>r.id),['c']);
 assert.equal(filterRegistrations([second],{...emptyRegistrationFilters,module:'ai-game-builder',session:sessionKey(session)}).length,0);
});
test('sorting sessions keeps old unscheduled registrations last and excludes removed registrations',()=>{
 const later={...base,id:'b',fullName:'Zara',modules:[{...base.modules[0],session:{...session,date:'2026-12-29'}}]},legacy={...base,id:'c',modules:[{...base.modules[0],session:undefined}]};
 assert.deepEqual(filterRegistrations([legacy,later,base,{...base,id:'d',deletedAt:'removed'}],{...emptyRegistrationFilters,sort:'session'}).map(r=>r.id),['a','b','c']);
});
test('bulk removal validates every selected version before returning updates and preserves originals',()=>{
 const second={...base,id:'b'},items=[{id:'a',expectedUpdatedAt:'v1'},{id:'b',expectedUpdatedAt:'v1'}],records=[base,second];const removed=archiveRegistrationBatch(records,items,'Duplicate registrations','now');assert.equal(removed.length,2);assert.ok(removed.every(r=>r.deletedAt==='now'&&r.status==='approved'));assert.ok(records.every(r=>!r.deletedAt));
 assert.throws(()=>archiveRegistrationBatch(records,[items[0],{...items[1],expectedUpdatedAt:'stale'}],'Duplicate','now'),/berubah/);assert.ok(records.every(r=>!r.deletedAt));
 assert.throws(()=>archiveRegistrationBatch(records,[items[0],items[0]],'Duplicate','now'));assert.throws(()=>archiveRegistrationBatch(records,[],'Duplicate','now'));assert.throws(()=>archiveRegistrationBatch(records,items,'','now'));assert.throws(()=>archiveRegistrationBatch(records,[...items,{id:'missing',expectedUpdatedAt:'v1'}],'Duplicate','now'));
});
