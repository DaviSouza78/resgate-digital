'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),project=require('../project.json');
async function json(file){const r=await fetch(new URL(file+'?drill='+Date.now(),project.pagesUrl),{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}
async function livePointer(){const r=await fetch(`https://api.github.com/repos/${project.owner}/${project.name}/contents/rollout.json?ref=gh-pages`,{headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error('Consulta do ponteiro: HTTP '+r.status);const data=await r.json();return JSON.parse(Buffer.from(data.content,'base64').toString('utf8'));}
const pause=()=>new Promise(r=>setTimeout(r,2000));
(async()=>{
 const initial=await json('rollout.json');if(!initial.anterior)throw new Error('Necessárias duas releases preservadas');
 const previous=await json('releases/'+initial.anterior+'/version.json'),original=await json('version.json');
 const start=Date.now(),proof={scope:'Rollback real de duas releases válidas; disponibilidade verificada pelas sondas registradas',started:new Date(start).toISOString(),original:original.commit,target:previous.commit,samples:[]};let failure;
 try{
  cp.execFileSync(process.execPath,['scripts/publish-pages.cjs','rollback'],{stdio:'inherit'});
  while(Date.now()-start<295000){let status=0,commit=null;try{const r=await fetch(project.pagesUrl+'?drill='+Date.now(),{cache:'no-store',signal:AbortSignal.timeout(10000)});status=r.status;commit=(await json('version.json')).commit;}catch(_){}
   proof.samples.push({time:new Date().toISOString(),status,commit});
   if(commit===previous.commit&&status===200){proof.recoverySeconds=(Date.now()-start)/1000;proof.passed=proof.recoverySeconds<300&&proof.samples.every(p=>p.status===200);break;}await pause();
  }
  if(!proof.passed)throw new Error('Recuperação não comprovada em menos de cinco minutos');
 }catch(e){failure=e;proof.error=e.message;}
 try{
  const current=await livePointer();
  if(current.estavel===initial.anterior)cp.execFileSync(process.execPath,['scripts/publish-pages.cjs','rollback'],{stdio:'inherit'});
  else if(current.estavel!==initial.estavel)throw new Error('Ponteiro alterado por outra operação; restauração interrompida');
  const restoreStart=Date.now();while(Date.now()-restoreStart<295000){try{if((await json('version.json')).commit===original.commit){proof.restored=true;break;}}catch(_){}await pause();}
  if(!proof.restored)throw new Error('Restauração da release original não confirmada');
 }catch(e){failure=failure||e;proof.restoreError=e.message;proof.passed=false;}
 fs.mkdirSync('output/relatorios',{recursive:true});fs.writeFileSync('output/relatorios/rollback-publico.json',JSON.stringify(proof,null,2)+'\n');
 if(failure)throw failure;console.log('Rollback público comprovado em '+proof.recoverySeconds+' segundos.');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
