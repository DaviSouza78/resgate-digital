'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
test('integração: publicar duas releases, rollback no mesmo workspace e restaurar sem revogação',()=>{
const root=path.resolve('.'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'resgate-publisher-')),binary=process.env.RD_GIT_PATH||'git',bare=path.join(dir,'origin.git'),config=path.join(dir,'gitconfig');
const git=args=>cp.execFileSync(binary,args,{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
git(['init','--bare',bare]);git(['config','--file',config,'url.'+bare.split(path.sep).join('/')+'.insteadOf','https://github.com/local-fixture/resgate-digital.git']);
const preload=path.join(dir,'mock-api.cjs');fs.writeFileSync(preload,"global.fetch=async()=>({ok:true,status:200,json:async()=>({})});\n");
const env={...process.env,GITHUB_TOKEN:'fixture-only',GITHUB_REPOSITORY:'local-fixture/resgate-digital',GIT_CONFIG_GLOBAL:config,PATH:(path.isAbsolute(binary)?path.dirname(binary)+path.delimiter:'')+process.env.PATH};
const site=path.join(dir,'site');fs.mkdirSync(path.join(site,'assets'),{recursive:true});fs.mkdirSync(path.join(site,'status'));fs.writeFileSync(path.join(site,'status','index.html'),'status');
const first='a'.repeat(64),second='b'.repeat(64);
function build(id){const release=path.join(site,'releases',id);fs.mkdirSync(release,{recursive:true});const meta=JSON.stringify({commit:id,version:'1.0.0'});fs.writeFileSync(path.join(release,'MANIFESTO.sha256'),id);fs.writeFileSync(path.join(release,'version.json'),meta);for(const name of ['index.html','404.html','.nojekyll'])fs.writeFileSync(path.join(site,name),name);fs.writeFileSync(path.join(site,'version.json'),meta);fs.writeFileSync(path.join(site,'rollout.json'),JSON.stringify({estavel:id,anterior:null,releases:[id],percentual:0,canario:null}));}
function publish(mode){cp.execFileSync(process.execPath,['--require',preload,path.join(root,'scripts/publish-pages.cjs'),mode],{cwd:dir,env,stdio:['ignore','pipe','pipe']});}
function rollout(){return JSON.parse(fs.readFileSync(path.join(dir,'.pages-work','rollout.json')));}
try{build(first);publish('production');build(second);publish('production');assert.equal(rollout().anterior,first);publish('rollback');assert.equal(rollout().estavel,first);assert.ok(rollout().revogadas.includes(second));assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'.pages-work/version.json'))).commit,first);publish('production');assert.equal(rollout().estavel,second);assert.ok(!rollout().revogadas.includes(second));}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
