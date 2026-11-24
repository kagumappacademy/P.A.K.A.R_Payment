import {compare} from 'bcryptjs';
type Account={id:string;role:'admin'|'finance';code_hash:string};
const dummyHash='$2b$12$04JBK5rRY35/5sYSu2Xk9O8kCmAn.zvPYJ84HDmj04zK0fGWJPgZi';
export async function matchStaffCode(code:string,accounts:readonly Account[]){
 if(!/^\d{6}$/.test(code))return null;
 const matches=await Promise.all((['admin','finance'] as const).map(async role=>{const account=accounts.find(a=>a.role===role);const valid=await compare(code,account?.code_hash||dummyHash);return account&&valid?account:null;}));
 const found=matches.filter((a):a is Account=>a!==null);
 return found.length===1?found[0]:null;
}
