import ts from 'typescript';
import {readFile,readdir,writeFile} from 'node:fs/promises';
const dictionary=JSON.parse(await readFile('data/en.json','utf8')),entries=new Map();
const groups={landing:'landing',header:'navigation',footer:'navigation',organizer:'navigation',registration:'registration',payment:'payment','generated-receipt':'payment',admin:'admin','password-field':'admin',preferences:'navigation','background-music':'navigation','technology-backdrop':'navigation','interface-text-editor':'admin'};
function add(value,group){const key=value.replace(/\s+/g,' ').trim();if(!key||key.length>6000||!/[a-zA-Z]/.test(key))return;const old=entries.get(key);if(old){if(!old.groups.includes(group))old.groups.push(group);}else entries.set(key,{key,groups:[group]});}
const files=(await readdir('components')).filter(f=>f.endsWith('.tsx')).map(f=>'components/'+f).concat(['app/error.tsx','app/not-found.tsx','app/layout.tsx','lib/receipt-pdf.ts','lib/receipts.ts','app/api/[...path]/route.ts']);
for(const file of files){
 const source=ts.createSourceFile(file,await readFile(file,'utf8'),ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS),name=file.split('/').at(-1).replace(/\.tsx?$/,''),group=groups[name]||'system';
 function visit(node){
  if(ts.isJsxText(node))add(node.text,group);
  if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node)){
   const value=node.text,parent=node.parent;
   if(ts.isJsxAttribute(parent)&&['title','alt','aria-label','placeholder','label'].includes(parent.name.getText(source)))add(value,group);
   else if(Object.hasOwn(dictionary,value)||(/\s/.test(value)&&/^[A-ZÀ-ž]/.test(value)&&!/[{}<>]|^(SELECT|UPDATE|INSERT|DELETE|CREATE|ALTER|Content-|Cache-|Bearer|Path=|Max-Age)/.test(value)&&!value.includes('://')))add(value,group);
  }
  ts.forEachChild(node,visit);
 }visit(source);
}
for(const key of Object.keys(dictionary))if(!entries.has(key))add(key,'general');
for(const key of ['BM','ENG','Bahasa Melayu','English','P.A.K.A.R / DIGITAL MISSION','modul','/ modul'])if(!entries.has(key))add(key,'navigation');
await writeFile('data/text-catalog.json',JSON.stringify([...entries.values()].sort((a,b)=>a.key.localeCompare(b.key,'ms')),null,2)+'\n');
console.log(`Generated ${entries.size} editable text entries.`);
