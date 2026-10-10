'use strict';
const cp=require('node:child_process');const project=require('../project.json');
const token=process.env.RD_GITHUB_TOKEN;if(!token)throw new Error('Token de sessão indisponível');
const env={...process.env,GIT_CONFIG_COUNT:'2',GIT_CONFIG_KEY_0:'http.https://github.com/.extraheader',GIT_CONFIG_VALUE_0:'AUTHORIZATION: basic '+Buffer.from('x-access-token:'+token).toString('base64'),GIT_CONFIG_KEY_1:'credential.helper',GIT_CONFIG_VALUE_1:''};
const args=['push','--atomic','--set-upstream'];
if(process.argv.includes('--correct-attribution')){const leases=require('../output/relatorios/attribution-leases.json');for(const [ref,sha] of Object.entries(leases))args.push(`--force-with-lease=${ref}:${sha}`);}
args.push('origin','main','--tags');
try{cp.execFileSync(process.env.RD_GIT_PATH||'git',args,{env,stdio:['ignore','pipe','pipe']});console.log('Branch main e 12 tags enviadas ao GitHub.');}catch(e){const message=(e.stderr||Buffer.from(e.message)).toString().replaceAll(token,'[redacted]');console.error(message);process.exitCode=1;}
