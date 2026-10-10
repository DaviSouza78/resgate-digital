'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
test('publicação preserva ativos históricos e cria tag anotada com o artefato atual',()=>{
 const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'rd-release-')),root=path.resolve(__dirname,'..'),commit='a'.repeat(40),buildVersion='1.0.0+ci.'+commit.slice(0,12);
 if(path.dirname(temporary)!==path.resolve(os.tmpdir())||!path.basename(temporary).startsWith('rd-release-'))throw new Error('Diretório temporário inválido');
 const fixtures={'version.json':JSON.stringify({version:'1.0.0',buildVersion,commit}),'downloads/resgate-digital-offline.zip':'zip atual','docs/GDD.pdf':'gdd atual','docs/Relatorio-tecnico.pdf':'relatorio atual','versoes/v1.0.0/sbom.cdx.json':'{}','MANIFESTO.sha256':'manifesto atual','downloads/pitch.mp4':'video atual'};
 try{
  for(const [name,bytes] of Object.entries(fixtures)){const file=path.join(temporary,'site/hml',name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);}
  const mock=`const fs=require('node:fs');const records=[];global.fetch=async(url,options={})=>{const u=new URL(url),p=decodeURIComponent(u.pathname),method=options.method||'GET';records.push({path:p,method,body:method==='POST'?Buffer.from(options.body||'').toString():null});let status=200,data={};if(u.hostname==='uploads.github.com'){data={name:u.searchParams.get('name')};}else if(p.includes('/releases/tags/')){const tag=p.split('/').at(-1);if(tag.includes('+'))status=404;else data={assets:[{name:'resgate-digital-'+tag+'.zip'},{name:'resgate-digital-'+tag+'.zip.sha256'},{name:'GDD-'+tag+'.pdf'},{name:'sbom.cdx.json'},{name:'build.zip'},{name:'build.zip.sha256'}]};}else if(p.includes('/git/ref/'))status=404;else if(p.endsWith('/git/tags'))data={sha:'annotated-tag-sha'};else if(p.endsWith('/releases'))data={assets:[],upload_url:'https://uploads.github.com/repos/example/game/releases/1/assets{?name,label}'};else if(!p.endsWith('/git/refs'))throw Error('Rota inesperada: '+p);return {ok:status===200,status,json:async()=>data};};process.on('exit',()=>fs.writeFileSync('records.json',JSON.stringify(records)));`;
  const preload=path.join(temporary,'mock.cjs');fs.writeFileSync(preload,mock);
  cp.execFileSync(process.execPath,['--require',preload,path.join(root,'scripts/releases.cjs')],{cwd:temporary,env:{...process.env,GITHUB_TOKEN:'test-token',GITHUB_REPOSITORY:'example/game'},stdio:'pipe'});
  const records=JSON.parse(fs.readFileSync(path.join(temporary,'records.json'),'utf8'));
  assert.equal(records.filter(r=>r.method==='DELETE').length,0);
  const annotation=records.find(r=>r.path.endsWith('/git/tags'));assert.equal(JSON.parse(annotation.body).object,commit);assert.equal(JSON.parse(annotation.body).tag,'v'+buildVersion);
  assert.equal(JSON.parse(records.find(r=>r.path.endsWith('/git/refs')).body).sha,'annotated-tag-sha');
  const uploads=records.filter(r=>r.path.includes('/releases/1/assets'));assert.equal(uploads.length,8);assert.ok(uploads.some(r=>r.body==='zip atual'));
 }finally{fs.rmSync(temporary,{recursive:true,force:true});}
});
