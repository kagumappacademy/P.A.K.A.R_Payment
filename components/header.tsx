'use client';
import { Localized, PreferenceControls } from './preferences';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
export function Brand() {return <Localized><Link href="/" className="brand" aria-label="P.A.K.A.R halaman utama"><span className="brand-mark"><span/><span/><span/><span/></span><span>P.A.K.A.R<small>AKTIFKAN POTENSI ANDA</small></span></Link></Localized>;}
export function Header() {
 const [open,setOpen]=useState(false);
 return <Localized><header className="site-header"><div className="container nav-inner"><Brand/><nav className={open?'nav-links is-open':'nav-links'} aria-label="Navigasi utama"><Link href="/#tentang" onClick={()=>setOpen(false)}>Tentang program</Link><Link href="/#program" onClick={()=>setOpen(false)}>Pilihan modul</Link><Link href="/#cara-daftar" onClick={()=>setOpen(false)}>Cara daftar</Link><Link href="/semak" onClick={()=>setOpen(false)}>Semak status</Link></nav><PreferenceControls/><Link className="button button-small nav-cta" href="/#program">Daftar sekarang</Link><button className="icon-button mobile-menu" onClick={()=>setOpen(!open)} aria-label={open?'Tutup menu':'Buka menu'} aria-expanded={open}>{open?<X/>:<Menu/>}</button></div></header></Localized>;
}
