import { getAdmin } from '@/lib/auth';
import { getConfiguration, parseRegistration, rows } from '@/lib/db';
import { AdminDashboard, AdminLogin } from '@/components/admin';
export const dynamic='force-dynamic';
export const metadata={title:'Portal Admin',robots:{index:false,follow:false}};
export default async function AdminPage(){const admin=await getAdmin();if(!admin)return <AdminLogin/>;const [config,records]=await Promise.all([getConfiguration(true,true),rows('SELECT * FROM registrations ORDER BY created_at DESC')]);return <AdminDashboard {...config} initialRegistrations={records.map(parseRegistration)} email={admin.email}/>;}
