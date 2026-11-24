import {MessageCircle} from 'lucide-react';
import {whatsappPhoneUrl} from '@/lib/whatsapp';
export function WhatsAppPhone({phone}:{phone:string}){
 const href=whatsappPhoneUrl(phone);
 return href?<a className="participant-whatsapp-phone" href={href} target="_blank" rel="noopener noreferrer" title="Hubungi melalui WhatsApp"><MessageCircle size={17} aria-hidden="true"/><span data-no-translate="true">{phone}</span><span className="participant-whatsapp-label">WhatsApp</span></a>:<span data-no-translate="true">{phone||'—'}</span>;
}
