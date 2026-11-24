import {getStaff} from '@/lib/auth';
import {rows,parseRegistration,getConfiguration} from '@/lib/db';
import {financeRecord} from '@/lib/finance';
import {StaffLogin} from '@/components/staff-login';
import {FinanceDashboard} from '@/components/finance-dashboard';
export const dynamic='force-dynamic';
export const metadata={title:'Portal Finance',robots:{index:false,follow:false}};
export default async function FinancePage(){const staff=await getStaff();if(!staff)return <StaffLogin role="finance"/>;const [records,{settings}]=await Promise.all([rows('SELECT * FROM registrations ORDER BY created_at DESC'),getConfiguration()]);return <FinanceDashboard initialRecords={records.map(parseRegistration).map(financeRecord)} tracks={settings.tracks} role={staff.role}/>;}
