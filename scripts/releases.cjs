'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const token=process.env.GITHUB_TOKEN,repo=process.env.GITHUB_REPOSITORY;if(!token||!repo)throw new Error('Ambiente GitHub ausente');
const headers={Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
async function api(endpoint,method='GET',body){const r=await fetch('https://api.github.com/repos/'+repo+endpoint,{method,headers:{...headers,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(30000)});if(r.status===404&&method==='GET')return null;if(!r.ok)throw new Error('API releases HTTP '+r.status);return r.status===204?null:r.json();}
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{for(const v of require('../versions.json').versions){
 const tag='v'+v.version;let release=await api('/releases/tags/'+tag);
 if(!release)release=await api('/releases','POST',{tag_name:tag,name:'Resgate Digital '+tag,body:`Responsável designado: ${v.responsible}. Função: ${v.role}.\n\n${v.change}\n\nPreparação assistida por IA; contribuição e revisão humana devem ser comprovadas separadamente. Extraia build.zip e abra index.html.`,prerelease:v.version!=='1.0.0'});
 const archiveName=`resgate-digital-${tag}.zip`,files=[{file:`pacotes/${archiveName}`,name:archiveName},{file:`pacotes/${archiveName}.sha256`,name:archiveName+'.sha256'},{file:`versoes/${tag}/GDD.pdf`,name:`GDD-${tag}.pdf`},{file:`versoes/${tag}/sbom.cdx.json`,name:'sbom.cdx.json'}];
 // Ativos já publicados são preservados. A atualização operacional fica no artefato CI identificado pelo novo SHA.
 for(const f of files){if(release.assets.some(a=>a.name===f.name))continue;const file=path.join('site','hml',f.file);if(!fs.existsSync(file))throw new Error('Ativo ausente: '+f.file);await upload(f.name,fs.readFileSync(file));}
 if(!release.assets.some(a=>a.name==='build.zip')){const original=release.assets.find(a=>a.name===archiveName);let bytes;
  if(original){const response=await fetch(original.url,{headers:{...headers,Accept:'application/octet-stream'},signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error('Download do ativo original HTTP '+response.status);bytes=Buffer.from(await response.arrayBuffer());}
  else bytes=fs.readFileSync(path.join('site','hml','pacotes',archiveName));
  await upload('build.zip',bytes);if(!release.assets.some(a=>a.name==='build.zip.sha256'))await upload('build.zip.sha256',Buffer.from(hash(bytes)+'  build.zip\n'));
 }
 async function upload(name,bytes){const r=await fetch(release.upload_url.replace(/\{.*$/,'')+'?name='+encodeURIComponent(name),{method:'POST',headers:{...headers,'Content-Type':'application/octet-stream'},body:bytes,signal:AbortSignal.timeout(60000)});if(!r.ok)throw new Error(`Upload ${name}: HTTP ${r.status}`);}
 console.log('Release '+tag+': pacote, checksum, GDD e SBOM preservados.');
}
 // Entrega operacional atual: tag anotada com metadados SemVer, sem acrescentar uma versão de integrante.
 const metadata=JSON.parse(fs.readFileSync('site/hml/version.json','utf8')),tag='v'+metadata.buildVersion;
 if(!await api('/git/ref/tags/'+encodeURIComponent(tag))){const annotated=await api('/git/tags','POST',{tag,message:'Entrega operacional CI do mesmo artefato promovido; doze etapas individuais preservadas.',object:metadata.commit,type:'commit',tagger:{name:'github-actions[bot]',email:'41898282+github-actions[bot]@users.noreply.github.com',date:new Date().toISOString()}});await api('/git/refs','POST',{ref:'refs/tags/'+tag,sha:annotated.sha});}
 let delivery=await api('/releases/tags/'+encodeURIComponent(tag));if(!delivery)delivery=await api('/releases','POST',{tag_name:tag,name:'Resgate Digital — entrega '+metadata.buildVersion,body:'Artefato CI promovido sem recompilar. Doze versões individuais permanecem nas tags anteriores. Esta tag operacional identifica o SHA da entrega, com autoria de automação declarada.'});
 const zip=fs.readFileSync('site/hml/downloads/resgate-digital-offline.zip');const assets=[['build.zip',zip],['build.zip.sha256',Buffer.from(hash(zip)+'  build.zip\n')],['GDD.pdf',fs.readFileSync('site/hml/docs/GDD.pdf')],['SBOM.cdx.json',fs.readFileSync('site/hml/versoes/v1.0.0/sbom.cdx.json')],['version.json',fs.readFileSync('site/hml/version.json')],['MANIFESTO.sha256',fs.readFileSync('site/hml/MANIFESTO.sha256')],['Relatorio-tecnico.pdf',fs.readFileSync('site/hml/docs/Relatorio-tecnico.pdf')],['pitch.mp4',fs.readFileSync('site/hml/downloads/pitch.mp4')]];
 for(const [name,bytes] of assets){if(delivery.assets.some(a=>a.name===name))continue;const r=await fetch(delivery.upload_url.replace(/\{.*$/,'')+'?name='+encodeURIComponent(name),{method:'POST',headers:{...headers,'Content-Type':'application/octet-stream'},body:bytes,signal:AbortSignal.timeout(60000)});if(!r.ok)throw new Error(`Entrega ${name}: HTTP ${r.status}`);}
 console.log('Entrega operacional atual publicada em '+tag+'.');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
