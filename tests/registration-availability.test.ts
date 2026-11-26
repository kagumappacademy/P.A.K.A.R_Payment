import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaultRegistrationOpensAt,registrationIsOpen,registrationOpeningInput,registrationOpeningIso,registrationOpeningLabel} from '../lib/registration-availability.ts';
import {registrationAvailabilitySchema} from '../lib/validation.ts';
const opens=Date.parse(defaultRegistrationOpensAt),scheduled={registrationOpen:false,registrationScheduled:true,registrationOpensAt:defaultRegistrationOpensAt};
test('registration opens exactly at the scheduled Malaysia time without an admin visit',()=>{
 assert.equal(opens,Date.parse('2026-11-27T04:00:00Z'));assert.equal(registrationIsOpen(scheduled,opens-1),false);assert.equal(registrationIsOpen(scheduled,opens),true);assert.equal(registrationIsOpen(scheduled,opens+1),true);
});
test('manual ON and OFF override inactive schedules and legacy settings keep their meaning',()=>{
 assert.equal(registrationIsOpen({registrationOpen:true},opens-1000),true);assert.equal(registrationIsOpen({registrationOpen:false},opens+1000),false);
 assert.equal(registrationIsOpen({...scheduled,registrationOpen:true},opens-1000),true);assert.equal(registrationIsOpen({...scheduled,registrationScheduled:false},opens+1000),false);
 for(const date of ['', 'bad-date'])assert.equal(registrationIsOpen({...scheduled,registrationOpensAt:date},opens),false);
});
test('opening labels and admin date inputs consistently use Malaysia time in BM and ENG',()=>{
 assert.equal(registrationOpeningInput(defaultRegistrationOpensAt),'2026-11-27T12:00');assert.equal(registrationOpeningIso('2026-11-27T12:00'),'2026-11-27T04:00:00.000Z');
 assert.match(registrationOpeningLabel(defaultRegistrationOpensAt),/27 November 2026, jam 12:00 tengah hari/);assert.match(registrationOpeningLabel(defaultRegistrationOpensAt,'en'),/27 November 2026, 12:00 p.m./);
 assert.match(registrationOpeningLabel('2026-11-26T16:00:00Z'),/27 November 2026, jam 12:00 tengah malam/);assert.equal(registrationOpeningLabel('invalid'),'');
});
test('opening settings reject ambiguous timestamps and incomplete automatic schedules',()=>{
 assert.equal(registrationAvailabilitySchema.safeParse(scheduled).success,true);
 for(const changes of [{registrationOpensAt:''},{registrationOpensAt:'2026-11-27T12:00'},{registrationOpen:true},{registrationOpensAt:'2026-02-31T12:00:00+08:00'}])assert.equal(registrationAvailabilitySchema.safeParse({...scheduled,...changes}).success,false);
 assert.equal(registrationAvailabilitySchema.safeParse({...scheduled,registrationScheduled:false,registrationOpensAt:''}).success,true);
});
