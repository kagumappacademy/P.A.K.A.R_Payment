import english from '../data/en.json' with { type: 'json' };
export type Language='bm'|'en';
export type Theme='light'|'dark';
export type InterfaceText=Record<string,{bm?:string;en?:string}>;
const dictionary=english as Record<string,string>;
const lower=Object.fromEntries(Object.entries(dictionary).map(([key,value])=>[key.toLowerCase(),value]));
export function translateText(value:string,language:Language,overrides:InterfaceText={}):string {
  const normalized=value.replace(/\s+/g,' ').trim();
  const customKey=Object.hasOwn(overrides,normalized)?normalized:normalized===normalized.toUpperCase()?Object.keys(overrides).find(key=>key.toLowerCase()===normalized.toLowerCase()):undefined;
  let custom=customKey===undefined?undefined:overrides[customKey]?.[language];
  if(custom!==undefined&&customKey!==normalized)custom=custom.toUpperCase();
  if(custom!==undefined)return `${value.match(/^\s*/)?.[0]||''}${custom}${value.match(/\s*$/)?.[0]||''}`;
  if(language==='bm'||!value.trim())return value;
  const key=value.replace(/\s+/g,' ').trim();
  let translated=dictionary[key];
  if(!translated&&lower[key.toLowerCase()]){
    translated=lower[key.toLowerCase()];
    if(key===key.toUpperCase())translated=translated.toUpperCase();
  }
  if(!translated){
    const count=key.match(/^(\d+)(\+?) modul$/);
    if(count)translated=`${count[1]}${count[2]} ${count[1]==='1'&&!count[2]?'module':'modules'}`;
    const prefix=key.match(/^(Logo penganjur|Poster penuh|Poster modul|Gambar modul|Gambar|Poster|Lihat|Maklumat) (.+)$/);
    if(!translated&&prefix)translated=`${translateText(prefix[1],language,overrides)} ${translateText(prefix[2],language,overrides)}`;
    if(!translated&&/\d.*\d{4}/.test(key)){
      translated=key.replace(/Januari/g,'January').replace(/Februari/g,'February').replace(/Mac\b/g,'March').replace(/Mei/g,'May').replace(/Jun\b/g,'June').replace(/Julai/g,'July').replace(/Ogos/g,'August').replace(/Oktober/g,'October').replace(/Disember/g,'December').replace(/ pada /g,' at ').replace(/ PTG\b/g,' pm').replace(/ PG\b/g,' am');
    }
  }
  if(!translated)return value;
  return `${value.match(/^\s*/)?.[0]||''}${translated}${value.match(/\s*$/)?.[0]||''}`;
}
