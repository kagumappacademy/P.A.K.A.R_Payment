'use client';
import { Localized } from './preferences';
import Link from 'next/link';
import { Brand } from './header';
import { OrganizerBadge } from './organizer';
export function Footer({organizer='Kagum Academy',organizerLogo='/images/brand/kagum-academy.png'}:{organizer?:string;organizerLogo?:string}) {return <Localized><footer className="site-footer" data-design-id="footer"><div className="container footer-top"><div className="footer-brand-block"><Brand/><p>Misi kecil hari ini.<br/><span>Impak besar untuk masa depan.</span></p></div><OrganizerBadge name={organizer} logo={organizerLogo} className="footer-organizer"/><div className="footer-links"><Link href="/#program">Terokai program</Link><Link href="/semak">Semak pendaftaran</Link><a href="/#hubungi">Hubungi kami</a><Link href="/admin">Portal admin</Link></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} {organizer}. Hak cipta terpelihara.</span><span>Dibina untuk generasi pencipta.</span></div></footer></Localized>;}
