// ============================================================
// KREATOR-TURNIEJU.JS — w pełni konfigurowalny generator turniejów,
// wzorowany na kreatorze z Sensible Soccer 96/97.
//
// DWA FORMATY:
//   LIGA    — 8-24 drużyny, każdy z każdym (jedno- lub dwurundowo).
//   PUCHAR  — do 64 drużyn, WIELE RUND, każda runda konfigurowana
//             z osobna: albo czyste starcia 1v1 (mecz+rewanż albo
//             jeden na neutralnym), albo grupy (3+ drużyn, tabela
//             punktowa, Ty wybierasz ile awansuje z każdej grupy).
//             Trwa, aż zostanie jeden zespół.
//
// Zasada: liczba drużyn w rundzie MUSI się dzielić bez reszty na
// wybrany rozmiar grupy — niemożliwe konfiguracje są blokowane
// w UI, nie tylko sprawdzane na końcu.
// ============================================================

// Zwraca wszystkie SENSOWNE sposoby podziału N drużyn na grupy:
// { groupSize, numGroups } dla każdego dzielnika N (groupSize >= 2).
// groupSize === 2 to czyste starcia 1v1 (mecz+rewanż/neutralny) —
// NIE tabela grupowa, tylko klasyczny dwumecz pucharowy.
function getValidGroupConfigs(n) {
  const configs = [];
  for (let groupSize = 2; groupSize <= n; groupSize++) {
    if (n % groupSize === 0) {
      configs.push({ groupSize, numGroups: n / groupSize, isKnockoutPairs: groupSize === 2 });
    }
  }
  return configs;
}

// Dla danej konfiguracji grupy (rozmiar) — ile drużyn SENSOWNIE może
// awansować z każdej z nich (od 1 do groupSize-1; przy parach 1v1
// zawsze dokładnie 1).
function getValidAdvanceCounts(groupSize) {
  if (groupSize === 2) return [1];
  const opts = [];
  for (let a = 1; a < groupSize; a++) opts.push(a);
  return opts;
}

// ============================================================
// WYBÓR ZESPOŁÓW — trzy metody, wspólne dla Ligi i Pucharu.
// ============================================================

// Losowe N zespołów z całej bazy (bez powtórzeń klub+sezon).
function drawRandomTeams(n, excludeMineClub) {
  const pool = TEAMS_DATA.filter(t => !excludeMineClub || t.club !== excludeMineClub);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// N NAJMOCNIEJSZYCH zespołów z bazy (po średnim overallu składu),
// z lekkim rozrzutem losowym, żeby nie zawsze wychodził identyczny
// zestaw (bierzemy z nieco szerszej górnej półki niż ściśle top N).
function drawStrongestTeams(n, excludeMineClub) {
  const pool = TEAMS_DATA.filter(t => !excludeMineClub || t.club !== excludeMineClub);
  const withOvr = pool.map(t => {
    const st = t.players.filter(p => p.starting);
    const usePool = st.length >= 11 ? st : t.players;
    const ovr = calcTeamOverall(usePool.map(p => ({ pos: p.position, overall: p.overall })));
    return { t, ovr };
  }).sort((a, b) => b.ovr - a.ovr);
  const widerPoolSize = Math.min(withOvr.length, Math.round(n * 1.5) + 5);
  const shuffled = withOvr.slice(0, widerPoolSize).sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n).map(x => x.t);
}

// ============================================================
// NAWIGACJA
// ============================================================

function goToTournamentCreatorSetup() {
  showScreen('screen-tc-format');
}

function goToLigaSetup() {
  showScreen('screen-tc-liga');
}

function goToPucharSetup() {
  state.puchar = { stage: 'teamcount' };
  renderPucharSetupStep();
  showScreen('screen-tc-puchar');
}

// ============================================================
// SELEKTOR DRUŻYN (manualny wybór) — wspólny dla Ligi i Pucharu.
// ============================================================

function openTeamPicker(targetCount, title, onConfirm) {
  state.tcPicker = { targetCount, selected: [], onConfirm };
  document.getElementById('tc-picker-title').textContent = title || `WYBIERZ ${targetCount} DRUŻYN`;
  const filterSel = document.getElementById('tc-picker-season-filter');
  const seasons = [...new Set(TEAMS_DATA.map(t => t.season))].sort();
  filterSel.innerHTML = '<option value="">Wszystkie sezony</option>' + seasons.map(s => `<option value="${s}">${s}</option>`).join('');
  renderTeamPickerList();
  showScreen('screen-tc-team-picker');
}

function renderTeamPickerList() {
  const list = document.getElementById('tc-picker-list');
  const seasonFilter = document.getElementById('tc-picker-season-filter').value;
  const pool = seasonFilter ? TEAMS_DATA.filter(t => t.season === seasonFilter) : TEAMS_DATA;
  list.innerHTML = '';
  pool.forEach(t => {
    const isSelected = state.tcPicker.selected.some(s => s.club === t.club && s.season === t.season);
    const row = document.createElement('div');
    row.className = 'slot-row' + (isSelected ? ' filled' : '');
    row.style.cursor = 'pointer';
    row.style.marginBottom = '2px';
    row.innerHTML = `<span class="slot-name">${t.club}</span><span class="slot-club" style="color:var(--gray);">${t.season}</span>${isSelected ? '<span style="color:var(--gold);">✓</span>' : ''}`;
    row.addEventListener('click', () => toggleTeamPick(t));
    list.appendChild(row);
  });
  updatePickerCount();
}

function toggleTeamPick(t) {
  const idx = state.tcPicker.selected.findIndex(s => s.club === t.club && s.season === t.season);
  if (idx >= 0) {
    state.tcPicker.selected.splice(idx, 1);
  } else {
    if (state.tcPicker.selected.length >= state.tcPicker.targetCount) return;
    state.tcPicker.selected.push(t);
  }
  renderTeamPickerList();
}

function updatePickerCount() {
  const n = state.tcPicker.selected.length;
  const target = state.tcPicker.targetCount;
  document.getElementById('tc-picker-count').textContent = `Wybrano ${n} / ${target}`;
  document.getElementById('tc-picker-confirm').disabled = n !== target;
}

function confirmTeamPicker() {
  if (state.tcPicker.selected.length !== state.tcPicker.targetCount) return;
  const cb = state.tcPicker.onConfirm;
  const teams = state.tcPicker.selected.slice();
  state.tcPicker = null;
  if (cb) cb(teams);
}

// ============================================================
// LIGA — reużywa CAŁEGO silnika Trybu Sezonu (state.season),
// tylko z własną, dowolną listą drużyn zamiast jednego sezonu z bazy.
// ============================================================

function confirmLigaSetup() {
  const teamCount = parseInt(document.getElementById('tc-liga-teamcount').value, 10);
  const legFormat = document.getElementById('tc-liga-legformat').value;
  const teamSource = document.getElementById('tc-liga-teamsource').value;

  if (teamSource === 'random') {
    startCustomLiga(drawRandomTeams(teamCount, state.myClub), legFormat);
  } else if (teamSource === 'strongest') {
    startCustomLiga(drawStrongestTeams(teamCount, state.myClub), legFormat);
  } else {
    openTeamPicker(teamCount, `WYBIERZ ${teamCount} DRUŻYN DO LIGI`, (teams) => startCustomLiga(teams, legFormat));
  }
}

function startCustomLiga(teams, legFormat) {
  const realTeams = teams.map(teamToBracketObj);
  const myRoster = buildMyMatchRoster();
  const myTeam = { label: state.myClub || state.myTeamName || 'TWOJA DRUŻYNA', isPlayer: true, overall: state.myOverall, roster: myRoster, club: state.myClub || null };
  const allTeams = [...realTeams, myTeam];

  const allRounds = generateRoundRobin(allTeams);
  const fixtures = legFormat === 'single' ? allRounds.slice(0, allRounds.length / 2) : allRounds;

  state.season = {
    seasonId: '🏗️ WŁASNA LIGA',
    teams: allTeams,
    fixtures,
    matchdayIdx: 0,
    table: initSeasonTable(allTeams),
  };
  state.tournamentPhase = 'season';

  advanceToNextPlayableMatchday();
}

// ============================================================
// PUCHAR — wizard konfiguracji rund (krok po kroku), Sensible-Soccer-style.
// ============================================================

function renderPucharSetupStep() {
  const panel = document.getElementById('tc-puchar-panel');
  const p = state.puchar;

  if (p.stage === 'teamcount') {
    panel.innerHTML = `
      <div class="panel-title">ILE DRUŻYN W PUCHARZE? (razem z Tobą, max 64)</div>
      <input type="range" id="tc-puchar-teamcount" min="4" max="64" value="16" step="1" oninput="document.getElementById('tc-puchar-teamcount-val').textContent=this.value" style="width:100%;">
      <div style="text-align:center;font-family:var(--font-hud);font-size:20px;color:var(--gold);margin:4px 0 14px;" id="tc-puchar-teamcount-val">16</div>
      <div class="gap8">
        <button class="btn btn-gold" onclick="pucharConfirmTeamCount()">▶ DALEJ</button>
        <button class="btn btn-sm" onclick="showScreen('screen-tc-format')">← MENU</button>
      </div>`;
    return;
  }

  if (p.stage === 'teamsource') {
    panel.innerHTML = `
      <div class="panel-title">SKĄD RESZTA DRUŻYN? (${p.totalTeams - 1} + Ty = ${p.totalTeams})</div>
      <div class="gap8">
        <button class="btn btn-gold" onclick="pucharChooseSource('random')">🎲 Losowe</button>
        <button class="btn btn-gold" onclick="pucharChooseSource('strongest')">💪 Najmocniejsze</button>
        <button class="btn btn-gold" onclick="pucharChooseSource('manual')">✋ Wybierz sam</button>
        <button class="btn btn-sm" onclick="pucharGoBack('teamcount')">← WSTECZ</button>
      </div>`;
    return;
  }

  if (p.stage === 'roundconfig') {
    const remaining = p.teamsRemainingForNextRound;
    const roundNum = p.rounds.length + 1;
    const configs = getValidGroupConfigs(remaining);
    panel.innerHTML = `
      <div class="panel-title">RUNDA ${roundNum} — pozostało ${remaining} drużyn</div>
      <div style="margin-bottom:10px;color:var(--gray);font-size:14px;">Wybierz strukturę tej rundy:</div>
      <div class="gap8" id="tc-puchar-configs" style="flex-wrap:wrap;"></div>`;
    const configsEl = document.getElementById('tc-puchar-configs');
    configs.forEach(cfg => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-sm';
      btn.textContent = cfg.isKnockoutPairs ? `⚔ ${cfg.numGroups} par (1v1)` : `${cfg.numGroups} grup po ${cfg.groupSize}`;
      btn.addEventListener('click', () => pucharChooseGroupConfig(cfg));
      configsEl.appendChild(btn);
    });
    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn-sm';
    backBtn.textContent = '← WSTECZ';
    backBtn.addEventListener('click', () => pucharGoBack('teamsource'));
    configsEl.appendChild(backBtn);
    return;
  }

  if (p.stage === 'advanceconfig') {
    const cfg = p.pendingGroupConfig;
    const opts = getValidAdvanceCounts(cfg.groupSize);
    panel.innerHTML = `<div class="panel-title">ILE AWANSUJE Z KAŻDEJ GRUPY? (grupa po ${cfg.groupSize})</div><div class="gap8" id="tc-puchar-advance" style="flex-wrap:wrap;flex-direction:column;align-items:flex-start;"></div>`;
    const advEl = document.getElementById('tc-puchar-advance');
    opts.forEach(a => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:10px;cursor:pointer;padding:4px;';
      const dots = Array.from({ length: cfg.groupSize }, (_, i) =>
        `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;margin-right:3px;background:${i < a ? 'var(--green-ll)' : '#444'};border:1px solid ${i < a ? 'var(--green-ll)' : 'var(--border)'};"></span>`
      ).join('');
      row.innerHTML = `<button class="btn btn-sm" style="min-width:180px;">${a} z każdej (razem ${a * cfg.numGroups})</button><span>${dots}</span>`;
      row.addEventListener('click', () => pucharChooseAdvanceCount(a));
      advEl.appendChild(row);
    });
    return;
  }

  if (p.stage === 'legformat') {
    const cfg = p.pendingGroupConfig;
    panel.innerHTML = `
      <div class="panel-title">FORMAT MECZÓW W TEJ RUNDZIE</div>
      <div class="gap8">
        <button class="btn btn-gold" id="tc-lf-double">🏠✈ Mecz i rewanż (u siebie / na wyjeździe)</button>
        <button class="btn btn-gold" id="tc-lf-single">⚖ Jeden mecz, neutralny teren</button>
      </div>`;
    document.getElementById('tc-lf-double').addEventListener('click', () => pucharChooseLegFormat('double'));
    document.getElementById('tc-lf-single').addEventListener('click', () => pucharChooseLegFormat('single-neutral'));
    return;
  }

  if (p.stage === 'summary') {
    panel.innerHTML = `
      <div class="panel-title">PODSUMOWANIE TURNIEJU</div>
      <div id="tc-puchar-summary-list" style="margin-bottom:12px;"></div>
      <div class="gap8">
        <button class="btn btn-gold" id="tc-start-btn">▶ ROZPOCZNIJ PUCHAR</button>
        <button class="btn btn-sm" id="tc-restart-btn">← ZACZNIJ ROZKŁAD RUND OD NOWA</button>
      </div>`;
    const summaryEl = document.getElementById('tc-puchar-summary-list');
    summaryEl.innerHTML = p.rounds.map((r, i) => {
      const legLabel = r.legFormat === 'double' ? 'mecz+rewanż' : 'neutralny';
      return r.isKnockoutPairs
        ? `<div>Runda ${i+1}: ${r.numGroups} par (1v1), ${legLabel}</div>`
        : `<div>Runda ${i+1}: ${r.numGroups} grup po ${r.groupSize}, awansuje ${r.advancePerGroup}/grupę, ${legLabel}</div>`;
    }).join('');
    document.getElementById('tc-start-btn').addEventListener('click', pucharStartTournament);
    document.getElementById('tc-restart-btn').addEventListener('click', () => pucharGoBack('roundconfig-restart'));
    return;
  }
}

function pucharConfirmTeamCount() {
  const n = parseInt(document.getElementById('tc-puchar-teamcount').value, 10);
  state.puchar.totalTeams = n;
  state.puchar.stage = 'teamsource';
  renderPucharSetupStep();
}

function pucharGoBack(stage) {
  if (stage === 'roundconfig-restart') {
    state.puchar.rounds = [];
    state.puchar.teamsRemainingForNextRound = state.puchar.totalTeams;
    state.puchar.stage = 'roundconfig';
  } else {
    state.puchar.stage = stage;
  }
  renderPucharSetupStep();
}

function pucharChooseSource(source) {
  const n = state.puchar.totalTeams - 1; // minus ja
  const afterChosen = (teams) => {
    state.puchar.teams = teams;
    state.puchar.rounds = [];
    state.puchar.teamsRemainingForNextRound = state.puchar.totalTeams;
    state.puchar.stage = 'roundconfig';
    showScreen('screen-tc-puchar');
    renderPucharSetupStep();
  };
  if (source === 'random') afterChosen(drawRandomTeams(n, state.myClub));
  else if (source === 'strongest') afterChosen(drawStrongestTeams(n, state.myClub));
  else openTeamPicker(n, `WYBIERZ ${n} DRUŻYN DO PUCHARU`, afterChosen);
}

function pucharChooseGroupConfig(cfg) {
  state.puchar.pendingGroupConfig = cfg;
  if (cfg.isKnockoutPairs) {
    state.puchar.pendingAdvanceCount = 1;
    state.puchar.stage = 'legformat';
  } else {
    state.puchar.stage = 'advanceconfig';
  }
  renderPucharSetupStep();
}

function pucharChooseAdvanceCount(a) {
  state.puchar.pendingAdvanceCount = a;
  state.puchar.stage = 'legformat';
  renderPucharSetupStep();
}

function pucharChooseLegFormat(fmt) {
  const cfg = state.puchar.pendingGroupConfig;
  const advance = state.puchar.pendingAdvanceCount;
  state.puchar.rounds.push({
    numGroups: cfg.numGroups, groupSize: cfg.groupSize, isKnockoutPairs: cfg.isKnockoutPairs,
    advancePerGroup: advance, legFormat: fmt,
  });
  const nextCount = cfg.numGroups * advance;
  state.puchar.teamsRemainingForNextRound = nextCount;
  state.puchar.pendingGroupConfig = null;
  state.puchar.pendingAdvanceCount = null;
  state.puchar.stage = (nextCount === 1) ? 'summary' : 'roundconfig';
  renderPucharSetupStep();
}

// ============================================================
// WYKONANIE TURNIEJU PUCHAROWEGO — rundy typu "pary" (knockout)
// i "grupy" (tabela punktowa), na przemian, aż zostanie 1 zespół.
// ============================================================

function pucharStartTournament() {
  const myRoster = buildMyMatchRoster();
  const myTeam = { label: state.myClub || state.myTeamName || 'TWOJA DRUŻYNA', isPlayer: true, overall: state.myOverall, roster: myRoster, club: state.myClub || null };
  const otherTeams = state.puchar.teams.map(teamToBracketObj);

  state.customPuchar = {
    rounds: state.puchar.rounds,
    currentRoundIdx: 0,
    currentRoundTeams: [myTeam, ...otherTeams],
  };
  state.tournamentPhase = 'customPuchar';
  goToPucharRound();
}

// Symuluje dwumecz/pojedynczy mecz MIĘDZY DWIEMA DRUŻYNAMI SPOZA MOJEGO UDZIAŁU
// (błyskawicznie, w tle) — zwraca zwycięzcę oraz sam wynik (bez strzelców — dla
// meczów, w których nie gram, sam wynik wystarczy i wygląda czyściej).
function simulateBackgroundTie(teamA, teamB, legFormat) {
  if (legFormat === 'single-neutral') {
    const r = resolveOtherMatch(teamA, teamB, true); // pojedynczy mecz - zawsze potrzebny zwycięzca
    const scoreText = `${teamA.label} ${r.gf}:${r.ga} ${teamB.label}${r.wasExtraTime ? ' (po dogrywce)' : ''}`;
    const winner = r.result === 'W' ? teamA : teamB;
    return { winner, scoreText, timeline: r.timeline };
  }
  const r1 = simulateMatch(teamA.overall, teamB.overall);
  const r2 = simulateMatch(teamB.overall, teamA.overall);
  const aggA = r1.gf + r2.ga, aggB = r1.ga + r2.gf;
  const scoreText = `${teamA.label} ${aggA}:${aggB} ${teamB.label} (dwumecz: ${r1.gf}:${r1.ga}, ${r2.gf}:${r2.ga})`;
  let winner;
  if (aggA !== aggB) winner = aggA > aggB ? teamA : teamB;
  else {
    const awayGoalsA = r2.gf, awayGoalsB = r1.ga;
    winner = awayGoalsA !== awayGoalsB ? (awayGoalsA > awayGoalsB ? teamA : teamB) : (Math.random() < 0.5 ? teamA : teamB);
  }
  return { winner, scoreText };
}

// Symuluje CAŁĄ grupę (tabela punktowa) między drużynami SPOZA mojego udziału —
// zwraca N zwycięzców (advancePerGroup) w tle, natychmiast.
function simulateBackgroundGroup(teams, advancePerGroup, legFormat) {
  const rounds = generateRoundRobin(teams);
  const fixtures = legFormat === 'single-neutral' ? rounds.slice(0, rounds.length / 2) : rounds;
  const table = initSeasonTable(teams);
  fixtures.forEach(round => round.forEach(m => {
    const r = resolveOtherMatch(m.home, m.away, false); // faza grupowa - remis dozwolony
    updateSeasonTable(table, m.home.label, m.away.label, r.gf, r.ga);
  }));
  const sorted = sortedSeasonTable(table);
  const qualifiers = sorted.slice(0, advancePerGroup).map(row => teams.find(t => t.label === row.label));
  return { qualifiers, sorted };
}

function goToPucharRound() {
  const cp = state.customPuchar;
  if (cp.currentRoundIdx >= cp.rounds.length || cp.currentRoundTeams.length <= 1) { finishPuchar(); return; }
  const roundCfg = cp.rounds[cp.currentRoundIdx];
  cp.roundCfg = roundCfg;
  if (roundCfg.isKnockoutPairs) setupPucharKnockoutRound(roundCfg);
  else setupPucharGroupRound(roundCfg);
}

function finishPuchar() {
  const cp = state.customPuchar;
  const champion = cp.currentRoundTeams[0];
  const won = champion && champion.isPlayer;
  document.getElementById('challenge-end-summary').textContent = won
    ? `🏆 Zdobywasz Puchar! Przeprowadziłeś swój zespół przez cały turniej.`
    : `Turniej zakończony. Mistrzem zostaje ${champion ? champion.label : '???'}.`;
  document.getElementById('challenge-end-table').innerHTML = '';
  showScreen('screen-challenge-end');
}

// ── RUNDA TYPU "PARY" (knockout, dwumecz/neutralny) ──
function setupPucharKnockoutRound(roundCfg) {
  const cp = state.customPuchar;
  const shuffled = [...cp.currentRoundTeams].sort(() => Math.random() - 0.5);
  const myIdx = shuffled.findIndex(t => t.isPlayer);
  if (myIdx > 0 && myIdx % 2 === 1) { const tmp = shuffled[myIdx - 1]; shuffled[myIdx - 1] = shuffled[myIdx]; shuffled[myIdx] = tmp; }
  const pairs = [];
  for (let i = 0; i < shuffled.length; i += 2) pairs.push([shuffled[i], shuffled[i + 1]]);

  cp.pairs = pairs;
  cp.currentPairIdx = pairs.findIndex(pair => pair[0].isPlayer || pair[1].isPlayer);
  cp.mode = 'knockout';
  cp.leg = 1; cp.myAgg = 0; cp.oppAgg = 0; cp.leg1MyGoals = 0; cp.leg1OppGoals = 0; cp.leg1WasHome = null;
  cp.winnersThisRound = [];

  pairs.forEach((pair, idx) => {
    if (idx === cp.currentPairIdx) return;
    const outcome = simulateBackgroundTie(pair[0], pair[1], roundCfg.legFormat);
    cp.winnersThisRound[idx] = outcome.winner;
    addHistoryCard(`Puchar — Runda ${cp.currentRoundIdx + 1}`, outcome.scoreText, '', '');
  });

  showPucharKnockoutMatchInfo();
}

function showPucharKnockoutMatchInfo() {
  const cp = state.customPuchar;
  const pair = cp.pairs[cp.currentPairIdx];
  const myTeam = pair[0].isPlayer ? pair[0] : pair[1];
  const oppTeam = pair[0].isPlayer ? pair[1] : pair[0];
  document.getElementById('challenge-title').textContent = `Runda ${cp.currentRoundIdx + 1} — Puchar`;
  const legsInRound = cp.roundCfg.legFormat === 'single-neutral' ? 1 : 2;
  document.getElementById('challenge-round-label').textContent = legsInRound === 1 ? 'Mecz na neutralnym terenie' : `Mecz ${cp.leg}/2`;
  document.getElementById('challenge-opponent-preview').textContent = `Rywal: ${oppTeam.label} (OVR ${calcTeamOverall(oppTeam.roster)})`;
  document.getElementById('challenge-agg-info').textContent = (legsInRound === 2 && cp.leg === 2) ? `Po pierwszym meczu: ${cp.myAgg} : ${cp.oppAgg}` : '';
  document.getElementById('btn-play-challenge-match').disabled = false;
  document.getElementById('btn-play-challenge-match').textContent = '▶ ROZEGRAJ MECZ';
  document.getElementById('btn-play-challenge-match').onclick = setupPucharKnockoutMatch;
  document.getElementById('challenge-group-table').innerHTML = '';
  showScreen('screen-challenge');
}

function setupPucharKnockoutMatch() {
  const cp = state.customPuchar;
  const pair = cp.pairs[cp.currentPairIdx];
  const myTeamObj = pair[0].isPlayer ? pair[0] : pair[1];
  const oppTeam = pair[0].isPlayer ? pair[1] : pair[0];
  const legsInRound = cp.roundCfg.legFormat === 'single-neutral' ? 1 : 2;
  const iAmHomeThisLeg = legsInRound === 1 ? true : (cp.leg === 1);
  const m = iAmHomeThisLeg ? { home: myTeamObj, away: oppTeam } : { home: oppTeam, away: myTeamObj };
  cp.currentM = m; cp.currentOpp = oppTeam; cp.currentMyTeam = myTeamObj;

  const venue = legsInRound === 1 ? 'neutral' : (iAmHomeThisLeg ? 'home' : 'away');
  document.getElementById('playoff-round-label').textContent = `Puchar — Runda ${cp.currentRoundIdx + 1}`;
  document.getElementById('playoff-round-title').textContent = `Puchar — Runda ${cp.currentRoundIdx + 1}`;
  document.getElementById('playoff-history-title').textContent = 'KREATOR TURNIEJU — PUCHAR';
  document.getElementById('groups-panel').style.display = 'none';
  if (legsInRound === 1) state.currentMatchNeedsWinner = true;
  else if (cp.leg === 2) state.currentMatchNeedsWinner = { myAggOffset: cp.myAgg, oppAggOffset: cp.oppAgg };
  else state.currentMatchNeedsWinner = false; // leg 1 dwumeczu - remis dozwolony, agregat jeszcze się nie domyka
  resetMatchScreen(oppTeam, myTeamObj, venue);
}

function finishPucharKnockoutMatch(sim, m, opp) {
  const cp = state.customPuchar;
  const legsInRound = cp.roundCfg.legFormat === 'single-neutral' ? 1 : 2;
  const iWasHomeThisLeg = m.home.isPlayer;

  const scoreText = `${sim.gf} : ${sim.ga}`;
  const resultClass = sim.result === 'W' ? 'win' : sim.result === 'D' ? 'draw' : 'loss';
  const ST = getStyle();
  document.getElementById('po-commentary').textContent = sim.result === 'W' ? rand(ST.win) : sim.result === 'D' ? rand(ST.draw) : rand(ST.loss);
  document.getElementById('po-score').textContent = formatScoreText(sim.gf, sim.ga);
  document.getElementById('po-score').className = `match-score ${resultClass}`;
  document.getElementById('btn-skip-match').style.display = 'none';
  document.getElementById('btn-pause-match').style.display = 'none';

  const onDecided = (advanced) => resolvePucharPairResult(advanced, legsInRound === 1 ? scoreText : null);

  if (legsInRound === 1) {
    addHistoryCard('PUCHAR', `Runda ${cp.currentRoundIdx + 1} vs ${opp.label}`, scoreText, resultClass);
    if (sim.result !== 'D') onDecided(sim.result === 'W');
    else runChallengeShootout(opp, scoreText, `Remis ${scoreText} — decydują rzuty karne.`, ST, onDecided);
    return;
  }

  addHistoryCard('PUCHAR', `Runda ${cp.currentRoundIdx + 1} — mecz ${cp.leg} vs ${opp.label}`, scoreText, resultClass);

  if (cp.leg === 1) {
    cp.leg1MyGoals = sim.gf; cp.leg1OppGoals = sim.ga; cp.leg1WasHome = iWasHomeThisLeg;
    cp.myAgg = sim.gf; cp.oppAgg = sim.ga; cp.leg = 2;
    document.getElementById('challenge-btn-next-round').textContent = 'REWANŻ →';
    document.getElementById('challenge-btn-next-round').style.display = 'inline-block';
    document.getElementById('challenge-btn-next-round').onclick = () => { showPucharKnockoutMatchInfo(); };
    return;
  }

  cp.myAgg += sim.gf; cp.oppAgg += sim.ga;
  if (cp.myAgg !== cp.oppAgg) { onDecided(cp.myAgg > cp.oppAgg); return; }

  // Remis na agregacie — dogrywka ROZEGRAŁA SIĘ NA ŻYWO (jeśli była
  // potrzebna, patrz needsWinner w setupPucharKnockoutMatch), a sim.gf/sim.ga
  // już ją zawierają. Jeśli agregat WCIĄŻ jest remisowy — karne, bez
  // przestarzałej zasady goli na wyjeździe (UEFA zniosła ją w 2021).
  const aggText = `${cp.myAgg} : ${cp.oppAgg}`;
  runChallengeShootout(opp, aggText, `Dwumecz zakończony remisem ${aggText} — decydują rzuty karne.`, ST, onDecided);
}

function resolvePucharPairResult(advanced, finalScoreText) {
  const cp = state.customPuchar;
  const pair = cp.pairs[cp.currentPairIdx];
  const winner = advanced ? cp.currentMyTeam : cp.currentOpp;
  cp.winnersThisRound[cp.currentPairIdx] = winner;
  const scoreLabel = finalScoreText || `${cp.myAgg}:${cp.oppAgg}`;

  if (!advanced) {
    document.getElementById('challenge-btn-next-round').style.display = 'none';
    document.getElementById('challenge-end-summary').textContent = `Odpadasz z Pucharu (Runda ${cp.currentRoundIdx + 1}, wynik ${scoreLabel}).`;
    document.getElementById('challenge-end-table').innerHTML = '';
    showScreen('screen-challenge-end');
    finishRemainingPucharInBackground();
    return;
  }

  document.getElementById('challenge-btn-next-round').textContent = 'NASTĘPNA RUNDA →';
  document.getElementById('challenge-btn-next-round').style.display = 'inline-block';
  document.getElementById('challenge-btn-next-round').onclick = () => { advancePucharRound(); };
}

function advancePucharRound() {
  const cp = state.customPuchar;
  cp.currentRoundTeams = cp.winnersThisRound;
  cp.currentRoundIdx++;
  cp.leg = 1; cp.myAgg = 0; cp.oppAgg = 0;
  goToPucharRound();
}

// Gdy gracz odpada, turniej jako calosc dogrywa sie sam w tle (potrzebne, zeby
// wiedziec kto finalnie zdobyl Puchar) — czysto informacyjne podsumowanie.
function finishRemainingPucharInBackground() {
  const cp = state.customPuchar;
  // cp.winnersThisRound juz zawiera WSZYSTKICH zwyciezcow biezacej rundy — w tym
  // zwyciezce mojej pary (to mój rywal, bo ja właśnie odpadłem).
  let teams = cp.winnersThisRound.slice();
  let roundIdx = cp.currentRoundIdx + 1;
  while (roundIdx < cp.rounds.length && teams.length > 1) {
    const cfg = cp.rounds[roundIdx];
    if (cfg.isKnockoutPairs) {
      const shuffled = [...teams].sort(() => Math.random() - 0.5);
      const winners = [];
      for (let i = 0; i < shuffled.length; i += 2) winners.push(simulateBackgroundTie(shuffled[i], shuffled[i + 1], cfg.legFormat).winner);
      teams = winners;
    } else {
      const shuffled = [...teams].sort(() => Math.random() - 0.5);
      const winners = [];
      for (let i = 0; i < shuffled.length; i += cfg.groupSize) {
        winners.push(...simulateBackgroundGroup(shuffled.slice(i, i + cfg.groupSize), cfg.advancePerGroup, cfg.legFormat).qualifiers);
      }
      teams = winners;
    }
    roundIdx++;
  }
  const champion = teams[0];
  const prevText = document.getElementById('challenge-end-summary').textContent;
  document.getElementById('challenge-end-summary').textContent =
    prevText + ` Mistrzem turnieju zostaje ${champion ? champion.label : '???'}.`;
  document.getElementById('challenge-end-table').innerHTML = '';
  showScreen('screen-challenge-end');
}

// ── PODPIĘCIE W ROUTER finishMatch/getCurrentMatchContext (jak w wyzwania.js) ──
const _origGetCurrentMatchContextTC = getCurrentMatchContext;
getCurrentMatchContext = function () {
  if (state.tournamentPhase === 'customPuchar') {
    return { m: state.customPuchar.currentM, opp: state.customPuchar.currentOpp, myTeam: state.customPuchar.currentMyTeam };
  }
  return _origGetCurrentMatchContextTC();
};

const _origFinishMatchTC = finishMatch;
finishMatch = function (sim, m, opp) {
  if (state.tournamentPhase === 'customPuchar') {
    document.getElementById('btn-skip-match').style.display = 'none';
    document.getElementById('btn-pause-match').style.display = 'none';
    if (state.customPuchar.mode === 'group') finishPucharGroupMatch(sim, m, opp);
    else finishPucharKnockoutMatch(sim, m, opp);
    return;
  }
  _origFinishMatchTC(sim, m, opp);
};

// ── RUNDA TYPU "GRUPY" (tabela punktowa, 3+ drużyn na grupę) ──
function setupPucharGroupRound(roundCfg) {
  const cp = state.customPuchar;
  const shuffled = [...cp.currentRoundTeams].sort(() => Math.random() - 0.5);
  const myIdx = shuffled.findIndex(t => t.isPlayer);
  // przenosimy moja druzyne na poczatek pierwszej grupy (dowolne miejsce w grupie jest ok)
  if (myIdx > 0) { const tmp = shuffled[0]; shuffled[0] = shuffled[myIdx]; shuffled[myIdx] = tmp; }

  const groups = [];
  for (let i = 0; i < shuffled.length; i += roundCfg.groupSize) {
    groups.push(shuffled.slice(i, i + roundCfg.groupSize));
  }
  cp.myGroupIdx = groups.findIndex(g => g.some(t => t.isPlayer));
  cp.mode = 'group';
  cp.groups = groups.map((teams, idx) => {
    if (idx === cp.myGroupIdx) {
      const rounds = generateRoundRobin(teams);
      const fixtures = roundCfg.legFormat === 'single-neutral' ? rounds.slice(0, rounds.length / 2) : rounds;
      return { teams, table: initSeasonTable(teams), fixtures, matchIdx: 0 };
    }
    return { teams, simulated: true };
  });
  cp.winnersThisRound = [];

  // Symulujemy WSZYSTKIE grupy poza moja natychmiast w tle.
  cp.groups.forEach((g, idx) => {
    if (idx === cp.myGroupIdx) return;
    const result = simulateBackgroundGroup(g.teams, roundCfg.advancePerGroup, roundCfg.legFormat);
    cp.winnersThisRound.push(...result.qualifiers);
    const standingsText = result.sorted.map((r, i) => `${i + 1}. ${r.label} (${r.points}pkt)`).join(', ');
    addHistoryCard(`Puchar — Runda ${cp.currentRoundIdx + 1} — Grupa`, standingsText, '', '');
  });

  goToMyGroupMatch();
}

function goToMyGroupMatch() {
  const cp = state.customPuchar;
  const myGroup = cp.groups[cp.myGroupIdx];

  if (myGroup.matchIdx >= myGroup.fixtures.length) {
    finishMyGroupAndAdvance();
    return;
  }
  const round = myGroup.fixtures[myGroup.matchIdx];

  // BŁĄD NAPRAWIONY: wcześniej rozgrywaliśmy TYLKO mój mecz z tej kolejki, a inne
  // mecze tej samej kolejki (między pozostałymi drużynami mojej grupy) nigdy się
  // nie odbywały — tabela była martwa poza moimi wynikami. Teraz rozstrzygamy
  // WSZYSTKIE inne mecze tej kolejki w tle, raz, przy pierwszym wejściu na nią.
  if (!round.__bgSimulated) {
    round.forEach(mt => {
      if (mt.home.isPlayer || mt.away.isPlayer) return;
      const r = resolveOtherMatch(mt.home, mt.away, false); // faza grupowa - remis dozwolony
      updateSeasonTable(myGroup.table, mt.home.label, mt.away.label, r.gf, r.ga);
    });
    round.__bgSimulated = true;
  }

  const m = round.find(mt => mt.home.isPlayer || mt.away.isPlayer);
  const oppTeam = m.home.isPlayer ? m.away : m.home;

  document.getElementById('challenge-title').textContent = `Runda ${cp.currentRoundIdx + 1} — Grupa`;
  document.getElementById('challenge-round-label').textContent = `Faza grupowa — mecz ${myGroup.matchIdx + 1}/${myGroup.fixtures.length}`;
  document.getElementById('challenge-opponent-preview').textContent = `Rywal: ${oppTeam.label} (OVR ${calcTeamOverall(oppTeam.roster)})`;
  document.getElementById('challenge-agg-info').textContent = '';
  document.getElementById('btn-play-challenge-match').disabled = false;
  document.getElementById('btn-play-challenge-match').textContent = '▶ ROZEGRAJ MECZ';
  document.getElementById('btn-play-challenge-match').onclick = setupPucharGroupMatch;
  renderSeasonTableInto('challenge-group-table', sortedSeasonTable(myGroup.table), cp.roundCfg.advancePerGroup);
  showScreen('screen-challenge');
}

function setupPucharGroupMatch() {
  const cp = state.customPuchar;
  const myGroup = cp.groups[cp.myGroupIdx];
  const round = myGroup.fixtures[myGroup.matchIdx];
  const m = round.find(mt => mt.home.isPlayer || mt.away.isPlayer);
  const oppTeam = m.home.isPlayer ? m.away : m.home;
  const myTeamObj = m.home.isPlayer ? m.home : m.away;
  cp.currentM = m; cp.currentOpp = oppTeam; cp.currentMyTeam = myTeamObj;

  const label = `Puchar — Runda ${cp.currentRoundIdx + 1} • Grupa (mecz ${myGroup.matchIdx + 1}/${myGroup.fixtures.length}) vs ${oppTeam.label}`;
  document.getElementById('playoff-round-label').textContent = label;
  document.getElementById('playoff-round-title').textContent = label;
  document.getElementById('playoff-history-title').textContent = 'KREATOR TURNIEJU — PUCHAR';
  document.getElementById('groups-panel').style.display = 'none';
  state.currentMatchNeedsWinner = false; // faza grupowa - remis to normalny, ważny wynik
  resetMatchScreen(oppTeam, myTeamObj, m.home.isPlayer ? 'home' : 'away');
}

function finishPucharGroupMatch(sim, m, opp) {
  const cp = state.customPuchar;
  const myGroup = cp.groups[cp.myGroupIdx];
  const scoreText = `${sim.gf} : ${sim.ga}`;
  const resultClass = sim.result === 'W' ? 'win' : sim.result === 'D' ? 'draw' : 'loss';
  const ST = getStyle();
  document.getElementById('po-commentary').textContent = sim.result === 'W' ? rand(ST.win) : sim.result === 'D' ? rand(ST.draw) : rand(ST.loss);
  document.getElementById('po-score').textContent = formatScoreText(sim.gf, sim.ga);
  document.getElementById('po-score').className = `match-score ${resultClass}`;
  document.getElementById('btn-skip-match').style.display = 'none';
  document.getElementById('btn-pause-match').style.display = 'none';

  const isHome = m.home.isPlayer;
  updateSeasonTable(myGroup.table, isHome ? cp.currentMyTeam.label : opp.label, isHome ? opp.label : cp.currentMyTeam.label, isHome ? sim.gf : sim.ga, isHome ? sim.ga : sim.gf);
  addHistoryCard('PUCHAR — GRUPA', `Runda ${cp.currentRoundIdx + 1} vs ${opp.label}`, scoreText, resultClass);

  myGroup.matchIdx++;
  document.getElementById('challenge-btn-next-round').textContent = myGroup.matchIdx < myGroup.fixtures.length ? 'NASTĘPNY MECZ GRUPOWY →' : 'ZOBACZ WYNIK GRUPY →';
  document.getElementById('challenge-btn-next-round').style.display = 'inline-block';
  document.getElementById('challenge-btn-next-round').onclick = () => { goToMyGroupMatch(); };
}

function finishMyGroupAndAdvance() {
  const cp = state.customPuchar;
  const myGroup = cp.groups[cp.myGroupIdx];
  const table = sortedSeasonTable(myGroup.table);
  const myPos = table.findIndex(r => r.isPlayer) + 1;
  const advanced = myPos <= cp.roundCfg.advancePerGroup;

  const myQualifiers = table.slice(0, cp.roundCfg.advancePerGroup).map(row => myGroup.teams.find(t => t.label === row.label));
  cp.winnersThisRound.push(...myQualifiers);

  if (!advanced) {
    document.getElementById('challenge-end-summary').textContent = `Kończysz fazę grupową na ${myPos}. miejscu — to za mało, żeby awansować dalej.`;
    renderSeasonTableInto('challenge-end-table', table, cp.roundCfg.advancePerGroup);
    showScreen('screen-challenge-end');
    finishRemainingPucharInBackground();
    return;
  }

  document.getElementById('challenge-title').textContent = `Runda ${cp.currentRoundIdx + 1} zakończona`;
  document.getElementById('challenge-round-label').textContent = `Awansujesz z grupy na ${myPos}. miejscu!`;
  document.getElementById('challenge-opponent-preview').textContent = '';
  document.getElementById('challenge-agg-info').textContent = '';
  document.getElementById('btn-play-challenge-match').textContent = '▶ NASTĘPNA RUNDA';
  document.getElementById('btn-play-challenge-match').disabled = false;
  document.getElementById('btn-play-challenge-match').onclick = advancePucharRound;
  renderSeasonTableInto('challenge-group-table', table, cp.roundCfg.advancePerGroup);
  showScreen('screen-challenge');
}
