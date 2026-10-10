(async function(){'use strict';const message=document.getElementById('loader-message'),link=document.getElementById('stable-link');const root=new URL('./',location.href);const safe=id=>typeof id==='string'&&/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(id);
try{let rollout=window.ResgateRollout;if(location.protocol!=='file:'){const r=await fetch(new URL('rollout.json',root),{cache:'no-store'});if(!r.ok)throw new Error('Não foi possível ler o controle de versões.');rollout=await r.json();}
if(!rollout||!safe(rollout.estavel)||!Array.isArray(rollout.releases)||!rollout.releases.every(safe)||!rollout.releases.includes(rollout.estavel)||!Number.isFinite(rollout.percentual)||rollout.percentual<0||rollout.percentual>100)throw new Error('Controle de versões inválido.');
const key=`resgate-digital-session:${root.pathname}`;let chosen=null;try{chosen=sessionStorage.getItem(key);}catch(_){}
if(!safe(chosen)||!rollout.releases.includes(chosen)||(rollout.revogadas||[]).includes(chosen)){chosen=rollout.estavel;if(safe(rollout.canario)&&rollout.releases.includes(rollout.canario)&&Math.random()*100<rollout.percentual)chosen=rollout.canario;try{sessionStorage.setItem(key,chosen);}catch(_){}}
const target=new URL(`releases/${chosen}/index.html`,root);link.href=new URL(`releases/${rollout.estavel}/index.html`,root).href;
// Confere antes do redirecionamento para não enviar o jogador a uma release ausente.
if(location.protocol!=='file:'){let r=await fetch(target,{method:'HEAD',cache:'no-store'});if(!r.ok){const stable=new URL(link.href);r=await fetch(stable,{method:'HEAD',cache:'no-store'});if(!r.ok)throw new Error('A versão selecionada não está acessível. Consulte o status.');try{sessionStorage.setItem(key,rollout.estavel);}catch(_){}location.replace(stable.href);return;}}
location.replace(target.href);
}catch(e){message.textContent=e.message;message.className='notice error';}})();
