import {test} from 'node:test';
import assert from 'node:assert/strict';
import {translateText} from '../lib/i18n.ts';
test('BM preserves original content',()=>assert.equal(translateText('Cuti sekolah.','bm'),'Cuti sekolah.'));
test('English translates the main school holiday campaign',()=>assert.equal(translateText('Cuti sekolah.','en'),'School holidays.'));
test('English translates payment actions',()=>assert.equal(translateText('Muat turun PDF','en'),'Download PDF'));
test('English translates full-poster admin controls',()=>assert.equal(translateText('Poster penuh modul','en'),'Full module poster'));
test('English preserves surrounding whitespace in mixed React content',()=>assert.equal(translateText(' / modul ','en'),' / module '));
test('English handles module-count singular and plural',()=>{assert.equal(translateText('1 modul','en'),'1 module');assert.equal(translateText('6 modul','en'),'6 modules');});
test('unknown participant content is preserved',()=>assert.equal(translateText('Nur Aisyah binti Abdullah','en'),'Nur Aisyah binti Abdullah'));
test('case-insensitive labels preserve uppercase headings',()=>assert.equal(translateText('NAMA PESERTA','en'),'PARTICIPANT NAME'));

test('admin can change button labels independently in BM and English',()=>{
 const copy={'Daftar sekarang':{bm:'Sertai misi',en:'Join the mission'}};
 assert.equal(translateText('Daftar sekarang','bm',copy),'Sertai misi');
 assert.equal(translateText('Daftar sekarang','en',copy),'Join the mission');
});
test('an unset language or removed override falls back to the original translation',()=>{
 assert.equal(translateText('Daftar sekarang','en',{'Daftar sekarang':{bm:'Sertai misi'}}),translateText('Daftar sekarang','en'));
 assert.equal(translateText('Daftar sekarang','bm',{}),'Daftar sekarang');
});
test('custom text keeps mixed-node whitespace and leaves participant details unchanged',()=>{
 const copy={'/ modul':{bm:'/ kelas',en:'/ class'}};
 assert.equal(translateText(' / modul ','bm',copy),' / kelas ');
 assert.equal(translateText('Nur Aisyah binti Abdullah','bm',copy),'Nur Aisyah binti Abdullah');
});
test('uppercase receipt labels use the same saved copy as the website',()=>assert.equal(translateText('MENUNGGU SEMAKAN','bm',{'Menunggu semakan':{bm:'Dalam semakan'}}),'DALAM SEMAKAN'));
