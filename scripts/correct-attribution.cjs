'use strict';
// Correção única de identidade autorizada pelo usuário; preserva datas e conteúdo dos commits.
const fs=require('node:fs'),cp=require('node:child_process');
const binary=process.env.RD_GIT_PATH||'git';
const git=(args,options={})=>cp.execFileSync(binary,args,{encoding:'utf8',...options}).trim();
const people=require('../contributors.json').contributors;
const records=require('../docs/commits.json');
if(records.every(r=>r.email===people.find(p=>p.name===r.responsible).email))throw new Error('Identidades já corrigidas');
const oldHead=git(['rev-parse','HEAD']);const leases={'refs/heads/main':oldHead};
for(const r of records)leases['refs/tags/v'+r.version]=git(['rev-parse','refs/tags/v'+r.version]);
fs.mkdirSync('output/relatorios',{recursive:true});fs.writeFileSync('output/relatorios/attribution-leases.json',JSON.stringify(leases,null,2));
git(['update-ref','refs/backup/attribution-before-correction',oldHead]);
const mapping={};
for(const old of git(['rev-list','--reverse','HEAD']).split('\n')){
 const info=JSON.parse(git(['show','-s','--format={"tree":"%T","parents":"%P","an":"%an","ae":"%ae","ad":"%aI","cn":"%cn","ce":"%ce","cd":"%cI"}',old]));
 const person=people.find(p=>p.name===info.an);
 const args=['commit-tree',info.tree];for(const parent of info.parents.split(' ').filter(Boolean))args.push('-p',mapping[parent]||parent);
 const message=cp.execFileSync(binary,['show','-s','--format=%B',old],{encoding:'utf8'});
 mapping[old]=git(args,{input:message,env:{...process.env,GIT_AUTHOR_NAME:info.an,GIT_AUTHOR_EMAIL:person?.email||info.ae,GIT_AUTHOR_DATE:info.ad,GIT_COMMITTER_NAME:info.cn,GIT_COMMITTER_EMAIL:info.ce,GIT_COMMITTER_DATE:info.cd}});
}
git(['update-ref','refs/heads/main',mapping[oldHead],oldHead]);
const project=require('../project.json');
for(const r of records){r.commit=mapping[r.commit];r.email=people.find(p=>p.name===r.responsible).email;git(['tag','-f','-a','v'+r.version,r.commit,'-m',`Resgate Digital v${r.version}; responsável: ${r.responsible}; preparação assistida por IA; identidade corrigida com o e-mail fornecido pelo usuário.`]);}
fs.writeFileSync('docs/commits.json',JSON.stringify(records,null,2)+'\n');
let md='# Commits das doze versões\n\nSão três commits de versão por integrante, com os e-mails fornecidos pelo usuário. As datas reais foram preservadas na correção de identidade. Os snapshots foram preparados com IA; não comprovam desenvolvimento humano anterior nem revisão por colegas. Commits adicionais de integração pertencem à automação.\n\n| Versão | Responsável | Função | Commit |\n| --- | --- | --- | --- |\n';
for(const r of records){md+=`| v${r.version} | ${r.responsible} | ${r.role} | [${r.commit.slice(0,8)}](${project.repository}/commit/${r.commit}) |\n`;const file=`etapas/v${r.version}/etapa.json`;const meta=JSON.parse(fs.readFileSync(file));meta.authorEmail=r.email;meta.identitySource='E-mail fornecido pelo usuário';fs.writeFileSync(file,JSON.stringify(meta,null,2)+'\n');const readme=`etapas/v${r.version}/README.md`;fs.writeFileSync(readme,fs.readFileSync(readme,'utf8').replace(/Identificador Git:[\s\S]*$/,'Identificador Git: '+r.email+'. E-mail informado pelo usuário; associação com a conta individual deve ser confirmada pela equipe.\n'));}
md+='\nOs três commits de versão não substituem a exigência de contribuição em três integráveis diferentes nem os dez PRs revisados. A associação dos e-mails às contas de cada integrante e a revisão humana devem ser confirmadas pela equipe.\n';fs.writeFileSync('docs/COMMITS.md',md);
console.log('Doze atribuições corrigidas, sem alterar datas; backup local preservado.');
