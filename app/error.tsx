'use client';
export default function ErrorPage({reset}:{error:Error;reset:()=>void}) {return <main id="main" className="empty-page"><h1>Sambungan terganggu.</h1><p>Pastikan MySQL sedang berjalan dan konfigurasi database telah disediakan.</p><button className="button" onClick={reset}>Cuba semula</button></main>;}
