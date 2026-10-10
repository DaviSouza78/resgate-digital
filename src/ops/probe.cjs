'use strict';
async function probe(environment,url,{fetcher=fetch,now=()=>performance.now(),time=new Date().toISOString()}={}){
const start=now();let status=0,version=null,commit=null,error=null;
try{const r=await fetcher(url,{cache:'no-store',signal:AbortSignal.timeout(15000)});status=r.status;await r.arrayBuffer();}catch(e){error=e.name;}
const latencyMs=Math.round(now()-start);
try{const r=await fetcher(new URL('version.json?probe='+encodeURIComponent(time),url),{cache:'no-store',signal:AbortSignal.timeout(15000)});if(r.ok){const meta=await r.json();version=meta.version||null;commit=meta.commit||null;}}catch(_){/* HTTP/latência continuam registrados quando metadados estão indisponíveis. */}
return {time,environment,status,latencyMs,version,commit,error};}
function alerts(probes){return {JogoForaDoAr:probes.some(p=>p.status!==200),LatenciaAlta:probes.some(p=>p.latencyMs>2000)};}
module.exports={probe,alerts};
