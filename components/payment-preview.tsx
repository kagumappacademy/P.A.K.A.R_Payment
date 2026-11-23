'use client';
import {Payment} from './payment';
import {Header} from './header';
import {Footer} from './footer';
import type {Settings,Module,Registration} from '@/lib/types';
export function PaymentPreview({settings,modules}:{settings:Settings;modules:Module[]}){
 const registration:Registration={id:'00000000-0000-4000-8000-000000000000',reference:'PKR-PRATONTON',fullName:'Peserta Contoh',email:'contoh@example.com',phone:'0123456789',institution:'Sekolah Contoh',age:16,guardianName:'Penjaga Contoh',guardianPhone:'0123456789',track:'menengah',modules:modules.filter(m=>m.track==='menengah').slice(0,1).map(m=>({id:m.id,title:m.title,price:m.price})),subtotal:modules.find(m=>m.track==='menengah')?.price||39,discount:0,discountPercent:0,total:modules.find(m=>m.track==='menengah')?.price||39,status:'awaiting_payment',receiptId:null,receiptName:null,adminNote:'',createdAt:'2026-11-23T00:00:00.000Z',updatedAt:'2026-11-23T00:00:00.000Z'};
 return <><Header/><main id="main" data-design-id="payment" className="container" style={{paddingBlock:60}}><p className="eyebrow">PRATONTON · DATA CONTOH</p><div className="form-panel" style={{marginTop:20}}><Payment registration={registration} accessToken={'0'.repeat(64)} settings={settings} onUpdate={()=>{}}/></div></main><Footer organizer={settings.organizer} organizerLogo={settings.organizerLogo}/></>;
}
