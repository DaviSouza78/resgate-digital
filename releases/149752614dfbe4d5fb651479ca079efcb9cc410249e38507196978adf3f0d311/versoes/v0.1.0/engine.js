(function (root) {
  'use strict';
  const DIRECTIONS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  function integer(n, min, max) { return Number.isInteger(n) && n >= min && n <= max; }
  function validateLevel(level) {
    if (!level || !integer(level.width, 2, 12) || !integer(level.height, 2, 12)) throw new Error('Dimensões da fase inválidas.');
    if (typeof level.id !== 'string' || !level.id || typeof level.title !== 'string' || !level.title) throw new Error('Identificação da fase inválida.');
    if (typeof level.learn !== 'string' || !level.learn || typeof level.hint !== 'string') throw new Error('Conteúdo educativo ausente.');
    const inside = p => p && integer(p.x, 0, level.width - 1) && integer(p.y, 0, level.height - 1);
    if (!inside(level.start) || !integer(level.start.direction, 0, 3) || !inside(level.goal)) throw new Error('Posição inicial ou objetivo inválido.');
    if (!Array.isArray(level.walls) || !level.walls.every(inside)) throw new Error('Obstáculos inválidos.');
    const coords = level.walls.map(p => `${p.x},${p.y}`);
    if (new Set(coords).size !== coords.length) throw new Error('Obstáculo duplicado.');
    if ([level.start, level.goal].some(p => coords.includes(`${p.x},${p.y}`))) throw new Error('Início ou objetivo sobre um obstáculo.');
    if (level.start.x === level.goal.x && level.start.y === level.goal.y) throw new Error('Início e objetivo devem ser diferentes.');
    if (!integer(level.maxBlocks, 1, 30) || !integer(level.par, 1, level.maxBlocks)) throw new Error('Limite de blocos inválido.');
    return true;
  }
  function validateContent(content) {
    if (!content || content.schemaVersion !== 1 || !Array.isArray(content.levels) || !content.levels.length) throw new Error('Esquema de conteúdo inválido.');
    content.levels.forEach(validateLevel);
    if (new Set(content.levels.map(l => l.id)).size !== content.levels.length) throw new Error('Identificador de fase duplicado.');
    return true;
  }
  function expand(program, depth = 0) {
    if (!Array.isArray(program) || depth > 3) throw new Error('Programa inválido ou repetição muito profunda.');
    const result = [];
    program.forEach((command, block) => {
      if (!command || typeof command !== 'object') throw new Error('Comando inválido.');
      if (command.op === 'repeat') {
        if (!integer(command.count, 2, 4) || !Array.isArray(command.body) || !command.body.length) throw new Error('Repetição inválida.');
        const body = expand(command.body, depth + 1);
        for (let i = 0; i < command.count; i++) body.forEach(c => result.push({ ...c, block }));
      } else {
        if (!['forward', 'left', 'right', 'ifBlocked'].includes(command.op)) throw new Error('Comando desconhecido.');
        result.push({ op: command.op, block });
      }
      if (result.length > 128) throw new Error('Programa excede 128 ações.');
    });
    return result;
  }
  function initialState(level) {
    validateLevel(level);
    return { x: level.start.x, y: level.start.y, direction: level.start.direction, status: 'ready', steps: 0, reason: '' };
  }
  function blocked(level, state) {
    const [dx, dy] = DIRECTIONS[state.direction];
    const x = state.x + dx, y = state.y + dy;
    return x < 0 || x >= level.width || y < 0 || y >= level.height || level.walls.some(w => w.x === x && w.y === y);
  }
  function step(level, state, command) {
    if (state.status === 'won' || state.status === 'failed') return { ...state };
    if (!command || !['forward', 'left', 'right', 'ifBlocked'].includes(command.op)) throw new Error('Ação inválida.');
    const next = { ...state, status: 'running', steps: state.steps + 1, reason: '' };
    let action = command.op;
    if (action === 'ifBlocked') action = blocked(level, state) ? 'left' : 'forward';
    if (action === 'left') next.direction = (state.direction + 3) % 4;
    if (action === 'right') next.direction = (state.direction + 1) % 4;
    if (action === 'forward') {
      if (blocked(level, state)) { next.status = 'failed'; next.reason = 'Há um obstáculo ou a borda à frente. Ajuste seus comandos e tente novamente.'; }
      else { const [dx, dy] = DIRECTIONS[state.direction]; next.x += dx; next.y += dy; }
    }
    if (next.status !== 'failed' && next.x === level.goal.x && next.y === level.goal.y) { next.status = 'won'; next.reason = 'Estação recuperada!'; }
    return next;
  }
  function finish(state) {
    return state.status === 'won' || state.status === 'failed' ? { ...state } : { ...state, status: 'failed', reason: 'Os comandos terminaram antes de chegar à estação. Você pode editar e tentar de novo.' };
  }
  function run(level, program) {
    let state = initialState(level);
    if (!program.length || program.length > level.maxBlocks) throw new Error('Quantidade de blocos inválida.');
    for (const action of expand(program)) { state = step(level, state, action); if (['won', 'failed'].includes(state.status)) break; }
    return finish(state);
  }
  function stars(level, blocks) { return blocks <= level.par ? 3 : blocks <= level.par + 2 ? 2 : 1; }
  function score(level, blocks) { return stars(level, blocks) * 100; }
  const api = { validateLevel, validateContent, expand, initialState, blocked, step, finish, run, stars, score };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ResgateDigitalCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
