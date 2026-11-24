'use client';
import {useState} from 'react';
import {LoaderCircle,LogOut} from 'lucide-react';
import {api} from './ui';
import {Localized} from './preferences';
export function LogoutButton(){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function logout(){if(busy)return;setBusy(true);setError('');try{await api('/api/auth/logout',{method:'POST'});window.location.replace('/admin');}catch{setError('Log keluar gagal. Sila cuba semula.');setBusy(false);}}
 return <Localized><span className="staff-logout"><button type="button" className="button button-secondary button-small staff-logout-button" disabled={busy} onClick={logout}>{busy?<LoaderCircle size={17} className="spin"/>:<LogOut size={17}/>}<span>{busy?'Sedang log keluar...':'Log keluar'}</span></button>{error&&<span className="staff-logout-error" role="alert">{error}</span>}</span></Localized>;
}
