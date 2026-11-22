import type { PaymentReceiptSnapshot, Registration, Settings } from './types.ts';
import type { Language } from './i18n.ts';

export function receiptSnapshot(registration: Registration, settings: Settings): PaymentReceiptSnapshot {
  return registration.paymentReceipt ?? {
    number:`RCT-${registration.reference.replace(/^PKR-/, '')}`,
    issuedAt:registration.paymentSubmittedAt || registration.updatedAt,
    recipient:settings.paymentName || settings.organizer,
    organizer:settings.organizer, eventName:settings.eventName, eventDate:settings.dateLabel
  };
}

export function receiptStatus(status: Registration['status']) {
  if(status==='approved')return {label:'Pembayaran disahkan',note:'Pembayaran pendaftaran ini telah disahkan oleh pentadbir program.'};
  if(status==='rejected')return {label:'Perlu tindakan',note:'Bukti pembayaran memerlukan pembetulan. Sila rujuk nota admin dan hantar resit baharu.'};
  return {label:'Menunggu semakan',note:'Dokumen ini dijana selepas bukti pembayaran dihantar. Pembayaran belum disahkan oleh penganjur.'};
}

export function participantGroup(registration: Registration, settings: Settings) {
  if(!registration.receiptId || !['pending','approved'].includes(registration.status))return '';
  return settings.whatsappGroups?.[registration.track] || '';
}

export function receiptDate(value: string,language:Language='bm') {
  return new Intl.DateTimeFormat(language==='en'?'en-GB':'ms-MY',{dateStyle:'long',timeStyle:'short',timeZone:'Asia/Kuala_Lumpur'}).format(new Date(value));
}

export type ReceiptResponse = {
  receipt: PaymentReceiptSnapshot;
  whatsappGroupUrl: string;
};
