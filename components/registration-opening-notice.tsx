'use client';
import {useEffect,useState} from 'react';
import {CalendarDays,LockKeyhole} from 'lucide-react';
import {registrationIsOpen,registrationOpeningLabel,type RegistrationAvailability} from '@/lib/registration-availability';
import {Localized,usePreferences} from './preferences';
export function useRegistrationOpen(settings:RegistrationAvailability){
 const [now,setNow]=useState(()=>Date.now());
 useEffect(()=>{let timer:ReturnType<typeof setTimeout>|undefined;const tick=()=>{const current=Date.now();setNow(current);const opensAt=Date.parse(settings.registrationOpensAt||'');if(settings.registrationScheduled&&!settings.registrationOpen&&Number.isFinite(opensAt)&&opensAt>current)timer=setTimeout(tick,Math.min(opensAt-current+25,2_147_000_000));};tick();const refresh=()=>{if(timer)clearTimeout(timer);tick();};window.addEventListener('focus',refresh);return()=>{if(timer)clearTimeout(timer);window.removeEventListener('focus',refresh);};},[settings.registrationOpen,settings.registrationScheduled,settings.registrationOpensAt]);
 return registrationIsOpen(settings,now);
}
export function RegistrationOpeningNotice({settings}:{settings:RegistrationAvailability}){
 const open=useRegistrationOpen(settings),{language}=usePreferences();if(open)return null;
 const upcoming=Boolean(settings.registrationOpensAt&&Date.parse(settings.registrationOpensAt)>Date.now());
 return <Localized><aside className="registration-opening-notice" role="status"><span className="opening-notice-icon"><LockKeyhole size={23}/></span><div><strong>{upcoming?'Pendaftaran akan dibuka pada':'Pendaftaran ditutup buat sementara waktu'}</strong>{upcoming?<p className="opening-notice-date"><CalendarDays size={17}/><time dateTime={settings.registrationOpensAt} data-no-translate="true">{registrationOpeningLabel(settings.registrationOpensAt!,language)}</time></p>:<p>Tarikh pembukaan baharu akan dimaklumkan.</p>}<p>Anda masih boleh melihat modul dan jadual sesi yang tersedia.</p></div></aside></Localized>;
}
