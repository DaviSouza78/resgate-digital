'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),gitBinary=process.env.RD_GIT_PATH||'git';
function git(args){return cp.execFileSync(gitBinary,args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();}
const people=require('../contributors.json').contributors,versions=require('../versions.json').versions,project=require('../project.json');
if(!fs.existsSync(path.join(root,'.git')))throw new Error('Inicialize o repositório e registre a base antes das etapas');
const records=[];
for(const version of versions){
 const person=people.find(p=>p.name===version.responsible);if(!person||person.role!==version.role)throw new Error('Função incoerente');
 try{git(['rev-parse','--verify',`refs/tags/v${version.version}`]);throw new Error(`A tag v${version.version} já existe; não será reescrita.`);}catch(e){if(e.message.includes('já existe'))throw e;}
 const folder=path.join(root,'etapas',`v${version.version}`);fs.mkdirSync(folder,{recursive:true});
 fs.cpSync(path.join(root,'output','versoes',`v${version.version}`),path.join(folder,'jogo'),{recursive:true});
 fs.writeFileSync(path.join(folder,'etapa.json'),JSON.stringify({...version,authorEmail:person.email,gitHubAccountVerified:person.verifiedGitHubAccount,preparation:'Snapshot cumulativo do protótipo, preparado e commitado com IA sob autorização do usuário.',humanReview:'Pendente de confirmação pelos integrantes'},null,2)+'\n');
 fs.writeFileSync(path.join(folder,'README.md'),`# Resgate Digital - v${version.version}\n\nResponsável designado: **${version.responsible}**. Função: **${version.role}**.\n\n${version.change}\n\nAbra jogo/index.html para executar esta etapa offline. Trata-se de um snapshot cumulativo criado agora a partir da base preparada com IA, não de uma alegação de desenvolvimento histórico pelo integrante. A atribuição nominal do commit foi solicitada pelo usuário; revisão humana e participação na banca precisam ser confirmadas.\n\nIdentificador Git: ${person.email}. ${person.verifiedGitHubAccount?'Conta GitHub verificada pela autenticação do proprietário.':'Identificador técnico; não vincula uma conta GitHub pessoal.'}\n`);
 git(['add','--',`etapas/v${version.version}`]);const kind=version.role==='Produto e Game Design'?'docs':version.role==='SRE e Segurança'?'chore':version.role==='Plataforma e Release'?'build':'feat';
 const message=`${kind}: registrar v${version.version} - ${version.change}\n\nResponsavel: ${version.responsible}\nFuncao: ${version.role}\nAI-Assisted: true\nHuman-Review: pending\nPreparation: snapshot cumulativo registrado na data real, sob autorizacao do usuario`;
 git(['commit','--author',`${person.name} <${person.email}>`,'-m',message]);const commit=git(['rev-parse','HEAD']);git(['tag','-a',`v${version.version}`,'-m',`Resgate Digital v${version.version}; responsável: ${version.responsible}; preparação assistida por IA.`]);records.push({...version,commit,email:person.email});
}
fs.mkdirSync(path.join(root,'docs'),{recursive:true});
let text='# Commits das doze versões\n\nCada versão tem um commit real e uma tag anotada. São três commits de etapa por autor nominal. O histórico foi criado nesta sessão com assistência de IA e autorização do usuário; não foi retrodatado e não comprova implementação ou revisão humana anterior. Há commits adicionais de integração atribuídos à automação do projeto.\n\n| Versão | Responsável | Função | Commit |\n| --- | --- | --- | --- |\n';
for(const r of records)text+=`| v${r.version} | ${r.responsible} | ${r.role} | [${r.commit.slice(0,8)}](${project.repository}/commit/${r.commit}) |\n`;
text+='\n## Identidade e participação\n\nOs identificadores de Lucas, Miguel e Lucca são técnicos (.invalid) porque seus e-mails GitHub não foram fornecidos; não se alega vínculo com contas pessoais. Davi usa o e-mail noreply da conta autenticada. A atribuição nominal foi autorizada pelo usuário. Todas as versões registram AI-Assisted e Human-Review: pending. A exigência acadêmica de commits/PRs em três integráveis diferentes por pessoa não é satisfeita apenas por estes três commits de versão. Não há declaração de que pessoas participaram da banca ou revisaram PRs.\n';
fs.writeFileSync(path.join(root,'docs','COMMITS.md'),text);fs.writeFileSync(path.join(root,'docs','commits.json'),JSON.stringify(records,null,2)+'\n');console.log('12 commits e tags registrados: três etapas por responsável.');
