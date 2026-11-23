import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sessionSecret} from '../lib/session-secret.ts';

test('canonical secret remains unchanged when both variable names exist',()=>{
 const canonical='canonical-session-secret-value-123456789';
 assert.equal(sessionSecret({SESSION_SECRET:canonical,JWT_SECRET:'different-jwt-secret-value-123456789'}),canonical);
});
test('JWT_SECRET-only deployments can create sessions and participant tokens',()=>{
 const alias='existing-jwt-secret-value-1234567890';
 assert.equal(sessionSecret({JWT_SECRET:alias}),alias);
 assert.equal(sessionSecret({SESSION_SECRET:'',JWT_SECRET:alias}),alias);
});
test('missing and short secrets are rejected for both names',()=>{
 for(const env of [{},{SESSION_SECRET:'short'},{JWT_SECRET:'short'},{SESSION_SECRET:'short',JWT_SECRET:'valid-but-must-not-mask-bad-canonical-secret'}])assert.throws(()=>sessionSecret(env),/at least 32 characters/);
});
