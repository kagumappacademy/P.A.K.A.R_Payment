import { getConfiguration } from '@/lib/db';
import { StatusLookup } from '@/components/status-lookup';
export const dynamic='force-dynamic';
export const metadata={title:'Semak Pendaftaran'};
export default async function StatusPage(){const {settings}=await getConfiguration();return <StatusLookup settings={settings}/>;}
