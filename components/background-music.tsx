'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { LoaderCircle, Music2, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import { usePreferences } from './preferences';

const STORAGE_KEY='pakar-music-preferences';
export function BackgroundMusic(){
  const audio=useRef<HTMLAudioElement>(null),container=useRef<HTMLDivElement>(null),volumeButton=useRef<HTMLButtonElement>(null);
  const panelId=useId(),sliderId=useId(),{t}=usePreferences();
  const [volume,setVolume]=useState(20),[muted,setMuted]=useState(false),[playing,setPlaying]=useState(false),[busy,setBusy]=useState(false),[open,setOpen]=useState(false),[ready,setReady]=useState(false),[error,setError]=useState('');
  useEffect(()=>{
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(saved&&typeof saved.volume==='number'&&Number.isFinite(saved.volume))setVolume(Math.max(0,Math.min(100,saved.volume)));
      if(saved&&typeof saved.muted==='boolean')setMuted(saved.muted);
    }catch{}
    setReady(true);
  },[]);
  useEffect(()=>{
    if(audio.current){audio.current.volume=volume/100;audio.current.muted=muted;}
    if(ready)try{localStorage.setItem(STORAGE_KEY,JSON.stringify({volume,muted}));}catch{}
  },[volume,muted,ready]);
  useEffect(()=>{
    if(!open)return;
    const close=(event:PointerEvent)=>{if(event.target instanceof Node&&!container.current?.contains(event.target))setOpen(false);};
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);volumeButton.current?.focus();}};
    document.addEventListener('pointerdown',close);document.addEventListener('keydown',escape);
    return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',escape);};
  },[open]);
  async function togglePlayback(){
    const player=audio.current;if(!player||busy)return;
    if(!player.paused){player.pause();return;}
    setBusy(true);setError('');
    try{await player.play();}catch{setError('Muzik tidak dapat dimainkan. Cuba semula.');setOpen(true);}finally{setBusy(false);}
  }
  const silent=muted||volume===0;
  function toggleMute(){if(volume===0){setVolume(20);setMuted(false);}else setMuted(value=>!value);}
  return <div className="background-music" ref={container} data-no-translate="true">
    <audio ref={audio} src="/audio/pakar-technology-theme.mp3" loop preload="none" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>{setBusy(false);setPlaying(false);setError('Muzik tidak dapat dimainkan. Cuba semula.');}}/>
    {open&&<div className="music-volume-panel" id={panelId} role="group" aria-label={t('Kawalan muzik latar')}>
      <div className="music-panel-heading"><span><Music2 size={16} aria-hidden="true"/>{t('Muzik latar')}</span><button type="button" className="music-icon-button" onClick={()=>{setOpen(false);volumeButton.current?.focus();}} aria-label={t('Tutup kawalan muzik')}><X size={16}/></button></div>
      <div className="music-volume-label"><label htmlFor={sliderId}>{t('Volume muzik')}</label><output htmlFor={sliderId}>{silent?0:Math.round(volume)}%</output></div>
      <div className="music-volume-row"><button type="button" className="music-icon-button" aria-label={t(silent?'Bunyikan muzik':'Senyapkan muzik')} aria-pressed={silent} onClick={toggleMute}>{silent?<VolumeX size={19}/>:<Volume2 size={19}/>}</button><input id={sliderId} type="range" min="0" max="100" step="1" value={volume} aria-valuetext={`${Math.round(volume)}%`} onChange={event=>{setVolume(Number(event.target.value));setMuted(false);}}/></div>
      <p className="music-track-credit">Technology Background · MUSIC4VIDEO</p>
      {error&&<p className="music-error" role="status">{t(error)}</p>}
    </div>}
    <div className={`music-player-pill ${playing&&!silent?'is-playing':''}`}>
      <button type="button" className="music-play-button" onClick={togglePlayback} disabled={busy} aria-label={t(playing?'Jeda muzik latar':'Mainkan muzik latar')}>
        <span className="music-play-icon">{busy?<LoaderCircle className="spin" size={17}/>:playing?<Pause size={17} fill="currentColor"/>:<Play size={17} fill="currentColor"/>}</span><span>{t('Muzik latar')}<small>{t(playing?'Sedang dimainkan':'Tekan untuk main')}</small></span>
      </button>
      <button type="button" ref={volumeButton} className="music-volume-toggle music-icon-button" aria-label={t('Laraskan volume muzik')} title={t('Laraskan volume muzik')} aria-expanded={open} aria-controls={panelId} onClick={()=>setOpen(value=>!value)}>{silent?<VolumeX size={19}/>:<Volume2 size={19}/>}</button>
    </div>
  </div>;
}
