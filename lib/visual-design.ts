export const designSections=[{id:'hero',label:'Pengenalan utama'},{id:'event',label:'Maklumat program'},{id:'holiday',label:'Nota cuti sekolah'},{id:'about',label:'Tentang & manfaat'},{id:'programs',label:'Track & modul'},{id:'steps',label:'Cara daftar'},{id:'faq',label:'Soalan lazim'},{id:'collaborators',label:'Rakan kolaborasi'},{id:'cta',label:'Ajakan mendaftar'}] as const;
export type ElementStyle={color?:string;backgroundColor?:string;borderColor?:string;fontSize?:number;fontWeight?:number;lineHeight?:number;letterSpacing?:number;textAlign?:'left'|'center'|'right';borderRadius?:number;borderWidth?:number;padding?:number;marginTop?:number;marginBottom?:number;gap?:number;widthPercent?:number;offsetX?:number;offsetY?:number;columns?:number;layout?:'original'|'row'|'column'|'row-reverse';alignItems?:'start'|'center'|'end'|'stretch';shadow?:'none'|'soft'|'glow';hidden?:boolean;inlineBlock?:boolean};
export type Palette={accent?:string;background?:string;surface?:string;text?:string;muted?:string};
export type VisualDesign={version:1;elements:Record<string,{desktop?:ElementStyle;mobile?:ElementStyle}>;sectionOrder:string[];palette?:{dark?:Palette;light?:Palette};font?:'manrope'|'space'|'system'};
export const emptyDesign=():VisualDesign=>({version:1,elements:{},sectionOrder:[]});
export function validDesignSelector(selector:string){return /^\[data-design-id="[a-z][a-z0-9-]{0,127}"\](?: > [a-z][a-z0-9-]*:nth-of-type\([1-9]\d{0,2}\)){0,12}$/.test(selector);}
const numeric:Record<string,[string,number,number,string]>={fontSize:['font-size',8,140,'px'],fontWeight:['font-weight',100,900,''],lineHeight:['line-height',.8,3,''],letterSpacing:['letter-spacing',-5,20,'px'],borderRadius:['border-radius',0,120,'px'],borderWidth:['border-width',0,12,'px'],padding:['padding',0,160,'px'],marginTop:['margin-top',-120,240,'px'],marginBottom:['margin-bottom',-120,240,'px'],gap:['gap',0,120,'px'],widthPercent:['width',10,100,'%']};
const hex=(v:unknown):v is string=>typeof v==='string'&&/^#[a-fA-F0-9]{6}$/.test(v);
export function elementStyleCss(style:ElementStyle={}){
 const rules:string[]=[];
 for(const [key,[property,min,max,unit]] of Object.entries(numeric)){const v=style[key as keyof ElementStyle];if(typeof v==='number'&&Number.isFinite(v))rules.push(`${property}:${Math.min(max,Math.max(min,v))}${unit}!important`);}
 for(const [key,property] of [['color','color'],['backgroundColor','background-color'],['borderColor','border-color']] as const)if(hex(style[key]))rules.push(`${property}:${style[key]}!important`);
 if(style.borderWidth!==undefined)rules.push('border-style:solid!important');
 if(['left','center','right'].includes(style.textAlign||''))rules.push(`text-align:${style.textAlign}!important`);
 if(style.offsetX!==undefined||style.offsetY!==undefined){const n=(v=0)=>Number.isFinite(v)?Math.min(320,Math.max(-320,v)):0;rules.push(`translate:${n(style.offsetX)}px ${n(style.offsetY)}px!important`);}
 if(style.columns&&Number.isInteger(style.columns)&&style.columns>=1&&style.columns<=4)rules.push(`display:grid!important;grid-template-columns:repeat(${style.columns},minmax(0,1fr))!important`);
 else if(['row','column','row-reverse'].includes(style.layout||''))rules.push(`display:flex!important;flex-direction:${style.layout}!important;flex-wrap:wrap!important`);
 if(['start','center','end','stretch'].includes(style.alignItems||''))rules.push(`align-items:${style.alignItems}!important`);
 if(style.inlineBlock===true)rules.push('display:inline-block!important');
 if(style.hidden===true)rules.push('display:none!important');
 if(style.shadow==='none')rules.push('box-shadow:none!important');
 if(style.shadow==='soft')rules.push('box-shadow:0 12px 35px #00000026!important');
 if(style.shadow==='glow')rules.push('box-shadow:0 0 28px color-mix(in srgb,var(--cyan) 24%,transparent)!important');
 return rules.join(';');
}
export function visualDesignCss(design:VisualDesign=emptyDesign()){
 const css:string[]=[];
 for(const mode of ['dark','light'] as const){const palette=design.palette?.[mode];if(!palette)continue;const rules=Object.entries({accent:'--cyan',background:'--bg',surface:'--surface',text:'--text',muted:'--muted'}).flatMap(([key,variable])=>hex(palette[key as keyof Palette])?[`${variable}:${palette[key as keyof Palette]}!important`]:[]);if(rules.length)css.push(`[data-theme="${mode}"]{${rules.join(';')}}`);}
 const font={manrope:"'Manrope Variable','Segoe UI',sans-serif",space:"'Space Grotesk Variable','Segoe UI',sans-serif",system:"'Segoe UI',sans-serif"}[design.font||'manrope'];
 if(design.font&&font)css.push(`:root{--font:${font}!important;--display:${font}!important}`);
 if(design.sectionOrder?.length){const order=[...new Set([...design.sectionOrder,...designSections.map(s=>s.id)])].filter(id=>designSections.some(s=>s.id===id));css.push('[data-design-id="landing"]{display:flex;flex-direction:column}');order.forEach((id,index)=>css.push(`[data-design-id="${id}"]{order:${index}}`));}
 const mobile:string[]=[];
 for(const [selector,styles] of Object.entries(design.elements||{})){if(!validDesignSelector(selector))continue;const desktop=elementStyleCss(styles.desktop),phone=elementStyleCss(styles.mobile);if(desktop)css.push(`@media(min-width:681px){${selector}{${desktop}}}`);if(phone)mobile.push(`${selector}{${phone}}`);}
 if(mobile.length)css.push(`@media(max-width:680px){${mobile.join('')}}`);
 return css.join('\n');
}
