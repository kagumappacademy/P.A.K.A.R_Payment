'use client';
import {Mail,MessageCircle,Phone} from 'lucide-react';
import {organizerContacts} from '@/lib/organizer-contacts';
import type {Settings} from '@/lib/types';
import {Localized} from './preferences';
export function OrganizerContact({settings}:{settings:Settings}){
 const contacts=organizerContacts(settings);
 return <Localized><div className="container organizer-contact-layout"><div className="organizer-contact-intro"><p className="eyebrow">HUBUNGI PENGANJUR</p><h2 id="contact-heading">Ada pertanyaan?<br/><span>Kami sedia membantu.</span></h2><p>Perlu bantuan memilih modul, sesi atau urusan pembayaran? Hubungi pasukan penganjur P.A.K.A.R.</p><span className="organizer-contact-brand" data-no-translate="true">{settings.organizer}</span>{settings.contactEmail&&<a className="organizer-contact-email" href={`mailto:${settings.contactEmail}`}><Mail size={18}/><span data-no-translate="true">{settings.contactEmail}</span></a>}</div><div className="organizer-contact-cards">{contacts.map(contact=><article className="organizer-contact-card" key={contact.whatsapp}><span className="organizer-contact-icon"><MessageCircle size={27}/></span><p>Talian penganjur</p><h3><a href={contact.telephone} data-no-translate="true">{contact.phone}</a></h3><a className="button" href={contact.whatsapp} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${contact.phone}`}><MessageCircle size={18}/>Chat di WhatsApp</a><a className="organizer-call-link" href={contact.telephone}><Phone size={16}/>Panggilan telefon</a></article>)}</div></div></Localized>;
}
