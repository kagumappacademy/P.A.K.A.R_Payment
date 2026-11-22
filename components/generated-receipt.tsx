'use client';
import { Localized, usePreferences } from './preferences';
import { useEffect, useState } from 'react';
import { Download, Eye, FileCheck2, LoaderCircle, MessageCircle, ShieldCheck } from 'lucide-react';
import { api, Modal, Notice, Status } from './ui';
import { money } from '@/lib/pricing';
import { receiptDate, receiptStatus, type ReceiptResponse } from '@/lib/receipts';
import type { Registration } from '@/lib/types';

export async function downloadReceiptPdf(id:string,accessToken?:string) {
  const response=await fetch('/api/registrations/payment-receipt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,accessToken,format:'pdf',language:document.documentElement.lang==='en'?'en':'bm'})});
  if(!response.ok){const data=await response.json();throw new Error(data.error||'Resit tidak dapat dimuat turun.');}
  const blob=await response.blob(),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=response.headers.get('content-disposition')?.match(/filename="([^"]+)"/)?.[1]||'resit-pakar.pdf';
  document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export function GeneratedReceipt({registration:r,accessToken,revision=0}:{registration:Registration;accessToken:string;revision?:number}) {
  const {language}=usePreferences();
  const [info,setInfo]=useState<ReceiptResponse|null>(null),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[preview,setPreview]=useState(false);
  useEffect(()=>{
    let active=true;setLoading(true);setError('');setInfo(null);
    api<ReceiptResponse>('/api/registrations/payment-receipt',{method:'POST',body:JSON.stringify({id:r.id,accessToken})}).then(data=>{if(active)setInfo(data);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[r.id,r.receiptId,r.status,accessToken,revision]);
  async function download(){setBusy(true);setError('');try{await downloadReceiptPdf(r.id,accessToken);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  return <Localized><section className="generated-receipt"><div className="generated-receipt-heading"><span className="panel-icon"><FileCheck2 size={24}/></span><div><h3>Resit pendaftaran anda</h3><p>{loading?'Menjana resit pendaftaran...':info?`${info.receipt.number} · ${receiptDate(info.receipt.issuedAt,language)}`:'Resit belum dapat dimuatkan.'}</p></div></div>
    {info&&<><div className="generated-receipt-summary"><div><span>Nama peserta</span><strong><span data-no-translate="true">{r.fullName}</span></strong></div><div><span>Jumlah pendaftaran</span><strong>{money(r.total)}</strong></div><div><span>Status pembayaran</span><Status status={r.status}/></div></div><p className="receipt-status-note"><ShieldCheck size={16}/>{receiptStatus(r.status).note}</p><div className="receipt-document-actions"><button className="button button-secondary" onClick={()=>setPreview(true)}><Eye size={17}/>Lihat resit</button><button className="button" onClick={download} disabled={busy}>{busy?<LoaderCircle className="spin" size={17}/>:<Download size={17}/>}Muat turun PDF</button></div></>}
    {loading&&<div className="receipt-loading"><LoaderCircle className="spin" size={21}/>Menyediakan dokumen anda...</div>}{error&&<Notice error>{error}</Notice>}
    <div className="whatsapp-next-step"><span className="whatsapp-step-icon"><MessageCircle size={27}/></span><div><h3>Langkah seterusnya: sertai kumpulan rasmi</h3><p>Dapatkan maklumat jadual dan pengumuman program dalam kumpulan WhatsApp peserta.</p>{info?.whatsappGroupUrl?<a className="button button-whatsapp" href={info.whatsappGroupUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/>Sertai kumpulan WhatsApp</a>:<p className="whatsapp-pending">{loading?'Menyemak pautan kumpulan...':'Pautan jemputan akan disediakan oleh admin. Tekan “Semak semula” untuk mendapatkan pautan terkini.'}</p>}</div></div>
    {preview&&info&&<Modal title="Resit pendaftaran" wide onClose={()=>setPreview(false)}><article className="receipt-paper"><header><span>{info.receipt.eventName}</span><h2>Resit pendaftaran</h2><p>{info.receipt.number}</p></header><div className="receipt-paper-body"><Status status={r.status}/><p className="receipt-paper-note">{receiptStatus(r.status).note}</p><dl><div><dt>Nombor pendaftaran</dt><dd>{r.reference}</dd></div><div><dt>Tarikh resit</dt><dd>{receiptDate(info.receipt.issuedAt,language)} (MYT)</dd></div><div><dt>Nama peserta</dt><dd><span data-no-translate="true">{r.fullName}</span></dd></div><div><dt>E-mel</dt><dd><span data-no-translate="true">{r.email}</span></dd></div><div><dt>Institusi</dt><dd><span data-no-translate="true">{r.institution}</span></dd></div><div><dt>Penerima bayaran</dt><dd>{info.receipt.recipient}</dd></div></dl><div className="receipt-paper-modules">{r.modules.map(m=><div key={m.id}><span>{m.title}</span><strong>{money(m.price)}</strong></div>)}</div><div className="receipt-paper-totals"><div><span>Harga asal</span><span>{money(r.subtotal)}</span></div><div><span>Diskaun kombo ({r.discountPercent}%)</span><span>- {money(r.discount)}</span></div><div className="receipt-paper-total"><span>Jumlah pendaftaran</span><strong>{money(r.total)}</strong></div></div>{r.adminNote&&<p className="receipt-paper-note">Nota admin: {r.adminNote}</p>}<footer><p>{info.receipt.organizer}</p><p>{info.receipt.eventDate} · Dokumen dijana secara elektronik.</p></footer></div></article><div className="form-actions form-actions-end"><button className="button" disabled={busy} onClick={download}>{busy?<LoaderCircle className="spin" size={17}/>:<Download size={17}/>}Muat turun PDF</button></div></Modal>}
  </section></Localized>;
}
