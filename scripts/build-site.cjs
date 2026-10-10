'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),output=path.join(root,'output'),site=path.join(root,'site');
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
function copy(src,dst){fs.mkdirSync(dst,{recursive:true});for(const entry of fs.readdirSync(src,{withFileTypes:true})){const from=path.join(src,entry.name),to=path.join(dst,entry.name);if(entry.isDirectory())copy(from,to);else fs.copyFileSync(from,to);}}
function walk(dir,base=dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name),base):[{name:path.relative(base,path.join(dir,e.name)).split(path.sep).join('/'),file:path.join(dir,e.name)}]).sort((a,b)=>a.name.localeCompare(b.name));}
function write(p,value){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,typeof value==='string'?value:JSON.stringify(value,null,2)+'\n');}
function git(ref){try{return cp.execFileSync(process.env.RD_GIT_PATH||'git',['rev-parse','--verify',ref],{cwd:root,stdio:['ignore','pipe','ignore'],encoding:'utf8'}).trim();}catch(_){return null;}}
if(!fs.existsSync(path.join(root,'dist','index.html'))||!fs.existsSync(path.join(output,'build.zip')))throw new Error('Construa e empacote o jogo antes do site.');
const artifact=path.join(output,'site-artifact');fs.mkdirSync(artifact,{recursive:true});
for(const name of ['index.html','versoes.html','privacidade.html'])fs.copyFileSync(path.join(root,'site-src',name),path.join(artifact,name));
copy(path.join(root,'site-src','assets'),path.join(artifact,'assets'));
copy(path.join(root,'dist'),path.join(artifact,'jogo'));
copy(path.join(output,'versoes'),path.join(artifact,'versoes'));
copy(path.join(output,'pacotes'),path.join(artifact,'pacotes'));
fs.mkdirSync(path.join(artifact,'downloads'),{recursive:true});fs.copyFileSync(path.join(output,'build.zip'),path.join(artifact,'downloads','resgate-digital-offline.zip'));fs.copyFileSync(path.join(output,'build.zip.sha256'),path.join(artifact,'downloads','offline-original.sha256'));
fs.mkdirSync(path.join(artifact,'docs'),{recursive:true});fs.copyFileSync(path.join(output,'pdf','GDD.pdf'),path.join(artifact,'docs','GDD.pdf'));
for(const f of ['LICENSE','AI-USAGE.md','THIRD_PARTY.md'])fs.copyFileSync(path.join(root,f),path.join(artifact,'docs',f));
for(const [from,to] of [['pdf/Relatorio-tecnico.pdf','docs/Relatorio-tecnico.pdf'],['video/pitch.mp4','downloads/pitch.mp4'],['video/pitch.srt','downloads/pitch.srt']]){const file=path.join(output,from);if(fs.existsSync(file))fs.copyFileSync(file,path.join(artifact,to));}
const project=fs.existsSync(path.join(root,'project.json'))?JSON.parse(fs.readFileSync(path.join(root,'project.json'),'utf8')):{};
const versions=require('../versions.json').versions.map(v=>({...v,commit:git(`v${v.version}^{commit}`)}));
const commit=process.env.GITHUB_SHA||git('HEAD');const metadata={version:'1.0.0',commit,repository:project.repository||null,levels:5,versions:12};
write(path.join(artifact,'version.json'),metadata);write(path.join(artifact,'site-data.js'),'window.ResgateSiteData = '+JSON.stringify({...metadata,versions,contributors:require('../contributors.json').contributors})+';\n');
const files=walk(artifact).filter(f=>f.name!=='MANIFESTO.sha256');const releaseId=hash(files.map(f=>f.name+'\n'+hash(fs.readFileSync(f.file))).join('\n'));
write(path.join(artifact,'MANIFESTO.sha256'),files.map(f=>`${hash(fs.readFileSync(f.file))}  ${f.name}`).join('\n')+'\n');
fs.mkdirSync(site,{recursive:true});const releasePath=path.join(site,'releases',releaseId);
if(fs.existsSync(releasePath)){const original=fs.readFileSync(path.join(releasePath,'MANIFESTO.sha256'),'utf8');if(original!==fs.readFileSync(path.join(artifact,'MANIFESTO.sha256'),'utf8'))throw new Error('Tentativa de sobrescrever release imutável.');}else copy(artifact,releasePath);
copy(artifact,path.join(site,'hml'));copy(path.join(root,'site-src','assets'),path.join(site,'assets'));
fs.copyFileSync(path.join(root,'site-src','loader.html'),path.join(site,'index.html'));
let previous=null;const rolloutFile=path.join(site,'rollout.json');if(fs.existsSync(rolloutFile)){const old=JSON.parse(fs.readFileSync(rolloutFile,'utf8'));previous=old.estavel!==releaseId?old.estavel:old.anterior;}
const releaseIds=fs.readdirSync(path.join(site,'releases')).filter(id=>/^[a-f0-9]{64}$/.test(id));
const rollout={estavel:releaseId,anterior:previous,canario:null,percentual:0,releases:releaseIds,strategy:'azul-verde'};
write(rolloutFile,rollout);write(path.join(site,'rollout.js'),'window.ResgateRollout = '+JSON.stringify(rollout)+';\n');
fs.mkdirSync(path.join(site,'status'),{recursive:true});fs.copyFileSync(path.join(root,'site-src','status.html'),path.join(site,'status','index.html'));
let status={version:'1.0.0',release:releaseId,canaryPercent:0,probes:[],dora:{}};const statusFile=path.join(site,'status','data.json');if(fs.existsSync(statusFile))status={...JSON.parse(fs.readFileSync(statusFile,'utf8')),version:'1.0.0',release:releaseId,canaryPercent:0};write(statusFile,status);write(path.join(site,'status','data.js'),'window.ResgateStatus = '+JSON.stringify(status)+';\n');
write(path.join(site,'.nojekyll'),'');write(path.join(site,'version.json'),metadata);
write(path.join(site,'404.html'),'<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Página não encontrada · Resgate Digital</title><h1>Página não encontrada</h1><p>Volte à página inicial usando o endereço principal do projeto.</p><button onclick="history.back()">Voltar</button></html>');
write(path.join(output,'relatorios','site-build.json'),{releaseId,commit,repository:metadata.repository,artifact:path.relative(root,artifact),strategy:'azul-verde',files:files.length,publication:'Aguardando deploy confirmado'});
console.log(`Site estático preparado: site/ · release ${releaseId.slice(0,12)} · homologação e produção usam o mesmo artefato.`);
