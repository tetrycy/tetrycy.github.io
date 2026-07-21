// ============================================================
// PLAYOFF.JS — Play-offy Mistrzów i Turniej Losowy (drabinka pucharowa).
// ============================================================


function finalizeBracketTeams(opponents) {
  const myRoster = buildMyMatchRoster();
  const teams = [...opponents, { label: state.myClub || state.myTeamName || 'TWOJA DRUŻYNA', overall: state.myOverall, isPlayer: true, roster: myRoster, club: state.myClub || null }];
  return shuffleArr(teams);
}

function buildChampionsBracketTeams() {
  const pool = TEAMS_DATA.map(teamToBracketObj).sort((a,b) => b.overall - a.overall);
  const MAX_PER_CLUB = 2;
  const clubCounts = {};
  const top15 = [];
  for (const t of pool) {
    if (top15.length >= 15) break;
    const c = clubCounts[t.club] || 0;
    if (c >= MAX_PER_CLUB) continue;
    clubCounts[t.club] = c + 1;
    top15.push(t);
  }
  return finalizeBracketTeams(top15);
}

function buildRandomBracketTeams() {
  const byClub = {};
  TEAMS_DATA.forEach(t => { (byClub[t.club] = byClub[t.club] || []).push(t); });
  const clubs = shuffleArr(Object.keys(byClub));
  const chosen = [];
  for (const c of clubs) {
    if (chosen.length >= 15) break;
    chosen.push(teamToBracketObj(rand(byClub[c])));
  }
  // awaryjnie, gdyby klubów było mniej niż 15
  let guard = 0;
  while (chosen.length < 15 && guard < 200) {
    guard++;
    const t = rand(TEAMS_DATA);
    const obj = teamToBracketObj(t);
    if (!chosen.find(c => c.label === obj.label)) chosen.push(obj);
  }
  return finalizeBracketTeams(chosen);
}

function makeMatches(teamsArr) {
  const matches = [];
  for (let i = 0; i < teamsArr.length; i += 2) {
    matches.push({ home: teamsArr[i], away: teamsArr[i+1], played: false, winner: null, score: null });
  }
  return matches;
}

function autoSimulateRound(round) {
  round.forEach(m => {
    if (m.home.isPlayer || m.away.isPlayer) return;
    const r = resolveOtherMatch(m.home, m.away, true); // drabinka pucharowa - zawsze potrzebny zwycięzca
    m.played = true;
    m.winner = r.result === 'W' ? m.home : m.away;
    m.score = r.wasExtraTime ? `${r.gf}:${r.ga} (po dogrywce)` : `${r.gf}:${r.ga}`;
    m.timeline = r.timeline; m.scorersHome = r.scorersMe; m.scorersAway = r.scorersOpp;
  });
}

function getCurrentRound() { return state.bracket[state.roundIdx]; }

function getPlayerMatch() { return getCurrentRound().find(m => m.home.isPlayer || m.away.isPlayer); }

function getOpponent(m) { return m.home.isPlayer ? m.away : m.home; }

function addHistoryCard(roundName, line2, scoreText, resultClass, scorersText) {
  const hist = document.getElementById('playoff-history');
  const card = document.createElement('div');
  card.className = 'match-card';
  card.style.fontSize = '16px';
  card.style.flexWrap = 'wrap';
  card.innerHTML = `
    <div class="match-team">${roundName}</div>
    <div class="match-team">${line2}</div>
    <div class="match-score ${resultClass}" style="font-size:11px;">${scoreText}</div>
    ${scorersText ? `<div style="width:100%;font-size:12px;color:var(--gray);">${scorersText}</div>` : ''}
  `;
  hist.prepend(card);
}

function renderOtherResults(round) {
  const rName = roundNameForCount(round.length);
  round.forEach(m => {
    if (m.home.isPlayer || m.away.isPlayer) return;
    addHistoryCard(rName, `${m.home.label} vs ${m.away.label}`, m.score, '');
  });
}

// ── HUB PLAY-OFFU / MUNDIALU (screen-playoff, poza meczem) ──────────
// Pokazuje kontekst NADCHODZĄCEGO meczu (rywal, OVR) + aktualną tabelę/
// drabinkę, i czeka na ręczne "ROZEGRAJ MECZ" — zamiast (jak wcześniej)
// wskakiwać prosto w mecz zaraz po awansie/starcie turnieju.
function goToPlayoffHub() {
  const isGroups = state.tournamentPhase === 'groups';
  document.getElementById('groups-panel').style.display = isGroups ? 'block' : 'none';
  document.getElementById('hub-playoff-mode-label').textContent =
    isGroups
      ? (state.mundialVariant === 'random' ? 'MUNDIAL LOSOWY' : 'MUNDIAL NAJMOCNIEJSZYCH')
      : (state.playoffMode === 'random' ? 'TURNIEJ LOSOWY' : (state.playoffMode === 'mundial'
          ? (state.mundialVariant === 'random' ? 'MUNDIAL LOSOWY' : 'MUNDIAL NAJMOCNIEJSZYCH')
          : 'PLAY-OFFY MISTRZÓW'));
  document.getElementById('playoff-history-title').textContent = isGroups ? 'WYNIKI' : 'DRABINKA — POZOSTAŁE WYNIKI';
  if (isGroups) renderGroupTables();

  let label, oppPreview;
  if (isGroups) {
    const md = state.mundial.matchday;
    const m = getPlayerGroupMatch();
    const opp = m.home.isPlayer ? m.away : m.home;
    label = `KOLEJKA ${md + 1}/3 • GRUPA ${m.group}`;
    oppPreview = `Rywal: ${opp.label} (OVR ${calcTeamOverall(opp.roster)})`;
  } else {
    const round = getCurrentRound();
    const m = getPlayerMatch();
    const opp = getOpponent(m);
    label = roundNameForCount(round.length);
    oppPreview = `Rywal: ${opp.label} (OVR ${calcTeamOverall(opp.roster)})`;
  }
  document.getElementById('hub-playoff-round-label').textContent = label;
  document.getElementById('hub-playoff-round-title').textContent = `${label} — ${oppPreview}`;

  document.getElementById('btn-play-match-hub').style.display = 'inline-block';
  document.getElementById('btn-next-round').style.display = 'none';
  document.getElementById('btn-playoff-end').style.display = 'none';
  showScreen('screen-playoff');
}

function startPlayoff(mode) {
  state.playoffMode = mode === 'random' ? 'random' : 'champions';
  state.tournamentPhase = 'knockout';
  const teams = state.playoffMode === 'random' ? buildRandomBracketTeams() : buildChampionsBracketTeams();
  const round0 = makeMatches(teams);
  autoSimulateRound(round0);
  state.bracket = [round0];
  state.roundIdx = 0;
  document.getElementById('playoff-history').innerHTML = '';
  document.getElementById('groups-panel').style.display = 'none';
  renderOtherResults(round0);
  goToPlayoffHub();
}

function setupMatch() {
  if (state.tournamentPhase === 'groups') setupGroupMatch();
  else setupKnockoutMatch();
}

function setupKnockoutMatch() {
  const round = getCurrentRound();
  const m = getPlayerMatch();
  const opp = getOpponent(m);
  const myTeam = m.home.isPlayer ? m.home : m.away;
  const rName = roundNameForCount(round.length);

  document.getElementById('playoff-round-label').textContent = rName;
  document.getElementById('playoff-round-title').textContent = rName;
  document.getElementById('playoff-history-title').textContent = 'DRABINKA — POZOSTAŁE WYNIKI';
  document.getElementById('groups-panel').style.display = 'none';
  state.currentMatchNeedsWinner = true; // pucharowy pojedynczy mecz - zawsze potrzebny zwycięzca
  resetMatchScreen(opp, myTeam);
}

function finishKnockoutMatch(sim, m, opp) {
  if (sim.result === 'D') {
    const ST = getStyle();
    const timelineEl = document.getElementById('po-timeline');

    if (timelineEl) {
      const introLine = document.createElement('div');
      introLine.className = 'tl-row tl-marker';
      introLine.textContent = sim.wasExtraTime
        ? 'Remis nawet po dogrywce! Teraz zadecydują rzuty karne.'
        : rand(ST.draw) + ' Teraz zadecydują rzuty karne.';
      timelineEl.prepend(introLine);
      timelineEl.scrollTop = 0;
    }

    const myRoster = buildMyMatchRoster();
    const shootout = simulatePenaltyShootout(myRoster, opp.roster, opp.label);

    // Karne odsłaniamy PO KOLEI, z dramaturgią — nie dumpujemy całej serii naraz.
    let kickIdx = 0;
    const STEP_MS = SPEED_MS[state.speed] || SPEED_MS.normal;
    const shootoutTimer = setInterval(() => {
      if (kickIdx >= shootout.timeline.length) {
        clearInterval(shootoutTimer);
        finalizeShootoutResult(sim, m, opp, shootout, ST);
        return;
      }
      const ev = shootout.timeline[kickIdx];
      const line = document.createElement('div');
      line.className = `tl-row ${tlClass(ev)}`;
      line.textContent = ev.text;
      timelineEl.prepend(line);
      timelineEl.scrollTop = 0;
      kickIdx++;
    }, STEP_MS);
  } else {
    const ST = getStyle();
    document.getElementById('po-commentary').textContent =
      sim.result === 'W' ? rand(ST.win) : rand(ST.loss);
    finalizeKnockoutResult(m, opp, sim.result === 'W', `${sim.gf} : ${sim.ga}`, sim.result === 'W' ? 'win' : 'loss', formatScoreText(sim.gf, sim.ga));
  }
}

function finalizeShootoutResult(sim, m, opp, shootout, ST) {
  const scoreText = `${sim.gf} : ${sim.ga}` +
    ` (k. ${shootout.myScore}:${shootout.oppScore})`;
  const resultClass = shootout.iWin ? 'win' : 'loss';
  document.getElementById('po-commentary').textContent = shootout.iWin ? rand(ST.win) : rand(ST.loss);

  const timelineEl = document.getElementById('po-timeline');
  if (timelineEl) {
    const summaryLine = document.createElement('div');
    summaryLine.className = `tl-row ${shootout.iWin ? 'tl-goal-me' : 'tl-goal-opp'}`;
    summaryLine.textContent = shootout.iWin ? rand(ST.win) : rand(ST.loss);
    timelineEl.prepend(summaryLine);
    timelineEl.scrollTop = 0;
  }

  const displayScoreText = formatScoreText(sim.gf, sim.ga) +
    ` (k. ${shootout.myScore}:${shootout.oppScore})`;
  finalizeKnockoutResult(m, opp, shootout.iWin, scoreText, resultClass, displayScoreText);
}

function finalizeKnockoutResult(m, opp, wonMatch, scoreText, resultClass, displayScoreText) {
  document.getElementById('po-score').textContent = displayScoreText || scoreText;
  document.getElementById('po-score').className = `match-score ${resultClass}`;

  m.played = true;
  m.score = scoreText;
  m.winner = wonMatch ? (m.home.isPlayer ? m.home : m.away) : (m.home.isPlayer ? m.away : m.home);

  addHistoryCard(roundNameForCount(getCurrentRound().length), `vs ${opp.label}`, scoreText, resultClass);
  document.getElementById('btn-play-match-hub').style.display = 'none';

  if (wonMatch) {
    if (getCurrentRound().length === 1) {
      document.getElementById('po-commentary').textContent =
        '🏆 MISTRZ TURNIEJU! Pokonałeś wszystkich rywali!';
      document.getElementById('btn-playoff-end').style.display = 'inline-block';
      document.getElementById('btn-playoff-end').textContent = '← MENU';
    } else {
      document.getElementById('btn-next-round').textContent = 'NASTĘPNA RUNDA →';
      document.getElementById('btn-next-round').style.display = 'inline-block';
    }
  } else {
    document.getElementById('btn-playoff-end').style.display = 'inline-block';
    document.getElementById('btn-playoff-end').textContent = '← KONIEC GRY';
  }
}

function nextRound() {
  const round = getCurrentRound();
  const winners = round.map(m => m.winner);
  const newRound = makeMatches(winners);
  autoSimulateRound(newRound);
  state.bracket.push(newRound);
  state.roundIdx++;
  renderOtherResults(newRound);
  goToPlayoffHub();
}
