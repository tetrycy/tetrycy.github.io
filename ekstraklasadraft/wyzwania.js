// ============================================================
// WYZWANIA.JS — silnik trybu WYZWANIA.
// Wczytywany JAKO OSTATNI — po tryby.js, po wszystkich plikach
// pojedynczych wyzwań z folderu WYZWANIA/. Każde wyzwanie to osobny
// plik (np. WYZWANIA/wisla-uefa-0203.js), sam dopisujący się do
// globalnej listy window.WYZWANIA — patrz WYZWANIA/_szablon.js.
// ============================================================

window.WYZWANIA = window.WYZWANIA || []; // zabezpieczenie na wypadek braku jakichkolwiek plików wyzwań

// Znajduje pełny obiekt drużyny (label/overall/roster) na podstawie
// specyfikacji rywala z pliku wyzwania — obsługuje oba źródła.
function resolveOpponentTeam(opponentSpec) {
  if (!opponentSpec) return null;
  if (opponentSpec.source === 'real') {
    const t = TEAMS_DATA.find(tt => tt.club === opponentSpec.club && tt.season === opponentSpec.season);
    if (!t) { console.error('WYZWANIA: nie znaleziono rywala w TEAMS_DATA:', opponentSpec); return null; }
    return teamToBracketObj(t);
  }
  if (opponentSpec.source === 'custom') {
    if (typeof WYZWANIA_TEAMS_DATA === 'undefined') {
      console.error('WYZWANIA: brak pliku wyzwania-druzyny.js (WYZWANIA_TEAMS_DATA nie istnieje).');
      return null;
    }
    const t = WYZWANIA_TEAMS_DATA.find(tt => tt.id === opponentSpec.id);
    if (!t) { console.error('WYZWANIA: nie znaleziono własnej drużyny o id:', opponentSpec.id); return null; }
    // Własne drużyny nie mają pola "season" (jak w TEAMS_DATA) — etykieta to sama nazwa klubu.
    // Nie mają też birthYear — silnik zmęczenia potraktuje ich jako przeciętny wiek (patrz FATIGUE_DEFAULT_AGE w silnik.js).
    const st = t.players.filter(p => p.starting);
    const usePool = st.length >= 11 ? st : t.players;
    const ovr = Math.round(usePool.reduce((a, p) => a + p.overall, 0) / usePool.length);
    const roster = usePool.map(p => ({ name: p.name, pos: p.position, overall: p.overall, birthYear: null, season: null }));
    return { label: t.club, club: t.club, overall: ovr, isPlayer: false, roster };
  }
  return null;
}

function goToChallengesScreen() {
  const listEl = document.getElementById('challenges-list');
  if (WYZWANIA.length === 0) {
    listEl.innerHTML = '<div style="color:var(--gray);">Brak zdefiniowanych wyzwań — dopisz je w wyzwania-dane.js.</div>';
  } else {
    listEl.innerHTML = WYZWANIA.map(ch => `
      <div class="challenge-card">
        <div class="challenge-card-title">${ch.title}</div>
        <div class="challenge-card-desc">${ch.description}</div>
        <button class="btn btn-sm" onclick="goToChallengeTeamChoice('${ch.id}')">▶ ROZPOCZNIJ</button>
      </div>
    `).join('');
  }
  showScreen('screen-challenges');
}

function goToChallengeTeamChoice(challengeId) {
  const def = WYZWANIA.find(c => c.id === challengeId);
  if (!def) return;
  state.pendingChallengeId = challengeId;
  document.getElementById('challenge-team-choice-title').textContent = def.title;
  document.getElementById('challenge-team-choice-club').textContent = `Oryginalna drużyna: ${def.club} ${def.clubSeason}`;
  showScreen('screen-challenge-team-choice');
}

function startChallengeOriginal() {
  const challengeId = state.pendingChallengeId;
  state.pendingChallengeId = null;
  startChallenge(challengeId);
}

function goToChallengeOwnSquad() {
  goToSquadSaves({ type: 'challenge', challengeId: state.pendingChallengeId });
}

function loadSquadForChallenge(saveId) {
  const ctx = state.squadPickerContext;
  state.squadPickerContext = null;
  const challengeId = ctx && ctx.challengeId;
  if (!challengeId) { loadSquadSlot(saveId); return; }
  const entry = getSquadSaves().find(s => s.id === saveId);
  if (!entry) return;
  state.pendingChallengeId = null;
  startChallenge(challengeId, entry);
}

// challengeId: id wyzwania. ownSquadEntry: opcjonalny zapis własnej drużyny
// (z ZAPISY.js) — jeśli podany, gracz gra swoim składem zamiast oryginalnego,
// historycznego składu klubu z tego wyzwania.
function startChallenge(challengeId, ownSquadEntry) {
  const def = WYZWANIA.find(c => c.id === challengeId);
  if (!def) return;
  const t = TEAMS_DATA.find(tt => tt.club === def.club && tt.season === def.clubSeason);
  if (!ownSquadEntry && !t) { alert(`Nie znaleziono w bazie: ${def.club} ${def.clubSeason}`); return; }

  if (def.type === 'group-knockout') {
    if (!def.qualifying && !def.group) {
      alert('To wyzwanie (grupa + puchar) nie ma jeszcze zdefiniowanej fazy grupowej ani kwalifikacji — uzupełnij jego plik w folderze WYZWANIA/.');
      return;
    }
  } else if (!def.rounds || def.rounds.length === 0) {
    alert('To wyzwanie nie ma jeszcze zdefiniowanych rund — uzupełnij jego plik w folderze WYZWANIA/.');
    return;
  }

  const keepSpeed = state.speed || 'extreme';
  const keepStyle = state.commentaryStyle || 'waldemar';

  if (ownSquadEntry) {
    state = {
      squad: ownSquadEntry.squad, coach: ownSquadEntry.coach || null, startingXI: ownSquadEntry.startingXI || null,
      myTeamName: ownSquadEntry.myTeamName || null, myTeamColors: ownSquadEntry.myTeamColors || null, myClub: ownSquadEntry.myClub || null,
      rerolls: 2, currentTeam: null, usedTeams: new Set(), bracket: [], roundIdx: 0, myOverall: 0,
      speed: keepSpeed, commentaryStyle: keepStyle, tournamentPhase: 'knockout', mundial: null, mundialVariant: 'champions',
      fogOfWar: false, fogOfWarApplied: false,
    };
    ensureStartingXI();
    state.myOverall = calcTeamOverall(getStartingXISquad());
  } else {
    state = { squad: {}, rerolls: 2, currentTeam: null, usedTeams: new Set(), bracket: [], roundIdx: 0, myOverall: 0, speed: keepSpeed, commentaryStyle: keepStyle, tournamentPhase: 'knockout', mundial: null, mundialVariant: 'champions', myClub: def.club, fogOfWar: false, fogOfWarApplied: false };
    assignRealTeamToSquad(t);
    ensureStartingXI();
    state.myOverall = calcTeamOverall(getStartingXISquad());
  }

  state.challenge = {
    defId: challengeId,
    // -- wspólne dla dwumeczów (kwalifikacje, runda "rounds", i etapy pucharowe po grupie) --
    phase: def.type === 'group-knockout' ? (def.qualifying ? 'qualifying' : 'group') : 'rounds',
    roundIdx: 0,
    leg: 1,
    myAgg: 0,
    oppAgg: 0,
    leg1MyGoals: 0,
    leg1OppGoals: 0,
    leg1WasHome: null,
    // -- faza grupowa (tylko group-knockout) --
    groupFixtures: null,
    groupMatchIdx: 0,
    groupTable: null,
    // -- rozwidlenie po grupie --
    knockoutPath: null,
    knockoutRoundIdx: 0,
    // -- aktualny mecz --
    currentM: null,
    currentOpp: null,
    currentMyTeam: null,
  };
  state.tournamentPhase = 'challenge';

  goToChallengeRound();
}

// Budujemy 6 meczów fazy grupowej (mecz+rewanż z każdym z 3 rywali), korzystając
// z tego samego generatora terminarza "każdy z każdym", którego używa Tryb Sezonu —
// dla 4 uczestników (Ty + 3 rywale) daje to naturalnie 6 kolejek z Twoim udziałem,
// z rozsądnie rozłożonym dom/wyjazd, tak jak w prawdziwej fazie grupowej.
function initGroupFixtures(def) {
  const myRosterObj = {
    label: state.myClub || state.myTeamName || 'TWOJA DRUŻYNA', isPlayer: true, overall: state.myOverall, club: state.myClub || null,
    roster: Object.values(getStartingXISquad()).map(s => ({ name: s.name, pos: s.pos, overall: s.overall, birthYear: s.birthYear, season: s.season })),
  };
  const opponents = def.group.opponents.map(resolveOpponentTeam);
  if (opponents.some(o => !o)) {
    alert('Brak danych jednego z rywali fazy grupowej — uzupełnij plik wyzwania.');
    return false;
  }
  const teams = [myRosterObj, ...opponents];
  const allRounds = generateRoundRobin(teams);
  const myMatches = allRounds.map(round => round.find(mt => mt.home.isPlayer || mt.away.isPlayer)).filter(Boolean);
  state.challenge.groupFixtures = myMatches;
  state.challenge.groupTable = initSeasonTable(teams);
  return true;
}

function goToChallengeRound() {
  const def = WYZWANIA.find(c => c.id === state.challenge.defId);
  const ch = state.challenge;

  if (def.type === 'group-knockout') {
    if (ch.phase === 'qualifying') {
      displayChallengeRoundInfo(def, def.qualifying);
      return;
    }
    if (ch.phase === 'group') {
      if (!ch.groupFixtures) { if (!initGroupFixtures(def)) return; }
      if (ch.groupMatchIdx >= ch.groupFixtures.length) { resolveGroupStageAndAdvance(def); return; }
      const m = ch.groupFixtures[ch.groupMatchIdx];
      const oppTeam = m.home.isPlayer ? m.away : m.home;
      document.getElementById('challenge-title').textContent = def.title;
      document.getElementById('challenge-round-label').textContent =
        `Faza grupowa — mecz ${ch.groupMatchIdx + 1}/${ch.groupFixtures.length}`;
      document.getElementById('challenge-opponent-preview').textContent = `Rywal: ${oppTeam.label} (OVR ${oppTeam.overall})`;
      document.getElementById('challenge-agg-info').textContent = '';
      document.getElementById('btn-play-challenge-match').disabled = false;
      renderSeasonTableInto('challenge-group-table', sortedSeasonTable(ch.groupTable), 2);
      showScreen('screen-challenge');
      return;
    }
    if (ch.phase === 'knockout') {
      const round = def.knockoutPaths[ch.knockoutPath][ch.knockoutRoundIdx];
      if (!round) { finishChallenge(true); return; }
      displayChallengeRoundInfo(def, round);
      return;
    }
  }

  // ── Zwykła lista rund (np. Wisła — bez fazy grupowej) ──
  const round = def.rounds[ch.roundIdx];
  if (!round) { finishChallenge(true); return; }
  displayChallengeRoundInfo(def, round);
}

function displayChallengeRoundInfo(def, round) {
  const legsInRound = round.legs || 2;
  const oppTeam = resolveOpponentTeam(round.opponent);
  document.getElementById('challenge-title').textContent = def.title;
  document.getElementById('challenge-round-label').textContent = legsInRound === 1
    ? round.name
    : state.challenge.leg === 3
      ? `${round.name} — mecz dodatkowy (remis na dwumeczu, neutralny teren)`
      : `${round.name} — mecz ${state.challenge.leg}/2`;
  document.getElementById('challenge-opponent-preview').textContent = oppTeam
    ? `Rywal: ${oppTeam.label} (OVR ${oppTeam.overall})`
    : '⚠ Brak danych rywala dla tej rundy — uzupełnij plik wyzwania w folderze WYZWANIA/.';
  document.getElementById('challenge-agg-info').textContent =
    (legsInRound === 2 && state.challenge.leg >= 2) ? `Po ${state.challenge.leg === 3 ? 'dwumeczu' : 'pierwszym meczu'}: ${state.challenge.myAgg} : ${state.challenge.oppAgg}` : '';
  document.getElementById('btn-play-challenge-match').disabled = !oppTeam;
  document.getElementById('challenge-group-table').innerHTML = '';
  showScreen('screen-challenge');
}

function setupChallengeMatch() {
  const def = WYZWANIA.find(c => c.id === state.challenge.defId);
  const ch = state.challenge;

  if (def.type === 'group-knockout' && ch.phase === 'group') {
    const m = ch.groupFixtures[ch.groupMatchIdx];
    const oppTeam = m.home.isPlayer ? m.away : m.home;
    const myTeamObj = m.home.isPlayer ? m.home : m.away;
    ch.currentM = m; ch.currentOpp = oppTeam; ch.currentMyTeam = myTeamObj;

    const label = `${def.title} • Faza grupowa (mecz ${ch.groupMatchIdx + 1}/${ch.groupFixtures.length}) vs ${oppTeam.label}`;
    document.getElementById('playoff-round-label').textContent = label;
    document.getElementById('playoff-round-title').textContent = label;
    document.getElementById('playoff-history-title').textContent = 'WYZWANIE — FAZA GRUPOWA';
    document.getElementById('groups-panel').style.display = 'none';
    resetMatchScreen(oppTeam, myTeamObj, m.home.isPlayer ? 'home' : 'away');
    showScreen('screen-playoff');
    return;
  }

  // Kwalifikacje, etapy pucharowe po grupie, albo zwykła lista rund — ta sama logika dwumeczu.
  const round = def.type === 'group-knockout'
    ? (ch.phase === 'qualifying' ? def.qualifying : def.knockoutPaths[ch.knockoutPath][ch.knockoutRoundIdx])
    : def.rounds[ch.roundIdx];
  if (!round) return;

  const legsInRound = round.legs || 2;
  const oppTeam = resolveOpponentTeam(round.opponent);
  if (!oppTeam) return;

  const isFirstLegHome = round.firstLegHome !== false;
  const iAmHomeThisLeg = ch.leg === 3 ? true : (legsInRound === 1 ? isFirstLegHome : (ch.leg === 1 ? isFirstLegHome : !isFirstLegHome));

  const myRosterObj = {
    label: state.myClub || state.myTeamName || 'TWOJA DRUŻYNA', isPlayer: true, overall: state.myOverall, club: state.myClub || null,
    roster: Object.values(getStartingXISquad()).map(s => ({ name: s.name, pos: s.pos, overall: s.overall, birthYear: s.birthYear, season: s.season })),
  };
  const m = iAmHomeThisLeg ? { home: myRosterObj, away: oppTeam } : { home: oppTeam, away: myRosterObj };

  ch.currentM = m; ch.currentOpp = oppTeam; ch.currentMyTeam = myRosterObj;

  const label = legsInRound === 1
    ? `${def.title} • ${round.name}`
    : ch.leg === 3
      ? `${def.title} • ${round.name} (mecz dodatkowy, neutralny teren)`
      : `${def.title} • ${round.name} (mecz ${ch.leg}/2)`;
  document.getElementById('playoff-round-label').textContent = label;
  document.getElementById('playoff-round-title').textContent = label;
  document.getElementById('playoff-history-title').textContent = 'WYZWANIE';
  document.getElementById('groups-panel').style.display = 'none';
  const venue = (ch.leg === 3 || round.neutral) ? 'neutral' : (iAmHomeThisLeg ? 'home' : 'away');
  resetMatchScreen(oppTeam, myRosterObj, venue);
  showScreen('screen-playoff');
}

// Odsłania serię karnych PO KOLEI (ta sama dramaturgia co w pucharach), a po
// jej zakończeniu wywołuje onDecided(true/false) z wynikiem serii.
function runChallengeShootout(opp, scoreTextBase, introText, ST, onDecided) {
  const timelineEl = document.getElementById('po-timeline');
  const introLine = document.createElement('div');
  introLine.className = 'tl-row tl-marker';
  introLine.textContent = introText;
  timelineEl.prepend(introLine);
  timelineEl.scrollTop = 0;

  const myRoster = Object.values(getStartingXISquad()).map(s => ({ name: s.name, pos: s.pos, overall: s.overall, birthYear: s.birthYear, season: s.season }));
  const shootout = simulatePenaltyShootout(myRoster, opp.roster, opp.label);

  let kickIdx = 0;
  const STEP_MS = SPEED_MS[state.speed] || SPEED_MS.normal;
  const shootoutTimer = setInterval(() => {
    if (kickIdx >= shootout.timeline.length) {
      clearInterval(shootoutTimer);
      const summaryLine = document.createElement('div');
      summaryLine.className = `tl-row ${shootout.iWin ? 'tl-goal-me' : 'tl-goal-opp'}`;
      summaryLine.textContent = shootout.iWin ? rand(ST.win) : rand(ST.loss);
      timelineEl.prepend(summaryLine);
      timelineEl.scrollTop = 0;
      document.getElementById('po-score').textContent =
        scoreTextBase + (shootout.iWin ? ` (k. ${shootout.myScore}:${shootout.oppScore})` : ` (k. ${shootout.oppScore}:${shootout.myScore})`);
      onDecided(shootout.iWin);
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
}

function finishChallengeMatch(sim, m, opp) {
  const def = WYZWANIA.find(c => c.id === state.challenge.defId);
  const ch = state.challenge;

  if (def.type === 'group-knockout' && ch.phase === 'group') {
    finishChallengeGroupMatch(sim, m, opp, def);
    return;
  }

  const round = def.type === 'group-knockout'
    ? (ch.phase === 'qualifying' ? def.qualifying : def.knockoutPaths[ch.knockoutPath][ch.knockoutRoundIdx])
    : def.rounds[ch.roundIdx];

  const onDecided = def.type === 'group-knockout'
    ? (ch.phase === 'qualifying' ? (adv => resolveQualifyingResult(def, adv)) : (adv => resolveKnockoutPathResult(def, adv)))
    : resolveChallengeTie;

  finishTwoLeggedRoundMatch(sim, m, opp, round, onDecided);
}

// Wspólna logika ROZSTRZYGANIA dwumeczu (albo jednego meczu) — używana przez
// kwalifikacje, etapy pucharowe po grupie, i zwykłą listę rund (Wisła-style).
function finishTwoLeggedRoundMatch(sim, m, opp, round, onDecided) {
  const ch = state.challenge;
  const legsInRound = round.legs || 2;
  const iWasHomeThisLeg = m.home.isPlayer;

  const scoreText = `${sim.gf} : ${sim.ga}`;
  const resultClass = sim.result === 'W' ? 'win' : sim.result === 'D' ? 'draw' : 'loss';
  const ST = getStyle();
  document.getElementById('po-commentary').textContent =
    sim.result === 'W' ? rand(ST.win) : sim.result === 'D' ? rand(ST.draw) : rand(ST.loss);
  document.getElementById('po-score').textContent = formatScoreText(sim.gf, sim.ga);
  document.getElementById('po-score').className = `match-score ${resultClass}`;
  document.getElementById('btn-skip-match').style.display = 'none';
  document.getElementById('btn-pause-match').style.display = 'none';

  if (legsInRound === 1) {
    addHistoryCard('WYZWANIE', `${round.name} vs ${opp.label}`, scoreText, resultClass);
    if (sim.result !== 'D') { onDecided(sim.result === 'W'); }
    else { runChallengeShootout(opp, scoreText, `Remis ${scoreText} — decydują rzuty karne.`, ST, onDecided); }
    return;
  }

  // ── MECZ DODATKOWY (leg 3) — tylko dla rund z tiebreak: 'replay' ──
  if (ch.leg === 3) {
    addHistoryCard('WYZWANIE', `${round.name} — mecz dodatkowy vs ${opp.label}`, scoreText, resultClass);
    const timelineEl = document.getElementById('po-timeline');
    if (sim.result !== 'D') {
      onDecided(sim.result === 'W');
      return;
    }
    // Remis nawet w meczu dodatkowym — o awansie decyduje rzut monetą.
    const coinWin = Math.random() < 0.5;
    const line = document.createElement('div');
    line.className = 'tl-row tl-marker';
    line.textContent = `Remis nawet w meczu dodatkowym (${scoreText}) — o awansie decyduje rzut monetą... ${coinWin ? 'WYGRYWASZ!' : 'przegrywasz.'}`;
    timelineEl.prepend(line);
    timelineEl.scrollTop = 0;
    onDecided(coinWin);
    return;
  }

  addHistoryCard('WYZWANIE', `${round.name} — mecz ${ch.leg} vs ${opp.label}`, scoreText, resultClass);

  if (ch.leg === 1) {
    ch.leg1MyGoals = sim.gf;
    ch.leg1OppGoals = sim.ga;
    ch.leg1WasHome = iWasHomeThisLeg;
    ch.myAgg = sim.gf;
    ch.oppAgg = sim.ga;
    ch.leg = 2;
    document.getElementById('btn-next-round').textContent = 'REWANŻ →';
    document.getElementById('btn-next-round').style.display = 'inline-block';
    document.getElementById('btn-next-round').onclick = () => { goToChallengeRound(); };
    return;
  }

  ch.myAgg += sim.gf;
  ch.oppAgg += sim.ga;

  if (ch.myAgg !== ch.oppAgg) { onDecided(ch.myAgg > ch.oppAgg); return; }

  // ── Remis na agregacie po dwóch meczach ──
  if (round.tiebreak === 'replay') {
    // Zasada tego wyzwania: trzeci, decydujący mecz na neutralnym terenie.
    ch.leg = 3;
    const timelineEl = document.getElementById('po-timeline');
    const line = document.createElement('div');
    line.className = 'tl-row tl-marker';
    line.textContent = `Remis na dwumeczu ${ch.myAgg}:${ch.oppAgg} — o awansie zadecyduje trzeci mecz na neutralnym terenie.`;
    timelineEl.prepend(line);
    timelineEl.scrollTop = 0;
    document.getElementById('btn-next-round').textContent = 'MECZ DODATKOWY →';
    document.getElementById('btn-next-round').style.display = 'inline-block';
    document.getElementById('btn-next-round').onclick = () => { goToChallengeRound(); };
    return;
  }

  // ── Standardowa zasada goli na wyjeździe (domyślne zachowanie) ──
  const myAwayGoals = ch.leg1WasHome ? sim.gf : ch.leg1MyGoals;
  const oppAwayGoals = ch.leg1WasHome ? ch.leg1OppGoals : sim.ga;

  if (myAwayGoals !== oppAwayGoals) {
    const timelineEl = document.getElementById('po-timeline');
    const line = document.createElement('div');
    line.className = 'tl-row tl-marker';
    line.textContent = `Remis na dwumeczu ${ch.myAgg}:${ch.oppAgg} — decydują bramki na wyjeździe (${myAwayGoals}:${oppAwayGoals}).`;
    timelineEl.prepend(line);
    timelineEl.scrollTop = 0;
    onDecided(myAwayGoals > oppAwayGoals);
    return;
  }

  const aggText = `${ch.myAgg} : ${ch.oppAgg}`;
  runChallengeShootout(opp, aggText, `Dwumecz zakończony remisem ${aggText} (równo też na wyjeździe) — decydują rzuty karne.`, ST, onDecided);
}

function finishChallengeGroupMatch(sim, m, opp, def) {
  const ch = state.challenge;
  const scoreText = `${sim.gf} : ${sim.ga}`;
  const resultClass = sim.result === 'W' ? 'win' : sim.result === 'D' ? 'draw' : 'loss';
  const ST = getStyle();
  document.getElementById('po-commentary').textContent =
    sim.result === 'W' ? rand(ST.win) : sim.result === 'D' ? rand(ST.draw) : rand(ST.loss);
  document.getElementById('po-score').textContent = formatScoreText(sim.gf, sim.ga);
  document.getElementById('po-score').className = `match-score ${resultClass}`;
  document.getElementById('btn-skip-match').style.display = 'none';
  document.getElementById('btn-pause-match').style.display = 'none';

  const isHome = m.home.isPlayer;
  const homeLabel = isHome ? 'TWOJA DRUŻYNA' : opp.label;
  const awayLabel = isHome ? opp.label : 'TWOJA DRUŻYNA';
  const homeGoals = isHome ? sim.gf : sim.ga;
  const awayGoals = isHome ? sim.ga : sim.gf;
  updateSeasonTable(ch.groupTable, homeLabel, awayLabel, homeGoals, awayGoals);

  addHistoryCard('WYZWANIE — GRUPA', `mecz ${ch.groupMatchIdx + 1}/${ch.groupFixtures.length} vs ${opp.label}`, scoreText, resultClass);

  ch.groupMatchIdx++;
  const isLastGroupMatch = ch.groupMatchIdx >= ch.groupFixtures.length;
  document.getElementById('btn-next-round').textContent = isLastGroupMatch ? 'ZOBACZ WYNIK GRUPY →' : 'NASTĘPNY MECZ GRUPOWY →';
  document.getElementById('btn-next-round').style.display = 'inline-block';
  document.getElementById('btn-next-round').onclick = () => { goToChallengeRound(); };
}

function resolveGroupStageAndAdvance(def) {
  const ch = state.challenge;
  const table = sortedSeasonTable(ch.groupTable);
  const myPos = table.findIndex(r => r.label === 'TWOJA DRUŻYNA') + 1;

  if (myPos === 1 && def.knockoutPaths && def.knockoutPaths.winner) {
    ch.knockoutPath = 'winner';
  } else if (myPos === 2 && def.knockoutPaths && def.knockoutPaths.runnerUp) {
    ch.knockoutPath = 'runnerUp';
  } else {
    document.getElementById('challenge-end-summary').textContent =
      `Kończysz fazę grupową na ${myPos}. miejscu — to za mało, żeby awansować dalej. Koniec przygody w tym wyzwaniu.`;
    renderSeasonTableInto('challenge-end-table', table, 2);
    showScreen('screen-challenge-end');
    return;
  }

  ch.phase = 'knockout';
  ch.knockoutRoundIdx = 0;
  ch.leg = 1; ch.myAgg = 0; ch.oppAgg = 0;
  document.getElementById('po-commentary').textContent =
    `Kończysz fazę grupową na ${myPos}. miejscu! ` + (myPos === 1 ? 'Wygrywasz grupę!' : 'Awansujesz z 2. miejsca!');
  goToChallengeRound();
}

function resolveQualifyingResult(def, advanced) {
  const ch = state.challenge;
  if (advanced) {
    ch.phase = def.group ? 'group' : 'rounds';
    ch.leg = 1; ch.myAgg = 0; ch.oppAgg = 0;
    document.getElementById('po-commentary').textContent += ' Awansujesz z kwalifikacji!';
    document.getElementById('btn-next-round').textContent = 'DALEJ →';
    document.getElementById('btn-next-round').style.display = 'inline-block';
    document.getElementById('btn-next-round').onclick = () => { goToChallengeRound(); };
  } else {
    document.getElementById('btn-next-round').style.display = 'none';
    finishChallenge(false);
  }
}

function resolveKnockoutPathResult(def, advanced) {
  const ch = state.challenge;
  if (advanced) {
    ch.knockoutRoundIdx++;
    ch.leg = 1; ch.myAgg = 0; ch.oppAgg = 0;
    document.getElementById('po-commentary').textContent += ' Awansujesz do kolejnej rundy!';
    document.getElementById('btn-next-round').textContent = 'NASTĘPNA RUNDA →';
    document.getElementById('btn-next-round').style.display = 'inline-block';
    document.getElementById('btn-next-round').onclick = () => { goToChallengeRound(); };
  } else {
    document.getElementById('btn-next-round').style.display = 'none';
    finishChallenge(false);
  }
}

function resolveChallengeTie(advanced) {
  const ch = state.challenge;
  if (advanced) {
    ch.roundIdx++;
    ch.leg = 1;
    ch.myAgg = 0;
    ch.oppAgg = 0;
    document.getElementById('po-commentary').textContent += ' Awansujesz do kolejnej rundy!';
    document.getElementById('btn-next-round').textContent = 'NASTĘPNA RUNDA →';
    document.getElementById('btn-next-round').style.display = 'inline-block';
    document.getElementById('btn-next-round').onclick = () => { goToChallengeRound(); };
  } else {
    document.getElementById('btn-next-round').style.display = 'none';
    finishChallenge(false);
  }
}

function finishChallenge(success) {
  const def = WYZWANIA.find(c => c.id === state.challenge.defId);
  document.getElementById('challenge-end-summary').textContent = success
    ? `🏆 Wyzwanie ukończone! Przeprowadziłeś ${def.club} przez wszystkie rundy.`
    : `Koniec przygody — odpadasz (${state.challenge.myAgg}:${state.challenge.oppAgg}).`;
  document.getElementById('challenge-end-table').innerHTML = '';
  showScreen('screen-challenge-end');
}

const _origGetCurrentMatchContextC = getCurrentMatchContext;
getCurrentMatchContext = function () {
  if (state.tournamentPhase === 'challenge') {
    return { m: state.challenge.currentM, opp: state.challenge.currentOpp, myTeam: state.challenge.currentMyTeam };
  }
  return _origGetCurrentMatchContextC();
};

const _origFinishMatchC = finishMatch;
finishMatch = function (sim, m, opp) {
  if (state.tournamentPhase === 'challenge') {
    document.getElementById('btn-skip-match').style.display = 'none';
    document.getElementById('btn-pause-match').style.display = 'none';
    finishChallengeMatch(sim, m, opp);
    return;
  }
  _origFinishMatchC(sim, m, opp);
};
