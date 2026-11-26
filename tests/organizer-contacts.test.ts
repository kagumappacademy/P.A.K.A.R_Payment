import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {defaultOrganizerSecondaryPhone,organizerContacts} from '../lib/organizer-contacts.ts';
import {completeSectionOrder} from '../lib/visual-design.ts';
import {settingsSchema} from '../lib/validation.ts';
test('contact section preserves the original organiser and adds the supplied second phone',()=>{
 const contacts=organizerContacts({whatsapp:'60128609211'});assert.equal(contacts.length,2);assert.deepEqual(contacts.map(contact=>contact.phone),['+60 12-860 9211','+60 11-2851 1241']);assert.equal(contacts[0].whatsapp,'https://wa.me/60128609211');assert.equal(contacts[1].whatsapp,'https://wa.me/601128511241');assert.equal(contacts[1].telephone,'tel:+601128511241');
});
test('contact numbers can be edited or cleared and duplicate or unsafe links are excluded',()=>{
 assert.equal(organizerContacts({whatsapp:'011-2851 1241',whatsappSecondary:defaultOrganizerSecondaryPhone}).length,1);
 assert.equal(organizerContacts({whatsapp:'60128609211',whatsappSecondary:''}).length,1);
 assert.deepEqual(organizerContacts({whatsapp:'javascript:alert(1)',whatsappSecondary:''}),[]);
 const seed=JSON.parse(readFileSync(new URL('../data/seed.json',import.meta.url),'utf8'));
 assert.equal(settingsSchema.parse({...seed.settings,whatsappSecondary:'+60 11-2851 1241'}).whatsappSecondary,defaultOrganizerSecondaryPhone);assert.equal(settingsSchema.safeParse({...seed.settings,whatsappSecondary:'https://evil.example'}).success,false);
});
test('existing saved section orders gain contact before collaborators while preserving explicit order',()=>{
 const old=['hero','event','holiday','about','programs','steps','faq','collaborators','cta'],resolved=completeSectionOrder(old);assert.equal(resolved.indexOf('contact'),resolved.indexOf('collaborators')-1);assert.deepEqual(resolved.filter(id=>id!=='contact'),old);
 assert.equal(completeSectionOrder(['contact','hero'])[0],'contact');assert.equal(completeSectionOrder(['faq','hero'])[0],'faq');
});
