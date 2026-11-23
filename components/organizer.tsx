'use client';
import { Localized } from './preferences';

export function OrganizerBadge({name='Kagum Academy',logo='/images/brand/kagum-academy.jpg',className=''}:{name?:string;logo?:string;className?:string}){
  return <Localized><div className={`organizer-badge ${className}`}>{logo&&<img src={logo} alt={`Logo penganjur ${name}`} width={1080} height={1080}/>}<span>DIANJURKAN OLEH<strong>{name}</strong></span></div></Localized>;
}
