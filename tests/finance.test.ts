import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assertFinanceApproval} from '../lib/finance.ts';
import type {Registration} from '../lib/types.ts';
const record={status:'pending',receiptId:'proof-a',total:70.2} as Registration;
test('finance only approves the exact reviewed proof and amount',()=>{assert.doesNotThrow(()=>assertFinanceApproval(record,{id:'x',receiptId:'proof-a',total:70.2}));for(const changed of [{...record,status:'approved'},{...record,status:'awaiting_payment'},{...record,receiptId:'proof-b'},{...record,total:80}])assert.throws(()=>assertFinanceApproval(changed as Registration,{id:'x',receiptId:'proof-a',total:70.2}));});
