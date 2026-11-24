import {getStaff} from '@/lib/auth';
import {rows,parseRegistration} from '@/lib/db';
import {financeRecord} from '@/lib/finance';
import {redirect} from 'next/navigation';
import {RegistrationManager} from '@/components/registration-manager';
export const dynamic='force-dynamic';
export const metadata={title:'Urus pendaftaran',robots:{index:false,follow:false}};
export default async function RegistrationManagerPage(){const staff=await getStaff();if(!staff)redirect('/admin');const records=await rows('SELECT * FROM registrations ORDER BY created_at DESC');return <RegistrationManager initialRecords={records.map(parseRegistration).map(financeRecord)} role={staff.role}/>;}
