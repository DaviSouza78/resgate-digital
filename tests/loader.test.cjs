'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('site-src/assets/loader.js','utf8');
const stable='a'.repeat(64),prior='b'.repeat(64);
async function load(cached,revoked=[]){let destination=null,stored=cached;const nodes={};const rollout={estavel:stable,releases:[stable,prior],percentual:0,canario:null,revogadas:revoked};
 await vm.runInNewContext(source,{URL,window:{ResgateRollout:rollout},location:{href:'https://example.test/resgate-digital/',protocol:'https:',replace:url=>destination=url},document:{getElementById:id=>nodes[id]||(nodes[id]={})},sessionStorage:{getItem:()=>stored,setItem:(_,id)=>stored=id},fetch:async()=>({ok:true,json:async()=>rollout}),Math});return {destination,stored};}
test('rollback retira sessão da versão revogada mesmo com a release preservada',async()=>{const r=await load(prior,[prior]);assert.equal(r.stored,stable);assert.match(r.destination,new RegExp('/'+stable+'/index.html$'));});
test('sessão conserva release anterior válida entre publicações',async()=>{assert.equal((await load(prior)).stored,prior);});
test('identificador inválido não entra na URL de release',async()=>{assert.equal((await load('../arquivo')).stored,stable);});
