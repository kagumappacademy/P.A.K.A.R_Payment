'use client';
import type {Module} from '@/lib/types';
import {activeSessions,moduleSessions,sessionText} from '@/lib/module-sessions';
import {Localized,usePreferences} from './preferences';
import {SessionSummary} from './module-schedule';
export function ModuleSessionPicker({module,value,onChange,invalid=false}:{module:Module;value:string;onChange:(id:string)=>void;invalid?:boolean}){
 const {language}=usePreferences(),sessions=activeSessions(module),selected=sessions.find(session=>session.id===value);
 const fieldId=`module-session-${module.id}`,reminderId=`${fieldId}-reminder`;
 return <Localized><div className={`module-session-picker${invalid&&!selected?' session-picker-invalid':''}`}>{sessions.length?<><label htmlFor={fieldId}><span>Pilih sesi <b>*</b><em>Wajib</em></span><select id={fieldId} required aria-label={`Pilih sesi ${module.title}`} aria-invalid={invalid&&!selected||undefined} aria-describedby={!selected?reminderId:undefined} value={value} onChange={event=>onChange(event.target.value)}><option value="">Pilih satu sesi</option>{sessions.map(session=><option key={session.id} value={session.id}>{sessionText(session,language)}</option>)}</select></label>{selected?<SessionSummary session={selected} location/>:<p id={reminderId} className="session-required-message" role={invalid?'alert':undefined}>Sila pilih sesi untuk modul ini sebelum meneruskan pembayaran.</p>}</>:<p className="session-required-message" role={invalid?'alert':undefined}>{moduleSessions(module).length?'Semua sesi modul ini ditutup buat sementara waktu.':'Sesi belum tersedia. Modul ini belum boleh didaftarkan.'}</p>}</div></Localized>;
}
