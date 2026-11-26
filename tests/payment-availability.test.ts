import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {paymentAvailability} from '../lib/payment-availability.ts';
import {settingsSchema} from '../lib/validation.ts';
const details={paymentName:'PENERIMA UJIAN',bankName:'BANK UJIAN',bankAccount:'1234567890',paymentQr:'/images/brand/pakar-logo.png',paymentQrEnabled:false};
const seed=JSON.parse(readFileSync(new URL('../data/seed.json',import.meta.url),'utf8'));
test('QR visibility requires an explicit ON switch, uploaded image and recipient',()=>{
 assert.equal(paymentAvailability(details).qrReady,false);assert.equal(paymentAvailability({...details,paymentQrEnabled:undefined}).qrReady,false);
 assert.equal(paymentAvailability({...details,paymentQrEnabled:true}).qrReady,true);
 assert.equal(paymentAvailability({...details,paymentQrEnabled:true,paymentQr:''}).qrReady,false);
 assert.equal(paymentAvailability({...details,paymentQrEnabled:true,paymentName:' '}).qrReady,false);
});
test('bank transfer remains payable with QR off or no uploaded QR',()=>{
 assert.deepEqual(paymentAvailability(details),{qrReady:false,bankReady:true,paymentReady:true});
 assert.equal(paymentAvailability({...details,paymentQr:''}).paymentReady,true);
 for(const key of ['paymentName','bankName','bankAccount'])assert.equal(paymentAvailability({...details,[key]:' '}).paymentReady,false);
 assert.equal(paymentAvailability({...details,paymentQrEnabled:true,bankName:'',bankAccount:''}).paymentReady,true);
});
test('admin can retain a QR image while off but cannot turn on an incomplete QR',()=>{
 assert.equal(settingsSchema.parse(seed.settings).paymentQrEnabled,false);
 assert.equal(settingsSchema.safeParse({...seed.settings,...details}).success,true);
 assert.equal(settingsSchema.safeParse({...seed.settings,...details,paymentQrEnabled:true}).success,true);
 assert.equal(settingsSchema.safeParse({...seed.settings,...details,paymentQrEnabled:true,paymentQr:''}).success,false);
 assert.equal(settingsSchema.safeParse({...seed.settings,...details,paymentQrEnabled:true,paymentName:''}).success,false);
 assert.equal(settingsSchema.safeParse({...seed.settings,...details,paymentQrEnabled:false,paymentName:''}).success,true);
});
