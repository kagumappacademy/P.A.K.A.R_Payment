import type {Module,ModuleSession,Registration,SessionSnapshot} from './types.ts';
const template:Record<string,{days:number[];times?:[string,string][];mode:ModuleSession['mode']}>={
 'ai-game-builder':{days:[10,16,23,29],mode:'physical'},
 'creative-visual':{days:[5,11,18,28],mode:'online'},
 'smart-ulangkaji':{days:[9,15,22,24],mode:'online',times:Array(4).fill(['14:00','17:00'])},
 'video-basic':{days:[8,17,19,26],mode:'online',times:Array(4).fill(['09:00','13:00'])},
 produktiviti:{days:[12,17,19,24],mode:'physical',times:[['09:00','13:00'],['14:00','17:00'],['14:00','17:00'],['09:00','13:00']]},
 slaid:{days:[9,15,22,30],mode:'online',times:Array(4).fill(['09:00','13:00'])}
};
export function defaultModuleSessions(id:string):ModuleSession[]{const data=template[id];return data?data.days.map((day,i)=>({id:`${id}-sesi-${i+1}`,label:`Sesi ${i+1}`,date:`2026-12-${String(day).padStart(2,'0')}`,startTime:data.times?.[i][0]||'09:00',endTime:data.times?.[i][1]||'17:00',mode:data.mode,location:data.mode==='physical'?'Lokasi akan dimaklumkan':'Pautan kelas akan dimaklumkan',active:true})):[];}
export const sessionOrder=(a:SessionSnapshot,b:SessionSnapshot)=>`${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`)||a.label.localeCompare(b.label,'ms',{numeric:true});
export const moduleSessions=(module:Pick<Module,'id'|'track'|'sessions'>)=>[...(module.sessions??(module.track==='menengah'?defaultModuleSessions(module.id):[]))].sort(sessionOrder);
export const activeSessions=(module:Pick<Module,'id'|'track'|'sessions'>)=>moduleSessions(module).filter(session=>session.active);
export const sessionKey=(session?:SessionSnapshot)=>session?JSON.stringify([session.id,session.label,session.date,session.startTime,session.endTime,session.mode,session.location]):'unscheduled';
export function sessionText(session:SessionSnapshot,language:'bm'|'en'='bm'){
 const date=new Intl.DateTimeFormat(language==='en'?'en-GB':'ms-MY',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kuala_Lumpur'}).format(new Date(session.date+'T00:00:00+08:00'));
 const time=(value:string)=>new Intl.DateTimeFormat(language==='en'?'en-GB':'ms-MY',{hour:'numeric',minute:'2-digit',hour12:true,timeZone:'Asia/Kuala_Lumpur'}).format(new Date(session.date+'T'+value+':00+08:00'));
 const label=language==='en'?session.label.replace(/^Sesi\b/i,'Session'):session.label;
 return `${label} · ${date} · ${time(session.startTime)} – ${time(session.endTime)} · ${session.mode==='online'?'Online':language==='en'?'In person':'Fizikal'}`;
}
export function selectModuleSessions(modules:Module[],selections:Record<string,string>):Registration['modules']{
 if(Object.keys(selections).some(id=>!modules.some(module=>module.id===id)))throw new Error('Pilihan sesi tidak sepadan dengan modul yang dipilih.');
 const result=modules.map(module=>{
  const configured=moduleSessions(module),id=selections[module.id];
  if(!configured.length){if(id)throw new Error('Sesi yang dipilih tidak tersedia.');return {id:module.id,title:module.title,price:module.price};}
  const session=configured.find(item=>item.id===id&&item.active);if(!session)throw new Error(`Pilih satu sesi yang tersedia untuk ${module.title}.`);
  const {active:_active,...snapshot}=session;return {id:module.id,title:module.title,price:module.price,session:snapshot};
 });
 for(let i=0;i<result.length;i++)for(let j=i+1;j<result.length;j++){
  const a=result[i].session,b=result[j].session;
  if(a&&b&&a.date===b.date&&a.startTime<b.endTime&&b.startTime<a.endTime)throw new Error(`Masa sesi bertindih: ${result[i].title} dan ${result[j].title}. Pilih sesi pada masa yang lain.`);
 }
 return result;
}
export function participantsBySession<T extends Pick<Registration,'id'|'status'|'modules'>>(records:T[],moduleId:string){
 const groups=new Map<string,{id:string;session?:SessionSnapshot;participants:T[]}>();
 for(const record of records){const module=record.modules.find(item=>item.id===moduleId);if(!module)continue;const id=sessionKey(module.session),group=groups.get(id)||{id,session:module.session,participants:[]};if(!group.participants.some(item=>item.id===record.id))group.participants.push(record);groups.set(id,group);}
 return [...groups.values()].sort((a,b)=>a.session&&b.session?sessionOrder(a.session,b.session):a.session?-1:b.session?1:0);
}
