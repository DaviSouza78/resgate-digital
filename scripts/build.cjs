'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'output');
const core = require('../src/core/engine.js');
const content = require('../content/levels.json');
const versions = require('../versions.json').versions;
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
fs.mkdirSync(path.join(out,'relatorios'), { recursive: true });
core.validateContent(content);
for (const level of content.levels) if (core.run(level,level.solution).status !== 'won') throw new Error(`Fase sem solução: ${level.id}`);
for (const file of ['src/core/engine.js','web/app.js','scripts/build.cjs','scripts/triagem.cjs']) execFileSync(process.execPath,['--check',file],{cwd:root,stdio:'pipe'});
execFileSync(process.execPath,['--test','tests/core.test.cjs','tests/content.test.cjs'],{cwd:root,stdio:'inherit'});
const junit = execFileSync(process.execPath,['--test','--test-reporter=junit','tests/core.test.cjs','tests/content.test.cjs'],{cwd:root,encoding:'utf8'}).replace(/file="([^"]+)"/g, (_, file) => `file="${path.relative(root,file).split(path.sep).join('/')}"`);
fs.writeFileSync(path.join(out,'relatorios','junit.xml'),junit);
const sourceFiles = ['src/core/engine.js','web/index.html','web/styles.css','web/app.js','content/levels.json','versions.json'];
const sourceHash = hash(sourceFiles.map(f => f + '\n' + fs.readFileSync(path.join(root,f),'utf8')).join('\n'));
const buildDate = require('./build-context.cjs').date;
function commitForVersion(version){try{return execFileSync(process.env.RD_GIT_PATH||'git',['rev-parse','--verify',`v${version}^{commit}`],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch(_){return process.env.GITHUB_SHA||null;}}
let buildCommit=process.env.GITHUB_SHA||null;try{buildCommit=buildCommit||execFileSync(process.env.RD_GIT_PATH||'git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch(_){}
for (const v of versions) {
  const dir = path.join(out,'versoes',`v${v.version}`); fs.mkdirSync(dir,{recursive:true});
  for(const file of ['index.html','styles.css','app.js']) fs.copyFileSync(path.join(root,'web',file),path.join(dir,file));
  fs.copyFileSync(path.join(root,'src/core/engine.js'),path.join(dir,'engine.js'));
  const publicContent = { schemaVersion:1, levels:content.levels.slice(0,v.levels).map(l => { const copy={...l}; delete copy.solution; return copy; }) };
  fs.writeFileSync(path.join(dir,'levels.js'),'window.ResgateDigitalContent = '+JSON.stringify(publicContent,null,2)+';\n');
  fs.writeFileSync(path.join(dir,'levels.json'),JSON.stringify(publicContent,null,2)+'\n');
  const metadata = {...v,sourceHash,commit:buildCommit,versionCommit:commitForVersion(v.version),buildDate,publication:'artefato',authorship:'Responsabilidade designada; implementação e registro preparados com assistência de IA. Revisão humana não presumida.'};
  fs.writeFileSync(path.join(dir,'version.json'),JSON.stringify(metadata,null,2)+'\n');
  fs.writeFileSync(path.join(dir,'version.js'),'window.ResgateDigitalVersion = '+JSON.stringify(metadata,null,2)+';\n');
  for(const file of ['LICENSE','THIRD_PARTY.md','AI-USAGE.md']) fs.copyFileSync(path.join(root,file),path.join(dir,file));
  const pdf = path.join(out,'pdf','etapas',`GDD-v${v.version}.pdf`); if(fs.existsSync(pdf)) fs.copyFileSync(pdf,path.join(dir,'GDD.pdf'));
  fs.writeFileSync(path.join(dir,'LEIA-ME.txt'),`RESGATE DIGITAL\nVersão ${v.version}\nResponsável designado: ${v.responsible}\nFunção: ${v.role}\n\nExtraia TODOS os arquivos para uma pasta e abra index.html em um navegador moderno.\nNão é preciso servidor nem internet. Também funciona com um servidor estático local.\nUse Tab e Enter para operar os botões; selecione a velocidade Devagar se preferir.\n\nMudança desta etapa: ${v.change}\nEtapa cumulativa preparada com IA, com commit nominal real; não comprova desenvolvimento humano anterior.\nCódigo e documentos preparados com assistência de IA: veja AI-USAGE.md.\nNão há cadastro, transmissão de dados, anúncios ou recursos externos.\n`);
  const sbom = { bomFormat:'CycloneDX',specVersion:'1.5',version:1,metadata:{component:{type:'application',name:'resgate-digital',version:v.version,licenses:[{license:{id:'MIT'}}]}},components:[] };
  fs.writeFileSync(path.join(dir,'sbom.cdx.json'),JSON.stringify(sbom,null,2)+'\n');
  const names=fs.readdirSync(dir).filter(f=>f!=='MANIFESTO.sha256').sort();
  fs.writeFileSync(path.join(dir,'MANIFESTO.sha256'),names.map(f=>`${hash(fs.readFileSync(path.join(dir,f)))}  ${f}`).join('\n')+'\n');
}
const latest=path.join(out,'versoes','v1.0.0'); fs.mkdirSync(path.join(root,'dist'),{recursive:true});
for(const file of fs.readdirSync(latest)) fs.copyFileSync(path.join(latest,file),path.join(root,'dist',file));
fs.writeFileSync(path.join(out,'relatorios','build.json'),JSON.stringify({sourceHash,buildDate,versions:12,levels:5,commit:buildCommit,note:'commit identifica a fonte do build; versionCommit identifica a etapa atribuída ao integrante. O SBOM local descreve o runtime sem dependências e a pipeline também gera npm sbom.'},null,2)+'\n');
console.log('Build local aprovado: 12 versões cumulativas e dist/ final.');
