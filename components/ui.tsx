'use client';
import { Localized } from './preferences';
import { Award, BookOpen, BriefcaseBusiness, Check, Code2, Gamepad2, GraduationCap, Layers3, Monitor, Palette, Presentation, Search, ShieldCheck, Sparkles, Video, X, Zap } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
export function Icon({name,size=24,...props}:{name:string;size?:number;className?:string}) {
  const icons:Record<string,typeof Code2>={code:Code2,award:Award,book:BookOpen,briefcase:BriefcaseBusiness,gamepad:Gamepad2,layers:Layers3,monitor:Monitor,palette:Palette,presentation:Presentation,search:Search,shield:ShieldCheck,sparkles:Sparkles,video:Video,zap:Zap,graduation:GraduationCap,check:Check};
  const Glyph=icons[name]||Sparkles;return <Glyph size={size} strokeWidth={1.7} {...props}/>;
}
export function Accent({color,children,className='',designId}:{color:string;children:ReactNode;className?:string;designId?:string}) { return <div data-design-id={designId} className={className} style={{'--accent':color} as CSSProperties}>{children}</div>; }
export function Modal({title,onClose,children,wide=false}:{title:string;onClose:()=>void;children:ReactNode;wide?:boolean}) {
  const closeRef=useRef(onClose);closeRef.current=onClose;
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;
    const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
    const dialog=document.querySelector('[role="dialog"]') as HTMLElement|null;
    const focusables=()=>Array.from(dialog?.querySelectorAll<HTMLElement>('button,a[href],input,select,textarea,[tabindex="0"]')||[]).filter(el=>!el.hasAttribute('disabled'));
    focusables()[0]?.focus();
    const key=(e:KeyboardEvent)=>{if(e.key==='Escape')closeRef.current();if(e.key==='Tab'){const items=focusables(),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
    document.addEventListener('keydown',key);return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key);previous?.focus();};
  },[]);
  return <Localized><div className="modal-backdrop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}><section data-design-id="dialog" role="dialog" aria-modal="true" aria-label={title} className={`modal ${wide?'modal-wide':''}`}><div className="modal-heading"><h2>{title}</h2><button type="button" className="icon-button" onClick={onClose} aria-label="Tutup"><X size={22}/></button></div>{children}</section></div></Localized>;
}
export function Notice({children,error=false}:{children:ReactNode;error?:boolean}) { return <div className={`notice ${error?'notice-error':''}`} role={error?'alert':'status'}>{children}</div>; }
export function Status({status}:{status:string}) { const labels:Record<string,string>={awaiting_payment:'Belum dibayar',pending:'Menunggu semakan',approved:'Disahkan',rejected:'Perlu tindakan'};return <Localized><span className={`status status-${status}`}>{labels[status]||status}</span></Localized>; }
export async function api<T=Record<string,unknown>>(path:string,options?:RequestInit):Promise<T> {
  const response=await fetch(path,{...options,headers:{...(options?.body instanceof FormData?{}:{'Content-Type':'application/json'}),...options?.headers}});
  const data=await response.json();if(!response.ok)throw new Error(data.error||'Permintaan gagal. Sila cuba semula.');return data;
}
