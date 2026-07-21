// ============================================================
// NBA-PLAYOFF.JS — opcjonalny format Trybu Sezonu ("NBA STYLE").
// Po sezonie zasadniczym (zwykła liga, bez zmian) pierwsze 8 miejsc w
// tabeli gra play-off dokładnie jak w NBA: 1. miejsce z 8., 2. z 7.,
// 3. z 6., 4. z 5., każda runda to seria BEZ REWANŻU JEDNEGO MECZU —
// gra się AŻ KTOŚ WYGRA 4 MECZE (best-of-7), drabinka BEZ reseedowania
// między rundami (jak współczesne NBA), z klasycznym rozkładem
// gospodarzy 2-2-1-1-1 (lepiej rozstawiony gra mecze 1,2,5,7 u siebie).
//
// Serie bez udziału gracza rozstrzygane są od razu w tle, w całości,
// gdy tylko runda się zaczyna — gracz gra tylko SWOJĄ serię, mecz po
// meczu, dokładnie jak resztę Trybu Sezonu.
// ============================================================

const NBA_HOME_PATTERN = ['A', 'A', 'B', 'B', 'A', 'B', 'A']; // gry 1-7 (indeks 0-6)
const NBA_ROUND_NAMES = ['1. RUNDA PLAY-OFF', 'PÓŁFINAŁ', 'FINAŁ'];

// Buduje 4 serie 1. rundy z końcowej tabeli sezonu zasadniczego — bez
// zmian w samej tabeli/silniku ligowym, korzysta z tych samych funkcji
// co klasyczny koniec sezonu (sortedSeasonTable).
function buildNbaBracketFromStandings() {
  const top8 = sortedSeasonTable(state.season.table).slice(0, 8);
  const seeded = top8.map(row => state.season.teams.find(t => t.label === row.label));
  const pair = (i, j) => ({ teamA: seeded[i], teamB: seeded[j], winsA: 0, winsB: 0, gameIdx: 0, winner: null });
  // Kolejność [1v8, 4v5, 2v7, 3v6] — dzięki temu pary (0,1) i (2,3) to
  // dokładnie te, które w realnej drabince NBA spotykają się w półfinale.
  return [pair(0, 7), pair(3, 4), pair(1, 6), pair(2, 5)];
}

function startNbaPlayoff() {
  const top8 = sortedSeasonTable(state.season.table).slice(0, 8);
  const myFinalPos = sortedSeasonTable(state.season.table).findIndex(r => r.isPlayer) + 1;
  if (!top8.some(r => r.isPlayer)) {
    // Gracz nie łapie się do TOP 8 — dla niego sezon kończy się tutaj,
    // z pełną tabelą końcową (bez rozgrywania play-off, który go nie dotyczy).
    document.getElementById('season-final-summary').textContent =
      `Sezon zakończony! Zajmujesz ${myFinalPos}. miejsce w tabeli — zabrakło do TOP 8 (play-off NBA STYLE jest tylko dla najlepszej ósemki).`;
    renderSeasonTableInto('season-final-table', sortedSeasonTable(state.season.table), 8);
    showScreen('screen-season-end');
    return;
  }
  state.tournamentPhase = 'nbaPlayoff';
  state.nbaPlayoff = {
    round: 0,
    series: buildNbaBracketFromStandings(),
    champion: null,
    playerEliminated: false,
  };
  resolveNonPlayerSeriesInBackground();
  goToNbaPlayoffHub();
}

// Rozstrzyga w całości (do 4 zwycięstw) każdą serię w BIEŻĄCEJ rundzie,
// która nie dotyczy gracza — wywoływane raz, na starcie każdej rundy.
function resolveNonPlayerSeriesInBackground() {
  state.nbaPlayoff.series.forEach(s => {
    if (s.winner || s.teamA.isPlayer || s.teamB.isPlayer) return;
    while (!s.winner) {
      const venue = NBA_HOME_PATTERN[s.gameIdx] === 'A' ? 'home' : 'away';
      const r = resolveOtherMatch(s.teamA, s.teamB, true, venue); // każda gra serii potrzebuje zwycięzcy
      if (r.result === 'W') s.winsA++; else s.winsB++;
      s.gameIdx++;
      if (s.winsA >= 4) s.winner = s.teamA;
      else if (s.winsB >= 4) s.winner = s.teamB;
    }
  });
}

function findMySeries() {
  return state.nbaPlayoff.series.find(s => s.teamA.isPlayer || s.teamB.isPlayer);
}

// ── HUB (screen-season, w fazie 'nbaPlayoff') ──────────────────────
function goToNbaPlayoffHub() {
  const np = state.nbaPlayoff;
  document.getElementById('season-title').textContent = `SEZON ${state.season.seasonId} — PLAY-OFF`;
  document.getElementById('season-matchday-label').textContent = NBA_ROUND_NAMES[np.round] || 'PLAY-OFF';
  document.getElementById('season-btn-next-round').style.display = 'none';

  if (np.champion) {
    const iWon = np.champion.isPlayer;
    document.getElementById('season-next-match').textContent = iWon
      ? `🏆 ZOSTAJESZ MISTRZEM! Wygrywasz cały play-off.`
      : `🏆 Mistrzem zostaje ${np.champion.label}. Twoja przygoda w tym sezonie się kończy.`;
    document.getElementById('season-last-results').innerHTML = '';
    document.getElementById('season-table-container').innerHTML = renderNbaBracketHtml();
    document.getElementById('btn-play-match-season').style.display = 'none';
    showScreen('screen-season');
    return;
  }

  if (np.playerEliminated) {
    const s = findEliminatedPlayerSeries();
    document.getElementById('season-next-match').textContent =
      `😔 Przegrywasz serię ${myLossScoreText(s)} — odpadasz z play-off. Reszta drabinki gra dalej bez Ciebie.`;
    document.getElementById('season-last-results').innerHTML = '';
    document.getElementById('season-table-container').innerHTML = renderNbaBracketHtml();
    document.getElementById('btn-play-match-season').style.display = 'none';
    showScreen('screen-season');
    return;
  }

  const s = findMySeries();
  const myIsA = s.teamA.isPlayer;
  const oppTeam = myIsA ? s.teamB : s.teamA;
  const myWins = myIsA ? s.winsA : s.winsB;
  const oppWins = myIsA ? s.winsB : s.winsA;
  const venue = NBA_HOME_PATTERN[s.gameIdx] === (myIsA ? 'A' : 'B') ? 'u siebie' : 'na wyjeździe';
  document.getElementById('season-next-match').textContent =
    `Mecz ${s.gameIdx + 1} serii vs ${oppTeam.label} — stan serii ${myWins}:${oppWins} (${venue})`;
  document.getElementById('season-last-results').innerHTML = '';
  document.getElementById('season-table-container').innerHTML = renderNbaBracketHtml();
  document.getElementById('btn-play-match-season').style.display = 'inline-block';
  document.getElementById('btn-play-match-season').onclick = () => setupNbaPlayoffMatch();
  showScreen('screen-season');
}

function myLossScoreText(s) {
  const myIsA = s.teamA.isPlayer;
  const myWins = myIsA ? s.winsA : s.winsB;
  const oppWins = myIsA ? s.winsB : s.winsA;
  return `${myWins}:${oppWins}`;
}

function findEliminatedPlayerSeries() {
  return state.nbaPlayoff.series.find(s => s.winner && (s.teamA.isPlayer || s.teamB.isPlayer) && !s.winner.isPlayer);
}

// Prosty, czytelny widok drabinki bieżącej rundy — kto z kim, jaki stan serii.
function renderNbaBracketHtml() {
  const np = state.nbaPlayoff;
  const rows = np.series.map(s => {
    const isMine = s.teamA.isPlayer || s.teamB.isPlayer;
    const status = s.winner ? `→ awansuje ${s.winner.label}` : `${s.winsA}:${s.winsB}`;
    const style = isMine ? 'color:var(--gold);font-weight:bold;' : 'color:var(--gray);';
    return `<div style="${style}padding:4px 0;border-bottom:1px solid var(--border);">${s.teamA.label} vs ${s.teamB.label} — ${status}</div>`;
  }).join('');
  return `<div class="panel-title" style="font-size:14px;margin-top:10px;">${NBA_ROUND_NAMES[np.round]}</div>${rows}`;
}

// ── MECZ ─────────────────────────────────────────────────────────
function setupNbaPlayoffMatch() {
  const s = findMySeries();
  if (!s) { goToNbaPlayoffHub(); return; }
  const myIsA = s.teamA.isPlayer;
  const myTeam = myIsA ? s.teamA : s.teamB;
  const opp = myIsA ? s.teamB : s.teamA;
  const venue = NBA_HOME_PATTERN[s.gameIdx] === (myIsA ? 'A' : 'B') ? 'home' : 'away';
  const label = `${NBA_ROUND_NAMES[state.nbaPlayoff.round]} • Mecz ${s.gameIdx + 1} vs ${opp.label}`;
  document.getElementById('playoff-round-label').textContent = label;
  document.getElementById('playoff-round-title').textContent = label;
  state.currentMatchNeedsWinner = true; // każda gra serii do 4 zwycięstw musi mieć zwycięzcę
  resetMatchScreen(opp, myTeam, venue);
}

// Play-off nie może zakończyć się remisem na POJEDYNCZYM meczu — jak w
// prawdziwym pucharowym dwumeczu: dogrywka, a jeśli nadal remis, karne.
function decideNbaGameWinner(sim, myTeam, opp) {
  if (sim.result !== 'D') return { myWon: sim.result === 'W', note: '' };
  // Dogrywkę zawsze rozgrywa generator. Jeśli nadal jest remis, zostają karne.
  const shootout = simulatePenaltyShootout(myTeam.roster, opp.roster, opp.label);
  return { myWon: shootout.iWin, note: ` (k. ${shootout.myScore}:${shootout.oppScore})` };
}

// ── NAPRAWA: dogrywka/karne widoczne PRZED przeniesieniem do huba ──
// Ten sam problem i ta sama naprawa co w MUNDIAL-2026.js: bez tego, mecz
// kończący się remisem pokazywał "DALEJ" PRZED rozstrzygnięciem, a samo
// rozstrzygnięcie (i natychmiastowy powrót do huba) działo się dopiero PO
// kliknięciu — gracz nigdy nie widział wyniku dogrywki/karnych. Wołane
// przez MECZ-HUB.js NATYCHMIAST po zakończeniu meczu, zanim jeszcze
// pokaże się przycisk "DALEJ".
function nbaDecideDrawEarly(sim, m, opp) {
  if (state.tournamentPhase !== 'nbaPlayoff') return;
  const s = findMySeries();
  if (!s) return;
  const myIsA = s.teamA.isPlayer;
  const myTeam = myIsA ? s.teamA : s.teamB;

  const decision = decideNbaGameWinner(sim, myTeam, opp);
  sim._nbaPredecidedDecision = decision;

  const resultClass = decision.myWon ? 'win' : 'loss';
  const ST = getStyle();
  document.getElementById('po-commentary').textContent = decision.myWon ? rand(ST.win) : rand(ST.loss);
  document.getElementById('po-score').textContent = formatScoreText(sim.gf, sim.ga) + decision.note;
  document.getElementById('po-score').className = `match-score ${resultClass}`;
  if (sim.result === 'D' && decision.note) {
    const timelineEl = document.getElementById('po-timeline');
    if (timelineEl) {
      const line = document.createElement('div');
      line.className = 'tl-row tl-marker';
      line.textContent = `⏱ Remis w regulaminowym czasie — rozstrzyga${decision.note}`;
      timelineEl.prepend(line);
      timelineEl.scrollTop = 0;
    }
  }
}

function finishNbaPlayoffMatch(sim, m, opp) {
  const np = state.nbaPlayoff;
  const s = findMySeries();
  const myIsA = s.teamA.isPlayer;
  const myTeam = myIsA ? s.teamA : s.teamB;

  const decision = sim._nbaPredecidedDecision || decideNbaGameWinner(sim, myTeam, opp);
  if (!sim._nbaPredecidedDecision) {
    const resultClass = decision.myWon ? 'win' : 'loss';
    const ST = getStyle();
    document.getElementById('po-commentary').textContent = decision.myWon ? rand(ST.win) : rand(ST.loss);
    document.getElementById('po-score').textContent = formatScoreText(sim.gf, sim.ga) + decision.note;
    document.getElementById('po-score').className = `match-score ${resultClass}`;
  }

  if (decision.myWon) { if (myIsA) s.winsA++; else s.winsB++; }
  else { if (myIsA) s.winsB++; else s.winsA++; }
  s.gameIdx++;

  if (s.winsA >= 4) s.winner = s.teamA;
  else if (s.winsB >= 4) s.winner = s.teamB;

  if (s.winner && !s.winner.isPlayer) np.playerEliminated = true;

  if (s.winner) {
    // Runda się kończy dopiero, gdy WSZYSTKIE serie tej rundy są rozstrzygnięte
    // (moja właśnie się skończyła — reszta w tle była gotowa od razu na starcie rundy).
    const allDecided = np.series.every(ss => ss.winner);
    if (allDecided) advanceNbaRound();
  }
}

function advanceNbaRound() {
  const np = state.nbaPlayoff;
  const winners = np.series.map(s => s.winner);

  if (winners.length === 1) {
    np.champion = winners[0];
    return;
  }
  if (np.playerEliminated) {
    // Gracz odpadł — reszta drabinki i tak dogrywa się już tylko w tle,
    // ale sezon dla gracza faktycznie się kończy tutaj.
    return;
  }

  np.round++;
  const nextSeries = [];
  for (let i = 0; i < winners.length; i += 2) {
    nextSeries.push({ teamA: winners[i], teamB: winners[i + 1], winsA: 0, winsB: 0, gameIdx: 0, winner: null });
  }
  np.series = nextSeries;
  resolveNonPlayerSeriesInBackground();
}

// ── Podpięcie pod istniejące routery meczu (ten sam wzorzec co reszta trybów) ──
const _origGetCurrentMatchContextNba = getCurrentMatchContext;
getCurrentMatchContext = function () {
  if (state.tournamentPhase === 'nbaPlayoff') {
    const np = state.nbaPlayoff;
    if (np.champion || np.playerEliminated) return { m: null, opp: null, myTeam: null };
    const s = findMySeries();
    const myIsA = s.teamA.isPlayer;
    const myTeam = myIsA ? s.teamA : s.teamB;
    const opp = myIsA ? s.teamB : s.teamA;
    return { m: { home: myIsA ? s.teamA : s.teamB, away: myIsA ? s.teamB : s.teamA }, opp, myTeam };
  }
  return _origGetCurrentMatchContextNba();
};

const _origFinishMatchNba = finishMatch;
finishMatch = function (sim, m, opp) {
  if (state.tournamentPhase === 'nbaPlayoff') {
    finishNbaPlayoffMatch(sim, m, opp);
    goToNbaPlayoffHub();
    return;
  }
  _origFinishMatchNba(sim, m, opp);
};
