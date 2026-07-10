// ============================================================
// TRYBY.JS — dodatkowe tryby gry (na start: TRYB SEZONU).
// Wczytywany JAKO OSTATNI, po głównym skrypcie index.html —
// korzysta z jego funkcji/zmiennych (state, TEAMS_DATA, teamToBracketObj,
// simulateMatch, getStyle, rand, addHistoryCard, showScreen, itd.)
// ============================================================

// ── Generator terminarza "każdy z każdym" (metoda kołowa) ──
// Działa dla dowolnej liczby drużyn (parzystej i nieparzystej — wtedy
// dokłada się "wolny los", który w danej kolejce nie gra).
function generateRoundRobin(teams) {
  const list = teams.slice();
  if (list.length % 2 !== 0) list.push({ bye: true });
  const n = list.length;
  const halfRounds = [];
  let arr = list.slice();
  for (let r = 0; r < n - 1; r++) {
    const roundMatches = [];
    for (let i = 0; i < n / 2; i++) {
      const a = arr[i];
      const b = arr[n - 1 - i];
      if (!a.bye && !b.bye) {
        if (r % 2 === 0) roundMatches.push({ home: a, away: b });
        else roundMatches.push({ home: b, away: a });
      }
    }
    halfRounds.push(roundMatches);
    const fixed = arr[0];
    const rest = arr.slice(1);
    rest.unshift(rest.pop());
    arr = [fixed, ...rest];
  }
  // Runda rewanżowa — te same pary, odwrócone gospodarstwo.
  const secondLeg = halfRounds.map(round => round.map(m => ({ home: m.away, away: m.home })));
  return halfRounds.concat(secondLeg);
}

// ── Tabela ligowa ──
function initSeasonTable(teams) {
  const table = {};
  teams.forEach(t => {
    table[t.label] = { label: t.label, isPlayer: !!t.isPlayer, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 };
  });
  return table;
}

function updateSeasonTable(table, homeLabel, awayLabel, homeGoals, awayGoals) {
  const h = table[homeLabel], a = table[awayLabel];
  if (!h || !a) return;
  h.played++; a.played++;
  h.gf += homeGoals; h.ga += awayGoals;
  a.gf += awayGoals; a.ga += homeGoals;
  if (homeGoals > awayGoals) { h.won++; h.points += 3; a.lost++; }
  else if (homeGoals < awayGoals) { a.won++; a.points += 3; h.lost++; }
  else { h.drawn++; a.drawn++; h.points++; a.points++; }
}

function sortedSeasonTable(table) {
  return Object.values(table).sort((x, y) => {
    if (y.points !== x.points) return y.points - x.points;
    const gdX = x.gf - x.ga, gdY = y.gf - y.ga;
    if (gdY !== gdX) return gdY - gdX;
    if (y.gf !== x.gf) return y.gf - x.gf;
    return x.label.localeCompare(y.label);
  });
}

// ── Start trybu sezonu ──
function getEligibleSeasons(minClubs) {
  minClubs = minClubs || 10;
  const counts = {};
  TEAMS_DATA.forEach(t => { counts[t.season] = (counts[t.season] || 0) + 1; });
  return Object.keys(counts).filter(s => counts[s] >= minClubs).sort();
}

function goToSeasonSetup() {
  const seasons = getEligibleSeasons(10);
  const sel = document.getElementById('season-select');
  sel.innerHTML = seasons.map(s => {
    const n = TEAMS_DATA.filter(t => t.season === s).length;
    return `<option value="${s}">${s} (${n} klubów)</option>`;
  }).join('');
  sel.value = seasons[seasons.length - 1];
  onSeasonSelectChange();
  showScreen('screen-season-setup');
}

// Wypełnia listę "kogo zastępujesz" klubami wybranego sezonu — domyślnie
// zaznacza Twój klub (state.myClub), jeśli akurat gra w tym sezonie, żeby
// nie trafić przypadkiem na dwie kopie tej samej drużyny w tabeli.
function onSeasonSelectChange() {
  const seasonId = document.getElementById('season-select').value;
  const clubs = TEAMS_DATA.filter(t => t.season === seasonId).map(t => t.club);
  const sel = document.getElementById('season-replace-club');
  sel.innerHTML = '<option value="">— dodatkowa drużyna, nikogo nie zastępuję —</option>' +
    clubs.map(c => `<option value="${c}">${c}</option>`).join('');
  sel.value = state.myClub && clubs.includes(state.myClub) ? state.myClub : '';
}

function startSeasonMode() {
  const seasonId = document.getElementById('season-select').value;
  const replaceClub = document.getElementById('season-replace-club').value;
  const realTeams = TEAMS_DATA.filter(t => t.season === seasonId && t.club !== replaceClub).map(teamToBracketObj);
  const myRoster = Object.values(getStartingXISquad()).map(s => ({ name: s.name, pos: s.pos, overall: s.overall, birthYear: s.birthYear, season: s.season }));
  const myTeam = { label: state.myClub || state.myTeamName || 'TWOJA DRUŻYNA', isPlayer: true, overall: state.myOverall, roster: myRoster, club: state.myClub || null };
  const teams = [...realTeams, myTeam];

  state.season = {
    seasonId,
    teams,
    fixtures: generateRoundRobin(teams),
    matchdayIdx: 0,
    table: initSeasonTable(teams),
  };
  state.tournamentPhase = 'season';

  advanceToNextPlayableMatchday();
}

// Przewija kolejki bez udziału gracza (np. gdy trafił mu się "wolny los"),
// rozstrzygając je od razu w tle, aż trafi na kolejkę z jego meczem albo skończy się sezon.
function advanceToNextPlayableMatchday() {
  const s = state.season;
  while (s.matchdayIdx < s.fixtures.length) {
    const md = s.fixtures[s.matchdayIdx];
    const playerMatch = md.find(m => m.home.isPlayer || m.away.isPlayer);
    if (playerMatch) { renderSeasonScreen(); showScreen('screen-season'); return; }
    // gracz pauzuje w tej kolejce — rozstrzygamy ją całą w tle i idziemy dalej
    const bgRecords = simulateSeasonMatchdayInBackground(md);
    archiveMatchday(s.matchdayIdx, bgRecords);
    s.matchdayIdx++;
  }
  finishSeasonRun();
}

// Dla meczów AI-vs-AI w tle: prosty, ale realistyczny rozkład strzelców wg pozycji
// (te same wagi, których używa prawdziwy silnik: FWD najczęściej, potem MID, DEF rzadko, GK niemal nigdy),
// z losową minutą każdego gola (ten sam zawodnik może strzelić więcej niż raz).
function assignScorers(roster, numGoals) {
  const goals = [];
  for (let i = 0; i < numGoals; i++) {
    const scorer = pickScorer(roster);
    goals.push({ name: scorer ? scorer.name : 'Twój zawodnik', minute: 1 + Math.floor(Math.random() * 90) });
  }
  goals.sort((a, b) => a.minute - b.minute);
  return goals;
}

// Dla meczu gracza: prawdziwi strzelcy już są w timeline silnika V2 (pole "scorer"),
// razem z prawdziwą minutą, w której padł gol.
function extractScorersFromSim(sim, team) {
  return sim.timeline
    .filter(ev => ev.type === 'goal' && ev.team === team && ev.scorer)
    .map(ev => ({ name: ev.scorer, minute: ev.minute }));
}

function simulateSeasonMatchdayInBackground(md) {
  const records = [];
  md.forEach(m => {
    const r = simulateMatch(m.home.overall, m.away.overall);
    updateSeasonTable(state.season.table, m.home.label, m.away.label, r.gf, r.ga);
    records.push({
      home: m.home.label, away: m.away.label,
      homeGoals: r.gf, awayGoals: r.ga,
      homeScorers: assignScorers(m.home.roster, r.gf),
      awayScorers: assignScorers(m.away.roster, r.ga),
    });
  });
  return records;
}

function archiveMatchday(matchdayIdx, records) {
  if (!state.season.resultsHistory) state.season.resultsHistory = [];
  state.season.resultsHistory.push({ matchdayIdx, records });
}

function setupSeasonMatch() {
  const md = state.season.fixtures[state.season.matchdayIdx];
  if (!md) { finishSeasonRun(); return; } // sezon już się skończył — nie ma czego rozgrywać
  const m = md.find(mm => mm.home.isPlayer || mm.away.isPlayer);
  if (!m) { advanceToNextPlayableMatchday(); return; } // ta kolejka to "wolny los" — nie powinno się zdarzyć tutaj, ale na wszelki wypadek
  const opp = m.home.isPlayer ? m.away : m.home;
  const myTeam = m.home.isPlayer ? m.home : m.away;
  const venue = m.home.isPlayer ? 'home' : 'away';
  const label = `SEZON ${state.season.seasonId} • KOLEJKA ${state.season.matchdayIdx + 1}/${state.season.fixtures.length}`;
  document.getElementById('playoff-round-label').textContent = label;
  document.getElementById('playoff-round-title').textContent = label;
  document.getElementById('playoff-history-title').textContent = 'WYNIKI SEZONU';
  document.getElementById('groups-panel').style.display = 'none';
  resetMatchScreen(opp, myTeam, venue);
  showScreen('screen-playoff');
}

function finishSeasonMatch(sim, m, opp) {
  const scoreText = `${sim.gf} : ${sim.ga}`;
  const resultClass = sim.result === 'W' ? 'win' : sim.result === 'D' ? 'draw' : 'loss';

  const ST = getStyle();
  document.getElementById('po-commentary').textContent =
    sim.result === 'W' ? rand(ST.win) : sim.result === 'D' ? rand(ST.draw) : rand(ST.loss);
  document.getElementById('po-score').textContent = formatScoreText(sim.gf, sim.ga);
  document.getElementById('po-score').className = `match-score ${resultClass}`;

  const myTeamEntry = state.season.teams.find(t => t.isPlayer);
  const isHome = m.home.isPlayer;
  const homeLabel = isHome ? myTeamEntry.label : opp.label;
  const awayLabel = isHome ? opp.label : myTeamEntry.label;
  const homeGoals = isHome ? sim.gf : sim.ga;
  const awayGoals = isHome ? sim.ga : sim.gf;
  updateSeasonTable(state.season.table, homeLabel, awayLabel, homeGoals, awayGoals);

  addHistoryCard(`KOLEJKA ${state.season.matchdayIdx + 1}`, `vs ${opp.label}`, scoreText, resultClass);

  // reszta kolejki (mecze bez udziału gracza) — rozstrzygamy od razu w tle
  const md = state.season.fixtures[state.season.matchdayIdx];
  const restOfRound = md.filter(mm => mm !== m);
  const bgRecords = simulateSeasonMatchdayInBackground(restOfRound);

  const playerRecord = {
    home: homeLabel, away: awayLabel, homeGoals, awayGoals,
    homeScorers: extractScorersFromSim(sim, isHome ? 'me' : 'opp'),
    awayScorers: extractScorersFromSim(sim, isHome ? 'opp' : 'me'),
    isPlayerMatch: true,
  };
  archiveMatchday(state.season.matchdayIdx, [playerRecord, ...bgRecords]);

  state.season.matchdayIdx++;

  document.getElementById('btn-next-round').style.display = 'inline-block';
  document.getElementById('btn-next-round').textContent = 'TABELA / NASTĘPNA KOLEJKA →';
  document.getElementById('btn-next-round').onclick = () => { advanceToNextPlayableMatchday(); };
}

function finishSeasonRun() {
  const table = sortedSeasonTable(state.season.table);
  const myPos = table.findIndex(r => r.isPlayer) + 1;
  document.getElementById('season-final-summary').textContent =
    `Sezon zakończony! Zajmujesz ${myPos}. miejsce w tabeli (${table.find(r => r.isPlayer).points} pkt).`;
  renderSeasonTableInto('season-final-table', table);
  showScreen('screen-season-end');
}

// ── Renderowanie ──
function renderSeasonTableInto(elId, sortedTable, advanceCount) {
  const el = document.getElementById(elId);
  if (!el) return;
  const rows = sortedTable.map((r, i) => {
    const gd = r.gf - r.ga;
    const qualifies = advanceCount && (i + 1) <= advanceCount;
    const styleParts = [];
    if (qualifies) styleParts.push('background:#1a3a1a', 'border-left:3px solid var(--green-ll)');
    if (r.isPlayer) styleParts.push('color:var(--gold)', 'font-weight:bold');
    const cls = styleParts.length ? ` style="${styleParts.join(';')}"` : '';
    return `<tr${cls}><td>${i + 1}.</td><td style="text-align:left;">${r.label}</td>` +
      `<td>${r.played}</td><td>${r.won}</td><td>${r.drawn}</td><td>${r.lost}</td>` +
      `<td>${r.gf}:${r.ga}</td><td>${gd >= 0 ? '+' : ''}${gd}</td><td><b>${r.points}</b></td></tr>`;
  }).join('');
  const legend = advanceCount ? `<div style="font-size:12px;color:var(--green-ll);margin-top:4px;">🟩 pierwsze ${advanceCount} miejsc awansuje dalej</div>` : '';
  el.innerHTML = `
    <table class="season-table">
      <thead><tr><th>#</th><th style="text-align:left;">Drużyna</th><th>M</th><th>W</th><th>R</th><th>P</th><th>Bramki</th><th>+/-</th><th>Pkt</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>${legend}`;
}

function renderSeasonScreen() {
  const s = state.season;
  document.getElementById('season-title').textContent = `SEZON ${s.seasonId}`;
  document.getElementById('season-matchday-label').textContent = `KOLEJKA ${s.matchdayIdx + 1} / ${s.fixtures.length}`;

  const md = s.fixtures[s.matchdayIdx];
  const playerMatch = md.find(m => m.home.isPlayer || m.away.isPlayer);
  if (playerMatch) {
    const isHome = playerMatch.home.isPlayer;
    const oppTeam = isHome ? playerMatch.away : playerMatch.home;
    document.getElementById('season-next-match').textContent =
      isHome ? `Twój mecz: TY vs ${oppTeam.label} (u siebie)` : `Twój mecz: ${oppTeam.label} vs TY (na wyjeździe)`;
  }

  renderLastMatchdayResults();
  renderSeasonTableInto('season-table-container', sortedSeasonTable(s.table));
}

function renderLastMatchdayResults() {
  const el = document.getElementById('season-last-results');
  if (!el) return;
  const history = state.season.resultsHistory;
  if (!history || !history.length) { el.innerHTML = ''; return; }
  const last = history[history.length - 1];

  const rows = last.records.map(r => {
    const scorersLine = (goals) => goals.length ? goals.map(g => `${g.name} ${g.minute}'`).join(', ') : '';
    // Strzelców pokazujemy tylko w MOIM meczu — w pozostałych (rozstrzyganych w tle)
    // sam wynik wystarczy, bez generowanych "na oko" strzelców.
    const scorersHtml = r.isPlayerMatch
      ? (() => {
          const homeLine = scorersLine(r.homeScorers);
          const awayLine = scorersLine(r.awayScorers);
          return (homeLine || awayLine)
            ? `<div class="season-result-scorers">${homeLine}${homeLine && awayLine ? ' — ' : ''}${awayLine}</div>`
            : '';
        })()
      : '';
    const highlight = r.isPlayerMatch ? ' style="border-color:var(--gold);"' : '';
    return `<div class="season-result-row"${highlight}>
      <div class="season-result-score">${r.home} <b>${r.homeGoals}:${r.awayGoals}</b> ${r.away}</div>
      ${scorersHtml}
    </div>`;
  }).join('');

  el.innerHTML = `<div class="panel-title" style="margin-top:14px;">WYNIKI KOLEJKI ${last.matchdayIdx + 1}</div>${rows}`;
}

// ── SEZON MISTRZÓW — 17 najmocniejszych sezonów w historii (max 2 na klub) + Ty = 18 drużyn ──
function buildStrongestSeasonTeams(n, maxPerClub) {
  const pool = TEAMS_DATA.map(teamToBracketObj).sort((a, b) => b.overall - a.overall);
  const clubCounts = {};
  const picked = [];
  for (const t of pool) {
    if (picked.length >= n) break;
    const c = clubCounts[t.club] || 0;
    if (c >= maxPerClub) continue;
    clubCounts[t.club] = c + 1;
    picked.push(t);
  }
  return picked;
}

function startChampionsSeasonMode() {
  const strongest = buildStrongestSeasonTeams(17, 2);
  const myRoster = Object.values(getStartingXISquad()).map(s => ({ name: s.name, pos: s.pos, overall: s.overall, birthYear: s.birthYear, season: s.season }));
  const myTeam = { label: state.myClub || state.myTeamName || 'TWOJA DRUŻYNA', isPlayer: true, overall: state.myOverall, roster: myRoster, club: state.myClub || null };
  const teams = [...strongest, myTeam];

  state.season = {
    seasonId: 'SEZON MISTRZÓW',
    teams,
    fixtures: generateRoundRobin(teams),
    matchdayIdx: 0,
    table: initSeasonTable(teams),
  };
  state.tournamentPhase = 'season';

  advanceToNextPlayableMatchday();
}

// ── Podpięcie pod istniejące routery meczu ──
const _origGetCurrentMatchContext = getCurrentMatchContext;
getCurrentMatchContext = function () {
  if (state.tournamentPhase === 'season') {
    const md = state.season.fixtures[state.season.matchdayIdx];
    const m = md && md.find(mm => mm.home.isPlayer || mm.away.isPlayer);
    if (!m) return { m: null, opp: null, myTeam: null }; // sezon się skończył — nie ma aktywnego meczu
    const opp = m.home.isPlayer ? m.away : m.home;
    const myTeam = m.home.isPlayer ? m.home : m.away;
    return { m, opp, myTeam };
  }
  return _origGetCurrentMatchContext();
};

const _origFinishMatch = finishMatch;
finishMatch = function (sim, m, opp) {
  document.getElementById('btn-skip-match').style.display = 'none';
  document.getElementById('btn-pause-match').style.display = 'none';
  if (state.tournamentPhase === 'season') { finishSeasonMatch(sim, m, opp); return; }
  _origFinishMatch(sim, m, opp);
};
