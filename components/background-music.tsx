'use client';
import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { usePreferences } from './preferences';

const STORAGE_KEY='pakar-music-preferences';
export function BackgroundMusic(){
  const audio=useRef<HTMLAudioElement>(null),container=useRef<HTMLDivElement>(null),volume=useRef(.2);
  const {t}=usePreferences();
  const [muted,setMuted]=useState(false),[playing,setPlaying]=useState(false),[ready,setReady]=useState(false),[waiting,setWaiting]=useState(false),[error,setError]=useState('');
  useEffect(()=>{
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(saved&&typeof saved.muted==='boolean')setMuted(saved.muted);
      if(saved&&typeof saved.volume==='number'&&Number.isFinite(saved.volume)&&saved.volume>0)volume.current=Math.max(.01,Math.min(1,saved.volume/100));
    }catch{}
    if(audio.current)audio.current.volume=volume.current;
    setReady(true);
  },[]);
  useEffect(()=>{
    if(audio.current)audio.current.muted=muted;
    if(ready)try{localStorage.setItem(STORAGE_KEY,JSON.stringify({volume:Math.round(volume.current*100),muted}));}catch{}
  },[muted,ready]);
  useEffect(()=>{
    if(!ready)return;
    const player=audio.current;if(!player)return;
    let active=true,starting=false;
    function detach(){document.removeEventListener('pointerdown',interact);document.removeEventListener('keydown',interact);}
    function start(){
      if(starting)return;starting=true;
      player!.play().then(()=>{if(active){setWaiting(false);detach();}}).catch(reason=>{
        if(active&&reason?.name==='NotAllowedError')setWaiting(true);
      }).finally(()=>{starting=false;});
    }
    function interact(event:Event){
      if(event.target instanceof Node&&container.current?.contains(event.target))return;
      if(event instanceof KeyboardEvent&&['Shift','Control','Alt','Meta','Escape'].includes(event.key))return;
      start();
    }
    document.addEventListener('pointerdown',interact);document.addEventListener('keydown',interact);start();
    return()=>{active=false;detach();};
  },[ready]);
  const silent=muted||waiting||!playing;
  async function toggleMute(){
    const player=audio.current;if(!player)return;
    if(!silent){setMuted(true);player.muted=true;return;}
    setMuted(false);player.muted=false;setError('');
    try{await player.play();setWaiting(false);}catch{setWaiting(true);setError('Muzik tidak dapat dimainkan. Cuba semula.');}
  }
  return <div className="background-music" ref={container} data-no-translate="true">
    <audio ref={audio} src="/audio/pakar-technology-theme.mp3" autoPlay={ready} loop muted={muted} preload="none" onPlay={()=>{setPlaying(true);setWaiting(false);}} onPause={()=>setPlaying(false)} onError={()=>{setPlaying(false);setError('Muzik tidak dapat dimainkan. Cuba semula.');}}/>
    {error&&<p className="music-error" role="status">{t(error)}</p>}
    <button type="button" className={`music-mute-button ${!silent?'is-playing':''}`} onClick={toggleMute} aria-label={t(silent?'Bunyikan muzik':'Senyapkan muzik')} aria-pressed={silent} title={t(silent?'Bunyikan muzik':'Senyapkan muzik')}>
      <span className="music-play-icon">{silent?<VolumeX size={19}/>:<Volume2 size={19}/>}</span><span>{t('Muzik latar')}<small>{t(silent?'Bunyikan muzik':'Senyapkan muzik')}</small></span>
    </button>
  </div>;
}
