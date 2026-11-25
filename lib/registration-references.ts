import {randomBytes} from 'node:crypto';
const alphabet='23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export function createRegistrationReference(){
 return 'PKR-'+Array.from(randomBytes(6),byte=>alphabet[byte&31]).join('');
}
/** Retry a competing reservation of the short reference; other failures stay unchanged. */
export async function withUniqueRegistrationReference<T>(insert:(reference:string)=>Promise<T>,isReferenceCollision:(error:unknown,reference:string)=>Promise<boolean>,generate=createRegistrationReference):Promise<T>{
 for(let attempt=0;attempt<5;attempt++){
  const reference=generate();
  try{return await insert(reference);}catch(error){if(attempt===4||!await isReferenceCollision(error,reference))throw error;}
 }
 throw new Error('Unable to reserve registration reference.');
}
