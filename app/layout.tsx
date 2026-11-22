import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:{default:'P.A.K.A.R — Misi Cuti Sekolah Akhir Tahun',template:'%s | P.A.K.A.R'},description:'Program cuti sekolah akhir tahun 2026 untuk pelajar sekolah menengah. Terokai AI, bina game, reka visual dan pilih kombo modul P.A.K.A.R. Track universiti turut tersedia.'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="ms"><body><a className="skip-link" href="#main">Langkau ke kandungan</a>{children}</body></html>;}
