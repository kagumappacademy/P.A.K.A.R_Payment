import type {Settings} from './types.ts';
export const defaultRegistrationOpensAt='2026-11-27T12:00:00+08:00';
export type RegistrationAvailability=Pick<Settings,'registrationOpen'|'registrationScheduled'|'registrationOpensAt'>;
export function registrationIsOpen(settings:RegistrationAvailability,now=Date.now()){
 return settings.registrationOpen||Boolean(settings.registrationScheduled&&settings.registrationOpensAt&&Number.isFinite(Date.parse(settings.registrationOpensAt))&&now>=Date.parse(settings.registrationOpensAt));
}
export function registrationOpeningLabel(value:string,language:'bm'|'en'='bm'){
 const date=new Date(value);if(!Number.isFinite(date.getTime()))return '';
 const day=new Intl.DateTimeFormat(language==='bm'?'ms-MY':'en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kuala_Lumpur'}).format(date);
 const parts=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:'Asia/Kuala_Lumpur'}).formatToParts(date),hour=Number(parts.find(part=>part.type==='hour')?.value),minute=parts.find(part=>part.type==='minute')?.value||'00';
 const period=language==='en'?(hour>=12?'p.m.':'a.m.'):hour===12?'tengah hari':hour===0?'tengah malam':hour<12?'pagi':hour<19?'petang':'malam';
 return `${day}${language==='bm'?', jam ':', '}${hour%12||12}:${minute} ${period}${language==='bm'?' (waktu Malaysia)':' (Malaysia time)'}`;
}
export function registrationOpeningInput(value:string){
 if(!value||!Number.isFinite(Date.parse(value)))return '';
 return new Date(Date.parse(value)+8*60*60*1000).toISOString().slice(0,16);
}
export const registrationOpeningIso=(local:string)=>local?new Date(local+':00+08:00').toISOString():'';
