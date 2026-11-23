'use client';
import { Localized } from './preferences';
import { useEffect, useState } from 'react';
import { LoaderCircle, Search, ShieldCheck } from 'lucide-react';
import { Header } from './header';
import { Footer } from './footer';
import { api, Notice } from './ui';
import { Payment } from './payment';
import type { Registration, Settings } from '@/lib/types';
export function StatusLookup({settings}:{settings:Settings}) {
 const [reference,setReference]=useState(''),[email,setEmail]=useState(''),[result,setResult]=useState<{registration:Registration;accessToken:string}|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{try{setReference(localStorage.getItem('pakar-last-reference')||'');}catch{}},[]);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{setResult(await api('/api/registrations/lookup',{method:'POST',body:JSON.stringify({reference,email})}));}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <Localized><><Header/><main id="main" className="lookup-page container" data-design-id="status"><div className="center-heading"><p className="eyebrow">PUSAT MISI ANDA</p><h1>Semak pendaftaran.</h1><p>Lihat status pembayaran atau sambung pembayaran anda.</p></div>{!result?<form onSubmit={submit} className="lookup-form form-panel"><span className="lookup-icon"><Search size={30}/></span><label className="field"><span>Nombor pendaftaran</span><input required maxLength={40} autoCapitalize="characters" placeholder="PKR-..." value={reference} onChange={e=>setReference(e.target.value)}/></label><label className="field"><span>E-mel yang didaftarkan</span><input required type="email" autoComplete="email" placeholder="nama@email.com" value={email} onChange={e=>setEmail(e.target.value)}/></label>{error&&<Notice error>{error}</Notice>}<button className="button button-full" disabled={busy}>{busy?<LoaderCircle className="spin" size={18}/>:<Search size={18}/>}Semak status</button><p className="secure-note"><ShieldCheck size={14}/>Maklumat anda disemak secara selamat.</p></form>:<div className="form-panel lookup-result"><Payment {...result} settings={settings} onUpdate={r=>setResult({...result,registration:r})}/><button className="text-link" onClick={()=>setResult(null)}>Semak pendaftaran lain</button></div>}</main><Footer organizer={settings.organizer} organizerLogo={settings.organizerLogo}/></></Localized>;
}
