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
//
// WAŻNE: Mundial 2026 gra się WPROST wybraną reprezentacją, jej WŁASNYM
// składem (11 + 6 na ławce, z MUNDIAL2026-DANE.js) — NIE wydraftowaną
// drużyną klubową gracza. Start turnieju (buildSquadFromM26Team) nadpisuje
// state.squad tym składem, dokładnie tak jak zrobiłby to nowy draft — bez
// żadnego wymogu wcześniejszego draftowania czegokolwiek.
// ============================================================

// ── Budowa grup ─────────────────────────────────────────────
function resolveM26Team(id, isPlayerTeam) {
  const t = MUNDIAL26_TEAMS_DATA.find(tt => tt.id === id);
  if (!t) return null;
  const roster = t.players.filter(p => p.starting).map(p => ({ name: p.name, pos: p.position, overall: p.overall, birthYear: null, season: null }));
  return { label: t.label, overall: calcTeamOverall(roster.map(p => ({ pos: p.pos, overall: p.overall }))), isPlayer: !!isPlayerTeam, roster };
}

// Buduje state.squad WPROST ze składu wybranej reprezentacji (SLOTS dla
// jedenastki, RESERVE_SLOTS dla ławki) — Mundial 2026 gra się reprezentacją,
// NIE wydraftowaną drużyną klubową, więc nie ma tu żadnego draftu do
// wcześniejszego ukończenia. Nadpisuje bieżący state.squad (dokładnie tak,
// jak zrobiłby to nowy draft) — jeśli grasz aktualnie karierę klubową,
// zapisz ją najpierw, jeśli chcesz do niej wrócić.
function buildSquadFromM26Team(teamId) {
  const t = MUNDIAL26_TEAMS_DATA.find(tt => tt.id === teamId);
  if (!t) return false;
  const byPos = {};
  t.players.forEach(p => { (byPos[p.position] = byPos[p.position] || []).push(p); });
  const starterIdx = {}, reserveIdx = {};
  const squad = {};

  SLOTS.forEach(slot => {
    const pool = (byPos[slot.pos] || []).filter(p => p.starting);
    const idx = starterIdx[slot.pos] || 0;
    starterIdx[slot.pos] = idx + 1;
    const p = pool[idx];
    if (p) squad[slot.id] = { name: p.name, club: t.label, season: '2026', overall: p.overall, pos: slot.pos, label: slot.label, apps: 0, goals: 0, birthYear: null };
  });
  RESERVE_SLOTS.forEach(slot => {
    const pool = (byPos[slot.pos] || []).filter(p => !p.starting);
    const idx = reserveIdx[slot.pos] || 0;
    reserveIdx[slot.pos] = idx + 1;
    const p = pool[idx];
    if (p) squad[slot.id] = { name: p.name, club: t.label, season: '2026', overall: p.overall, pos: slot.pos, label: slot.label, apps: 0, goals: 0, isReserve: true, birthYear: null };
  });

  state.squad = squad;
  state.startingXI = SLOTS.map(s => s.id);
  state.myClub = t.label;
  state.myTeamName = t.label;
  return true;
}

function myMundial26TeamObj(teamId) {
  const myRoster = buildMyMatchRoster();
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

  buildSquadFromM26Team(myTeamId);
  ensureStartingXI();
  state.myOverall = calcTeamOverall(getStartingXISquad());

  const groups = buildGroupsForMundial26(myTeamId, redraw);
  const groupFixtures = {}, groupTables = {}, groupResults = {};
  Object.keys(groups).forEach(letter => {
    // generateRoundRobin zwraca PODWÓJNĄ rundę (mecz + rewanż, jak w Trybie
    // Sezonu) — faza grupowa Mundialu to POJEDYNCZY circuit (3 kolejki dla
    // 4 drużyn), więc bierzemy tylko pierwszą połowę.
    groupFixtures[letter] = generateRoundRobin(groups[letter]).slice(0, groups[letter].length - 1);
    groupTables[letter] = initSeasonTable(groups[letter]);
    groupResults[letter] = [];
  });

  state.mundial26 = {
    myTeamId, groups, groupFixtures, groupTables, groupResults,
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
      const r = resolveOtherMatch(m.home, m.away, false, 'neutral'); // Mundial: teren neutralny
      updateSeasonTable(m26.groupTables[letter], m.home.label, m.away.label, r.gf, r.ga);
      const record = {
        home: m.home.label, away: m.away.label, hg: r.gf, ag: r.ga,
        scorersHome: r.scorersMe, scorersAway: r.scorersOpp,
      };
      markComputerMatchReplay(record, r.timeline);
      m26.groupResults[letter].push(record);
      pruneComputerMatchReplays();
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
  state.currentMatchNeedsWinner = false; // faza grupowa - remis to normalny, ważny wynik
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
  const homeGoals = isHome ? sim.gf : sim.ga, awayGoals = isHome ? sim.ga : sim.gf;
  updateSeasonTable(m26.groupTables[letter], homeLabel, awayLabel, homeGoals, awayGoals);
  m26.groupResults[letter].push({
    home: homeLabel, away: awayLabel, hg: homeGoals, ag: awayGoals, timeline: sim.timeline,
    scorersHome: extractScorersFromSim(sim, isHome ? 'me' : 'opp'),
    scorersAway: extractScorersFromSim(sim, isHome ? 'opp' : 'me'),
  });

  simulateM26MatchdayBackground(m);
  m26.matchdayIdx++;
}

// ── Koniec faz grupowej — seedowanie 1-32 ────────────────────
// Sortuje tabelę grupy TAK, jak wskazałeś: przy równej liczbie punktów o
// kolejności decyduje NAJPIERW bezpośredni mecz między zainteresowanymi
// (punkty, potem różnica bramek, potem gole — liczone WYŁĄCZNIE z ich
// wzajemnych spotkań), a dopiero gdy to nie rozstrzyga — ogólna różnica
// bramek i gole z całej grupy.
function m26SortedGroupTable(letter) {
  const m26 = state.mundial26;
  const rows = Object.values(m26.groupTables[letter]).sort((a, b) => b.points - a.points);
  const results = m26.groupResults[letter];
  const output = [];
  let i = 0;
  while (i < rows.length) {
    let j = i;
    while (j < rows.length && rows[j].points === rows[i].points) j++;
    const tiedBlock = rows.slice(i, j);
    output.push(...(tiedBlock.length > 1 ? m26BreakTieWithH2H(tiedBlock, results) : tiedBlock));
    i = j;
  }
  return output;
}

function m26BreakTieWithH2H(tiedBlock, results) {
  const labels = new Set(tiedBlock.map(r => r.label));
  const mini = {};
  tiedBlock.forEach(r => { mini[r.label] = { points: 0, gf: 0, ga: 0 }; });
  results.forEach(res => {
    if (!labels.has(res.home) || !labels.has(res.away)) return;
    mini[res.home].gf += res.hg; mini[res.home].ga += res.ag;
    mini[res.away].gf += res.ag; mini[res.away].ga += res.hg;
    if (res.hg > res.ag) mini[res.home].points += 3;
    else if (res.hg < res.ag) mini[res.away].points += 3;
    else { mini[res.home].points += 1; mini[res.away].points += 1; }
  });
  return tiedBlock.slice().sort((a, b) => {
    const ma = mini[a.label], mb = mini[b.label];
    if (mb.points !== ma.points) return mb.points - ma.points;
    const gdMiniA = ma.gf - ma.ga, gdMiniB = mb.gf - mb.ga;
    if (gdMiniB !== gdMiniA) return gdMiniB - gdMiniA;
    if (mb.gf !== ma.gf) return mb.gf - ma.gf;
    // Wciąż remis nawet po bezpośrednich meczach — dopiero teraz ogólna różnica bramek/gole.
    const gdA = a.gf - a.ga, gdB = b.gf - b.ga;
    if (gdB !== gdA) return gdB - gdA;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.label.localeCompare(b.label);
  });
}

function m26RankTeams(rows) {
  // rows: [{label, points, gf, ga, ...}] — sortuje wg (pkt, różnica bramek, strzelone)
  return [...rows].sort((a, b) => (b.points - a.points) || ((b.gf - b.ga) - (a.gf - a.ga)) || (b.gf - a.gf));
}

function finishM26Groups() {
  const m26 = state.mundial26;
  const winners = [], runnersUp = [], thirds = [], fourths = [];
  Object.keys(m26.groups).forEach(letter => {
    const table = m26SortedGroupTable(letter);
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
  m26.revealedDepth = -1; // nic jeszcze nie odsłonięte — odsłania się rundami, w miarę jak gracz gra SWÓJ mecz danej rundy
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
  const r = resolveOtherMatch(m.teamA, m.teamB, true, 'neutral'); // Mundial: teren neutralny
  return {
    aWon: r.result === 'W', gf: r.gf, ga: r.ga, timeline: r.timeline,
    scorersHome: r.scorersMe, scorersAway: r.scorersOpp,
    wasExtraTime: r.wasExtraTime, wasPenalties: r.wasPenalties, penaltyScore: r.penaltyScore,
  };
}

// Rozstrzyga cały mecz/serię w tle na raz — pojedynczy mecz w trybie
// standardowym, albo pełną serię do 4 zwycięstw w trybie NBA STYLE.
// Zapisuje prawdziwy wynik na match.scoreText (i timeline/strzelców, jeśli
// akurat pracował pełny silnik) — widoczne potem w drabince.
function m26ResolveBackgroundMatch(m) {
  const m26 = state.mundial26;
  if (!m26.nbaStyleKnockout) {
    const g = m26ResolveBackgroundGame(m);
    m.winner = g.aWon ? m.teamA : m.teamB;
    m.loser = m.winner === m.teamA ? m.teamB : m.teamA;
    m.scoreText = g.wasPenalties
      ? `${g.gf}:${g.ga} (k. ${g.penaltyScore.my}:${g.penaltyScore.opp})`
      : (g.wasExtraTime ? `${g.gf}:${g.ga} (po dogrywce)` : `${g.gf}:${g.ga}`);
    markComputerMatchReplay(m, g.timeline);
    m.scorersHome = g.scorersHome; m.scorersAway = g.scorersAway;
    pruneComputerMatchReplays();
    return;
  }
  while (!m.winner) {
    const g = m26ResolveBackgroundGame(m);
    markComputerMatchReplay(m, g.timeline); // w serii zachowujemy przebieg najnowszej gry
    m.scorersHome = g.scorersHome; m.scorersAway = g.scorersAway;
    if (g.aWon) m.winsA++; else m.winsB++;
    m.gameIdx++;
    if (m.winsA >= 4) m.winner = m.teamA;
    else if (m.winsB >= 4) m.winner = m.teamB;
  }
  m.loser = m.winner === m.teamA ? m.teamB : m.teamA;
  m.scoreText = `${m.winsA}:${m.winsB} w serii`;
  pruneComputerMatchReplays();
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
      // Dogrywkę zawsze rozgrywa generator. Jeśli nadal jest remis, zostają karne.
      const shootout = sim._m26PrecomputedShootout || simulatePenaltyShootout(myTeam.roster, opp.roster, opp.label);
      myWon = shootout.iWin;
      note = ` (k. ${shootout.myScore}:${shootout.oppScore})`;
    }
    match.winner = myWon ? myTeam : opp;
    match.loser = myWon ? opp : myTeam;
    const aGf = iAmA ? sim.gf : sim.ga, aGa = iAmA ? sim.ga : sim.gf;
    match.scoreText = `${aGf}:${aGa}${note}`;
    match.timeline = sim.timeline;
    match.scorersHome = extractScorersFromSim(sim, iAmA ? 'me' : 'opp');
    match.scorersAway = extractScorersFromSim(sim, iAmA ? 'opp' : 'me');
    return { decided: true, myWon, note };
  }

  const decision = decideNbaGameWinner(sim, myTeam, opp);
  if (decision.myWon) { if (iAmA) match.winsA++; else match.winsB++; }
  else { if (iAmA) match.winsB++; else match.winsA++; }
  match.gameIdx++;
  if (!match.timelines) match.timelines = [];
  match.timelines.push(sim.timeline);
  let decided = false;
  if (match.winsA >= 4) { match.winner = match.teamA; match.loser = match.teamB; decided = true; }
  else if (match.winsB >= 4) { match.winner = match.teamB; match.loser = match.teamA; decided = true; }
  if (decided) match.scoreText = `${match.winsA}:${match.winsB} w serii`;
  return { decided, myWon: decision.myWon, note: decision.note };
}

// ── NAPRAWA: dogrywka/karne widoczne PRZED przeniesieniem do huba ──
// Wcześniej: mecz kończył się remisem → od razu pokazywał się "DALEJ" →
// dopiero PO jego kliknięciu liczyła się dogrywka/karne → ale w TEJ SAMEJ
// milisekundzie ekran wracał do huba (MECZ-HUB.js). Efekt: dogrywka/karne
// FAKTYCZNIE się liczyły (wynik w drabince był poprawny), ale gracz nigdy
// tego nie widział — stąd wrażenie "nic się nie stało".
//
// Naprawa: MECZ-HUB.js woła tę funkcję NATYCHMIAST po zakończeniu meczu,
// ZANIM jeszcze pokaże przycisk "DALEJ" — jeśli był remis, dogrywka/karne
// rozstrzygają się i wyświetlają TU, na ekranie meczu, z czasem na
// przeczytanie. Wynik zapisujemy na sim._m26PredecidedResult, żeby
// finishM26ClassificationMatch/finishM26KnockoutMatch (wołane PO kliknięciu
// "DALEJ") nie losowały tego jeszcze raz — tylko dokończyły resztę
// (aktualizację drabinki), używając już podjętej decyzji.
function m26DecideDrawEarly(sim, m, opp, onComplete) {
  const m26 = state.mundial26;
  if (!m26 || m26.phase !== 'knockout') { onComplete(); return; } // remisy w fazie grupowej są normalne — nic tu nie rozstrzygamy
  const match = m26.fullRanking
    ? (findMyRankBandMatch(m26.rankBands.main) || findMyRankBandMatch(m26.rankBands.consolation))
    : findMyM26Match();
  if (!match) { onComplete(); return; }
  sim._m26Match = match; // żeby finishM26*Match nie musiała szukać "nierozstrzygniętego" meczu, który już nim nie jest
  const iAmA = match.teamA.isPlayer;
  const myTeam = iAmA ? match.teamA : match.teamB;

  // Jeśli trzeba karnych, odsłaniamy je PO KOLEI (kto strzela, trafia czy
  // pudłuje) — dokładnie tak samo jak w klasycznym Playoffie — zamiast po
  // cichu dolosowywać sam wynik. m26RegisterGameResult i tak by policzyło
  // karne samo w sobie, ale wtedy WYRZUCA szczegóły — tu odsłaniamy je
  // NAJPIERW na ekranie, a dopiero potem finalizujemy wynik.
  const needsShootout = sim.result === 'D' && sim.wasExtraTime;
  if (needsShootout) {
    const shootout = simulatePenaltyShootout(myTeam.roster, opp.roster, opp.label);
    sim._m26PrecomputedShootout = shootout; // żeby m26RegisterGameResult użyło TEJ SAMEJ serii, a nie losowało drugi raz
    const timelineEl = document.getElementById('po-timeline');
    if (timelineEl) {
      const introLine = document.createElement('div');
      introLine.className = 'tl-row tl-marker';
      introLine.textContent = 'Remis nawet po dogrywce! Teraz zadecydują rzuty karne.';
      timelineEl.prepend(introLine);
      timelineEl.scrollTop = 0;
    }
    let kickIdx = 0;
    const STEP_MS = SPEED_MS[state.speed] || SPEED_MS.normal;
    const shootoutTimer = setInterval(() => {
      if (kickIdx >= shootout.timeline.length) {
        clearInterval(shootoutTimer);
        finishM26DrawDecision(sim, m, opp, match, myTeam, iAmA, onComplete);
        return;
      }
      const ev = shootout.timeline[kickIdx];
      if (timelineEl) {
        const line = document.createElement('div');
        line.className = `tl-row ${tlClass(ev)}`;
        line.textContent = ev.text;
        timelineEl.prepend(line);
        timelineEl.scrollTop = 0;
      }
      kickIdx++;
    }, STEP_MS);
    return;
  }

  finishM26DrawDecision(sim, m, opp, match, myTeam, iAmA, onComplete);
}

function finishM26DrawDecision(sim, m, opp, match, myTeam, iAmA, onComplete) {
  const result = m26RegisterGameResult(match, sim, myTeam, opp, iAmA);
  sim._m26PredecidedResult = result;

  const resultClass = result.myWon ? 'win' : 'loss';
  const ST = getStyle();
  document.getElementById('po-commentary').textContent = result.myWon ? rand(ST.win) : rand(ST.loss);
  document.getElementById('po-score').textContent = formatScoreText(sim.gf, sim.ga) + (result.note || '');
  document.getElementById('po-score').className = `match-score ${resultClass}`;
  m26AnnounceExtraTimeIfAny(sim, result);
  onComplete();
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
function buildRankBandShape(size, rankStart, rankEnd, depth) {
  depth = depth || 0;
  if (size === 1) return { size, rankStart, rankEnd, depth, teams: null, matches: null, upper: null, lower: null };
  const half = size / 2;
  return {
    size, rankStart, rankEnd, depth, teams: null, matches: null,
    upper: buildRankBandShape(half, rankStart, rankStart + half - 1, depth + 1),
    lower: buildRankBandShape(half, rankStart + half, rankEnd, depth + 1),
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

// To samo, ale tylko dla już ODSŁONIĘTYCH rund — do wyświetlania listy
// klasyfikacji na bieżąco, spójnie z tym, co widać w drzewie drabinki
// (patrz revealedDepth). Logika gry (np. czy turniej dla gracza się już
// skończył) korzysta z collectRankBandResults powyżej, NIE z tej wersji.
function collectRevealedRankBandResults(node, out) {
  if (!node) return out;
  const m26 = state.mundial26;
  if (node.depth > m26.revealedDepth) return out;
  if (node.size === 1) { if (node.teams) out.push({ team: node.teams[0], rank: node.rankStart }); return out; }
  collectRevealedRankBandResults(node.upper, out);
  collectRevealedRankBandResults(node.lower, out);
  return out;
}

function findMyFinalRank() {
  const m26 = state.mundial26;
  const all = [...collectRankBandResults(m26.rankBands.main, []), ...collectRankBandResults(m26.rankBands.consolation, [])];
  const mine = all.find(r => r.team.isPlayer);
  return mine ? mine.rank : null;
}

// Rozstrzyga WSZYSTKIE jeszcze niedokończone mecze w całym (pod)drzewie —
// wołane PO zakończeniu turnieju gracza (nie ma już żadnych jego własnych
// meczów, więc wszystko, co zostało, jest bezpiecznie "tłem"). To
// zabezpieczenie: kaskada w tryAdvanceRankBand powinna to zrobić sama w
// trakcie gry, ale to gwarantuje kompletność na wszelki wypadek.
function forceResolveEntireM26Tree(node) {
  if (!node || node.size === 1 || !node.matches) return;
  node.matches.forEach(m => { if (!m.winner) m26ResolveBackgroundMatch(m); });
  tryAdvanceRankBand(node);
  forceResolveEntireM26Tree(node.upper);
  forceResolveEntireM26Tree(node.lower);
}

function toggleM26GroupTablesOverlay() {
  const el = document.getElementById('groups-panel-results');
  const willShow = el.style.display === 'none';
  document.getElementById('m26-bracket-overlay').style.display = 'none';
  document.getElementById('m26-classification-overlay').style.display = 'none';
  el.style.display = willShow ? 'block' : 'none';
  if (willShow) renderM26GroupTables('groups-grid-results');
}

function toggleM26BracketOverlay() {
  const m26 = state.mundial26;
  const el = document.getElementById('m26-bracket-overlay');
  const willShow = el.style.display === 'none';
  document.getElementById('groups-panel-results').style.display = 'none';
  document.getElementById('m26-classification-overlay').style.display = 'none';
  el.style.display = willShow ? 'block' : 'none';
  if (!willShow) return;
  let nestedHtml;
  if (m26.fullRanking) {
    // Tylko ścieżka do mistrza (schodzimy w "upper"), i tylko rundy już
    // odsłonięte — reszta rundami, jak w drzewie klasyfikacji.
    const fullRounds = buildRoundsFromMainPath(m26.rankBands.main);
    const visibleRounds = fullRounds.slice(0, m26.revealedDepth + 1);
    nestedHtml = buildNestedBracketFromClassic(visibleRounds.map(r => r.matches), visibleRounds.map(r => r.label));
  } else {
    nestedHtml = buildNestedBracketFromClassic(m26.bracket, M26_ROUND_NAMES);
  }
  renderBracketDiagram('m26-bracket-overlay', nestedHtml);
}

function toggleM26ClassificationOverlay() {
  const m26 = state.mundial26;
  const el = document.getElementById('m26-classification-overlay');
  const willShow = el.style.display === 'none';
  document.getElementById('groups-panel-results').style.display = 'none';
  document.getElementById('m26-bracket-overlay').style.display = 'none';
  el.style.display = willShow ? 'block' : 'none';
  if (!willShow) return;
  const known = [...collectRevealedRankBandResults(m26.rankBands.main, []), ...collectRevealedRankBandResults(m26.rankBands.consolation, [])];
  const byRank = {};
  known.forEach(r => { byRank[r.rank] = r.team; });
  const medal = { 1: '🥇', 2: '🥈', 3: '🥉' };
  let html = '<div class="classification-list">';
  for (let rank = 1; rank <= 48; rank++) {
    const t = byRank[rank];
    const isMine = t && t.isPlayer;
    html += `<div class="classification-row${isMine ? ' classification-mine' : ''}">
      <span class="classification-rank">${rank}.</span>
      <span class="classification-medal">${medal[rank] || ''}</span>
      <span class="classification-team">${t ? t.label : '—'}</span>
    </div>`;
  }
  html += '</div>';
  el.innerHTML = html;
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
  state.currentMatchNeedsWinner = true; // klasyfikacyjna runda - zawsze potrzebny zwycięzca
  resetMatchScreen(opp, myTeam, 'neutral'); // Mundial 2026: zawsze teren neutralny, nawet w serii NBA STYLE
}

function finishM26ClassificationMatch(sim, m, opp) {
  const m26 = state.mundial26;
  const match = sim._m26Match || findMyRankBandMatch(m26.rankBands.main) || findMyRankBandMatch(m26.rankBands.consolation);
  const iAmA = match.teamA.isPlayer;
  const myTeam = iAmA ? match.teamA : match.teamB;

  const result = sim._m26PredecidedResult || m26RegisterGameResult(match, sim, myTeam, opp, iAmA);
  if (!sim._m26PredecidedResult) {
    const resultClass = result.myWon ? 'win' : 'loss';
    const ST = getStyle();
    document.getElementById('po-commentary').textContent = result.myWon ? rand(ST.win) : rand(ST.loss);
    document.getElementById('po-score').textContent = formatScoreText(sim.gf, sim.ga) + (result.note || '');
    document.getElementById('po-score').className = `match-score ${resultClass}`;
    m26AnnounceExtraTimeIfAny(sim, result);
  }

  if (!result.decided) return; // seria trwa dalej — kolejna gra tej samej pary

  const node = findNodeContainingMatch(m26.rankBands.main, match) || findNodeContainingMatch(m26.rankBands.consolation, match);
  if (node.depth > m26.revealedDepth) m26.revealedDepth = node.depth;
  tryAdvanceRankBand(node);
}

// Mecz pucharowy (drabinka główna LUB klasyfikacja 33-48) NIE MOŻE
// zakończyć się remisem — jeśli sim.result === 'D', zawsze dochodzi do
// dogrywki (a w razie potrzeby karnych). To dopisuje o tym jawną,
// niemożliwą do przeoczenia linijkę w osi czasu, ponad samą notatkę
// przy wyniku.
function m26AnnounceExtraTimeIfAny(sim, result) {
  if (sim.result !== 'D' || !result.note) return;
  const timelineEl = document.getElementById('po-timeline');
  if (!timelineEl) return;
  const line = document.createElement('div');
  line.className = 'tl-row tl-marker';
  line.textContent = `⏱ Remis w regulaminowym czasie — rozstrzyga${result.note}`;
  timelineEl.prepend(line);
  timelineEl.scrollTop = 0;
}

// ── Faza pucharowa ────────────────────────────────────────────
function goToM26Hub() {
  const m26 = state.mundial26;
  document.getElementById('groups-panel').style.display = m26.phase === 'groups' ? 'block' : 'none';
  document.getElementById('playoff-history-details').style.display = m26.phase === 'groups' ? 'none' : 'block';

  if (m26.phase === 'groups') {
    if (m26.matchdayIdx >= 3) { finishM26Groups(); return; }
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
  document.getElementById('playoff-history-details').style.display = 'none';

  if (m26.fullRanking) {
    const myRank = findMyFinalRank();
    if (myRank != null) {
      // Mój turniej się skończył — nie mam już żadnych własnych meczów,
      // więc wszystko, co jeszcze niedokończone, jest bezpiecznie "tłem".
      // Wymuszam pełne rozstrzygnięcie całego drzewa (zabezpieczenie —
      // kaskada powinna to zrobić sama, ale to gwarantuje kompletność) i
      // odsłaniam wszystko naraz — nie ma już czego chronić przed spojlerem.
      forceResolveEntireM26Tree(m26.rankBands.main);
      forceResolveEntireM26Tree(m26.rankBands.consolation);
      m26.revealedDepth = Infinity;
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

  document.getElementById('hub-playoff-round-label').textContent = M26_ROUND_NAMES[m26.roundIdx];

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

function renderM26GroupTables(gridId) {
  const m26 = state.mundial26;
  const grid = document.getElementById(gridId || 'groups-grid');
  grid.innerHTML = Object.keys(m26.groups).map(letter => {
    const rows = m26SortedGroupTable(letter);
    const body = rows.map((r, i) => {
      const gd = r.gf - r.ga;
      const style = r.isPlayer ? 'color:var(--gold);font-weight:bold;' : '';
      return `<tr style="${style}"><td>${i + 1}.</td><td style="text-align:left;">${r.label}</td><td>${r.played}</td><td>${r.won}</td><td>${r.drawn}</td><td>${r.lost}</td><td>${r.gf}:${r.ga}</td><td>${gd >= 0 ? '+' : ''}${gd}</td><td><b>${r.points}</b></td></tr>`;
    }).join('');
    return `<div class="panel" style="padding:8px;"><div class="panel-title" style="font-size:11px;">GRUPA ${letter}</div>
      <table class="season-table"><thead><tr><th>#</th><th style="text-align:left;">Drużyna</th><th>M</th><th>W</th><th>R</th><th>P</th><th>Bramki</th><th>+/-</th><th>Pkt</th></tr></thead><tbody>${body}</tbody></table></div>`;
  }).join('') + renderM26ThirdPlaceTableHtml();
}

// Ranking wszystkich 12 trzecich miejsc — na bieżąco, w trakcie fazy
// grupowej (na podstawie tego, co już rozegrane) — widać od razu, kto
// z "trzecich" łapie się do najlepszej ósemki (awans), a kto odpada.
function renderM26ThirdPlaceTableHtml() {
  const m26 = state.mundial26;
  const thirds = Object.keys(m26.groups).map(letter => {
    const table = m26SortedGroupTable(letter);
    return { ...table[2], group: letter };
  });
  const ranked = m26RankTeams(thirds);
  const body = ranked.map((r, i) => {
    const gd = r.gf - r.ga;
    const qualifies = i < 8;
    const style = (r.isPlayer ? 'color:var(--gold);font-weight:bold;' : '') + (qualifies ? 'background:#1a3a1a;' : '');
    return `<tr style="${style}"><td>${i + 1}.</td><td style="text-align:left;">${r.label} (gr. ${r.group})</td><td>${r.played}</td><td>${r.won}</td><td>${r.drawn}</td><td>${r.lost}</td><td>${r.gf}:${r.ga}</td><td>${gd >= 0 ? '+' : ''}${gd}</td><td><b>${r.points}</b></td></tr>`;
  }).join('');
  return `<div class="panel" style="padding:8px;max-width:900px;width:100%;">
    <div class="panel-title" style="font-size:11px;">RANKING TRZECICH MIEJSC (na bieżąco — 🟩 pierwsze 8 awansuje do TOP 32)</div>
    <table class="season-table"><thead><tr><th>#</th><th style="text-align:left;">Drużyna</th><th>M</th><th>W</th><th>R</th><th>P</th><th>Bramki</th><th>+/-</th><th>Pkt</th></tr></thead><tbody>${body}</tbody></table>
  </div>`;
}

// Prosty, czytelny tekstowy widok całej drabinki, runda po rundzie —
// od razu widać KSZTAŁT turnieju, nawet dla jeszcze nierozstrzygniętych
// dalszych rund (pokazują się jako "?").
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
  state.currentMatchNeedsWinner = true; // drabinka pucharowa - zawsze potrzebny zwycięzca
  state.currentMatchNeedsWinner = true; // pucharowa runda - zawsze potrzebny zwycięzca
  resetMatchScreen(opp, myTeam, 'neutral'); // Mundial 2026: zawsze teren neutralny, nawet w serii NBA STYLE
}

function finishM26KnockoutMatch(sim, m, opp) {
  const m26 = state.mundial26;
  const match = sim._m26Match || findMyM26Match();
  const iAmA = match.teamA.isPlayer;
  const myTeam = iAmA ? match.teamA : match.teamB;

  const result = sim._m26PredecidedResult || m26RegisterGameResult(match, sim, myTeam, opp, iAmA);
  if (!sim._m26PredecidedResult) {
    const resultClass = result.myWon ? 'win' : 'loss';
    const ST = getStyle();
    document.getElementById('po-commentary').textContent = result.myWon ? rand(ST.win) : rand(ST.loss);
    document.getElementById('po-score').textContent = formatScoreText(sim.gf, sim.ga) + (result.note || '');
    document.getElementById('po-score').className = `match-score ${resultClass}`;
    m26AnnounceExtraTimeIfAny(sim, result);
  }

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
    if (m26.phase === 'groups') { finishM26GroupMatch(sim, m, opp); advanceM26Matchday(); return; }
    if (m26.fullRanking) { finishM26ClassificationMatch(sim, m, opp); goToM26Hub(); return; }
    finishM26KnockoutMatch(sim, m, opp);
    goToM26Hub();
    return;
  }
  _origFinishMatchM26(sim, m, opp);
};
