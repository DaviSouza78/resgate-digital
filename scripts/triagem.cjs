'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'); const versions=require('../versions.json').versions;
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
const checks=[];
for(const v of versions){
  const dir=path.join(root,'output','versoes',`v${v.version}`);
  for(const name of ['index.html','version.json','LEIA-ME.txt','GDD.pdf','LICENSE','AI-USAGE.md','THIRD_PARTY.md']) if(!fs.existsSync(path.join(dir,name))) throw new Error(`Arquivo ausente: ${v.version}/${name}`);
  const meta=JSON.parse(fs.readFileSync(path.join(dir,'version.json'),'utf8')); if(meta.responsible!==v.responsible||meta.role!==v.role)throw new Error('Responsabilidade incoerente');
  for(const row of fs.readFileSync(path.join(dir,'MANIFESTO.sha256'),'utf8').trim().split('\n')){const [digest,name]=row.split('  ');if(hash(fs.readFileSync(path.join(dir,name)))!==digest)throw new Error(`Hash diferente: ${v.version}/${name}`);}
  const zip=path.join(root,'output','pacotes',`resgate-digital-v${v.version}.zip`);if(fs.statSync(zip).size>=25*1024*1024)throw new Error('Pacote acima do limite');
  const digest=fs.readFileSync(zip+'.sha256','utf8').split('  ')[0];if(hash(fs.readFileSync(zip))!==digest)throw new Error('Checksum de ZIP divergente');
  checks.push({version:v.version,result:'APROVADO LOCALMENTE'});
}
const report={scope:'Arquivos e pacotes locais; não equivale à triagem integral da avaliação.',checks,pending:['URL pública HTTP 200 e smoke de produção','GDD gerado e arquivado pela futura pipeline','Vídeo real legendado até 90 segundos validado com ffprobe','RAs e participação humana confirmados em SQUAD.md e Git','Pipeline, ambientes, aprovação, monitoramento, DORA e rollback','Prazo de entrega confirmado e ficha de entrega preenchida']};
fs.writeFileSync(path.join(root,'output','relatorios','triagem-local.json'),JSON.stringify(report,null,2)+'\n');
console.log('TRIAGEM LOCAL APROVADA: 12 versões e respectivos checksums. Triagem integral pendente: consulte o relatório.');
