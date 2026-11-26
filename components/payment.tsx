'use client';
import { Localized } from './preferences';
import { useState } from 'react';
import { Check, CheckCircle2, Copy, Download, ExternalLink, FileCheck2, FileUp, Landmark, LoaderCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { api, Notice, Status } from './ui';
import { GeneratedReceipt } from './generated-receipt';
import {SessionSummary} from './module-schedule';
import { money } from '@/lib/pricing';
import {paymentAvailability} from '@/lib/payment-availability';
import type { Registration, Settings } from '@/lib/types';

export function Payment({registration:r,accessToken,settings:s,onUpdate}:{registration:Registration;accessToken:string;settings:Settings;onUpdate:(r:Registration)=>void}) {
  const [file,setFile]=useState<File|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[copied,setCopied]=useState(false),[revision,setRevision]=useState(0);
  const sent=r.status==='pending'||r.status==='approved',{qrReady,bankReady,paymentReady}=paymentAvailability(s);
  async function upload(e:React.FormEvent) {
    e.preventDefault();setError('');
    if(!file){setError('Sila pilih fail resit pembayaran.');return;}
    if(file.size>3*1024*1024){setError('Saiz maksimum resit ialah 3MB.');return;}
    setBusy(true);
    try {
      const body=new FormData();body.set('registrationId',r.id);body.set('accessToken',accessToken);body.set('file',file);
      const result=await api<{registration:Registration}>('/api/registrations/receipt',{method:'POST',body});onUpdate(result.registration);setRevision(n=>n+1);
    }catch(e){setError((e as Error).message);}finally{setBusy(false);}
  }
  async function refresh(){
    setBusy(true);setError('');
    try{const data=await api<{registration:Registration}>('/api/registrations/lookup',{method:'POST',body:JSON.stringify({email:r.email,reference:r.reference})});onUpdate(data.registration);setRevision(n=>n+1);}
    catch(e){setError((e as Error).message);}finally{setBusy(false);}
  }
  return <Localized><div className="payment-content">
    <div className={`payment-state ${sent?'is-sent':''}`}><span className="payment-state-icon">{sent?<CheckCircle2 size={32}/>:<FileCheck2 size={32}/>}</span><div>
      <h2>{r.status==='approved'?'Misi anda telah disahkan!':r.status==='pending'?'Resit diterima. Terima kasih!':r.status==='rejected'?'Resit memerlukan perhatian.':'Pendaftaran anda telah disimpan.'}</h2>
      <p>{r.status==='approved'?'Muat turun resit pembayaran anda dan sertai kumpulan WhatsApp rasmi untuk maklumat program.':r.status==='pending'?'Resit pendaftaran anda dijana secara automatik. Muat turun salinan anda dan sertai kumpulan WhatsApp sementara admin menyemak pembayaran.':'Lengkapkan pembayaran dan hantar resit untuk pengesahan penyertaan.'}</p>
    </div></div>
    <div className="reference-box"><div><span>NOMBOR PENDAFTARAN</span><strong>{r.reference}</strong></div><button className="icon-button" aria-label="Salin nombor pendaftaran" onClick={async()=>{try{await navigator.clipboard.writeText(r.reference);setCopied(true);}catch{setError('Salin nombor pendaftaran secara manual.');}}}>{copied?<Check size={18}/>:<Copy size={18}/>}</button></div>
    <div className="payment-status-row"><Status status={r.status}/><span><span data-no-translate="true">{r.email}</span></span></div>
    {r.adminNote&&<Notice error={r.status==='rejected'}><strong>Nota admin:</strong> {r.adminNote}</Notice>}
    {r.modules.some(module=>module.session)&&<section className="payment-session-summary"><h3>Modul & sesi dipilih</h3>{r.modules.map(module=><div key={module.id}><strong>{module.title}</strong><SessionSummary session={module.session} location/></div>)}</section>}
    {sent?<>
      <GeneratedReceipt registration={r} accessToken={accessToken} revision={revision}/>
      <div className="form-actions"><button className="button button-secondary" disabled={busy} onClick={refresh}>{busy?<LoaderCircle className="spin" size={17}/>:<RefreshCw size={17}/>}Semak semula</button><Link className="button button-secondary" href="/">Kembali ke utama</Link></div>
    </>:<div className="payment-grid">
      <div className="qr-panel"><h3>{qrReady?'Bayar dengan DuitNow QR':'Bayar melalui pindahan bank'}</h3>{qrReady?<>
        <div className="qr-image"><a href={s.paymentQr} target="_blank" rel="noopener noreferrer" aria-label="Buka QR DuitNow saiz penuh"><img src={s.paymentQr} alt={`QR DuitNow rasmi ${s.paymentName}`}/></a></div><div className="qr-actions"><a className="button button-secondary button-small" href={s.paymentQr} target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/>Buka QR saiz penuh</a><a className="button button-secondary button-small" href={s.paymentQr} download><Download size={16}/>Muat turun QR</a></div><span className="payment-recipient">{s.paymentName}</span>
        {s.bankName&&<p>{s.bankName}{s.bankAccount&&<> · {s.bankAccount}</>}</p>}
      </>:<div className="bank-transfer-details"><span className="bank-transfer-icon"><Landmark size={28}/></span><p>Sila buat pembayaran ke akaun berikut.</p><dl>{s.bankName&&<div><dt>Nama bank</dt><dd data-no-translate="true">{s.bankName}</dd></div>}{s.paymentName&&<div><dt>Nama penerima</dt><dd data-no-translate="true">{s.paymentName}</dd></div>}{s.bankAccount&&<div><dt>Nombor akaun</dt><dd className="bank-account-number" data-no-translate="true">{s.bankAccount}</dd></div>}</dl>{!bankReady&&<Notice>Butiran bank sedang dikemas kini. Sila hubungi penganjur sebelum membuat pembayaran.</Notice>}</div>}
      <div className="payment-amount"><span>Jumlah perlu dibayar</span><strong>{money(r.total)}</strong></div>{paymentReady?<p className="payment-instructions">{qrReady?s.paymentInstructions:'Buat pindahan bank mengikut butiran di atas. Selepas pembayaran, muat naik resit untuk semakan.'}</p>:<div className="qr-unavailable"><p>Pendaftaran anda telah disimpan. Gunakan halaman <Link href="/semak">Semak status</Link> untuk kembali ke pembayaran.</p>{s.whatsapp&&<a className="text-link" href={`https://wa.me/${s.whatsapp}`}>Hubungi penganjur</a>}</div>}</div>
      <form onSubmit={upload} className="receipt-panel"><h3>Muat naik resit pembayaran</h3><p>Pastikan nama penerima, tarikh dan jumlah pembayaran jelas kelihatan.</p>
        <label className={`upload-area ${file?'has-file':''}`}><FileUp size={30}/><strong>{file?file.name:'Klik untuk pilih resit'}</strong><span>PNG, JPG, WEBP atau PDF · Maksimum 3MB</span><input aria-label="Fail resit pembayaran" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={e=>setFile(e.target.files?.[0]||null)} disabled={!paymentReady||busy}/></label>
        <label className="checkbox-label"><input type="checkbox" required disabled={!paymentReady||busy}/><span>Saya mengesahkan resit ini adalah untuk pembayaran pendaftaran saya.</span></label>
        <button className="button button-full" type="submit" disabled={busy||!paymentReady}>{busy?<LoaderCircle className="spin" size={18}/>:<ShieldCheck size={18}/>}Hantar resit untuk semakan</button>
        <p className="secure-note"><ShieldCheck size={14}/>Resit bank anda hanya boleh dilihat oleh admin.</p><p className="receipt-after-upload-note">Selepas dihantar, anda boleh memuat turun resit pendaftaran dan menyertai kumpulan WhatsApp yang ditetapkan admin.</p>
      </form>
    </div>}
    {error&&<Notice error>{error}</Notice>}
  </div></Localized>;
}
