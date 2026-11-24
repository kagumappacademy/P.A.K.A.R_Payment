import {test} from 'node:test';
import assert from 'node:assert/strict';
import {whatsappPhoneUrl} from '../lib/whatsapp.ts';
test('WhatsApp links normalize Malaysian local numbers and retain their international equivalent',()=>{
 for(const phone of ['0123456789','012 345 6789','(012) 345-6789','+60 12-345 6789','60123456789','0060123456789'])assert.equal(whatsappPhoneUrl(phone),'https://wa.me/60123456789');
 assert.equal(whatsappPhoneUrl('011-2345 6789'),'https://wa.me/601123456789');
});
test('WhatsApp links preserve explicit international country codes',()=>{
 assert.equal(whatsappPhoneUrl('+65 8123 4567'),'https://wa.me/6581234567');
 assert.equal(whatsappPhoneUrl('0065 8123 4567'),'https://wa.me/6581234567');
});
test('Missing, malformed and ambiguous extension numbers stay unlinked',()=>{
 for(const phone of ['', '—','0000000000','123','+1234567890123456','0123456789 ext 99','0123456789/0199999999','javascript:12345678','0123456789?text=hello'])assert.equal(whatsappPhoneUrl(phone),null);
});
