import type {Settings} from './types.ts';
import {whatsappPhoneUrl} from './whatsapp.ts';
export const defaultOrganizerSecondaryPhone='601128511241';
export function organizerContacts(settings:Pick<Settings,'whatsapp'|'whatsappSecondary'>){
 const contacts=new Map<string,{phone:string;whatsapp:string;telephone:string}>();
 for(const value of [settings.whatsapp,settings.whatsappSecondary??defaultOrganizerSecondaryPhone]){
  const href=whatsappPhoneUrl(value);if(!href||contacts.has(href))continue;
  const number=href.slice('https://wa.me/'.length),phone=/^6011\d{8}$/.test(number)?`+60 11-${number.slice(4,8)} ${number.slice(8)}`:/^60\d{9}$/.test(number)?`+60 ${number.slice(2,4)}-${number.slice(4,7)} ${number.slice(7)}`:'+'+number;
  contacts.set(href,{phone,whatsapp:href,telephone:'tel:+'+number});
 }
 return [...contacts.values()];
}
