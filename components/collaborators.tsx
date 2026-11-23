'use client';
import {Localized} from './preferences';
import type {Settings} from '@/lib/types';
import {defaultCollaborators,defaultCollaboratorTitle,defaultCollaboratorDescription} from '@/lib/collaborators';
export function Collaborators({settings}:{settings:Settings}){
 const partners=(settings.collaborators||defaultCollaborators).filter(partner=>partner.active&&partner.logo);
 if(!partners.length)return null;
 return <Localized><section className="collaborators-section" data-design-id="collaborators" data-design-section="true" aria-labelledby="collaborators-heading"><div className="container"><div className="collaborators-heading"><span className="eyebrow">DENGAN KERJASAMA</span><h2 id="collaborators-heading">{settings.collaboratorTitle||defaultCollaboratorTitle}</h2>{settings.collaboratorDescription!==''&&<p>{settings.collaboratorDescription??defaultCollaboratorDescription}</p>}</div><div className="collaborator-grid">{partners.map(partner=><div className="collaborator-item" data-design-id={`collaborator-${partner.id}`} key={partner.id}><div className="collaborator-logo"><img src={partner.logo} alt={`Logo ${partner.name}`} loading="lazy"/></div><span>{partner.name}</span></div>)}</div></div></section></Localized>;
}
