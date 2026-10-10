'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{syncAlerts}=require('../src/ops/sync-alerts.cjs');
test('recuperação fecha Issues conhecidas mesmo antes da indexação na listagem',async()=>{
 const stored=[],labels=[],api=async(endpoint,method='GET',body)=>{
  if(endpoint.startsWith('/labels')){if(method==='POST'){labels.push(body);return body;}return labels;}
  if(endpoint==='/issues'&&method==='POST'){const issue={...body,number:stored.length+1,state:'open',html_url:'https://example.test/'+(stored.length+1)};stored.push(issue);return issue;}
  if(endpoint.startsWith('/issues?'))return [];
  const issue=stored.find(i=>i.number===Number(endpoint.split('/').at(-1)));if(method==='PATCH')Object.assign(issue,body);return issue;
 };
 const opened=await syncAlerts(api,{JogoForaDoAr:true,LatenciaAlta:true},[],{exercise:true});assert.equal(opened.length,2);
 const closed=await syncAlerts(api,{JogoForaDoAr:false,LatenciaAlta:false},[],{exercise:true,knownIssues:opened});assert.equal(closed.length,2);assert.ok(stored.every(i=>i.state==='closed'));assert.ok(stored.every(i=>i.body.includes('EXERCÍCIO')));
 assert.deepEqual(await syncAlerts(api,{JogoForaDoAr:false,LatenciaAlta:false},[],{exercise:true,knownIssues:opened}),[]);
});
