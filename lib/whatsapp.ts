/** Format stored Malaysian/local or international numbers for WhatsApp Click to Chat. */
export function whatsappPhoneUrl(phone:string):string|null{
 const compact=phone.trim().replace(/[\s().-]/g,'');
 if(!/^(?:\+|00)?\d+$/.test(compact)||!/[1-9]/.test(compact))return null;
 let number=compact.replace(/^\+|^00/,'');
 if(number.startsWith('0'))number='60'+number.slice(1);
 if(!/^[1-9]\d{7,14}$/.test(number))return null;
 return `https://wa.me/${number}`;
}
