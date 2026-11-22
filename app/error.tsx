'use client';
import { Localized } from '@/components/preferences';
export default function ErrorPage({reset}:{error:Error;reset:()=>void}) {return <Localized><main id="main" className="empty-page"><h1>Sambungan terganggu.</h1><p>Semak sambungan internet dan konfigurasi database Turso.</p><button className="button" onClick={reset}>Cuba semula</button></main></Localized>;}
