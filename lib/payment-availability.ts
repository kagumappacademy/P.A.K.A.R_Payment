import type {Settings} from './types.ts';
export function paymentAvailability(settings:Pick<Settings,'paymentQrEnabled'|'paymentQr'|'paymentName'|'bankName'|'bankAccount'>){
 const qrReady=settings.paymentQrEnabled===true&&Boolean(settings.paymentQr.trim()&&settings.paymentName.trim());
 const bankReady=Boolean(settings.paymentName.trim()&&settings.bankName.trim()&&settings.bankAccount.trim());
 return {qrReady,bankReady,paymentReady:qrReady||bankReady};
}
