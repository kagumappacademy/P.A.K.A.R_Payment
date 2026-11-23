'use client';
import { Children, cloneElement, createContext, isValidElement, useContext, useState, useEffect, type ReactNode } from 'react';
import { Moon, Sun } from 'lucide-react';
import { translateText, type InterfaceText, type Language, type Theme } from '@/lib/i18n';
type Preferences={theme:Theme;language:Language;setTheme:(value:Theme)=>void;setLanguage:(value:Language)=>void;setInterfaceText:(value:InterfaceText)=>void;t:(value:string)=>string};
const Context=createContext<Preferences>({theme:'dark',language:'bm',setTheme:()=>{},setLanguage:()=>{},setInterfaceText:()=>{},t:value=>value});
const EMPTY_TEXT:InterfaceText={};
function savePreference(key:string,value:string){
  document.cookie=`${key}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol==='https:'?'; Secure':''}`;
}
export function PreferencesProvider({initialTheme='dark',initialLanguage='bm',initialInterfaceText=EMPTY_TEXT,children}:{initialTheme?:Theme;initialLanguage?:Language;initialInterfaceText?:InterfaceText;children:ReactNode}) {
  const [theme,setThemeState]=useState<Theme>(initialTheme),[language,setLanguageState]=useState<Language>(initialLanguage);
  const [interfaceText,setInterfaceText]=useState(initialInterfaceText);
  useEffect(()=>setInterfaceText(initialInterfaceText),[initialInterfaceText]);
  const setTheme=(value:Theme)=>{setThemeState(value);document.documentElement.dataset.theme=value;savePreference('pakar-theme',value);};
  const setLanguage=(value:Language)=>{setLanguageState(value);document.documentElement.lang=value==='en'?'en':'ms';savePreference('pakar-language',value);};
  return <Context.Provider value={{theme,language,setTheme,setLanguage,setInterfaceText,t:value=>translateText(value,language,interfaceText)}}><Localized>{children}</Localized></Context.Provider>;
}
export function usePreferences(){return useContext(Context);}

function localize(node:ReactNode,t:(value:string)=>string):ReactNode {
  if(typeof node==='string')return t(node);
  if(Array.isArray(node)){
    const items=Children.toArray(node);
    return items.map((item,index)=>{
      if(typeof item==='string'&&item.trim()==='modul'&&items[index-1]===1&&t('modul')==='modules')return item.replace('modul','module');
      return localize(item,t);
    });
  }
  if(!isValidElement(node))return node;
  const props=node.props as Record<string,unknown>;
  if(props['data-no-translate'])return node;
  const updated:Record<string,unknown>={};
  if(typeof node.type==='string'&&!props['data-copy-keys']){
    const keys=Children.toArray(props.children as ReactNode).filter((child):child is string=>typeof child==='string'&&!!child.trim()&&/[a-zA-Z]/.test(child)).map(text=>text.replace(/\s+/g,' ').trim());
    for(const key of ['placeholder','aria-label','title','alt'])if(typeof props[key]==='string'&&(props[key] as string).trim())keys.push((props[key] as string).replace(/\s+/g,' ').trim());
    if(keys.length)updated['data-copy-keys']=JSON.stringify(keys);
  }
  for(const key of ['aria-label','placeholder','title','alt'])if(typeof props[key]==='string')updated[key]=t(props[key] as string);
  if(props.children!==undefined)updated.children=localize(props.children as ReactNode,t);
  return cloneElement(node,updated);
}
export function Localized({children}:{children:ReactNode}){const {t}=usePreferences();return <>{localize(children,t)}</>;}
export function PreferenceControls(){
  const {theme,language,setTheme,setLanguage,t}=usePreferences();
  return <div className="preference-controls" data-no-translate="true">
    <button className="theme-switch" type="button" role="switch" aria-checked={theme==='dark'} aria-label={t('Mod gelap')} title={t(theme==='dark'?'Tukar ke mod cerah':'Tukar ke mod gelap')} onClick={()=>setTheme(theme==='dark'?'light':'dark')}>
      {theme==='dark'?<Moon size={17}/>:<Sun size={17}/>}<span className="theme-switch-label">{t(theme==='dark'?'Gelap':'Cerah')}</span><span className="theme-switch-track"><span/></span>
    </button>
    <div className="language-switch" role="group" aria-label={t('Bahasa')}><button type="button" lang="ms" aria-pressed={language==='bm'} onClick={()=>setLanguage('bm')} title={t('Bahasa Melayu')}>{t('BM')}</button><button type="button" lang="en" aria-pressed={language==='en'} onClick={()=>setLanguage('en')} title={t('English')}>{t('ENG')}</button></div>
  </div>;
}
