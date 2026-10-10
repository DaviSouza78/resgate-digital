'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.RESGATE_DIGITAL_PLAYWRIGHT_PATH||'playwright');
const root=path.resolve(__dirname,'..');
const reports=path.join(root,'output','relatorios');fs.mkdirSync(reports,{recursive:true});
const solutions=require('../content/levels.json').levels;
async function main(){
  const browser=await chromium.launch({headless:true,...(process.env.RESGATE_DIGITAL_BROWSER_PATH?{executablePath:process.env.RESGATE_DIGITAL_BROWSER_PATH}:{})});const results=[];
  const context=await browser.newContext({viewport:{width:1366,height:1000},offline:true});const page=await context.newPage();const errors=[];const network=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
  const url=pathToFileURL(path.join(root,'dist','index.html')).href;
  async function add(c){ if(c.op==='repeat')await page.locator('#repeat-count').selectOption(String(c.count));await page.locator(`[data-command="${c.op}"]`).click(); }
  try{
    await page.goto(url);await page.locator('#speed').selectOption('60');
    for(const c of solutions[0].solution)await add(c);
    await page.locator('#run').click();await page.locator('#dialog[open]').waitFor();assert.match(await page.locator('#dialog-title').innerText(),/recuperada/);assert.match(await page.locator('#dialog-body').innerText(),/300 pontos/);
    results.push({scenario:'E2E 1: abrir offline, iniciar, completar primeira fase e ver tela de fim',passed:true});await page.locator('#close-dialog').click();
    await page.locator('#levels button').nth(3).click();await page.locator('#run').click();await page.waitForFunction(()=>document.getElementById('feedback').classList.contains('error'));await page.waitForFunction(()=>!document.getElementById('clear').disabled);
    assert.match(await page.locator('#feedback').innerText(),/obstáculo/);await page.locator('#reset').click();assert.equal(await page.locator('#program li').count(),7);await page.locator('#clear').click();
    for(const c of solutions[3].solution)await add(c);await page.locator('#run').click();await page.locator('#dialog[open]').waitFor();results.push({scenario:'E2E 2: erro do programa, reiniciar mantendo blocos, corrigir e concluir',passed:true});await page.locator('#close-dialog').click();
    for(const i of [1,2,4]){await page.locator('#levels button').nth(i).click();await page.locator('#speed').selectOption('60');for(const c of solutions[i].solution)await add(c);await page.locator('#run').click();await page.locator('#dialog[open]').waitFor();assert.match(await page.locator('#dialog-body').innerText(),/300 pontos/);await page.locator('#close-dialog').click();}
    assert.equal(await page.locator('#levels .done').count(),5);results.push({scenario:'Todas as cinco fases vencidas pela interface, incluindo loop e condição',passed:true});
    await page.reload();assert.equal(await page.locator('#levels .done').count(),5);results.push({scenario:'Progresso persiste localmente sem rede',passed:true});
    await page.locator('#privacy').click();await page.locator('#dialog-actions button').click();assert.equal(await page.locator('#levels .done').count(),0);
    // Regressão de concorrência: reiniciar durante execução cancela o loop antigo.
    for(const c of solutions[0].solution)await add(c);await page.locator('#speed').selectOption('800');await page.locator('#run').click();await page.locator('#reset').click();await page.waitForTimeout(900);assert.equal(await page.locator('.cell.occupied').getAttribute('data-x'),'0');assert.equal(await page.locator('#dialog').getAttribute('open'),null);
    results.push({scenario:'Reinício cancela execução pendente sem avanço tardio',passed:true});
    await page.screenshot({path:path.join(reports,'jogo-desktop.png'),fullPage:true});
    await page.setViewportSize({width:390,height:844});await page.reload();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(reports,'jogo-mobile.png'),fullPage:true});results.push({scenario:'Layout móvel 390 px sem rolagem horizontal',passed:true});
    for(const v of require('../versions.json').versions){await page.goto(pathToFileURL(path.join(root,'output','versoes',`v${v.version}`,'index.html')).href);assert.equal(await page.locator('#levels button').count(),v.levels);await page.locator('#speed').selectOption('60');for(const c of solutions[0].solution)await add(c);await page.locator('#run').click();await page.locator('#dialog[open]').waitFor();}
    results.push({scenario:'Cada uma das 12 versões abre offline e conclui a primeira missão',passed:true});
    assert.deepEqual(errors,[]);assert.deepEqual(network,[]);results.push({scenario:'Nenhum erro JavaScript e nenhuma requisição HTTP',passed:true});
    fs.writeFileSync(path.join(reports,'e2e.json'),JSON.stringify({browser:browser.version(),engine:'Chromium',offline:true,results,errors,network},null,2));console.log(JSON.stringify(results,null,2));
  }finally{await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
