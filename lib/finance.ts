import type {Registration} from './types.ts';
export function assertFinanceApproval(record:Registration,item:{id:string;receiptId:string;total:number}){if(record.status!=='pending'||!record.receiptId||record.receiptId!==item.receiptId||Math.abs(record.total-item.total)>.005)throw new Error('Status, resit atau jumlah telah berubah. Muat semula dan semak sekali lagi.');}
export function financeRecord(r:Registration){return {id:r.id,reference:r.reference,fullName:r.fullName,email:r.email,track:r.track,modules:r.modules,total:r.total,discount:r.discount,status:r.status,receiptId:r.receiptId,receiptName:r.receiptName,receiptMime:r.receiptMime,adminNote:r.adminNote,createdAt:r.createdAt,paymentApprovedAt:r.paymentApprovedAt};}
export type FinanceRecord=ReturnType<typeof financeRecord>;
