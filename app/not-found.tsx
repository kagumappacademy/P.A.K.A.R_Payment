'use client';
import { Localized } from '@/components/preferences';
import Link from 'next/link';
export default function NotFound(){return <Localized><main id="main" className="empty-page"><span className="eyebrow">MISI TIDAK DITEMUI</span><h1>Halaman ini tiada.</h1><p>Mari kembali ke pusat misi anda.</p><Link className="button" href="/">Kembali ke halaman utama</Link></main></Localized>;}
