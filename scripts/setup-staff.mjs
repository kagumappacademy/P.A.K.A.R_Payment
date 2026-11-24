import {createDatabaseClient} from '../lib/turso.ts';
import {hash} from 'bcryptjs';
import {randomUUID} from 'node:crypto';
const client=createDatabaseClient();
try{await client.execute('CREATE TABLE IF NOT EXISTS staff_accounts(id TEXT PRIMARY KEY NOT NULL,role TEXT NOT NULL UNIQUE CHECK(role IN (\'admin\',\'finance\')),code_hash TEXT NOT NULL)');for(const role of ['admin','finance']){const code=process.env[role==='admin'?'ADMIN_LOGIN_CODE':'FINANCE_LOGIN_CODE'];if(!code||!/^\d{6}$/.test(code))throw Error('Set the staff login code environment variables to six digits.');await client.execute('INSERT OR IGNORE INTO staff_accounts(id,role,code_hash) VALUES(?,?,?)',[randomUUID(),role,await hash(code,12)]);}console.log('Staff code accounts ready. Existing codes preserved.');}finally{client.close();}
