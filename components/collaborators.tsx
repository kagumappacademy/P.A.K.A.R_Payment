'use client';
import {Localized} from './preferences';
import {useEffect,useState} from 'react';
import type {Settings} from '@/lib/types';
import {defaultCollaborators,defaultCollaboratorTitle,defaultCollaboratorDescription} from '@/lib/collaborators';
export function Collaborators({settings}:{settings:Settings}){
 const partners=(settings.collaborators||defaultCollaborators).filter(partner=>partner.active&&partner.logo);
 const [index,setIndex]=useState(0),[animated,setAnimated]=useState(true),[reduced,setReduced]=useState(false);
 const signature=partners.map(p=>p.id).join(',');
 useEffect(()=>{setIndex(0);},[signature]);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 useEffect(()=>{if(partners.length<2||reduced)return;const timer=setInterval(()=>setIndex(old=>old>=partners.length?0:old+1),3200);return()=>clearInterval(timer);},[partners.length,reduced]);
 if(!partners.length)return null;
 return <Localized><section className="collaborators-section" data-design-id="collaborators" data-design-section="true" aria-labelledby="collaborators-heading"><div className="container"><div className="collaborators-heading"><span className="eyebrow">DENGAN KERJASAMA</span><h2 id="collaborators-heading">{settings.collaboratorTitle||defaultCollaboratorTitle}</h2>{settings.collaboratorDescription!==''&&<p>{settings.collaboratorDescription??defaultCollaboratorDescription}</p>}</div><div className="collaborator-carousel" role="region" aria-roledescription="carousel" aria-label="Logo rakan kolaborasi" data-slide-index={index%partners.length}><div className="collaborator-slider"><div className={`collaborator-track ${animated&&!reduced?'animate':''}`} style={{transform:`translateX(-${index*100}%)`}} onTransitionEnd={e=>{if(e.target===e.currentTarget&&e.propertyName==='transform'&&index===partners.length){setAnimated(false);setIndex(0);requestAnimationFrame(()=>requestAnimationFrame(()=>setAnimated(true)));}}}>{[...partners,...(partners.length>1?[partners[0]]:[])].map((partner,i)=><div className="collaborator-slide" aria-hidden={i!==index} key={i} data-design-id={i<partners.length?`collaborator-${partner.id}`:undefined}><div className="collaborator-logo"><img src={partner.logo} alt={`Logo ${partner.name}`} loading={i===0?'eager':'lazy'}/></div><span>{partner.name}</span></div>)}</div></div>{partners.length>1&&<div className="collaborator-controls"><div role="group" aria-label="Pilihan logo">{partners.map((partner,i)=><button key={partner.id} type="button" aria-label={`Lihat logo ${partner.name}`} aria-pressed={index%partners.length===i} onClick={()=>{setAnimated(true);setIndex(i);}}><span/></button>)}</div></div>}</div></div></section></Localized>;
}
