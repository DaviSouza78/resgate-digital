'use strict';
async function syncAlerts(api,states,probes,{exercise=false,knownIssues=[]}={}){
const labels=['alerta',...(exercise?['exercicio']:[])];const existing=await api('/labels?per_page=100');for(const name of labels)if(!existing.some(l=>l.name===name))await api('/labels','POST',{name,color:exercise?'8250df':'b3261e'});
const issues=await api('/issues?labels='+labels.join(',')+'&state=open&per_page=100');const changes=[];
for(const known of knownIssues){const fresh=await api('/issues/'+known.number);if(fresh.state==='open'&&!issues.some(i=>i.number===fresh.number))issues.push(fresh);}
for(const [kind,active] of Object.entries(states)){const title=(exercise?'[Exercício controlado] ':'')+kind;const open=issues.find(i=>!i.pull_request&&i.title===title);
if(active&&!open){const issue=await api('/issues','POST',{title,labels,body:(exercise?'EXERCÍCIO: resposta de um servidor local controlado. Não representa indisponibilidade do jogo público.\n\n':'Sonda real dos ambientes publicados.\n\n')+probes.map(p=>`${p.time}: ${p.environment}, HTTP ${p.status}, ${p.latencyMs} ms, versão ${p.version||'indisponível'}`).join('\n')});changes.push({kind,action:'opened',url:issue.html_url,number:issue.number});}
if(!active&&open){await api('/issues/'+open.number,'PATCH',{state:'closed'});changes.push({kind,action:'closed',url:open.html_url,number:open.number});}}
return changes;}
module.exports={syncAlerts};
