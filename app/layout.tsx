import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { PreferencesProvider } from '@/components/preferences';
import { TechnologyBackdrop } from '@/components/technology-backdrop';
import './globals.css';
export const metadata:Metadata={title:{default:'P.A.K.A.R — Misi Cuti Sekolah Akhir Tahun',template:'%s | P.A.K.A.R'},description:'Program cuti sekolah akhir tahun 2026 untuk pelajar sekolah menengah. Terokai AI, bina game, reka visual dan pilih kombo modul P.A.K.A.R. Track universiti turut tersedia.'};
export default async function RootLayout({children}:{children:React.ReactNode}) {
  const jar=await cookies();
  const theme=jar.get('pakar-theme')?.value==='light'?'light':'dark';
  const language=jar.get('pakar-language')?.value==='en'?'en':'bm';
  return <html lang={language==='en'?'en':'ms'} data-theme={theme}><body><PreferencesProvider initialTheme={theme} initialLanguage={language}><TechnologyBackdrop/><a className="skip-link" href="#main">Langkau ke kandungan</a>{children}</PreferencesProvider></body></html>;
}
