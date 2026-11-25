import type {Registration} from './types.ts';
import {sessionKey} from './module-sessions.ts';
export type RegistrationFilters={search:string;status:string;track:string;module:string;session:string;sort:'newest'|'name'|'session'|'amount'};
export const emptyRegistrationFilters:RegistrationFilters={search:'',status:'all',track:'all',module:'all',session:'all',sort:'newest'};
export function filterRegistrations(records:Registration[],filters:RegistrationFilters){
 const date=(r:Registration)=>r.modules.filter(m=>filters.module==='all'||m.id===filters.module).map(m=>m.session?m.session.date+'T'+m.session.startTime:'zzzz').sort()[0]||'zzzz';
 return records.filter(record=>{
  if(record.deletedAt||(filters.status!=='all'&&record.status!==filters.status)||(filters.track!=='all'&&record.track!==filters.track))return false;
  const modules=record.modules.filter(module=>filters.module==='all'||module.id===filters.module);
  if(!modules.length||(filters.session!=='all'&&!modules.some(module=>sessionKey(module.session)===filters.session)))return false;
  const text=`${record.fullName} ${record.email} ${record.phone} ${record.reference} ${record.institution} ${record.modules.map(m=>m.title+' '+(m.session?.label||'')).join(' ')}`;
  return text.toLowerCase().includes(filters.search.trim().toLowerCase());
 }).sort((a,b)=>filters.sort==='name'?a.fullName.localeCompare(b.fullName,'ms'):filters.sort==='session'?date(a).localeCompare(date(b))||a.fullName.localeCompare(b.fullName,'ms'):filters.sort==='amount'?b.total-a.total:b.createdAt.localeCompare(a.createdAt));
}
