'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../src/core/engine.js');
const content = require('../content/levels.json');
const versions = require('../versions.json').versions;
const clone = value => JSON.parse(JSON.stringify(value));
test('integração: conteúdo JSON válido e todas as cinco soluções chegam ao objetivo', () => { assert.equal(core.validateContent(content), true); assert.equal(content.levels.length, 5); content.levels.forEach(l => assert.equal(core.run(l, l.solution).status, 'won', l.id)); });
test('integração: erros de esquema, posições e limites bloqueiam a entrada', () => {
  const corruptions = [c => c.schemaVersion = 2, c => c.levels = [], c => c.levels[0].width = 0, c => c.levels[0].id = '', c => c.levels[0].learn = '', c => c.levels[0].start.x = -1, c => c.levels[0].start.direction = 8, c => c.levels[0].goal.x = 100, c => c.levels[0].walls = null, c => c.levels[0].walls.push(c.levels[0].walls[0]), c => c.levels[0].walls.push({ x: 0, y: 2 }), c => c.levels[0].goal = { x: 0, y: 2 }, c => c.levels[0].par = 9, c => c.levels[1].id = c.levels[0].id];
  corruptions.forEach(corrupt => { const c = clone(content); corrupt(c); assert.throws(() => core.validateContent(c)); });
});
test('integração: cada etapa tem responsável, função consistente e apenas fases solucionáveis', () => {
  assert.equal(versions.length, 12); assert.equal(new Set(versions.map(v => v.version)).size, 12);
  const counts = new Map(), roles = new Map();
  versions.forEach(v => { counts.set(v.responsible, (counts.get(v.responsible) || 0) + 1); if (roles.has(v.responsible)) assert.equal(roles.get(v.responsible), v.role); roles.set(v.responsible, v.role); content.levels.slice(0,v.levels).forEach(l => { const ops = core.expand(l.solution).map(a => a.op); if(v.stage < 6) assert.ok(l.solution.every(c => c.op !== 'repeat')); if(v.stage < 10) assert.ok(!ops.includes('ifBlocked')); assert.equal(core.run(l,l.solution).status,'won'); }); });
  assert.equal(counts.size,4); assert.ok([...counts.values()].every(n => n === 3)); assert.equal(new Set(roles.values()).size,4);
});
test('integração: programa inicial de depuração falha e solução corrigida vence', () => { const l = content.levels[3]; assert.equal(core.run(l,l.starter).status,'failed'); assert.equal(core.run(l,l.solution).status,'won'); });
