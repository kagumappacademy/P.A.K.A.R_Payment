import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaultModuleSessions,missingSessionModules,moduleSessions,participantsBySession,selectModuleSessions,sessionKey,sessionText} from '../lib/module-sessions.ts';
import {moduleSessionsSchema,registrationSchema} from '../lib/validation.ts';
import type {Module,Registration} from '../lib/types.ts';
const make=(id:string)=>({id,title:id,track:'menengah',price:39,sessions:defaultModuleSessions(id)}) as Module;
test('the supplied December calendar contains four sessions for each of six school modules',()=>{
 const ids=['ai-game-builder','creative-visual','smart-ulangkaji','video-basic','produktiviti','slaid'];let count=0;
 for(const id of ids){const sessions=defaultModuleSessions(id);assert.equal(sessions.length,4);assert.equal(moduleSessionsSchema.safeParse(sessions).success,true);count+=sessions.length;}
 assert.equal(count,24);assert.deepEqual(defaultModuleSessions('ai-game-builder').map(s=>s.date),['2026-12-10','2026-12-16','2026-12-23','2026-12-29']);
 assert.equal(defaultModuleSessions('produktiviti')[1].startTime,'14:00');assert.equal(defaultModuleSessions('slaid')[3].date,'2026-12-30');
});
test('required session choices belong to the selected module and must be open',()=>{
 const game=make('ai-game-builder'),visual=make('creative-visual');
 assert.throws(()=>selectModuleSessions([game],{}),/Pilih satu sesi/);
 assert.throws(()=>selectModuleSessions([game],{[game.id]:visual.sessions![0].id}),/Pilih satu sesi/);
 assert.throws(()=>selectModuleSessions([game],{extra:'unknown'}),/tidak sepadan/);
 game.sessions![0].active=false;assert.throws(()=>selectModuleSessions([game],{[game.id]:game.sessions![0].id}),/Pilih satu sesi/);
 assert.throws(()=>selectModuleSessions([{...game,sessions:game.sessions!.map(s=>({...s,active:false}))}],{}),/Pilih satu sesi/);
});
test('selected sessions are stored as independent snapshots without changing module prices',()=>{
 const game=make('ai-game-builder'),first=game.sessions![0],rows=selectModuleSessions([game],{[game.id]:first.id});assert.equal(rows[0].price,39);assert.equal(rows[0].session?.date,'2026-12-10');assert.equal('active' in rows[0].session!,false);
 first.date='2026-12-31';first.location='Changed venue';assert.equal(rows[0].session?.date,'2026-12-10');assert.notEqual(rows[0].session?.location,first.location);
});
test('overlapping sessions are rejected but morning and afternoon sessions on the same day are allowed',()=>{
 const a=make('smart-ulangkaji'),b=make('slaid');assert.equal(selectModuleSessions([a,b],{[a.id]:a.sessions![0].id,[b.id]:b.sessions![0].id}).length,2);
 b.sessions![0].startTime='15:00';b.sessions![0].endTime='18:00';assert.throws(()=>selectModuleSessions([a,b],{[a.id]:a.sessions![0].id,[b.id]:b.sessions![0].id}),/bertindih/);
 b.sessions![0].startTime='17:00';assert.equal(selectModuleSessions([a,b],{[a.id]:a.sessions![0].id,[b.id]:b.sessions![0].id}).length,2);
});
test('malformed dates, time ranges and duplicate sessions are rejected',()=>{
 const sessions=defaultModuleSessions('ai-game-builder');for(const changes of [{date:'2026-02-31'},{startTime:'24:00'},{startTime:'18:00'},{endTime:'09:00'}])assert.equal(moduleSessionsSchema.safeParse([{...sessions[0],...changes}]).success,false);
 assert.equal(moduleSessionsSchema.safeParse([sessions[0],sessions[0]]).success,false);assert.equal(moduleSessionsSchema.safeParse([sessions[0],{...sessions[1],label:sessions[0].label}]).success,false);
});
test('legacy module metadata keeps defaults but new registrations cannot bypass an empty schedule',()=>{
 assert.equal(moduleSessions({id:'ai-game-builder',track:'menengah'}).length,4);assert.deepEqual(moduleSessions({id:'ai-game-builder',track:'menengah',sessions:[]}),[]);assert.throws(()=>selectModuleSessions([{...make('research'),track:'universiti',sessions:[]}],{}),/Pilih satu sesi/);
});

test('every selected module needs its own available session before payment',()=>{
 const game=make('ai-game-builder'),visual=make('creative-visual'),selections={[game.id]:game.sessions![0].id};
 assert.deepEqual(missingSessionModules([game,visual],selections).map(module=>module.id),[visual.id]);
 assert.throws(()=>selectModuleSessions([game,visual],selections),/creative-visual/);
 const complete={...selections,[visual.id]:visual.sessions![0].id};assert.deepEqual(missingSessionModules([game,visual],complete),[]);assert.equal(selectModuleSessions([game,visual],complete).length,2);
 assert.deepEqual(missingSessionModules([game,visual],{...complete,[visual.id]:game.sessions![0].id}).map(module=>module.id),[visual.id]);
 visual.sessions![0].active=false;assert.deepEqual(missingSessionModules([game,visual],complete).map(module=>module.id),[visual.id]);
 assert.deepEqual(missingSessionModules([game],complete),[]);assert.deepEqual(missingSessionModules([{...game,sessions:[]}],selections).map(module=>module.id),[game.id]);
});
test('session reports separate old registrations, preserve changed schedule snapshots and sort by date',()=>{
 const module=make('ai-game-builder'),snapshot=selectModuleSessions([module],{[module.id]:module.sessions![1].id})[0];
 const record={id:'a',status:'approved',modules:[snapshot]} as Registration,earlier={...record,id:'b',modules:selectModuleSessions([module],{[module.id]:module.sessions![0].id})},legacy={...record,id:'c',modules:[{id:module.id,title:module.title,price:39}]};
 const groups=participantsBySession([record,record,legacy,earlier],module.id);assert.equal(groups.length,3);assert.equal(groups[0].session?.date,'2026-12-10');assert.equal(groups[1].participants.length,1);assert.equal(groups[2].id,'unscheduled');
 assert.equal(sessionKey({...snapshot.session!}),sessionKey(snapshot.session));assert.notEqual(sessionKey({...snapshot.session!,date:'2026-12-31'}),sessionKey(snapshot.session));
});
test('session dates are displayed in Malaysia time in both languages',()=>{
 const session=defaultModuleSessions('ai-game-builder')[0];assert.match(sessionText(session),/10 Dis 2026/);assert.match(sessionText(session,'en'),/10 Dec 2026/);assert.match(sessionText(session,'en'),/Session 1/);
});
