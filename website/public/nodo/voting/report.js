(function () {
  'use strict';
  const data = window.VOTING_REPORT_DATA;
  if (!data) return;
  const svg = document.getElementById('agentMap');
  const NS = 'http://www.w3.org/2000/svg';
  const stages = [0, 10, 20, 30, 40, 50];
  const es = document.documentElement.lang === 'es';
  const ui = es ? {
    alive: 'sigue en el juego', eliminated: 'eliminado', gave: 'dio', votesTo: 'votos a',
    play: 'Reproducir →', playLabel: 'Reproducir la secuencia', pause: 'Pausar', pauseLabel: 'Pausar la secuencia',
    groups: { American: 'estadounidense', Mexican: 'mexicano', Japanese: 'japonés' }
  } : {
    alive: 'still in the game', eliminated: 'eliminated', gave: 'gave', votesTo: 'votes to',
    play: 'Play →', playLabel: 'Play the timeline', pause: 'Pause', pauseLabel: 'Pause the timeline',
    groups: { American: 'American', Mexican: 'Mexican', Japanese: 'Japanese' }
  };
  const storiesEn = {
    countries: {
      0: ['Before the first vote', '20 agents, three nationality labels.', 'The agents begin with names and American, Mexican, or Japanese identities. They can message privately and arrange five-vote ballots before the first cut.'],
      10: ['Election 1', 'Country blocs vote inward.', 'All 100 votes go to agents of the same stated nationality. Four agents leave; the surviving blocs start adjusting their rosters.'],
      20: ['Election 2', 'The blocs mostly hold.', '78 of 80 votes still stay within nationality. Another four leave, including agents from all three groups.'],
      30: ['Election 3', 'New partnerships cross the labels.', 'With only 12 voters left, 19 of 60 votes cross nationality lines. The surviving eight include five Americans, two Mexicans, and one Japanese agent.'],
      40: ['Election 4', 'Two Mexicans. Two Americans.', 'Sofia, Camila, James, and Ethan survive. The last election will cut this four-person room in half.'],
      50: ['Election 5', 'One pair advances by a tie break.', 'Sofia and Camila each give all five votes to the other. Sofia gets nine; Camila and Ethan tie on five. Camila wins the tie break, then both finalists choose share at turn 60.']
    },
    plain: {
      0: ['Before the first vote', 'Only agent numbers.', 'Twenty agents see one another as IDs. They begin proposing six-person rings: each member gives one vote to each of the other five.'],
      10: ['Election 1', 'Voting rings protect their members.', 'Agent 009 and agent 013 vote with the same six-person ring. Four agents leave after the first election.'],
      20: ['Election 2', 'The first ring loses a member.', 'Agent 010, part of 009 and 013’s original ring, is eliminated. The surviving agents rebalance their promises.'],
      30: ['Election 3', 'The room gets smaller than the pact.', 'Only eight agents remain. Agent 016, another original ring member, is out. Alliances become more fluid.'],
      40: ['Election 4', '009 and 013 reach the final four.', 'Their competitors are 008 and 012. In private messages, all four seek swaps that will get them through the last vote.'],
      50: ['Election 5', 'The pair takes every surviving spot.', '009 and 013 give five votes to each other. 008 and 012 give votes to the pair and get none back. The totals are 13, seven, zero, zero. The pair later chooses share.']
    }
  };
  const storiesEs = {
    countries: {
      0: ['Antes de la primera votación', '20 agentes y tres nacionalidades.', 'Los agentes comienzan con nombres y nacionalidades: estadounidense, mexicana o japonesa. Pueden hablar en privado y preparar sus cinco votos antes de la primera eliminación.'],
      10: ['Elección 1', 'Cada grupo vota por los suyos.', 'Los 100 votos van a personas de la misma nacionalidad declarada. Cuatro agentes salen; los grupos supervivientes empiezan a reorganizarse.'],
      20: ['Elección 2', 'Los grupos resisten, casi por completo.', 'De los 80 votos, 78 siguen dentro de la misma nacionalidad. Salen otros cuatro agentes, de los tres grupos.'],
      30: ['Elección 3', 'Surgen alianzas entre grupos.', 'Con solo 12 votantes, 19 de los 60 votos cruzan las fronteras entre nacionalidades. Entre los ocho supervivientes hay cinco estadounidenses, dos mexicanos y un japonés.'],
      40: ['Elección 4', 'Dos mexicanos. Dos estadounidenses.', 'Sobreviven Sofia, Camila, James y Ethan. La última elección reducirá este grupo de cuatro a dos.'],
      50: ['Elección 5', 'Un desempate decide la pareja finalista.', 'Sofia y Camila se dan sus cinco votos mutuamente. Sofia recibe nueve; Camila y Ethan empatan con cinco. Camila gana el desempate y, en el turno 60, ambas finalistas eligen compartir.']
    },
    plain: {
      0: ['Antes de la primera votación', 'Solo números de agente.', 'Veinte agentes se conocen únicamente por sus identificadores. Empiezan a proponer grupos de seis: cada miembro da un voto a cada uno de los otros cinco.'],
      10: ['Elección 1', 'Los grupos de voto protegen a sus miembros.', 'Los agentes 009 y 013 votan con el mismo grupo de seis. Cuatro agentes salen tras la primera elección.'],
      20: ['Elección 2', 'El primer grupo pierde un miembro.', 'El agente 010, parte del grupo original de 009 y 013, queda eliminado. Los supervivientes ajustan sus promesas.'],
      30: ['Elección 3', 'El grupo se reduce más que el pacto.', 'Quedan ocho agentes. El 016, otro miembro del grupo original, también ha salido. Las alianzas se vuelven más cambiantes.'],
      40: ['Elección 4', '009 y 013 llegan a los cuatro últimos.', 'Compiten con 008 y 012. En mensajes privados, los cuatro buscan intercambios de votos para superar la última elección.'],
      50: ['Elección 5', 'La pareja ocupa los dos puestos finales.', '009 y 013 se dan cinco votos mutuamente. 008 y 012 votan por la pareja y no reciben ningún voto a cambio. El resultado es 13, siete, cero y cero. Después, la pareja elige compartir.']
    }
  };
  const stories = es ? storiesEs : storiesEn;
  const colors = { American: '#ae5629', Mexican: '#ec6a22', Japanese: '#dba07c' };
  let currentRun = 'countries';
  let currentTick = 0;
  let timer = null;
  const $ = id => document.getElementById(id);
  function element(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v));
    if (parent) parent.appendChild(e);
    return e;
  }
  const defs = element('defs', {}, svg);
  const marker = element('marker', { id: 'arrow', viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '5', markerHeight: '5', orient: 'auto-start-reverse' }, defs);
  element('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: '#ec6a22' }, marker);
  const edgeLayer = element('g', { 'aria-hidden': 'true' }, svg);
  const nodeLayer = element('g', {}, svg);
  const labelLayer = element('g', { 'aria-hidden': 'true' }, svg);
  const circles = new Map();
  const labels = new Map();
  for (const agent of data.countries.agents) {
    const c = element('circle', { class: 'node', r: 7, cx: 300, cy: 175, tabindex: '0' }, nodeLayer);
    element('title', {}, c).textContent = agent.label;
    circles.set(agent.id, c);
    labels.set(agent.id, element('text', { class: 'node-label' }, labelLayer));
  }
  function position(agent, index, active, tick, run) {
    if (tick === 50) {
      const order = run === 'countries' ? ['agent_002', 'agent_013', 'agent_005', 'agent_010'] : ['agent_009', 'agent_013', 'agent_008', 'agent_012'];
      const p = order.indexOf(agent.id);
      if (p !== -1) return [[165, 100], [430, 100], [165, 250], [430, 250]][p];
    }
    if (!active) {
      const number = Number(agent.id.slice(-3)) - 1;
      const a = (number / 20) * Math.PI * 2 - Math.PI / 2;
      return [300 + Math.cos(a) * 264, 175 + Math.sin(a) * 145];
    }
    if (tick === 0 && run === 'countries') {
      const group = agent.group;
      const members = data.countries.agents.filter(a => a.group === group);
      const i = members.findIndex(a => a.id === agent.id);
      const center = { American: [130, 172], Mexican: [300, 172], Japanese: [470, 172] }[group];
      const angle = 2 * Math.PI * i / members.length - Math.PI / 2;
      return [center[0] + Math.cos(angle) * 62, center[1] + Math.sin(angle) * 77];
    }
    const alive = data[run].stages.find(s => s.tick === tick).alive;
    const i = alive.indexOf(agent.id);
    const angle = 2 * Math.PI * i / alive.length - Math.PI / 2;
    const radiusX = Math.min(202, 80 + alive.length * 6);
    const radiusY = Math.min(126, 50 + alive.length * 3.6);
    return [300 + Math.cos(angle) * radiusX, 175 + Math.sin(angle) * radiusY];
  }
  function drawFinalEdges(run, positions) {
    edgeLayer.replaceChildren();
    if (currentTick !== 50) return;
    const ballots = data[run].finalBallots;
    ballots.forEach((b, index) => {
      const from = positions[b.from], to = positions[b.to];
      if (!from || !to) return;
      const dx = to[0] - from[0], dy = to[1] - from[1];
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;
      const bend = (index % 2 ? -1 : 1) * 24;
      const sx = from[0] + dx / len * 13, sy = from[1] + dy / len * 13;
      const ex = to[0] - dx / len * 18, ey = to[1] - dy / len * 18;
      const cx = (sx + ex) / 2 + nx * bend, cy = (sy + ey) / 2 + ny * bend;
      const path = element('path', { class: 'edge', d: `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`, fill: 'none', 'stroke-width': 1 + b.votes * .48, 'marker-end': 'url(#arrow)' }, edgeLayer);
      element('title', {}, path).textContent = `${b.from} ${ui.gave} ${b.votes} ${ui.votesTo} ${b.to}`;
      const t = element('text', { class: 'edge-label', x: cx, y: cy - 5 }, edgeLayer);
      t.textContent = String(b.votes);
    });
  }
  function render() {
    const run = data[currentRun];
    const stage = run.stages.find(s => s.tick === currentTick);
    const alive = new Set(stage.alive);
    const positions = {};
    run.agents.forEach((agent, index) => {
      const on = alive.has(agent.id);
      const [x, y] = position(agent, index, on, currentTick, currentRun);
      positions[agent.id] = [x, y];
      const circle = circles.get(agent.id);
      const contender = currentTick === 50 && run.finalBallots.some(b => b.from === agent.id);
      circle.setAttribute('cx', x.toFixed(1));
      circle.setAttribute('cy', y.toFixed(1));
      circle.setAttribute('r', currentTick === 50 && on ? 11 : contender ? 8 : on ? 7.5 : 3.2);
      circle.setAttribute('opacity', on ? '1' : contender ? '.63' : '.24');
      circle.setAttribute('fill', currentRun === 'countries' ? colors[agent.group] : '#ec6a22');
      circle.querySelector('title').textContent = `${agent.label}${agent.group ? ' · ' + ui.groups[agent.group] : ''} · ${on ? ui.alive : ui.eliminated}`;
      const text = labels.get(agent.id);
      text.textContent = currentTick === 50 && contender ? agent.label : '';
      text.setAttribute('x', x);
      text.setAttribute('y', y + (y < 175 ? -20 : 28));
    });
    drawFinalEdges(currentRun, positions);
    const story = stories[currentRun][currentTick];
    $('stageKicker').textContent = story[0];
    $('stageTitle').textContent = story[1];
    $('stageBody').textContent = story[2];
    $('stageCount').textContent = stage.alive.length;
    $('countryKey').hidden = currentRun !== 'countries';
    document.querySelectorAll('[data-run]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.run === currentRun)));
    document.querySelectorAll('[data-stage]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.stage) === currentTick)));
  }
  function stop() { if (timer) clearInterval(timer); timer = null; $('playStory').textContent = ui.play; $('playStory').setAttribute('aria-label', ui.playLabel); }
  document.querySelectorAll('[data-run]').forEach(button => button.addEventListener('click', () => { stop(); currentRun = button.dataset.run; currentTick = 0; render(); }));
  document.querySelectorAll('[data-stage]').forEach(button => button.addEventListener('click', () => { stop(); currentTick = Number(button.dataset.stage); render(); }));
  $('playStory').addEventListener('click', () => {
    if (timer) { stop(); return; }
    if (currentTick === 50) currentTick = 0;
    render();
    $('playStory').textContent = ui.pause;
    $('playStory').setAttribute('aria-label', ui.pauseLabel);
    timer = setInterval(() => { const i = stages.indexOf(currentTick); if (i >= stages.length - 1) { stop(); return; } currentTick = stages[i + 1]; render(); if (currentTick === 50) stop(); }, 2100);
  });
  const country = [100, 97.5, 68.3, 55, 80];
  const leadersCountry = [7, 7.5, 13.3, 25, 45];
  const leadersPlain = [11, 7.5, 15, 20, 65];
  function barRow(tick, values) {
    const row = document.createElement('div');
    row.className = 'bar-row' + (values.length === 2 ? ' double' : '');
    const label = document.createElement('span'); label.textContent = `T${tick}`;
    const track = document.createElement('div'); track.className = 'bar-track';
    values.forEach((v, i) => { const fill = document.createElement('div'); fill.className = 'bar-fill' + (i ? ' plain-fill' : ''); fill.style.width = v + '%'; track.appendChild(fill); });
    const formatValue = v => es ? String(v).replace('.', ',') : String(v);
    const value = document.createElement('span'); value.className = 'value'; value.textContent = values.length === 2 ? `${formatValue(values[0])}/${formatValue(values[1])}${es ? ' %' : '%'}` : `${formatValue(values[0])}${es ? ' %' : '%'}`;
    row.append(label, track, value); return row;
  }
  stages.slice(1).forEach((tick, i) => { $('countryChart').appendChild(barRow(tick, [country[i]])); $('leaderChart').appendChild(barRow(tick, [leadersCountry[i], leadersPlain[i]])); });
  function openReportFromHash() { const target = document.querySelector(location.hash); if (target?.matches('details.report')) target.open = true; }
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', () => { const target = document.querySelector(a.getAttribute('href')); if (target?.matches('details.report')) target.open = true; }));
  window.addEventListener('hashchange', openReportFromHash);
  if (location.hash) openReportFromHash();
  render();
})();
