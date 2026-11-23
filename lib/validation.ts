import { z } from 'zod';
const text = (max = 200) => z.string().trim().min(1).max(max);
const optionalText = (max = 200) => z.string().trim().max(max).default('');
const asset = z.string().max(250).regex(/^$|^\/images\/[a-zA-Z0-9_./-]+$|^\/api\/files\/[a-f0-9-]{36}$/);
export const whatsappGroupSchema = z.string().trim().max(350).refine(value=>{
  if(!value)return true;
  try {
    const url=new URL(value);
    return url.protocol==='https:' && url.hostname==='chat.whatsapp.com' && !url.port && !url.username && !url.password && !url.hash && /^\/[a-zA-Z0-9]{10,64}\/?$/.test(url.pathname);
  }catch{return false;}
},'Gunakan pautan jemputan kumpulan rasmi https://chat.whatsapp.com/...');
export const registrationSchema = z.object({
  fullName: text(120), email: z.email().max(190).transform(v=>v.toLowerCase()),
  phone: text(25).regex(/^[+\d\s()-]{8,25}$/), institution: text(200), age: z.number().int().min(12).max(99),
  guardianName: optionalText(120), guardianPhone: optionalText(25),
  track: z.enum(['menengah','universiti']),
  moduleIds: z.array(text(80)).min(1).max(20), consent: z.literal(true),
  idempotencyKey: z.uuid(), expectedTotal: z.number().min(0)
}).superRefine((d,ctx)=> {
  if (d.age < 18 && (!d.guardianName || !/^[+\d\s()-]{8,25}$/.test(d.guardianPhone))) ctx.addIssue({code:'custom',message:'Nama dan telefon penjaga diperlukan bagi peserta bawah 18 tahun.'});
  if (new Set(d.moduleIds).size !== d.moduleIds.length) ctx.addIssue({code:'custom',message:'Pilihan modul berulang tidak dibenarkan.'});
});
export const moduleSchema = z.object({
  id: text(80).regex(/^[a-z0-9-]+$/), track: z.enum(['menengah','universiti']),
  title: text(150), subtitle: optionalText(200), description: text(2000),
  price: z.number().min(1).max(10000), accent: z.string().regex(/^#[a-fA-F0-9]{6}$/),
  icon: text(30), cover: asset.default(''), poster: asset, duration: text(150), schedule: text(250), active: z.boolean(),
  sortOrder: z.number().int().min(0).max(1000), outcomes: z.array(text(250)).min(1).max(10)
});
const track = z.object({name:text(100),audience:text(150),description:text(1000)});
export const interfaceTextSchema=z.record(z.string().trim().min(1).max(6000),z.object({bm:text(6000).optional(),en:text(6000).optional()}).strict()).refine(value=>Object.keys(value).length<=2500,'Terlalu banyak teks tersuai.');
export const settingsSchema = z.object({
  interfaceText:interfaceTextSchema.default({}),
  eventName:text(100),eyebrow:text(200),heroTitle:text(200),heroHighlight:text(200),heroDescription:text(2000),
  aboutTitle:text(200),aboutDescription:text(3000),dateLabel:text(100),startDate:z.iso.date(),endDate:z.iso.date(),
  location:text(300),delivery:text(100),organizer:text(200),organizerLogo:asset.default('/images/brand/kagum-academy.png'),contactEmail:z.union([z.literal(''),z.email()]),
  whatsapp:z.string().regex(/^$|^\d{8,16}$/),heroImage:asset,eventPoster:asset,registrationOpen:z.boolean(),
  whatsappGroups:z.object({menengah:whatsappGroupSchema.default(''),universiti:whatsappGroupSchema.default('')}).default({menengah:'',universiti:''}),
  tracks:z.object({menengah:track,universiti:track}),
  comboTwo:z.number().min(0).max(90),comboThree:z.number().min(0).max(90),comboAll:z.number().min(0).max(90),
  paymentName:optionalText(200),bankName:optionalText(100),bankAccount:optionalText(60),paymentQr:asset,
  paymentInstructions:text(3000),privacyText:text(3000),
  benefits:z.array(z.object({title:text(150),description:text(1000),icon:text(30)})).min(1).max(6),
  faqs:z.array(z.object({question:text(300),answer:text(2000)})).min(1).max(15)
}).superRefine((s,ctx)=>{
  if(s.startDate>s.endDate) ctx.addIssue({code:'custom',message:'Tarikh tamat mesti selepas tarikh mula.'});
  if(s.comboThree<s.comboTwo || s.comboAll<s.comboThree) ctx.addIssue({code:'custom',message:'Diskaun kombo mesti meningkat mengikut jumlah modul.'});
});
