import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRegistrationReference,withUniqueRegistrationReference} from '../lib/registration-references.ts';
test('new registration numbers use six easy-to-read characters after PKR',()=>{
 for(let i=0;i<20;i++)assert.match(createRegistrationReference(),/^PKR-[2-9A-HJ-NP-Z]{6}$/);
});
test('a competing registration reference is retried without overwriting another registration',async()=>{
 const reserved=new Set(['PKR-AAAAAA']),references=['PKR-AAAAAA','PKR-BBBBBB'],collision=new Error('Reference already reserved');
 const result=await withUniqueRegistrationReference(async reference=>{if(reserved.has(reference))throw collision;reserved.add(reference);return {reference};},async error=>error===collision,()=>references.shift()!);
 assert.equal(result.reference,'PKR-BBBBBB');assert.deepEqual([...reserved],['PKR-AAAAAA','PKR-BBBBBB']);
});
test('database failures unrelated to the reference are not retried',async()=>{
 const failure=new Error('Unavailable'),attempts:string[]=[];
 await assert.rejects(withUniqueRegistrationReference(async reference=>{attempts.push(reference);throw failure;},async()=>false,()=> 'PKR-AAAAAA'),error=>error===failure);
 assert.equal(attempts.length,1);
});
test('exhausted reference collisions fail after five reservations',async()=>{
 const collision=new Error('Duplicate reference');let count=0;
 await assert.rejects(withUniqueRegistrationReference(async()=>{count++;throw collision;},async()=>true,()=> 'PKR-AAAAAA'),error=>error===collision);
 assert.equal(count,5);
});
