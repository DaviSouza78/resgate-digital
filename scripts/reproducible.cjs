'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto');
const context=require('./build-context.cjs');
const env={...process.env,SOURCE_DATE_EPOCH:String(context.epoch),GITHUB_SHA:context.commit};
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function build(){cp.execFileSync(process.execPath,['scripts/build.cjs'],{env,stdio:'pipe'});cp.execFileSync(process.env.RD_PYTHON_PATH||'python',['scripts/package.py'],{env,stdio:'pipe'});return require('../versions.json').versions.map(v=>({version:v.version,sha256:hash(`output/pacotes/resgate-digital-v${v.version}.zip`)}));}
const first=build(),second=build();if(JSON.stringify(first)!==JSON.stringify(second))throw new Error('Builds não reproduzíveis');
fs.writeFileSync('output/relatorios/reprodutibilidade.json',JSON.stringify({commit:context.commit,epoch:context.epoch,builds:2,packages:first,passed:true},null,2)+'\n');console.log('Duas builds: os doze ZIPs têm SHA-256 idêntico.');
