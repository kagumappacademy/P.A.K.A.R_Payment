'use client';
import type {Module} from '@/lib/types';
import {activeSessions,moduleSessions,sessionText} from '@/lib/module-sessions';
import {Localized,usePreferences} from './preferences';
import {SessionSummary} from './module-schedule';
export function ModuleSessionPicker({module,value,onChange}:{module:Module;value:string;onChange:(id:string)=>void}){
 const {language}=usePreferences(),sessions=activeSessions(module),selected=sessions.find(session=>session.id===value);
 return <Localized><div className="module-session-picker">{sessions.length?<><label><span>Pilih sesi</span><select required aria-label={`Pilih sesi ${module.title}`} value={value} onChange={event=>onChange(event.target.value)}><option value="">Pilih satu sesi</option>{sessions.map(session=><option key={session.id} value={session.id}>{sessionText(session,language)}</option>)}</select></label>{selected&&<SessionSummary session={selected} location/>}</>:<p>{moduleSessions(module).length?'Semua sesi modul ini ditutup buat sementara waktu.':'Jadual sesi akan dimaklumkan.'}</p>}</div></Localized>;
}
