/* Interface local: nenhuma requisição de rede, identificador ou telemetria. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  $('site-home').hidden = !/\/jogo\/(?:index\.html)?$/.test(location.pathname);
  const core = window.ResgateDigitalCore, content = window.ResgateDigitalContent, release = window.ResgateDigitalVersion;
  try { core.validateContent(content); } catch (error) { $('game').replaceChildren(); const p = document.createElement('p'); p.className = 'boot-error'; p.textContent = `O conteúdo da missão não pôde ser aberto: ${error.message}`; $('game').append(p); return; }
  const levels = content.levels.slice(0, release.levels);
  let current = 0, program = [], state, running = false, token = 0, completed = {};
  const storageKey = 'resgate-digital-progress-v1';
  if (release.stage >= 8) {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) levels.forEach(l => { if (Number.isInteger(saved[l.id]) && saved[l.id] >= 1 && saved[l.id] <= 3) completed[l.id] = saved[l.id]; });
    } catch (_) { /* Storage bloqueado ou corrompido não impede jogar. */ }
  }
  function persist() { if (release.stage >= 8) try { localStorage.setItem(storageKey, JSON.stringify(completed)); } catch (_) {} }
  function say(message, kind = '') { $('feedback').textContent = message; $('feedback').className = `feedback ${kind}`; }
  function label(c) { return c.op === 'forward' ? '↑ Avançar' : c.op === 'left' ? '↶ Esquerda' : c.op === 'right' ? '↷ Direita' : c.op === 'repeat' ? `↻ ${c.count} avanços` : '◇ Se obstáculo'; }
  function nav() {
    $('levels').replaceChildren();
    levels.forEach((l, i) => { const b = document.createElement('button'); b.className = `level-button${i === current ? ' active' : ''}${completed[l.id] ? ' done' : ''}`; b.setAttribute('aria-current', i === current ? 'step' : 'false'); b.textContent = `${i + 1}. ${l.topic}`; b.disabled = running; b.addEventListener('click', () => load(i)); $('levels').append(b); });
  }
  const robotSvg = '<svg class="robot" viewBox="0 0 80 64" aria-hidden="true"><path d="M13 24L3 15v33l10-9" fill="#e89931"/><rect x="11" y="15" width="56" height="36" rx="18" fill="#ffcd73"/><path d="M31 15V7h12v8" fill="none" stroke="#ffcd73" stroke-width="6"/><circle cx="47" cy="33" r="12" fill="#155766" stroke="#fff1cc" stroke-width="4"/><circle cx="44" cy="29" r="3" fill="#70c7d3"/><path d="M67 30h9v6h-9" fill="#e89931"/><path d="M19 53h29" stroke="#e89931" stroke-width="3" stroke-linecap="round"/></svg>';
  function board() {
    const l = levels[current]; $('board').replaceChildren(); $('board').style.gridTemplateColumns = `repeat(${l.width},1fr)`;
    const direction = ['direita', 'baixo', 'esquerda', 'cima'][state.direction];
    $('board').setAttribute('aria-label', `Mapa ${l.width} por ${l.height}. Submarino na coluna ${state.x + 1}, linha ${state.y + 1}, olhando para ${direction}. Estação na coluna ${l.goal.x + 1}, linha ${l.goal.y + 1}.`);
    for (let y = 0; y < l.height; y++) for (let x = 0; x < l.width; x++) {
      const cell = document.createElement('div'); cell.className = 'cell'; cell.dataset.x = x; cell.dataset.y = y;
      if (l.walls.some(w => w.x === x && w.y === y)) { cell.classList.add('wall'); const reef = document.createElement('span'); reef.className = 'reef'; reef.textContent = '≋'; cell.append(reef); }
      if (l.goal.x === x && l.goal.y === y) { cell.classList.add('goal'); const station = document.createElement('span'); station.className = 'station'; station.textContent = '◇'; cell.append(station); }
      if (state.x === x && state.y === y) { cell.classList.add('occupied'); cell.innerHTML = robotSvg; cell.firstElementChild.style.transform = `rotate(${state.direction * 90}deg)`; }
      $('board').append(cell);
    }
  }
  function edit(active = -1) {
    $('program').replaceChildren();
    program.forEach((c, i) => { const item = document.createElement('li'); if (i === active && release.stage >= 2) item.className = 'current'; const span = document.createElement('span'); span.textContent = `${i + 1}. ${label(c)}`; const remove = document.createElement('button'); remove.textContent = '×'; remove.setAttribute('aria-label', `Remover comando ${i + 1}`); remove.disabled = running; remove.addEventListener('click', () => { program.splice(i, 1); edit(); }); item.append(span, remove); $('program').append(item); });
    $('empty-program').hidden = program.length > 0;
    $('block-count').textContent = `${program.length} / ${levels[current].maxBlocks} blocos`;
    document.querySelectorAll('[data-command]').forEach(b => { b.disabled = running || program.length >= levels[current].maxBlocks; });
    $('run').disabled = running || program.length === 0;
    $('undo').disabled = running || program.length === 0; $('clear').disabled = running || program.length === 0; $('repeat-count').disabled = running;
    nav();
  }
  function load(i) {
    token++; running = false; current = i; state = core.initialState(levels[current]);
    program = levels[current].starter ? JSON.parse(JSON.stringify(levels[current].starter)) : [];
    $('mission-number').textContent = `MISSÃO ${String(i + 1).padStart(2, '0')} / ${String(levels.length).padStart(2, '0')}`;
    $('level-title').textContent = levels[i].title; $('topic').textContent = levels[i].topic; $('learning-text').textContent = levels[i].learn;
    $('hint-text').hidden = true; $('hint-text').textContent = levels[i].hint;
    $('repeat-control').hidden = release.stage < 6; $('conditional-control').hidden = release.stage < 10;
    say(levels[i].starter ? 'Este programa tem um erro. Execute, observe e depois corrija a sequência.' : 'O submarino está pronto. Monte seu programa e clique em Executar.');
    board(); edit();
  }
  function modal(title, kicker, paragraphs, actions = []) {
    $('dialog-title').textContent = title; $('dialog-kicker').textContent = kicker; $('dialog-body').replaceChildren(); $('dialog-actions').replaceChildren();
    paragraphs.forEach(text => { const p = document.createElement('p'); p.textContent = text; $('dialog-body').append(p); });
    actions.forEach(a => { const b = document.createElement('button'); b.textContent = a.label; b.className = a.primary ? 'primary' : 'secondary'; b.addEventListener('click', () => { $('dialog').close(); a.action(); }); $('dialog-actions').append(b); });
    if (!$('dialog').open) $('dialog').showModal();
  }
  async function execute() {
    if (running || !program.length) return;
    let commands;
    try { commands = core.expand(program); } catch (e) { say(e.message, 'error'); return; }
    state = core.initialState(levels[current]); running = true; const runToken = ++token; board(); edit();
    const speed = Number($('speed').value);
    for (const command of commands) {
      if (runToken !== token) return;
      edit(command.block);
      state = core.step(levels[current], state, command); board();
      say(state.status === 'failed' ? state.reason : `Executando ${label(command)}. Posição: coluna ${state.x + 1}, linha ${state.y + 1}.`, state.status === 'failed' ? 'error' : '');
      await new Promise(resolve => setTimeout(resolve, speed));
      if (runToken !== token) return;
      if (state.status === 'failed' || state.status === 'won') break;
    }
    state = core.finish(state); running = false; edit();
    if (state.status !== 'won') { say(state.reason, 'error'); return; }
    const l = levels[current], earned = core.stars(l, program.length);
    completed[l.id] = Math.max(completed[l.id] || 0, earned); persist(); nav(); say(`Estação recuperada! ${earned} de 3 estrelas · ${core.score(l, program.length)} pontos.`, 'success');
    const last = current === levels.length - 1;
    const paragraphs = [`${'★'.repeat(earned)}${'☆'.repeat(3 - earned)} · ${core.score(l, program.length)} pontos · ${program.length} blocos usados.`];
    if (release.stage >= 9) paragraphs.push(l.learn);
    if (last) paragraphs.push(levels.every(level => completed[level.id]) ? `Você recuperou todas as ${levels.length} estações desta versão! Pode jogar novamente para melhorar seus programas.` : 'Você chegou ao fim desta versão. Explore as outras missões para recuperar todas as estações.');
    modal(last ? 'Expedição concluída!' : 'Estação recuperada!', 'BOM TRABALHO, EXPLORADOR', paragraphs, [
      { label: last ? 'Jogar de novo' : 'Próxima missão', primary: true, action: () => load(last ? 0 : current + 1) },
      { label: 'Melhorar meu programa', action: () => { state = core.initialState(l); board(); say('Edite seu programa para encontrar outro caminho.'); } }
    ]);
  }
  document.querySelectorAll('[data-command]').forEach(b => b.addEventListener('click', () => {
    if (running || program.length >= levels[current].maxBlocks) return;
    const op = b.dataset.command;
    program.push(op === 'repeat' ? { op, count: Number($('repeat-count').value), body: [{ op: 'forward' }] } : { op }); edit();
  }));
  $('run').addEventListener('click', execute);
  $('undo').addEventListener('click', () => { if (!running) { program.pop(); edit(); } });
  $('clear').addEventListener('click', () => { if (!running) { program = []; edit(); } });
  $('reset').addEventListener('click', () => { token++; running = false; state = core.initialState(levels[current]); edit(); board(); say('Tentativa reiniciada. Seu programa foi mantido para você corrigir.'); });
  $('hint').addEventListener('click', () => { $('hint-text').hidden = !$('hint-text').hidden; });
  $('close-dialog').addEventListener('click', () => $('dialog').close());
  $('help').addEventListener('click', () => modal('Como jogar', 'SEU PRIMEIRO PROGRAMA', [
    'Você controla o submarino amarelo. A estação é o losango verde. Os recifes e as bordas bloqueiam o caminho.',
    'Avançar anda uma casa. Esquerda e Direita giram o submarino sem andar. Clique nos comandos e depois em Executar.',
    'Remova um bloco pelo ×. Reiniciar tentativa mantém o programa; Limpar programa apaga os blocos. Você pode tentar quantas vezes quiser.',
    release.stage >= 6 ? 'Repetir executa de 2 a 4 avanços usando um bloco. Nas últimas fases, os limites incentivam programas menores.' : 'Observe o caminho e a ordem dos comandos. Novas versões acrescentam outros desafios.',
    release.stage >= 10 ? 'Se obstáculo vira à esquerda quando a frente está bloqueada; caso contrário, avança uma casa.' : 'Use Ver uma dica se precisar de ajuda.',
    'Todos os botões funcionam com teclado: Tab para navegar e Enter ou Espaço para ativar. O mapa informa a posição no texto de status.'
  ]));
  $('version-label').textContent = release.stage >= 3 ? `v${release.version} · Responsável pela etapa: ${release.responsible}` : 'Protótipo educativo · execução local';
  $('release-info').hidden = release.stage < 7;
  $('release-info').addEventListener('click', () => modal(`Versão ${release.version}`, 'FICHA DA ETAPA', [
    `Responsável designado: ${release.responsible}. Função: ${release.role}.`, release.change,
    `Identificador do conteúdo: ${release.sourceHash.slice(0, 16)}. Build: ${release.buildDate}.`,
    'Esta é uma etapa local preparada com assistência de IA. A responsabilidade designada não comprova autoria humana nem substitui commits, revisão e apresentação.'
  ]));
  $('local-status').hidden = release.stage < 4; $('integrity-message').textContent = 'Conteúdo das missões validado · nenhum serviço externo necessário';
  $('verify').hidden = release.stage < 12;
  $('verify').addEventListener('click', () => { try { core.validateContent(content); modal('Verificação local concluída', 'INTEGRIDADE DO JOGO', ['As cinco fases têm estrutura válida e soluções verificadas no build. O jogo utiliza apenas arquivos do próprio pacote.', 'A verificação de hashes de todos os arquivos é feita pelo comando de triagem local. Publicação, monitoramento e vídeo ainda precisam de validação na etapa DevOps.']); } catch(e) { say(e.message, 'error'); } });
  $('privacy').hidden = release.stage < 8;
  $('privacy').addEventListener('click', () => modal('Seu progresso fica aqui', 'DADOS LOCAIS', ['Não pedimos nome, e-mail, idade ou localização. Não enviamos partidas nem informações a servidores.', 'A partir desta etapa, apenas as estrelas por fase ficam no armazenamento deste navegador. Não há ranking público ou telemetria.'], [{ label: 'Apagar progresso local', action: () => { completed = {}; try { localStorage.removeItem(storageKey); } catch (_) {} nav(); say('Progresso local apagado.'); } }]));
  $('export').hidden = release.stage < 11;
  $('export').addEventListener('click', () => { const text = `RESGATE DIGITAL\nVersão: ${release.version}\n` + levels.map(l => `${l.title}: ${completed[l.id] || 0}/3 estrelas`).join('\n') + '\nResumo local sem identificação do jogador.\n'; const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = 'resgate-digital-resumo.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); });
  load(0);
})();
