'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {LockKeyhole,ShieldCheck,LoaderCircle} from 'lucide-react';
import {Brand} from './header';
import {Localized,PreferenceControls} from './preferences';
import {PasswordField} from './password-field';
import {api,Notice} from './ui';
export function StaffLogin(){
 const [code,setCode]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');const router=useRouter();
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{const result=await api<{redirectTo:'/admin'|'/finance'}>('/api/auth/login',{method:'POST',body:JSON.stringify({code})});router.replace(result.redirectTo);router.refresh();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <Localized><main id="main" className="admin-login"><div className="admin-login-art"><Brand/><div><span className="eyebrow">PUSAT KAWALAN P.A.K.A.R</span><h1>Setiap misi, dalam kawalan.</h1><p>Urus program, peserta dan pembayaran anda.</p><div className="login-graphic"><ShieldCheck size={110}/></div></div><p>Kagum Academy</p></div><div className="admin-login-form"><PreferenceControls/><Link className="back-link" href="/">Kembali ke website</Link><form onSubmit={submit}><span className="panel-icon"><LockKeyhole size={25}/></span><h2>Portal Admin</h2><p>Masukkan kod akses 6 digit untuk log masuk.</p><PasswordField label="Kod akses 6 digit" required inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} autoComplete="off" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="••••••"/>{error&&<Notice error>{error}</Notice>}<button className="button button-full" disabled={busy||code.length!==6}>{busy?<LoaderCircle size={18} className="spin"/>:<LockKeyhole size={18}/>}Log masuk</button><p className="secure-note"><ShieldCheck size={14}/>Akses terhad kepada petugas yang dibenarkan.</p></form></div></main></Localized>;
}
