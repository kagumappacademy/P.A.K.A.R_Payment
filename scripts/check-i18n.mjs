import ts from 'typescript';
import {readFileSync,readdirSync} from 'node:fs';
const dictionary=JSON.parse(readFileSync('data/en.json','utf8'));
const known=new Set(Object.keys(dictionary).map(key=>key.toLowerCase()));
const missing=new Set();
for(const name of readdirSync('components').filter(value=>value.endsWith('.tsx'))){
  const source=ts.createSourceFile(name,readFileSync(`components/${name}`,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  function walk(node){
    if(ts.isJsxText(node)){
      const value=node.text.replace(/\s+/g,' ').trim();
      if(value&&/[a-z]/i.test(value)&&!known.has(value.toLowerCase()))missing.add(value);
    }
    ts.forEachChild(node,walk);
  }
  walk(source);
}
console.log('Unmapped visible text:',JSON.stringify([...missing],null,2));
