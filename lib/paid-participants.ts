import type {Registration} from './types.ts';
type PaidRecord=Pick<Registration,'id'|'reference'|'fullName'|'email'|'track'|'modules'|'total'|'status'|'deletedAt'|'phone'|'institution'>;
export function paidParticipantsByModule<T extends PaidRecord>(records:T[]){
 const paid=[...new Map(records.filter(r=>r.status==='approved'&&!r.deletedAt).map(r=>[r.id,r])).values()];
 const groups=new Map<string,{id:string;title:string;track:Registration['track'];participants:T[]}>();
 for(const r of paid)for(const m of [...new Map(r.modules.map(m=>[m.id,m])).values()]){const key=r.track+':'+m.id;const group=groups.get(key)||{id:key,title:m.title,track:r.track,participants:[]};group.participants.push(r);groups.set(key,group);}
 return {paid,total:Math.round(paid.reduce((s,r)=>s+r.total,0)*100)/100,groups:[...groups.values()].sort((a,b)=>a.title.localeCompare(b.title))};
}
