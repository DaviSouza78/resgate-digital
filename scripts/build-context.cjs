'use strict';
const cp=require('node:child_process');
function git(args){return cp.execFileSync(process.env.RD_GIT_PATH||'git',args,{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}
const commit=process.env.GITHUB_SHA||git(['rev-parse','HEAD']);
const epoch=Number(process.env.SOURCE_DATE_EPOCH||git(['show','-s','--format=%ct',commit]));
if(!Number.isFinite(epoch)||epoch<=0)throw new Error('Data de origem inválida');
module.exports={commit,epoch,date:new Date(epoch*1000).toISOString(),localDate:new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Montevideo',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(epoch*1000))};
if(require.main===module)process.stdout.write(JSON.stringify(module.exports));
