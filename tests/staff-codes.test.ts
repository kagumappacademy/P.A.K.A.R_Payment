import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hash} from 'bcryptjs';
import {matchStaffCode} from '../lib/staff-codes.ts';
const accounts=await Promise.all([{id:'admin-id',role:'admin' as const,code:'194836'},{id:'finance-id',role:'finance' as const,code:'002541'}].map(async({code,...a})=>({...a,code_hash:await hash(code,4)})));
test('one login identifies the role from its code and preserves leading zeroes',async()=>{assert.equal((await matchStaffCode('194836',accounts))?.role,'admin');assert.equal((await matchStaffCode('002541',accounts))?.role,'finance');});
test('incorrect or malformed staff codes do not select a role',async()=>{for(const code of ['854019','2541','1948367','abcdef'])assert.equal(await matchStaffCode(code,accounts),null);});
test('ambiguous shared codes never grant either role',async()=>{assert.equal(await matchStaffCode('194836',[accounts[0],{...accounts[1],code_hash:accounts[0].code_hash}]),null);});
