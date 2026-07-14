// ============================================================
// MUNDIAL-2026.JS — nowy tryb z poziomu głównego menu: Mundial 2026.
// 48 reprezentacji, 12 grup po 4 (oryginalny podział albo przelosowanie),
// potem TOP 32 (12 pierwszych miejsc + 12 drugich + 8 najlepszych trzecich)
// wchodzi w STAŁĄ, widoczną od początku drabinkę pucharową — dokładnie
// jak w prawdziwym Mundialu: 1/16 → 1/8 → ćwierćfinał → półfinał → finał,
// pojedynczy mecz, remis rozstrzyga dogrywka + karne.
//
// Seedowanie 1-32 (jak przy budowaniu drabinki NBA, ta sama idea):
//   seed 1-12  = zwycięzcy grup, posortowani (pkt, różnica bramek, gole)
//   seed 13-24 = drudzy w grupach, tak samo posortowani
//   seed 25-32 = najlepsza ósemka trzecich miejsc, tak samo posortowana
// Drabinka budowana jest standardowym "wężowym" porządkiem seedów
// (1 vs 32, 16 vs 17, 8 vs 25, ...), żeby najmocniejsi mogli się spotkać
// dopiero w później rundach — i widać ją w CAŁOŚCI od razu po grupach,
// nawet zanim rozegrane zostaną wcześniejsze mecze (miejsca w drabince
// dalszych rund pokazują "?", dopóki się nie rozstrzygną, ale sam KSZTAŁT
// drabinki — kto z kim może się spotkać i kiedy — jest znany od początku).
//
// UWAGA: podział na grupy w MUNDIAL2026-DANE.js jest już PRAWDZIWY
// (losowanie z 5.12.2025 + rozstrzygnięte baraże), ze Szwecją zamienioną
// na Polskę w Grupie F. Same składy zawodników każdej reprezentacji to
// wciąż ZAŚLEPKA (płaski overall na drużynę) — podmień, gdy zechcesz.
// ============================================================

// ── Budowa grup ─────────────────────────────────────────────
function resolveM26Team(id, isPlayerTeam) {
  const t = MUNDIAL26_TEAMS_DATA.find(tt => tt.id === id);
  if (!t) return null;
  const roster = t.players.map(p => ({ name: p.name, pos: p.position, overall: p.overall, birthYear: null, season: null }));
  return { label: t.label, overall: calcTeamOverall(roster.map(p => ({ pos: p.pos, overall: p.overall }))), isPlayer: !!isPlayerTeam, roster };
}

function myMundial26TeamObj(teamId) {
  const myRoster = Object.values(getStartingXISquad()).map(s => ({ name: s.name, pos: s.pos, overall: s.overall, birthYear: s.birthYear, season: s.season }));
  const base = MUNDIAL26_TEAMS_DATA.find(t => t.id === teamId);
  return { label: (base ? base.label : 'TWOJA DRUŻYNA'), overall: state.myOverall, isPlayer: true, roster: myRoster };
}

function buildGroupsForMundial26(myTeamId, redraw) {
  const myTeamObj = myMundial26TeamObj(myTeamId);
  const letters = Object.keys(MUNDIAL26_GROUPS);
  const groups = {};

  if (!redraw) {
    letters.forEach(letter => {
      groups[letter] = MUNDIAL26_GROUPS[letter].map(id => id === myTeamId ? myTeamObj : resolveM26Team(id, false));
    });
    return groups;
  }

  // Przelosowanie: wszystkie 48 (poza wybraną drużyną, wstawianą osobno)
  // tasujemy i dzielimy na 12 świeżych grup po 4, gracz trafia do losowej.
  const others = shuffleArr(MUNDIAL26_TEAMS_DATA.map(t => t.id).filter(id => id !== myTeamId)).map(id => resolveM26Team(id, false));
  const myGroupLetter = rand(letters);
  let otherIdx = 0;
  letters.forEach(letter => {
    const teamsInGroup = letter === myGroupLetter ? [myTeamObj] : [];
    while (teamsInGroup.length < 4) teamsInGroup.push(others[otherIdx++]);
    groups[letter] = teamsInGroup;
  });
  return groups;
}

// ── Start trybu ─────────────────────────────────────────────
function goToMundial26Setup() {
  if (!Object.keys(state.squad || {}).length) {
    alert('Mundial 2026 grasz swoim wydraftowanym składem — najpierw stwórz drużynę, a potem od razu wrócisz tutaj.');
    state.pendingMundial26AfterDraft = true;
    goToDraftSetup();
    return;
  }
  const sel = document.getElementById('m26-team-select');
  sel.innerHTML = MUNDIAL26_TEAMS_DATA.map(t => `<option value="${t.id}">${t.label}</option>`).join('');
  sel.value = 'm26-polska';
  showScreen('screen-mundial26-setup');
}

function startMundial26() {
  const myTeamId = document.getElementById('m26-team-select').value;
  const redraw = document.getElementById('m26-redraw-checkbox').checked;
  const fullRanking = document.getElementById('m26-fullranking-checkbox').checked;
  const nbaStyleKnockout = document.getElementById('m26-nbastyle-checkbox').checked;
  ensureStartingXI();
  state.myOverall = calcTeamOverall(getStartingXISquad());

  const groups = buildGroupsForMundial26(myTeamId, redraw);
  const groupFixtures = {}, groupTables = {};
  Object.keys(groups).forEach(letter => {
    groupFixtures[letter] = generateRoundRobin(groups[letter]);
    groupTables[letter] = initSeasonTable(groups[letter]);
  });

  state.mundial26 = {
    myTeamId, groups, groupFixtures, groupTables,
    matchdayIdx: 0,
    phase: 'groups',
    fullRanking, nbaStyleKnockout,
    bracket: null, roundIdx: 0, champion: null, playerEliminated: false,
    rankBands: null,
  };
  state.tournamentPhase = 'mundial26';
  advanceM26Matchday();
}

function myM26GroupLetter() {
  return Object.keys(state.mundial26.groups).find(letter => state.mundial26.groups[letter].some(t => t.isPlayer));
}

// ── Faza grupowa ─────────────────────────────────────────────
function advanceM26Matchday() {
  const m26 = state.mundial26;
  if (m26.matchdayIdx >= 3) { finishM26Groups(); return; }
  goToM26Hub();
}

// Rozstrzyga w tle WSZYSTKIE mecze danej kolejki grupowej poza tą jedną,
// w której bierze udział gracz (jego mecz rozgrywa się naprawdę).
function simulateM26MatchdayBackground(excludeMatch) {
  const m26 = state.mundial26;
  Object.keys(m26.groupFixtures).forEach(letter => {
    const md = m26.groupFixtures[letter][m26.matchdayIdx];
    if (!md) return;
    md.forEach(m => {
      if (m === excludeMatch) return;
      const r = simulateMatch(m.home.overall, m.away.overall);
      updateSeasonTable(m26.groupTables[letter], m.home.label, m.away.label, r.gf, r.ga);
    });
  });
}

function setupM26GroupMatch() {
  const m26 = state.mundial26;
  const letter = myM26GroupLetter();
  const md = m26.groupFixtures[letter][m26.matchdayIdx];
  const m = md.find(mm => mm.home.isPlayer || mm.away.isPlayer);
  const opp = m.home.isPlayer ? m.away : m.home;
  const myTeam = m.home.isPlayer ? m.home : m.away;
  const label = `MUNDIAL 2026 • GRUPA ${letter} • KOLEJKA ${m26.matchdayIdx + 1}/3`;
  document.getElementById('playoff-round-label').textContent = label;
  document.getElementById('playoff-round-title').textContent = label;
  document.getElementById('playoff-history-title').textContent = 'WYNIKI GRUPY';
  resetMatchScreen(opp, myTeam, 'neutral'); // Mundial 2026: zawsze teren neutralny, bez przewagi żadnej ze stron
}

function finishM26GroupMatch(sim, m, opp) {
  const m26 = state.mundial26;
  const letter = myM26GroupLetter();
  const scoreText = `${sim.gf} : ${sim.ga}`;
  const resultClass = sim.result === 'W' ? 'win' : sim.result === 'D' ? 'draw' : 'loss';
  const ST = getStyle();
  document.getElementById('po-commentary').textContent = sim.result === 'W' ? rand(ST.win) : sim.result === 'D' ? rand(ST.draw) : rand(ST.loss);
  document.getElementById('po-score').textContent = formatScoreText(sim.gf, sim.ga);
  document.getElementById('po-score').className = `match-score ${resultClass}`;

  const isHome = m.home.isPlayer;
  const homeLabel = isHome ? m.home.label : opp.label;
  const awayLabel = isHome ? opp.label : m.away.label;
  updateSeasonTable(m26.groupTables[letter], homeLabel, awayLabel, isHome ? sim.gf : sim.ga, isHome ? sim.ga : sim.gf);

  simulateM26MatchdayBackground(m);
  m26.matchdayIdx++;
}

// ── Koniec faz grupowej — seedowanie 1-32 ────────────────────
function m26RankTeams(rows) {
  // rows: [{label, points, gf, ga, ...}] — sortuje wg (pkt, różnica bramek, strzelone)
  return [...rows].sort((a, b) => (b.points - a.points) || ((b.gf - b.ga) - (a.gf - a.ga)) || (b.gf - a.gf));
}

function finishM26Groups() {
  const m26 = state.mundial26;
  const winners = [], runnersUp = [], thirds = [], fourths = [];
  Object.keys(m26.groups).forEach(letter => {
    const table = sortedSeasonTable(m26.groupTables[letter]);
    winners.push(table[0]); runnersUp.push(table[1]); thirds.push(table[2]); fourths.push(table[3]);
  });
  const rankedThirds = m26RankTeams(thirds);
  const qualifyingRows = [...m26RankTeams(winners), ...m26RankTeams(runnersUp), ...rankedThirds.slice(0, 8)];
  // qualifyingRows[0] = seed 1 ... qualifyingRows[31] = seed 32
  const qualifiedSeeds = qualifyingRows.map(row => findM26TeamByLabel(row.label));

  const iQualified = qualifiedSeeds.some(t => t && t.isPlayer);
  state.tournamentPhase = 'mundial26';

  if (!m26.fullRanking) {
    if (!iQualified) {
      document.getElementById('season-final-summary').textContent =
        `Odpadasz w fazie grupowej Mundialu 2026 — do TOP 32 (2 pierwsze miejsca w grupie + 8 najlepszych trzecich) zabrakło niewiele. Turniej toczy się dalej bez Ciebie.`;
      document.getElementById('season-final-table').innerHTML = '';
      showScreen('screen-season-end');
      return;
    }
    m26.phase = 'knockout';
    m26.bracket = buildM26Bracket(qualifiedSeeds);
    m26.roundIdx = 0;
    resolveM26NonPlayerMatchesInRound();
    goToM26Hub();
    return;
  }

  // ── TRYB PEŁNEJ KLASYFIKACJI 1-48 ──
  // Ci, co się nie łapią do TOP 32 (4 najsłabsze trzecie miejsca + wszystkie
  // 12 czwartych = 16 drużyn), grają WŁASNĄ drabinkę klasyfikacyjną o miejsca
  // 33-48 — nawet gracz, jeśli akurat wśród nich się znajdzie.
  const nonQualifiedThirds = rankedThirds.slice(8);
  const consolationRows = [...nonQualifiedThirds, ...m26RankTeams(fourths)];
  const consolationSeeds = consolationRows.map(row => findM26TeamByLabel(row.label));

  const mainOrder = buildSeedOrder(32).map(seedNum => qualifiedSeeds[seedNum - 1]);
  const consolationOrder = buildSeedOrder(16).map(seedNum => consolationSeeds[seedNum - 1]);

  m26.phase = 'knockout';
  m26.rankBands = { main: buildRankBandShape(32, 1, 32), consolation: buildRankBandShape(16, 33, 48) };
  populateRankBand(m26.rankBands.main, mainOrder);
  populateRankBand(m26.rankBands.consolation, consolationOrder);
  resolveRankBandNonPlayerMatches(m26.rankBands.main);
  resolveRankBandNonPlayerMatches(m26.rankBands.consolation);
  goToM26Hub();
}

// Standardowy "wężowy" porządek seedów dla drabinki o rozmiarze n
// (1,2 → 1,n,n/2+1,... itd.) — gwarantuje, że najlepsi seedowie mogą
// się spotkać dopiero w najdalszych rundach.
function buildSeedOrder(n) {
  let order = [1, 2];
  while (order.length < n) {
    const size = order.length * 2;
    const newOrder = [];
    order.forEach(seed => { newOrder.push(seed); newOrder.push(size + 1 - seed); });
    order = newOrder;
  }
  return order;
}

const M26_ROUND_NAMES = ['1/16 FINAŁU', '1/8 FINAŁU', 'ĆWIERĆFINAŁ', 'PÓŁFINAŁ', 'FINAŁ'];

// Buduje WSZYSTKIE rundy naraz — pierwsza (1/16) ma prawdziwe drużyny wg
// seedów, kolejne mają puste sloty (wypełniane zwycięzcami w miarę gry) —
// dzięki temu KSZTAŁT całej drabinki jest widoczny od razu po grupach.
function buildM26Bracket(seeds32) {
  const order = buildSeedOrder(32);
  const r0Teams = order.map(seedNum => seeds32[seedNum - 1]);
  const round0 = [];
  for (let i = 0; i < r0Teams.length; i += 2) {
    round0.push({ teamA: r0Teams[i], teamB: r0Teams[i + 1], winner: null, loser: null, winsA: 0, winsB: 0, gameIdx: 0 });
  }
  const rounds = [round0];
  let size = 8;
  while (size >= 1) {
    rounds.push(Array.from({ length: size }, () => ({ teamA: null, teamB: null, winner: null, loser: null, winsA: 0, winsB: 0, gameIdx: 0 })));
    size = size / 2;
  }
  return rounds; // [16 meczów 1/16, 8 meczów 1/8, 4 ćwierćfinały, 2 półfinały, 1 finał]
}

function findMyM26Match() {
  const round = state.mundial26.bracket[state.mundial26.roundIdx];
  return round.find(m => !m.winner && ((m.teamA && m.teamA.isPlayer) || (m.teamB && m.teamB.isPlayer)));
}

// Rozstrzyga w tle (do jednego wyniku — dogrywka/karne, jeśli remis) mecze
// bieżącej rundy, które NIE dotyczą gracza.
// Rozstrzyga JEDNĄ grę w tle (bez udziału gracza) - kto by ją wygrał, gdyby
// padł remis, decyduje dogrywka, a potem ważona moneta (bez pełnych karnych,
// to tylko tło).
function m26ResolveBackgroundGame(m) {
  const r = simulateMatch(m.teamA.overall, m.teamB.overall);
  if (r.gf !== r.ga) return r.gf > r.ga;
  const et = simulateExtraTimeResult(m.teamA.overall, m.teamB.overall);
  if (et.gf !== et.ga) return et.gf > et.ga;
  return Math.random() < clamp(0.5 + (m.teamA.overall - m.teamB.overall) * 0.015, 0.15, 0.85);
}

// Rozstrzyga cały mecz/serię w tle na raz — pojedynczy mecz w trybie
// standardowym, albo pełną serię do 4 zwycięstw w trybie NBA STYLE.
function m26ResolveBackgroundMatch(m) {
  const m26 = state.mundial26;
  if (!m26.nbaStyleKnockout) {
    m.winner = m26ResolveBackgroundGame(m) ? m.teamA : m.teamB;
    m.loser = m.winner === m.teamA ? m.teamB : m.teamA;
    return;
  }
  while (!m.winner) {
    if (m26ResolveBackgroundGame(m)) m.winsA++; else m.winsB++;
    m.gameIdx++;
    if (m.winsA >= 4) m.winner = m.teamA;
    else if (m.winsB >= 4) m.winner = m.teamB;
  }
  m.loser = m.winner === m.teamA ? m.teamB : m.teamA;
}

// Rozstrzyga JEDNĄ grę mojego meczu/serii — cały mecz na raz w trybie
// standardowym (dogrywka/karne od razu decydują całość), albo jedną grę
// serii do 4 zwycięstw w trybie NBA STYLE (używa decideNbaGameWinner
// z NBA-PLAYOFF.js — ta sama logika co w play-offie NBA Trybu Sezonu).
function m26RegisterGameResult(match, sim, myTeam, opp, iAmA) {
  const m26 = state.mundial26;
  if (!m26.nbaStyleKnockout) {
    let myWon = sim.result === 'W';
    let note = '';
    if (sim.result === 'D') {
      const et = simulateExtraTimeResult(myTeam.overall, opp.overall);
      if (et.gf !== et.ga) { myWon = et.gf > et.ga; note = ` (dogr. ${et.gf}:${et.ga})`; }
      else {
        const shootout = simulatePenaltyShootout(myTeam.roster, opp.roster, opp.label);
        myWon = shootout.iWin;
        note = ` (dogr. ${et.gf}:${et.ga}, k. ${shootout.myScore}:${shootout.oppScore})`;
      }
    }
    match.winner = myWon ? myTeam : opp;
    match.loser = myWon ? opp : myTeam;
    return { decided: true, myWon, note };
  }

  const decision = decideNbaGameWinner(sim, myTeam, opp);
  if (decision.myWon) { if (iAmA) match.winsA++; else match.winsB++; }
  else { if (iAmA) match.winsB++; else match.winsA++; }
  match.gameIdx++;
  let decided = false;
  if (match.winsA >= 4) { match.winner = match.teamA; match.loser = match.teamB; decided = true; }
  else if (match.winsB >= 4) { match.winner = match.teamB; match.loser = match.teamA; decided = true; }
  return { decided, myWon: decision.myWon, note: decision.note };
}

function resolveM26NonPlayerMatchesInRound() {
  const round = state.mundial26.bracket[state.mundial26.roundIdx];
  round.forEach(m => {
    if (m.winner || !m.teamA || !m.teamB) return;
    if (m.teamA.isPlayer || m.teamB.isPlayer) return;
    m26ResolveBackgroundMatch(m);
  });
}

function findM26TeamByLabel(label) {
  for (const letter of Object.keys(state.mundial26.groups)) {
    const t = state.mundial26.groups[letter].find(tt => tt.label === label);
    if (t) return t;
  }
  return null;
}

// ── PEŁNA KLASYFIKACJA 1-48 (opcjonalny tryb, wzorem koszykarskich Mundiali) ──
// Każdy przegrany od razu trafia do WŁASNEJ "półki" drabinki klasyfikacyjnej
// (np. przegrani ćwierćfinału grają o miejsca 5-8, przegrani tamtych meczów
// o miejsca 7-8 itd.) — aż w samym dole tabeli zostanie rozstrzygnięte
// nawet miejsce 48. Reprezentowane jako drzewo: węzeł to zakres miejsc
// [rankStart..rankEnd] — gdy ma więcej niż 1 drużynę, ma swoje mecze
// ("runda A" tej półki), zwycięzcy schodzą do "upper" (górna połowa
// zakresu, lepsze miejsca), przegrani do "lower" (gorsza połowa).
function buildRankBandShape(size, rankStart, rankEnd) {
  if (size === 1) return { size, rankStart, rankEnd, teams: null, matches: null, upper: null, lower: null };
  const half = size / 2;
  return {
    size, rankStart, rankEnd, teams: null, matches: null,
    upper: buildRankBandShape(half, rankStart, rankStart + half - 1),
    lower: buildRankBandShape(half, rankStart + half, rankEnd),
  };
}

function populateRankBand(node, teams) {
  node.teams = teams;
  if (node.size === 1) return;
  node.matches = [];
  for (let i = 0; i < teams.length; i += 2) node.matches.push({ teamA: teams[i], teamB: teams[i + 1], winner: null, loser: null, winsA: 0, winsB: 0, gameIdx: 0 });
}

// Gdy WSZYSTKIE mecze tej półki są rozstrzygnięte — zwycięzcy schodzą do
// "upper" (dalsza gra o lepsze miejsca w tym zakresie), przegrani do "lower".
function tryAdvanceRankBand(node) {
  if (!node || node.size === 1 || !node.matches) return;
  if (!node.matches.every(m => m.winner)) return;
  populateRankBand(node.upper, node.matches.map(m => m.winner));
  populateRankBand(node.lower, node.matches.map(m => m.loser));
  resolveRankBandNonPlayerMatches(node.upper);
  resolveRankBandNonPlayerMatches(node.lower);
}

// Rozstrzyga w tle (i w dół całego poddrzewa) mecze tej półki, o ile NIE
// dotyczy gracza — jeśli dotyczy, ta gałąź czeka na prawdziwy mecz gracza.
function resolveRankBandNonPlayerMatches(node) {
  if (!node || !node.matches) return;
  node.matches.forEach(m => {
    if (m.winner) return;
    if (m.teamA.isPlayer || m.teamB.isPlayer) return; // ta konkretna para dotyczy gracza — czeka na prawdziwy mecz
    m26ResolveBackgroundMatch(m);
  });
  tryAdvanceRankBand(node);
}

// Szuka gdziekolwiek w drzewie węzła z nierozstrzygniętym meczem gracza.
function findMyRankBandMatch(node) {
  if (!node || !node.matches) return null;
  const mine = node.matches.find(m => !m.winner && (m.teamA.isPlayer || m.teamB.isPlayer));
  if (mine) return mine;
  return findMyRankBandMatch(node.upper) || findMyRankBandMatch(node.lower);
}

function findNodeContainingMatch(node, match) {
  if (!node) return null;
  if (node.matches && node.matches.includes(match)) return node;
  return findNodeContainingMatch(node.upper, match) || findNodeContainingMatch(node.lower, match);
}

function m26ClassificationLabelFor(match) {
  const m26 = state.mundial26;
  const node = findNodeContainingMatch(m26.rankBands.main, match) || findNodeContainingMatch(m26.rankBands.consolation, match);
  if (!node) return 'MECZ KLASYFIKACYJNY';
  if (node.rankStart === 1 && node.size === 2) return 'FINAŁ';
  if (node.size === 2) return `MECZ O ${node.rankStart}. MIEJSCE`;
  return `O MIEJSCA ${node.rankStart}-${node.rankEnd}`;
}

// Zbiera WSZYSTKIE już rozstrzygnięte miejsca (nawet częściowo, w trakcie
// turnieju) — węzły o rozmiarze 1 to już przyznane, ostateczne miejsca.
function collectRankBandResults(node, out) {
  if (!node) return out;
  if (node.size === 1) { if (node.teams) out.push({ team: node.teams[0], rank: node.rankStart }); return out; }
  collectRankBandResults(node.upper, out);
  collectRankBandResults(node.lower, out);
  return out;
}

function findMyFinalRank() {
  const m26 = state.mundial26;
  const all = [...collectRankBandResults(m26.rankBands.main, []), ...collectRankBandResults(m26.rankBands.consolation, [])];
  const mine = all.find(r => r.team.isPlayer);
  return mine ? mine.rank : null;
}

function renderM26FullRankingView() {
  const m26 = state.mundial26;
  const known = [...collectRankBandResults(m26.rankBands.main, []), ...collectRankBandResults(m26.rankBands.consolation, [])];
  const byRank = {};
  known.forEach(r => { byRank[r.rank] = r.team; });
  let html = '<div class="panel-title" style="font-size:14px;">KLASYFIKACJA KOŃCOWA (NA BIEŻĄCO)</div>';
  for (let rank = 1; rank <= 48; rank++) {
    const t = byRank[rank];
    const isMine = t && t.isPlayer;
    html += `<div style="${isMine ? 'color:var(--gold);font-weight:bold;' : 'color:var(--gray);'}padding:1px 0;">${rank}. ${t ? t.label : '?'}</div>`;
  }
  document.getElementById('playoff-history').innerHTML = html;
}

function setupM26ClassificationMatch() {
  const m26 = state.mundial26;
  const m = findMyRankBandMatch(m26.rankBands.main) || findMyRankBandMatch(m26.rankBands.consolation);
  if (!m) { goToM26Hub(); return; }
  const iAmA = m.teamA.isPlayer;
  const myTeam = iAmA ? m.teamA : m.teamB;
  const opp = iAmA ? m.teamB : m.teamA;
  let label = `MUNDIAL 2026 • ${m26ClassificationLabelFor(m)}`;
  if (m26.nbaStyleKnockout) {
    label += ` • Mecz ${m.gameIdx + 1} serii (${m.winsA}:${m.winsB}) vs ${opp.label}`;
  }
  document.getElementById('playoff-round-label').textContent = label;
  document.getElementById('playoff-round-title').textContent = label;
  document.getElementById('playoff-history-title').textContent = 'KLASYFIKACJA KOŃCOWA';
  resetMatchScreen(opp, myTeam, 'neutral'); // Mundial 2026: zawsze teren neutralny, nawet w serii NBA STYLE
}

function finishM26ClassificationMatch(sim, m, opp) {
  const m26 = state.mundial26;
  const match = findMyRankBandMatch(m26.rankBands.main) || findMyRankBandMatch(m26.rankBands.consolation);
  const iAmA = match.teamA.isPlayer;
  const myTeam = iAmA ? match.teamA : match.teamB;

  const result = m26RegisterGameResult(match, sim, myTeam, opp, iAmA);
  const resultClass = result.myWon ? 'win' : 'loss';
  const ST = getStyle();
  document.getElementById('po-commentary').textContent = result.myWon ? rand(ST.win) : rand(ST.loss);
  document.getElementById('po-score').textContent = formatScoreText(sim.gf, sim.ga) + (result.note || '');
  document.getElementById('po-score').className = `match-score ${resultClass}`;

  if (!result.decided) return; // seria trwa dalej — kolejna gra tej samej pary

  const node = findNodeContainingMatch(m26.rankBands.main, match) || findNodeContainingMatch(m26.rankBands.consolation, match);
  tryAdvanceRankBand(node);
}

// ── Faza pucharowa ────────────────────────────────────────────
function goToM26Hub() {
  const m26 = state.mundial26;
  document.getElementById('groups-panel').style.display = m26.phase === 'groups' ? 'block' : 'none';
  document.getElementById('playoff-history-title').textContent = m26.phase === 'groups' ? 'WYNIKI GRUP' : 'DRABINKA MUNDIALU';

  if (m26.phase === 'groups') {
    document.getElementById('hub-playoff-mode-label').textContent = 'MUNDIAL 2026 — FAZA GRUPOWA';
    document.getElementById('hub-playoff-round-label').textContent = `KOLEJKA ${m26.matchdayIdx + 1}/3`;
    const letter = myM26GroupLetter();
    const md = m26.groupFixtures[letter][m26.matchdayIdx];
    const m = md.find(mm => mm.home.isPlayer || mm.away.isPlayer);
    const opp = m.home.isPlayer ? m.away : m.home;
    document.getElementById('hub-playoff-round-title').textContent = `GRUPA ${letter} • KOLEJKA ${m26.matchdayIdx + 1}/3 — Rywal: ${opp.label} (OVR ${calcTeamOverall(opp.roster)})`;
    renderM26GroupTables();
    document.getElementById('btn-play-match-hub').style.display = 'inline-block';
    document.getElementById('btn-play-match-hub').onclick = () => setupM26GroupMatch();
    document.getElementById('btn-next-round').style.display = 'none';
    document.getElementById('btn-playoff-end').style.display = 'none';
    showScreen('screen-playoff');
    return;
  }

  // Faza pucharowa
  document.getElementById('hub-playoff-mode-label').textContent = 'MUNDIAL 2026 — FAZA PUCHAROWA';
  document.getElementById('groups-panel').style.display = 'none';

  if (m26.fullRanking) {
    document.getElementById('playoff-history-title').textContent = 'KLASYFIKACJA KOŃCOWA (NA BIEŻĄCO)';
    renderM26FullRankingView();
    const myRank = findMyFinalRank();
    if (myRank != null) {
      document.getElementById('hub-playoff-round-label').textContent = 'TURNIEJ ZAKOŃCZONY';
      document.getElementById('hub-playoff-round-title').textContent = myRank === 1
        ? '🏆 ZOSTAJESZ MISTRZEM ŚWIATA!' : `🏁 Kończysz Mundial 2026 na ${myRank}. miejscu na 48.`;
      document.getElementById('btn-play-match-hub').style.display = 'none';
    } else {
      const m = findMyRankBandMatch(m26.rankBands.main) || findMyRankBandMatch(m26.rankBands.consolation);
      const iAmA = m.teamA.isPlayer;
      const opp = iAmA ? m.teamB : m.teamA;
      const label = m26ClassificationLabelFor(m);
      document.getElementById('hub-playoff-round-label').textContent = label;
      document.getElementById('hub-playoff-round-title').textContent = `${label} — Rywal: ${opp.label} (OVR ${calcTeamOverall(opp.roster)})`;
      document.getElementById('btn-play-match-hub').style.display = 'inline-block';
      document.getElementById('btn-play-match-hub').onclick = () => setupM26ClassificationMatch();
    }
    document.getElementById('btn-next-round').style.display = 'none';
    document.getElementById('btn-playoff-end').style.display = 'none';
    showScreen('screen-playoff');
    return;
  }

  document.getElementById('playoff-history-title').textContent = 'DRABINKA MUNDIALU';
  document.getElementById('hub-playoff-round-label').textContent = M26_ROUND_NAMES[m26.roundIdx];
  renderM26Bracket();

  if (m26.champion) {
    document.getElementById('hub-playoff-round-title').textContent = m26.champion.isPlayer
      ? '🏆 ZOSTAJESZ MISTRZEM ŚWIATA!' : `🏆 Mistrzem świata zostaje ${m26.champion.label}.`;
    document.getElementById('btn-play-match-hub').style.display = 'none';
  } else if (m26.playerEliminated) {
    document.getElementById('hub-playoff-round-title').textContent = '😔 Odpadasz z Mundialu. Turniej toczy się dalej bez Ciebie.';
    document.getElementById('btn-play-match-hub').style.display = 'none';
  } else {
    const m = findMyM26Match();
    const iAmA = m.teamA.isPlayer;
    const opp = iAmA ? m.teamB : m.teamA;
    document.getElementById('hub-playoff-round-title').textContent = `${M26_ROUND_NAMES[m26.roundIdx]} — Rywal: ${opp.label} (OVR ${calcTeamOverall(opp.roster)})`;
    document.getElementById('btn-play-match-hub').style.display = 'inline-block';
    document.getElementById('btn-play-match-hub').onclick = () => setupM26KnockoutMatch();
  }
  document.getElementById('btn-next-round').style.display = 'none';
  document.getElementById('btn-playoff-end').style.display = 'none';
  showScreen('screen-playoff');
}

function renderM26GroupTables() {
  const m26 = state.mundial26;
  const grid = document.getElementById('groups-grid');
  grid.innerHTML = Object.keys(m26.groups).map(letter => {
    const rows = sortedSeasonTable(m26.groupTables[letter]);
    const body = rows.map((r, i) => `<tr${r.isPlayer ? ' style="color:var(--gold);font-weight:bold;"' : ''}><td>${i + 1}.</td><td style="text-align:left;">${r.label}</td><td>${r.points}</td></tr>`).join('');
    return `<div class="panel" style="padding:8px;"><div class="panel-title" style="font-size:11px;">GRUPA ${letter}</div><table class="season-table"><tbody>${body}</tbody></table></div>`;
  }).join('');
}

// Prosty, czytelny tekstowy widok całej drabinki, runda po rundzie —
// od razu widać KSZTAŁT turnieju, nawet dla jeszcze nierozstrzygniętych
// dalszych rund (pokazują się jako "?").
function renderM26Bracket() {
  const m26 = state.mundial26;
  const html = m26.bracket.map((round, ri) => {
    const rows = round.map(m => {
      const nameOf = t => t ? t.label : '?';
      const isMine = (m.teamA && m.teamA.isPlayer) || (m.teamB && m.teamB.isPlayer);
      const status = m.winner ? `→ ${m.winner.label}` : '';
      const style = isMine ? 'color:var(--gold);font-weight:bold;' : 'color:var(--gray);';
      return `<div style="${style}padding:2px 0;">${nameOf(m.teamA)} vs ${nameOf(m.teamB)} ${status}</div>`;
    }).join('');
    return `<details ${ri === m26.roundIdx ? 'open' : ''}><summary>${M26_ROUND_NAMES[ri]}</summary>${rows}</details>`;
  }).join('');
  document.getElementById('playoff-history').innerHTML = html;
}

function setupM26KnockoutMatch() {
  const m26 = state.mundial26;
  const m = findMyM26Match();
  const iAmA = m.teamA.isPlayer;
  const myTeam = iAmA ? m.teamA : m.teamB;
  const opp = iAmA ? m.teamB : m.teamA;
  let label = `MUNDIAL 2026 • ${M26_ROUND_NAMES[m26.roundIdx]}`;
  if (m26.nbaStyleKnockout) {
    label += ` • Mecz ${m.gameIdx + 1} serii (${m.winsA}:${m.winsB}) vs ${opp.label}`;
  }
  document.getElementById('playoff-round-label').textContent = label;
  document.getElementById('playoff-round-title').textContent = label;
  document.getElementById('playoff-history-title').textContent = 'DRABINKA MUNDIALU';
  resetMatchScreen(opp, myTeam, 'neutral'); // Mundial 2026: zawsze teren neutralny, nawet w serii NBA STYLE
}

function finishM26KnockoutMatch(sim, m, opp) {
  const m26 = state.mundial26;
  const match = findMyM26Match();
  const iAmA = match.teamA.isPlayer;
  const myTeam = iAmA ? match.teamA : match.teamB;

  const result = m26RegisterGameResult(match, sim, myTeam, opp, iAmA);
  const resultClass = result.myWon ? 'win' : 'loss';
  const ST = getStyle();
  document.getElementById('po-commentary').textContent = result.myWon ? rand(ST.win) : rand(ST.loss);
  document.getElementById('po-score').textContent = formatScoreText(sim.gf, sim.ga) + (result.note || '');
  document.getElementById('po-score').className = `match-score ${resultClass}`;

  if (!result.decided) return; // seria trwa dalej — kolejna gra tej samej pary

  if (!match.winner.isPlayer) m26.playerEliminated = true;
  const allDecided = m26.bracket[m26.roundIdx].every(mm => mm.winner);
  if (allDecided) advanceM26KnockoutRound();
}

function advanceM26KnockoutRound() {
  const m26 = state.mundial26;
  const round = m26.bracket[m26.roundIdx];
  const winners = round.map(m => m.winner);

  if (winners.length === 1) { m26.champion = winners[0]; return; }
  if (m26.playerEliminated) return; // reszta drabinki i tak już jest tłem — dla gracza kończy się tutaj

  const nextRound = m26.bracket[m26.roundIdx + 1];
  for (let i = 0; i < winners.length; i += 2) {
    nextRound[i / 2].teamA = winners[i];
    nextRound[i / 2].teamB = winners[i + 1];
  }
  m26.roundIdx++;
  resolveM26NonPlayerMatchesInRound();
}

// ── Podpięcie pod istniejące routery meczu (ten sam wzorzec co reszta trybów) ──
const _origGetCurrentMatchContextM26 = getCurrentMatchContext;
getCurrentMatchContext = function () {
  if (state.tournamentPhase === 'mundial26') {
    const m26 = state.mundial26;
    if (m26.phase === 'groups') {
      const letter = myM26GroupLetter();
      const md = m26.groupFixtures[letter][m26.matchdayIdx];
      const m = md && md.find(mm => mm.home.isPlayer || mm.away.isPlayer);
      if (!m) return { m: null, opp: null, myTeam: null };
      const opp = m.home.isPlayer ? m.away : m.home;
      const myTeam = m.home.isPlayer ? m.home : m.away;
      return { m, opp, myTeam };
    }
    if (m26.fullRanking) {
      if (findMyFinalRank() != null) return { m: null, opp: null, myTeam: null };
      const match = findMyRankBandMatch(m26.rankBands.main) || findMyRankBandMatch(m26.rankBands.consolation);
      if (!match) return { m: null, opp: null, myTeam: null };
      const iAmA = match.teamA.isPlayer;
      const myTeam = iAmA ? match.teamA : match.teamB;
      const opp = iAmA ? match.teamB : match.teamA;
      return { m: { home: myTeam, away: opp }, opp, myTeam };
    }
    if (m26.champion || m26.playerEliminated) return { m: null, opp: null, myTeam: null };
    const match = findMyM26Match();
    if (!match) return { m: null, opp: null, myTeam: null };
    const iAmA = match.teamA.isPlayer;
    const myTeam = iAmA ? match.teamA : match.teamB;
    const opp = iAmA ? match.teamB : match.teamA;
    return { m: { home: myTeam, away: opp }, opp, myTeam };
  }
  return _origGetCurrentMatchContextM26();
};

const _origFinishMatchM26 = finishMatch;
finishMatch = function (sim, m, opp) {
  if (state.tournamentPhase === 'mundial26') {
    const m26 = state.mundial26;
    if (m26.phase === 'groups') { finishM26GroupMatch(sim, m, opp); goToM26Hub(); return; }
    if (m26.fullRanking) { finishM26ClassificationMatch(sim, m, opp); goToM26Hub(); return; }
    finishM26KnockoutMatch(sim, m, opp);
    goToM26Hub();
    return;
  }
  _origFinishMatchM26(sim, m, opp);
};
