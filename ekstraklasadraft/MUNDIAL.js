// ============================================================
// MUNDIAL.JS — tryb Mundialu (faza grupowa, 32 drużyny, 8 grup).
// ============================================================


const GROUP_NAMES = ['A','B','C','D','E','F','G','H'];

const ROUND_PAIRS = [
  [[0,3],[1,2]],
  [[0,2],[3,1]],
  [[0,1],[2,3]],
];

function finalizeMundialTeams(opponents) {
  const myRoster = Object.values(getStartingXISquad()).map(s => ({ name: s.name, pos: s.pos, overall: s.overall, birthYear: s.birthYear, season: s.season }));
  const myTeam = { label: state.myClub || state.myTeamName || 'TWOJA DRUŻYNA', overall: state.myOverall, isPlayer: true, roster: myRoster, club: state.myClub || null };
  return [...opponents, myTeam].sort((a,b) => b.overall - a.overall);
}

function buildMundialTeamsChampions() {
  const pool = TEAMS_DATA.map(teamToBracketObj).sort((a,b) => b.overall - a.overall);
  const MAX_PER_CLUB = 2;
  const clubCounts = {};
  const top31 = [];
  for (const t of pool) {
    if (top31.length >= 31) break;
    const c = clubCounts[t.club] || 0;
    if (c >= MAX_PER_CLUB) continue;
    clubCounts[t.club] = c + 1;
    top31.push(t);
  }
  return finalizeMundialTeams(top31);
}

function buildMundialTeamsRandom() {
  const byClub = {};
  TEAMS_DATA.forEach(t => { (byClub[t.club] = byClub[t.club] || []).push(t); });
  const clubs = shuffleArr(Object.keys(byClub));
  const chosen = [];
  for (const c of clubs) {
    if (chosen.length >= 31) break;
    chosen.push(teamToBracketObj(rand(byClub[c])));
  }
  // awaryjnie, gdyby klubów było mniej niż 31
  let guard = 0;
  while (chosen.length < 31 && guard < 400) {
    guard++;
    const t = rand(TEAMS_DATA);
    const obj = teamToBracketObj(t);
    if (!chosen.find(c => c.label === obj.label)) chosen.push(obj);
  }
  return finalizeMundialTeams(chosen);
}

function assignGroups(sortedTeams) {
  // 4 koszyki po 8 (wg siły), z każdego koszyka po jednej drużynie do każdej z 8 grup
  const pots = [sortedTeams.slice(0,8), sortedTeams.slice(8,16), sortedTeams.slice(16,24), sortedTeams.slice(24,32)];
  const groups = {};
  GROUP_NAMES.forEach(g => { groups[g] = []; });
  pots.forEach(pot => {
    shuffleArr(pot).forEach((team, i) => groups[GROUP_NAMES[i]].push(team));
  });
  return groups;
}

function buildGroupSchedule(groups) {
  const schedule = [];
  for (let r = 0; r < 3; r++) {
    const roundObj = {};
    GROUP_NAMES.forEach(g => {
      const teams = groups[g];
      roundObj[g] = ROUND_PAIRS[r].map(([i,j]) => ({
        home: teams[i], away: teams[j], played: false, gf: null, ga: null, group: g,
      }));
    });
    schedule.push(roundObj);
  }
  return schedule;
}

function getPlayerGroupMatch() {
  const roundObj = state.mundial.schedule[state.mundial.matchday];
  for (const g of GROUP_NAMES) {
    const m = roundObj[g].find(mm => mm.home.isPlayer || mm.away.isPlayer);
    if (m) return m;
  }
  return null;
}

function autoSimulateMundialRound(md) {
  const roundObj = state.mundial.schedule[md];
  GROUP_NAMES.forEach(g => {
    roundObj[g].forEach(m => {
      if (m.played || m.home.isPlayer || m.away.isPlayer) return;
      const r = simulateMatch(m.home.overall, m.away.overall);
      m.played = true;
      m.gf = r.gf; m.ga = r.ga;
    });
  });
}

function computeGroupStandings(g) {
  const teams = state.mundial.groups[g];
  const stats = {};
  teams.forEach(t => { stats[t.label] = { team: t, played: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }; });
  state.mundial.schedule.forEach(roundObj => {
    roundObj[g].forEach(m => {
      if (!m.played) return;
      const hs = stats[m.home.label], as = stats[m.away.label];
      hs.played++; as.played++;
      hs.gf += m.gf; hs.ga += m.ga;
      as.gf += m.ga; as.ga += m.gf;
      if (m.gf > m.ga) { hs.w++; hs.pts += 3; as.l++; }
      else if (m.gf < m.ga) { as.w++; as.pts += 3; hs.l++; }
      else { hs.d++; as.d++; hs.pts++; as.pts++; }
    });
  });
  const arr = Object.values(stats);
  arr.sort((a,b) => (b.pts - a.pts) || ((b.gf-b.ga) - (a.gf-a.ga)) || (b.gf - a.gf) || a.team.label.localeCompare(b.team.label));
  return arr;
}

function renderGroupTables() {
  const grid = document.getElementById('groups-grid');
  if (!grid) return;
  grid.innerHTML = '';
  GROUP_NAMES.forEach(g => {
    const standings = computeGroupStandings(g);
    const box = document.createElement('div');
    box.className = 'group-box';
    const rows = standings.map((s,i) => `
      <tr class="${s.team.isPlayer ? 'group-row-me' : ''}">
        <td>${i+1}</td>
        <td class="group-team-name">${s.team.label}</td>
        <td>${s.played}</td><td>${s.w}</td><td>${s.d}</td><td>${s.l}</td>
        <td>${s.gf}:${s.ga}</td><td>${s.gf - s.ga}</td><td><b>${s.pts}</b></td>
      </tr>`).join('');
    box.innerHTML = `
      <div class="group-box-title">GRUPA ${g}</div>
      <table class="group-table">
        <thead><tr><th>#</th><th>DRUŻYNA</th><th>M</th><th>W</th><th>R</th><th>P</th><th>BR</th><th>+/-</th><th>PKT</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
    grid.appendChild(box);
  });
}

function renderOtherMundialResults(md) {
  const roundObj = state.mundial.schedule[md];
  GROUP_NAMES.forEach(g => {
    roundObj[g].forEach(m => {
      if (!m.played || m.home.isPlayer || m.away.isPlayer) return;
      addHistoryCard(`KOLEJKA ${md+1} • GRUPA ${g}`, `${m.home.label} vs ${m.away.label}`, `${m.gf}:${m.ga}`, '');
    });
  });
}

function startMundial(mode) {
  const variant = mode === 'random' ? 'random' : 'champions';
  state.playoffMode = 'mundial';
  state.mundialVariant = variant;
  state.tournamentPhase = 'groups';
  const teams = variant === 'random' ? buildMundialTeamsRandom() : buildMundialTeamsChampions();
  const groups = assignGroups(teams);
  const schedule = buildGroupSchedule(groups);
  state.mundial = { groups, schedule, matchday: 0 };
  document.getElementById('playoff-history').innerHTML = '';
  document.getElementById('playoff-mode-label').textContent =
    variant === 'random' ? 'MUNDIAL LOSOWY' : 'MUNDIAL NAJMOCNIEJSZYCH';
  document.getElementById('groups-panel').style.display = 'block';
  showScreen('screen-playoff');
  autoSimulateMundialRound(0);
  renderOtherMundialResults(0);
  renderGroupTables();
  setupMatch();
}

function setupGroupMatch() {
  const md = state.mundial.matchday;
  const m = getPlayerGroupMatch();
  const opp = m.home.isPlayer ? m.away : m.home;
  const myTeam = m.home.isPlayer ? m.home : m.away;

  const label = `KOLEJKA ${md+1}/3`;
  document.getElementById('playoff-round-label').textContent = label;
  document.getElementById('playoff-round-title').textContent = `${label} • GRUPA ${m.group}`;
  document.getElementById('playoff-history-title').textContent = 'WYNIKI';
  document.getElementById('groups-panel').style.display = 'block';
  resetMatchScreen(opp, myTeam);
  renderGroupTables();
}

function getCurrentMatchContext() {
  if (state.tournamentPhase === 'groups') {
    const m = getPlayerGroupMatch();
    const opp = m.home.isPlayer ? m.away : m.home;
    const myTeam = m.home.isPlayer ? m.home : m.away;
    return { m, opp, myTeam };
  }
  const m = getPlayerMatch();
  const opp = getOpponent(m);
  const myTeam = m.home.isPlayer ? m.home : m.away;
  return { m, opp, myTeam };
}

function nextMundialMatchday() {
  state.mundial.matchday++;
  const md = state.mundial.matchday;
  autoSimulateMundialRound(md);
  renderOtherMundialResults(md);
  renderGroupTables();
  setupMatch();
}

function finishGroupStage() {
  const standings = {};
  GROUP_NAMES.forEach(g => { standings[g] = computeGroupStandings(g); });
  state.mundial.finalStandings = standings;
  renderGroupTables();

  const Q = {};
  GROUP_NAMES.forEach(g => { Q[g+'1'] = standings[g][0].team; Q[g+'2'] = standings[g][1].team; });

  // Krzyżowy układ 1/16 finału — strony A-D i E-H nie spotykają się przed finałem
  const qualifiersOrder = [
    Q.A1, Q.B2, Q.C1, Q.D2, Q.B1, Q.A2, Q.D1, Q.C2,
    Q.E1, Q.F2, Q.G1, Q.H2, Q.F1, Q.E2, Q.H1, Q.G2,
  ];
  const playerQualified = qualifiersOrder.some(t => t.isPlayer);

  if (!playerQualified) {
    document.getElementById('po-commentary').textContent = '😔 Twoja drużyna odpada w fazie grupowej. Inne drużyny grają dalej bez Ciebie...';
    document.getElementById('btn-play-match').style.display = 'none';
    document.getElementById('btn-skip-match').style.display = 'none';
    document.getElementById('btn-next-round').style.display = 'none';
    document.getElementById('btn-playoff-end').style.display = 'inline-block';
    document.getElementById('btn-playoff-end').textContent = '← KONIEC GRY';
    return;
  }

  state.tournamentPhase = 'knockout';
  state.bracket = [makeMatches(qualifiersOrder)];
  state.roundIdx = 0;
  autoSimulateRound(state.bracket[0]);
  document.getElementById('playoff-mode-label').textContent =
    state.mundialVariant === 'random' ? 'MUNDIAL LOSOWY' : 'MUNDIAL NAJMOCNIEJSZYCH';
  renderOtherResults(state.bracket[0]);
  setupMatch();
}

function advance() {
  document.getElementById('btn-next-round').style.display = 'none';
  if (state.tournamentPhase === 'groups') {
    if (state.mundial.matchday < 2) nextMundialMatchday();
    else finishGroupStage();
  } else {
    nextRound();
  }
}

function finishGroupMatch(sim, m, opp) {
  const scoreText = `${sim.gf} : ${sim.ga}`;
  const resultClass = sim.result === 'W' ? 'win' : sim.result === 'D' ? 'draw' : 'loss';

  const ST = getStyle();
  document.getElementById('po-commentary').textContent =
    sim.result === 'W' ? rand(ST.win) : sim.result === 'D' ? rand(ST.draw) : rand(ST.loss);

  document.getElementById('po-score').textContent = formatScoreText(sim.gf, sim.ga);
  document.getElementById('po-score').className = `match-score ${resultClass}`;

  m.played = true;
  if (m.home.isPlayer) { m.gf = sim.gf; m.ga = sim.ga; }
  else { m.gf = sim.ga; m.ga = sim.gf; }

  addHistoryCard(`KOLEJKA ${state.mundial.matchday+1} • GRUPA ${m.group}`, `vs ${opp.label}`, scoreText, resultClass);
  renderGroupTables();

  if (state.mundial.matchday < 2) {
    document.getElementById('btn-next-round').textContent = 'NASTĘPNA KOLEJKA →';
  } else {
    document.getElementById('btn-next-round').textContent = 'PRZEJDŹ DO FAZY PUCHAROWEJ →';
  }
  document.getElementById('btn-next-round').style.display = 'inline-block';
}
