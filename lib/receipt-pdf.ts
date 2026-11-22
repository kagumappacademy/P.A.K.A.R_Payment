import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { money } from './pricing';
import { receiptDate, receiptSnapshot, receiptStatus } from './receipts';
import type { Registration, Settings } from './types';

const navy=rgb(.045,.085,.15), cyan=rgb(.13,.74,.8), ink=rgb(.12,.18,.27), muted=rgb(.4,.46,.55), border=rgb(.86,.89,.92), white=rgb(1,1,1);
let fontFiles:Promise<Buffer[]>|undefined;
function wrap(text:string,font:PDFFont,size:number,width:number) {
  const words=String(text).replace(/[\u0000-\u001f]/g,' ').split(/\s+/), lines:string[]=[];let line='';
  for(const word of words){
    const candidate=line?`${line} ${word}`:word;
    if(font.widthOfTextAtSize(candidate,size)<=width){line=candidate;continue;}
    if(line)lines.push(line);line='';
    for(const character of word){
      if(line && font.widthOfTextAtSize(line+character,size)>width){lines.push(line);line='';}
      line+=character;
    }
  }
  if(line)lines.push(line);return lines.length?lines:[''];
}

export async function createPaymentReceiptPdf(registration:Registration,settings:Settings) {
  const doc=await PDFDocument.create();doc.registerFontkit(fontkit);
  const buffers=await (fontFiles??=Promise.all(['NotoSans-Regular.ttf','NotoSans-Bold.ttf'].map(name=>readFile(join(process.cwd(),'public','fonts',name)))));
  const [regular,bold]=await Promise.all(buffers.map(data=>doc.embedFont(data,{subset:true})));
  const snapshot=receiptSnapshot(registration,settings),status=receiptStatus(registration.status);
  doc.setTitle(`${snapshot.eventName} - ${snapshot.number}`);doc.setAuthor(snapshot.organizer);doc.setSubject('Resit pendaftaran program');doc.setCreationDate(new Date(snapshot.issuedAt));
  const width=595.28,height=841.89,left=44,right=width-44,contentWidth=right-left;
  let page!:PDFPage,y=0;
  function text(value:string,x:number,top:number,size=10,font=regular,color=ink){page.drawText(value,{x,y:height-top-size,font,size,color});}
  function newPage(first=false){
    page=doc.addPage([width,height]);
    if(first){
      page.drawRectangle({x:0,y:height-135,width,height:135,color:navy});
      [cyan,rgb(.68,.56,.93),rgb(.64,.84,.23),rgb(.98,.8,.24)].forEach((color,i)=>page.drawRectangle({x:left+(i%2)*9,y:height-40-Math.floor(i/2)*11,width:7,height:9,color}));
      text(snapshot.eventName,left+31,27,19,bold,white);
      text('RESIT PENDAFTARAN',left,65,22,bold,white);
      text(snapshot.number,left,101,10,regular,rgb(.65,.86,.91));
      y=150;
    }else{ text(`${snapshot.eventName} | ${snapshot.number}`,left,31,11,bold,navy);y=65; }
  }
  function ensure(space:number){if(y+space>height-68)newPage();}
  function paragraph(value:string,size=10,font=regular,color=ink,maxWidth=contentWidth,x=left){
    for(const line of wrap(value,font,size,maxWidth)){ensure(size+7);text(line,x,y,size,font,color);y+=size+6;}
  }
  function line(){ensure(18);page.drawLine({start:{x:left,y:height-y},end:{x:right,y:height-y},thickness:.7,color:border});y+=18;}
  function labelValue(label:string,value:string){paragraph(label.toUpperCase(),8,bold,muted);paragraph(value,10);y+=7;}
  function fieldRow(fields:{label:string;value:string}[]){
    const gap=24,columnWidth=(contentWidth-gap)/2;
    const entries=fields.map(field=>({...field,lines:wrap(field.value,regular,9,columnWidth)}));
    const rowHeight=17+Math.max(...entries.map(field=>field.lines.length))*13+10;
    ensure(rowHeight);
    entries.forEach((field,index)=>{const x=left+index*(columnWidth+gap);text(field.label.toUpperCase(),x,y,8,bold,muted);field.lines.forEach((value,lineIndex)=>text(value,x,y+16+lineIndex*13,9));});
    y+=rowHeight;
  }
  newPage(true);
  const statusColor=registration.status==='approved'?rgb(.08,.4,.25):registration.status==='rejected'?rgb(.7,.18,.25):rgb(.57,.37,.09);
  paragraph(status.label.toUpperCase(),11,bold,statusColor);y+=4;
  paragraph(status.note,9,regular,muted);y+=10;
  fieldRow([{label:'Nombor pendaftaran',value:registration.reference},{label:'Tarikh resit',value:`${receiptDate(snapshot.issuedAt)} (MYT)`}]);
  if(registration.paymentApprovedAt)labelValue('Disahkan pada',`${receiptDate(registration.paymentApprovedAt)} (MYT)`);
  line();
  fieldRow([{label:'Peserta',value:registration.fullName},{label:'E-mel',value:registration.email}]);
  fieldRow([{label:'Institusi',value:registration.institution},{label:'Track',value:settings.tracks[registration.track].name}]);
  fieldRow([{label:'Penerima bayaran',value:snapshot.recipient},{label:'Program',value:`${snapshot.eventName} | ${snapshot.eventDate}`}]);
  line();
  ensure(70);
  page.drawRectangle({x:left,y:height-y-27,width:contentWidth,height:27,color:rgb(.94,.96,.98)});
  text('MODUL PILIHAN',left+10,y+7,9,bold,muted);text('HARGA (RM)',right-88,y+7,9,bold,muted);y+=35;
  for(const mod of registration.modules){
    const lines=wrap(mod.title,regular,10,contentWidth-120),rowHeight=Math.max(26,lines.length*16+7);ensure(rowHeight);
    lines.forEach((value,i)=>text(value,left+10,y+i*16,10));
    const price=money(mod.price);text(price,right-10-regular.widthOfTextAtSize(price,10),y,10);y+=rowHeight;
  }
  line();ensure(105);
  for(const [label,value] of [['Harga asal',money(registration.subtotal)],[`Diskaun kombo (${registration.discountPercent}%)`,`- ${money(registration.discount)}`]]){
    text(label,left,y,10,regular,muted);text(value,right-regular.widthOfTextAtSize(value,10),y,10);y+=24;
  }
  page.drawRectangle({x:left,y:height-y-49,width:contentWidth,height:49,color:navy});
  text('JUMLAH PENDAFTARAN',left+14,y+17,10,bold,white);
  const total=money(registration.total);text(total,right-14-bold.widthOfTextAtSize(total,19),y+10,19,bold,white);y+=69;
  if(registration.adminNote){paragraph('NOTA ADMIN',8,bold,muted);paragraph(registration.adminNote,9);y+=12;}
  paragraph(`Program: ${snapshot.eventName} | ${snapshot.eventDate}`,9,regular,muted);
  paragraph(`Penganjur: ${snapshot.organizer}`,9,regular,muted);
  y+=10;paragraph('Resit dijana secara elektronik. Status terkini boleh disemak menggunakan nombor pendaftaran dan e-mel di portal P.A.K.A.R.',8,regular,muted);
  doc.getPages().forEach((sheet,index)=>{
    sheet.drawLine({start:{x:left,y:44},end:{x:right,y:44},thickness:.6,color:border});
    sheet.drawText('P.A.K.A.R | Resit pendaftaran',{x:left,y:28,font:regular,size:8,color:muted});
    sheet.drawText(`${index+1} / ${doc.getPageCount()}`,{x:right-30,y:28,font:regular,size:8,color:muted});
  });
  return doc.save();
}
