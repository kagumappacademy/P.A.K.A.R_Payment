import {getStaff} from '@/lib/auth';
import {rows,parseRegistration,getConfiguration} from '@/lib/db';
import {financeRecord} from '@/lib/finance';
import {redirect} from 'next/navigation';
import {FinanceDashboard} from '@/components/finance-dashboard';
export const dynamic='force-dynamic';
export const metadata={title:'Semakan pembayaran',robots:{index:false,follow:false}};
export default async function FinancePage(){const staff=await getStaff();if(!staff)redirect('/admin');const [records,{settings,modules}]=await Promise.all([rows("SELECT * FROM registrations WHERE json_extract(content,'$.deletedAt') IS NULL ORDER BY created_at DESC"),getConfiguration(true)]);return <FinanceDashboard initialRecords={records.map(parseRegistration).map(financeRecord)} tracks={settings.tracks} modules={modules} role={staff.role}/>;}
