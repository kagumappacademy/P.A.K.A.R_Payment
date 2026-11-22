'use client';
import { useEffect, useRef, type CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { usePreferences } from './preferences';

export function TechnologyBackdrop(){
  const background=useRef<HTMLDivElement>(null),pathname=usePathname();
  const {language}=usePreferences();
  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');let frame=0;
    const move=(event:PointerEvent)=>{
      if(media.matches||frame)return;
      frame=requestAnimationFrame(()=>{background.current?.style.setProperty('--pointer-x',`${event.clientX}px`);background.current?.style.setProperty('--pointer-y',`${event.clientY}px`);frame=0;});
    };
    window.addEventListener('pointermove',move,{passive:true});
    return()=>{window.removeEventListener('pointermove',move);cancelAnimationFrame(frame);};
  },[]);
  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
    const selector='.about-grid,.benefit,.section-heading,.module-card,.combo-banner,.step-card,.faq-item,.final-cta';
    const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}},{threshold:.08,rootMargin:'0px 0px -15px 0px'});
    function scan(){document.querySelectorAll<HTMLElement>(selector).forEach(element=>{if(element.dataset.reveal)return;element.dataset.reveal='true';element.classList.add('reveal-ready');observer.observe(element);});}
    scan();let frame=0;
    const mutations=new MutationObserver(()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;scan();});});
    mutations.observe(document.body,{childList:true,subtree:true});
    return()=>{observer.disconnect();mutations.disconnect();cancelAnimationFrame(frame);document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(element=>{element.classList.remove('reveal-ready','is-visible');delete element.dataset.reveal;});};
  },[pathname,language]);
  return <div className="technology-backdrop" ref={background} aria-hidden="true" data-no-translate="true">
    <div className="technology-grid"/>
    <svg className="technology-circuits" viewBox="0 0 1440 1000" fill="none" preserveAspectRatio="xMidYMid slice"><g stroke="currentColor" strokeWidth="1"><path d="M-50 200h210l80 80h130l60 60h90M0 230h140l80 80h100M1440 100h-180l-65 65h-120l-40 40h-95M1440 130h-150l-50 50h-80M-40 790h160l95-95h130l70-70h120M0 830h135l90-90h160M1480 800h-180l-90-90h-120l-70-70h-140M1440 845h-160l-70-70h-75"/><g fill="currentColor"><circle cx="520" cy="340" r="4"/><circle cx="320" cy="310" r="3"/><circle cx="940" cy="205" r="4"/><circle cx="1160" cy="180" r="3"/><circle cx="535" cy="625" r="4"/><circle cx="385" cy="740" r="3"/><circle cx="880" cy="640" r="4"/><circle cx="1135" cy="775" r="3"/></g></g></svg>
    <div className="technology-pointer-glow"/>
    <div className="technology-orbit technology-orbit-one"><span/><i/></div><div className="technology-orbit technology-orbit-two"><span/></div>
    <div className="technology-particles">{Array.from({length:14},(_,index)=><span key={index} style={{'--particle-index':index,'--particle-left':`${(index*37+11)%100}%`,'--particle-top':`${(index*23+13)%100}%`} as CSSProperties}/>)}</div>
    <span className="technology-hud-label">P.A.K.A.R / DIGITAL MISSION</span>
  </div>;
}
