import { getConfiguration } from '@/lib/db';
import { RegistrationWizard } from '@/components/registration';
export const dynamic='force-dynamic';
export const metadata={title:'Daftar Program'};
export default async function RegisterPage({searchParams}:{searchParams:Promise<{track?:string;modul?:string;sesi?:string}>}) {const query=await searchParams;return <RegistrationWizard {...await getConfiguration()} initialTrack={query.track==='universiti'?'universiti':'menengah'} initialModule={query.modul} initialSession={query.sesi}/>;}
