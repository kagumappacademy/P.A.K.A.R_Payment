import type {Registration} from './types.ts';
export function archiveRegistrationBatch(records:Registration[],items:{id:string;expectedUpdatedAt:string}[],reason:string,at:string){
 if(!items.length||items.length>100||new Set(items.map(item=>item.id)).size!==items.length)throw new Error('Pilih 1 hingga 100 pendaftaran yang berbeza.');
 return items.map(item=>{const record=records.find(record=>record.id===item.id);if(!record)throw new Error('Rekod telah berubah. Muat semula sebelum meneruskan.');return changeRegistrationArchive(record,{action:'archive',expectedUpdatedAt:item.expectedUpdatedAt,reason},'admin',at);});
}
export function changeRegistrationArchive(record:Registration,input:{action:'archive'|'restore';expectedUpdatedAt:string;reason?:string},role:'admin'|'finance',at:string):Registration{
 if(record.updatedAt!==input.expectedUpdatedAt||Boolean(record.deletedAt)!==(input.action==='restore'))throw new Error('Rekod telah berubah. Muat semula sebelum meneruskan.');
 const reason=input.reason?.trim()||'';if(input.action==='archive'&&reason.length<3)throw new Error('Sila nyatakan sebab pendaftaran dibuang.');
 return {...record,deletedAt:input.action==='archive'?at:undefined,deletedReason:input.action==='archive'?reason:undefined,deletedByRole:input.action==='archive'?role:undefined,registrationHistory:[...(record.registrationHistory||[]),{action:input.action==='archive'?'archived':'restored',at,role,reason:input.action==='restore'?'Pendaftaran dipulihkan.':reason}]};
}
