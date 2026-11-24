import { getStaff } from '@/lib/auth';
import {redirect} from 'next/navigation';
import { getConfiguration, parseRegistration, rows } from '@/lib/db';
import { AdminDashboard, AdminLogin } from '@/components/admin';
export const dynamic='force-dynamic';
export const metadata={title:'Portal Admin',robots:{index:false,follow:false}};
export default async function AdminPage(){const admin=await getStaff();if(!admin)return <AdminLogin/>;if(admin.role==='finance')redirect('/finance');const [config,records]=await Promise.all([getConfiguration(true,true),rows("SELECT * FROM registrations WHERE json_extract(content,'$.deletedAt') IS NULL ORDER BY created_at DESC")]);return <AdminDashboard {...config} initialRegistrations={records.map(parseRegistration)} email={admin.email}/>;}
