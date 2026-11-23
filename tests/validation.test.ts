import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { registrationSchema, settingsSchema, moduleSchema, interfaceTextSchema } from '../lib/validation.ts';
import { readFileSync } from 'node:fs';
const seed=JSON.parse(readFileSync(new URL('../data/seed.json',import.meta.url),'utf8'));
const valid={fullName:'Peserta Ujian',email:'peserta@example.com',phone:'0123456789',institution:'Sekolah Ujian',age:16,guardianName:'Penjaga Ujian',guardianPhone:'0198765432',track:'menengah',moduleIds:['ai-game-builder'],consent:true,idempotencyKey:randomUUID(),expectedTotal:39};
test('minor requires guardian details',()=>assert.equal(registrationSchema.safeParse({...valid,guardianName:'',guardianPhone:''}).success,false));
test('minor registration with guardian is valid',()=>assert.equal(registrationSchema.safeParse(valid).success,true));
test('adult can register without guardian',()=>assert.equal(registrationSchema.safeParse({...valid,age:20,guardianName:'',guardianPhone:''}).success,true));
test('repeated module IDs are rejected',()=>assert.equal(registrationSchema.safeParse({...valid,moduleIds:['ai-game-builder','ai-game-builder']}).success,false));
test('privacy consent is required',()=>assert.equal(registrationSchema.safeParse({...valid,consent:false}).success,false));
test('seed settings satisfy the production schema',()=>assert.equal(settingsSchema.safeParse(seed.settings).success,true));
test('combo discount cannot decrease for larger bundles',()=>assert.equal(settingsSchema.safeParse({...seed.settings,comboThree:5}).success,false));
test('unsafe asset URLs are rejected',()=>assert.equal(moduleSchema.safeParse({...seed.modules[0],poster:'javascript:alert(1)'}).success,false));
test('all ten seeded modules are valid',()=>{for(const mod of seed.modules)assert.equal(moduleSchema.safeParse({...mod,poster:`/images/modules/${mod.id}.svg`}).success,true);});

test('learning mode is no longer required or persisted in registration input',()=>{const parsed=registrationSchema.parse({...valid,learningMode:'Online'});assert.equal('learningMode' in parsed,false);});

test('editable copy supports independent languages and rejects malformed or oversized values',()=>{
 assert.equal(interfaceTextSchema.safeParse({'Daftar sekarang':{bm:'Sertai sekarang',en:'Join now'}}).success,true);
 assert.equal(interfaceTextSchema.safeParse({'Daftar sekarang':{bm:''}}).success,false);
 assert.equal(interfaceTextSchema.safeParse({'Daftar sekarang':{bm:'a'.repeat(6001)}}).success,false);
 assert.equal(interfaceTextSchema.safeParse({'Daftar sekarang':{bm:'Sertai',href:'https://example.com'}}).success,false);
 assert.equal(interfaceTextSchema.safeParse({'Daftar sekarang':'Sertai'}).success,false);
});
