import { getConfiguration } from '@/lib/db';
import { Landing } from '@/components/landing';
export const dynamic='force-dynamic';
export default async function Home() {return <Landing {...await getConfiguration()}/>;}
