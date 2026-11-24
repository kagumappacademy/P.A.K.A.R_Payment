'use client';
import { useId, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Localized } from './preferences';

type PasswordFieldProps=Omit<InputHTMLAttributes<HTMLInputElement>,'type'|'id'> & {label:string};
export function PasswordField({label,...props}:PasswordFieldProps){
  const id=useId(),[visible,setVisible]=useState(false);
  const action=label.toLowerCase().includes('kod')?(visible?'Sembunyikan kod':'Tunjukkan kod'):(visible?'Sembunyikan kata laluan':'Tunjukkan kata laluan');
  return <Localized><div className="field"><span><label htmlFor={id}>{label}</label></span><div className="password-input"><input {...props} id={id} type={visible?'text':'password'}/><button className="password-visibility-toggle" type="button" aria-label={action} title={action} aria-controls={id} aria-pressed={visible} onClick={()=>setVisible(value=>!value)}>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button></div></div></Localized>;
}
