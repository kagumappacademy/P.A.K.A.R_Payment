import {getAdmin} from '@/lib/auth';
import {getConfiguration} from '@/lib/db';
import {AdminLogin} from '@/components/admin';
import {RegistrationWizard} from '@/components/registration';
import {PaymentPreview} from '@/components/payment-preview';
export const dynamic='force-dynamic';
export const metadata={title:'Pratonton Pembayaran',robots:{index:false,follow:false}};
export default async function Preview({searchParams}:{searchParams:Promise<{view?:string}>}){if(!await getAdmin())return <AdminLogin/>;const {settings,modules}=await getConfiguration();if((await searchParams).view==='modules')return <RegistrationWizard settings={settings} modules={modules} initialTrack="menengah" previewStep={2}/>;return <PaymentPreview settings={settings} modules={modules}/>;}
