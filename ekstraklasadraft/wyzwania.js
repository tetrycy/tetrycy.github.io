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
  // Źródło 'resolved' — gotowy obiekt drużyny (label/overall/roster), budowany
  // dynamicznie w trakcie gry (np. rywal wyłoniony z tabeli fazy ligowej
  // wyzwania typu 'swiss') — nie z pliku danych.
  if (opponentSpec.source === 'resolved') return opponentSpec.team;
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
    const ovr = calcTeamOverall(usePool.map(p => ({ pos: p.position, overall: p.overall })));
    const roster = usePool.map(p => ({ name: p.name, pos: p.position, overall: p.overall, birthYear: null, season: null }));
    return { id: t.id, label: t.club, club: t.club, overall: ovr, isPlayer: false, roster, coach: t.coach || null };
  }
  return null;
}

// Skrót z ekranu startowego ("🏆 LIGA MISTRZÓW 26/27") — pomija ogólną
// listę wszystkich wyzwań, pokazuje od razu tylko te dwa (Lech/Górnik),
// reużywając dokładnie ten sam ekran/logikę co zwykłe Wyzwania.
function goToChampionsLeagueQuickStart() {
  const listEl = document.getElementById('challenges-list');
  const clChallenges = WYZWANIA.filter(ch => ch.id === 'lm-2526-lech' || ch.id === 'lm-2526-gornik');
  listEl.innerHTML = clChallenges.length ? clChallenges.map(ch => `
    <div class="challenge-card">
      <div class="challenge-card-title">${ch.title}</div>
      <div class="challenge-card-desc">${ch.description}</div>
      <button class="btn btn-sm" onclick="goToChallengeTeamChoice('${ch.id}')">▶ ROZPOCZNIJ</button>
    </div>
  `).join('') : '<div style="color:var(--gray);">Liga Mistrzów 26/27 nie jest jeszcze zdefiniowana.</div>';
  showScreen('screen-challenges');
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
  } else if (def.type === 'swiss') {
    const hasPots = def.swiss && Array.isArray(def.swiss.pots) && def.swiss.pots.length === 4 && def.swiss.pots.every(p => Array.isArray(p) && p.length);
    const hasTeams = def.swiss && Array.isArray(def.swiss.teams) && def.swiss.teams.length;
    if (!hasPots && !hasTeams) {
      alert('To wyzwanie (system szwajcarski) nie ma zdefiniowanej fazy ligowej (ani def.swiss.pots, ani def.swiss.teams) — uzupełnij jego plik w folderze WYZWANIA/.');
      return;
    }
  } else if (!def.rounds || def.rounds.length === 0) {
    alert('To wyzwanie nie ma jeszcze zdefiniowanych rund — uzupełnij jego plik w folderze WYZWANIA/.');
    return;
  }

  const keepSpeed = state.speed || 'extreme';
  const keepStyle = state.commentaryStyle || 'waldemar';
  const keepSettings = state.settings || { otherMatchesEngine: 'full' };

  if (ownSquadEntry) {
    state = {
      squad: ownSquadEntry.squad, coach: ownSquadEntry.coach || null, startingXI: ownSquadEntry.startingXI || null,
      myTeamName: ownSquadEntry.myTeamName || null, myTeamColors: ownSquadEntry.myTeamColors || null, myClub: ownSquadEntry.myClub || null,
      rerolls: 2, currentTeam: null, usedTeams: new Set(), bracket: [], roundIdx: 0, myOverall: 0,
      speed: keepSpeed, commentaryStyle: keepStyle, tournamentPhase: 'knockout', mundial: null, mundialVariant: 'champions',
      fogOfWar: false, fogOfWarApplied: false, settings: keepSettings,
    };
    ensureStartingXI();
    state.myOverall = calcTeamOverall(getStartingXISquad());
  } else {
    state = { squad: {}, rerolls: 2, currentTeam: null, usedTeams: new Set(), bracket: [], roundIdx: 0, myOverall: 0, speed: keepSpeed, commentaryStyle: keepStyle, tournamentPhase: 'knockout', mundial: null, mundialVariant: 'champions', myClub: def.club, fogOfWar: false, fogOfWarApplied: false, settings: keepSettings };
    assignRealTeamToSquad(t);
    ensureStartingXI();
    state.myOverall = calcTeamOverall(getStartingXISquad());
  }

  state.challenge = {
    defId: challengeId,
    // -- wspólne dla dwumeczów (kwalifikacje, runda "rounds", i etapy pucharowe po grupie) --
    phase: def.type === 'group-knockout' ? (def.qualifying ? 'qualifying' : 'group')
      : def.type === 'swiss' ? (def.qualifying && def.qualifying.length ? 'qualifying' : 'swiss')
      : 'rounds',
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
    // -- faza ligowa systemem szwajcarskim (tylko type: 'swiss') --
    swissTeams: null,      // pełne obiekty 36 uczestników (Ty + rywale)
    swissRounds: null,     // pierwsze N kolejek round-robina — Twoje mecze + tło
    swissMatchIdx: 0,
    swissTable: null,
    koTeams: null,         // [{label, seed}] — drabinka po fazie ligowej
    dynamicRound: null,    // bieżąca runda pucharowa/barażowa budowana w locie
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
    roster: buildMyMatchRoster(),
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
  if (!def) {
    alert('Nie można wznowić wyzwania — jego plik definicji nie jest wczytany (sprawdź sekcję WYZWANIA/ w index.html).');
    showScreen('screen-title');
    return;
  }
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
      document.getElementById('challenge-opponent-preview').textContent = `Rywal: ${oppTeam.label} (OVR ${calcTeamOverall(oppTeam.roster)})`;
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

  if (def.type === 'swiss') {
    if (ch.phase === 'qualifying') {
      const qRound = swissQualRound(def, ch);
      if (!qRound) { ch.phase = 'swissDraw'; goToChallengeRound(); return; }
      displayChallengeRoundInfo(def, qRound);
      return;
    }
    if (ch.phase === 'swissDraw') { goToSwissDrawScreen(def); return; }
    if (ch.phase === 'swiss') { goSwissLeagueScreen(def); return; }
    if (ch.phase === 'swissPlayoff' || ch.phase === 'swissKnockout') { goSwissKnockoutRound(def); return; }
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
    ? `Rywal: ${oppTeam.label} (OVR ${calcTeamOverall(oppTeam.roster)})`
    : '⚠ Brak danych rywala dla tej rundy — uzupełnij plik wyzwania w folderze WYZWANIA/.';
  document.getElementById('challenge-agg-info').textContent =
    (legsInRound === 2 && state.challenge.leg >= 2) ? `Po ${state.challenge.leg === 3 ? 'dwumeczu' : 'pierwszym meczu'}: ${state.challenge.myAgg} : ${state.challenge.oppAgg}` : '';
  document.getElementById('btn-play-challenge-match').disabled = !oppTeam;
  document.getElementById('btn-play-challenge-match').textContent = '▶ ROZEGRAJ MECZ';
  document.getElementById('btn-play-challenge-match').onclick = () => setupChallengeMatch();
  const swissDrawBtn = document.getElementById('btn-toggle-swiss-draw');
  if (swissDrawBtn) swissDrawBtn.style.display = state.challenge.swissPots ? 'inline-block' : 'none';
  const drawEl = document.getElementById('challenge-draw-reveal');
  if (drawEl) drawEl.style.display = 'none';
  document.getElementById('challenge-group-table').innerHTML = '';
  showScreen('screen-challenge');
}

function setupChallengeMatch() {
  const def = WYZWANIA.find(c => c.id === state.challenge.defId);
  const ch = state.challenge;

  if (def.type === 'swiss' && ch.phase === 'swiss') {
    const round = ch.swissRounds[ch.swissMatchIdx];
    const m = round.find(mt => mt.home.isPlayer || mt.away.isPlayer);
    const oppTeam = m.home.isPlayer ? m.away : m.home;
    const myTeamObj = m.home.isPlayer ? m.home : m.away;
    ch.currentM = m; ch.currentOpp = oppTeam; ch.currentMyTeam = myTeamObj;

    const label = `${def.title} • Faza ligowa (kolejka ${ch.swissMatchIdx + 1}/${ch.swissRounds.length}) vs ${oppTeam.label}`;
    document.getElementById('playoff-round-label').textContent = label;
    document.getElementById('playoff-round-title').textContent = label;
    document.getElementById('playoff-history-title').textContent = 'WYZWANIE — FAZA LIGOWA';
    document.getElementById('groups-panel').style.display = 'none';
    state.currentMatchNeedsWinner = false; // faza ligowa - remis to normalny, ważny wynik
    resetMatchScreen(oppTeam, myTeamObj, m.home.isPlayer ? 'home' : 'away');
    return;
  }

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
    state.currentMatchNeedsWinner = false; // faza grupowa - remis to normalny, ważny wynik
    resetMatchScreen(oppTeam, myTeamObj, m.home.isPlayer ? 'home' : 'away');
    return;
  }

  // Kwalifikacje, etapy pucharowe po grupie, albo zwykła lista rund — ta sama logika dwumeczu.
  const round = def.type === 'group-knockout'
    ? (ch.phase === 'qualifying' ? def.qualifying : def.knockoutPaths[ch.knockoutPath][ch.knockoutRoundIdx])
    : def.type === 'swiss'
      ? (ch.phase === 'qualifying' ? swissQualRound(def, ch) : ch.dynamicRound)
      : def.rounds[ch.roundIdx];
  if (!round) return;

  const legsInRound = round.legs || 2;
  const oppTeam = resolveOpponentTeam(round.opponent);
  if (!oppTeam) return;

  const isFirstLegHome = round.firstLegHome !== false;
  const iAmHomeThisLeg = ch.leg === 3 ? true : (legsInRound === 1 ? isFirstLegHome : (ch.leg === 1 ? isFirstLegHome : !isFirstLegHome));

  const myRosterObj = {
    label: state.myClub || state.myTeamName || 'TWOJA DRUŻYNA', isPlayer: true, overall: state.myOverall, club: state.myClub || null,
    roster: buildMyMatchRoster(),
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
  // Dogrywka na żywo: mecz jednorundowy i mecz dodatkowy (leg 3) zawsze
  // potrzebują zwycięzcy wprost; leg 1 dwumeczu — remis jak najbardziej
  // dozwolony (agregat jeszcze się nie domyka); leg 2 — potrzebny zwycięzca,
  // ale liczy się REMISOWANY AGREGAT (offset z leg 1), nie sam ten mecz.
  // Wyjątek: tiebreak:'replay' (historyczne puchary) — tam remis na agregacie
  // rozstrzyga trzeci mecz, nie dogrywka, więc leg 2 tych rund NIE dostaje ET.
  if (legsInRound === 1 || ch.leg === 3) state.currentMatchNeedsWinner = true;
  else if (ch.leg === 2 && round.tiebreak !== 'replay') state.currentMatchNeedsWinner = { myAggOffset: ch.myAgg, oppAggOffset: ch.oppAgg };
  else state.currentMatchNeedsWinner = false;
  resetMatchScreen(oppTeam, myRosterObj, venue);
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

  const myRoster = buildMyMatchRoster();
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
        scoreTextBase + ` (k. ${shootout.myScore}:${shootout.oppScore})`;
      document.getElementById('po-score').className = `match-score ${shootout.iWin ? 'win' : 'loss'}`;
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

  if (def.type === 'swiss') {
    if (ch.phase === 'swiss') { finishSwissLeagueMatch(sim, m, opp, def); return; }
    const round = ch.phase === 'qualifying' ? swissQualRound(def, ch) : ch.dynamicRound;
    const onDecided = ch.phase === 'qualifying'
      ? (adv => resolveSwissQualifying(def, adv))
      : (adv => resolveSwissKnockoutResult(def, adv));
    finishTwoLeggedRoundMatch(sim, m, opp, round, onDecided);
    return;
  }

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
    document.getElementById('challenge-btn-next-round').textContent = 'REWANŻ →';
    document.getElementById('challenge-btn-next-round').style.display = 'inline-block';
    document.getElementById('challenge-btn-next-round').onclick = () => { goToChallengeRound(); };
    return;
  }

  ch.myAgg += sim.gf;
  ch.oppAgg += sim.ga;

  if (ch.myAgg !== ch.oppAgg) { onDecided(ch.myAgg > ch.oppAgg); return; }

  // ── Remis na agregacie po dwóch meczach ──
  if (round.tiebreak === 'replay') {
    // Zasada TEGO konkretnego (historycznego) wyzwania: trzeci, decydujący
    // mecz na neutralnym terenie — tak grano przed erą dogrywek w Europie.
    ch.leg = 3;
    const timelineEl = document.getElementById('po-timeline');
    const line = document.createElement('div');
    line.className = 'tl-row tl-marker';
    line.textContent = `Remis na dwumeczu ${ch.myAgg}:${ch.oppAgg} — o awansie zadecyduje trzeci mecz na neutralnym terenie.`;
    timelineEl.prepend(line);
    timelineEl.scrollTop = 0;
    document.getElementById('challenge-btn-next-round').textContent = 'MECZ DODATKOWY →';
    document.getElementById('challenge-btn-next-round').style.display = 'inline-block';
    document.getElementById('challenge-btn-next-round').onclick = () => { goToChallengeRound(); };
    return;
  }

  // ── Domyślna, WSPÓŁCZESNA zasada (UEFA zniosła gole na wyjeździe we
  // wszystkich rozgrywkach od sezonu 2021/22): remis na dwumeczu → dogrywka,
  // a jeśli dalej remis → rzuty karne. Dogrywka jest ROZGRYWANA NA ŻYWO —
  // sim.gf/sim.ga (użyte wyżej do ch.myAgg/ch.oppAgg) JUŻ ją zawierają, bo
  // silnik dogrywa ją sam, w tym samym meczu (patrz needsWinner w
  // setupChallengeMatch / simulateMatchV2Live). Jeśli agregat WCIĄŻ jest
  // remisowy mimo to — dogrywka się odbyła i nie rozstrzygnęła niczego —
  // od razu karne, bez drugiego, teraz zbędnego rozstrzygnięcia.
  if (ch.myAgg !== ch.oppAgg) { onDecided(ch.myAgg > ch.oppAgg); return; }

  const aggText = `${ch.myAgg} : ${ch.oppAgg}`;
  runChallengeShootout(opp, aggText, `Remis nawet po dogrywce (${aggText}) — decydują rzuty karne.`, ST, onDecided);
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
  document.getElementById('challenge-btn-next-round').textContent = isLastGroupMatch ? 'ZOBACZ WYNIK GRUPY →' : 'NASTĘPNY MECZ GRUPOWY →';
  document.getElementById('challenge-btn-next-round').style.display = 'inline-block';
  document.getElementById('challenge-btn-next-round').onclick = () => { goToChallengeRound(); };
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
    // Odświeżam od razu — dotąd ekran pokazywał starą rundę/rywala, aż do
    // dodatkowego kliknięcia, co wyglądało jak "zawieszenie" na Aarhus GF.
    goToChallengeRound();
  } else {
    document.getElementById('challenge-btn-next-round').style.display = 'none';
    finishChallenge(false);
  }
}

function resolveKnockoutPathResult(def, advanced) {
  const ch = state.challenge;
  if (advanced) {
    ch.knockoutRoundIdx++;
    ch.leg = 1; ch.myAgg = 0; ch.oppAgg = 0;
    document.getElementById('po-commentary').textContent += ' Awansujesz do kolejnej rundy!';
    goToChallengeRound();
  } else {
    document.getElementById('challenge-btn-next-round').style.display = 'none';
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
    goToChallengeRound();
  } else {
    document.getElementById('challenge-btn-next-round').style.display = 'none';
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

// ============================================================
// SYSTEM SZWAJCARSKI (type: 'swiss') — jak Liga Mistrzów od 2024/25:
// wspólna tabela wszystkich uczestników, każdy gra tylko N (domyślnie 8)
// meczów z N różnymi rywalami. Miejsca 1-8 → prosto do 1/8 finału,
// 9-24 → dwumeczowy baraż o 1/8 (9. z 24., 10. z 23., ...), 25+ →
// odpadnięcie. Dalej klasyczna drabinka dwumeczów aż do pojedynczego
// finału na neutralnym terenie.
//
// PAROWANIE — świadomy kompromis (bez koszyków siły): generujemy pełny
// terminarz "każdy z każdym" (generateRoundRobin, ten sam co Tryb Sezonu)
// i bierzemy tylko pierwsze N kolejek. Matematyka round-robina gwarantuje:
// każda drużyna gra dokładnie N meczów, każdy z INNYM rywalem, z rozsądnym
// podziałem dom/wyjazd — czyli strukturę szwajcarską. Mecze bez Twojego
// udziału rozstrzyga w tle simulateMatch (jak w Trybie Sezonu).
// ============================================================

// Runda eliminacji w wyzwaniu 'swiss' może zamiast stałego rywala (opponent)
// mieć PULĘ rywali (opponentPool: [spec, spec, ...]) — wtedy rywal jest
// losowany raz, przy pierwszym wejściu w tę rundę, z pominięciem rywali już
// wylosowanych we wcześniejszych rundach. Wynik losowania zapisuje się w
// state.challenge.qualifyingDraws, więc przeżywa rewanż i zapis/wczytanie gry.
function swissQualRound(def, ch) {
  const base = def.qualifying[ch.roundIdx];
  if (!base || base.opponent || !base.opponentPool) return base;
  ch.qualifyingDraws = ch.qualifyingDraws || {};
  if (!ch.qualifyingDraws[ch.roundIdx]) {
    const usedKeys = Object.values(ch.qualifyingDraws).map(s => JSON.stringify(s));
    const available = base.opponentPool.filter(s => !usedKeys.includes(JSON.stringify(s)));
    ch.qualifyingDraws[ch.roundIdx] = rand(available.length ? available : base.opponentPool);
  }
  return Object.assign({}, base, { opponent: ch.qualifyingDraws[ch.roundIdx] });
}

function swissMyTeamObj() {
  return {
    label: state.myClub || state.myTeamName || 'TWOJA DRUŻYNA', isPlayer: true, overall: state.myOverall, club: state.myClub || null,
    roster: buildMyMatchRoster(),
  };
}

// Buduje pary fazy ligowej WEDŁUG KOSZYKÓW (jak realna Liga Mistrzów):
// każda drużyna gra dokładnie 2 mecze z KAŻDYM z 4 koszyków (włącznie z
// własnym) = 8 meczów, 4 u siebie / 4 na wyjeździe — gwarantowane samą
// konstrukcją, bez losowego dobijania/powtarzania prób:
//   - w obrębie koszyka: cykl na przetasowanej kolejności (każdy dostaje
//     1 mecz u siebie + 1 na wyjeździe z 2 różnymi kolegami z koszyka),
//   - między dwoma różnymi koszykami: dwustronny "krąg" (każdy z koszyka A
//     dostaje 1 mecz u siebie + 1 na wyjeździe z 2 różnymi zespołami z B,
//     i symetrycznie odwrotnie).
// ŚWIADOMY KOMPROMIS: bez unikania par z tego samego kraju/związku (realna
// LM to uwzględnia — tutaj, przy 36 drużynach w dużej mierze fikcyjnych,
// pominięcie tego nie zmienia rozgrywki, a znacznie upraszcza losowanie).
function buildSwissPotFixtures(pots) {
  const fixtures = [];
  pots.forEach(pot => {
    const order = [...pot].sort(() => Math.random() - 0.5);
    const n = order.length;
    for (let k = 0; k < n; k++) fixtures.push({ home: order[k], away: order[(k + 1) % n] });
  });
  for (let i = 0; i < pots.length; i++) {
    for (let j = i + 1; j < pots.length; j++) {
      const A = [...pots[i]].sort(() => Math.random() - 0.5);
      const B = [...pots[j]].sort(() => Math.random() - 0.5);
      const n = A.length;
      for (let k = 0; k < n; k++) {
        fixtures.push({ home: A[k], away: B[k] });
        fixtures.push({ home: B[(k + 1) % n], away: A[k] });
      }
    }
  }
  return fixtures;
}

// Rozdziela WSZYSTKIE mecze fazy ligowej na "kolejki" — każda kolejka
// zawiera dokładnie jeden Twój mecz plus mniej więcej równą porcję meczów
// pozostałych 34 drużyn (rozstrzyganych w tle). To nie jest prawdziwy
// kalendarz UEFA (tam każda drużyna gra raz na kolejkę) — dla rozgrywki
// nie ma to znaczenia, bo tło i tak jest tylko wynikiem w tabeli.
function groupFixturesIntoRounds(fixtures, myTeam, roundsCount) {
  const myFixtures = fixtures.filter(f => f.home === myTeam || f.away === myTeam);
  const otherFixtures = fixtures.filter(f => f.home !== myTeam && f.away !== myTeam).sort(() => Math.random() - 0.5);
  const rounds = myFixtures.map(f => [f]);
  otherFixtures.forEach((f, idx) => { rounds[idx % roundsCount].push(f); });
  return rounds;
}

// Jeśli w eliminacjach WYELIMINOWAŁEM drużynę, która normalnie siedziałaby
// też w koszyku fazy ligowej (np. Górnik bije Lyon lub Bodø/Glimt w
// barażu, a obaj są w Koszyku 3) — ta drużyna fizycznie nie może grać w
// dwóch miejscach naraz. Podstawiam ją inną, niewykorzystaną drużyną z
// puli eliminacyjnej (tą, z którą NIE grałem po drodze).
function substituteEliminatedPotTeam(def, ch, pots) {
  if (!ch.qualifyingDraws) return pots;
  const usedIds = new Set();
  Object.values(ch.qualifyingDraws).forEach(spec => { if (spec && spec.id) usedIds.add(spec.id); });
  // Wszystkie id, jakie KIEDYKOLWIEK mogły się pojawić w eliminacjach (cała
  // pula), żeby wiedzieć, kogo można bezpiecznie użyć jako zamiennika.
  const allQualifyingIds = new Set();
  (def.qualifying || []).forEach(q => {
    if (q.opponent && q.opponent.id) allQualifyingIds.add(q.opponent.id);
    (q.opponentPool || []).forEach(o => { if (o.id) allQualifyingIds.add(o.id); });
  });
  const potIds = new Set(pots.flat().map(t => t.id).filter(Boolean));
  usedIds.forEach(eliminatedId => {
    if (!potIds.has(eliminatedId)) return; // ta drużyna i tak nie jest w żadnym koszyku - nic do zrobienia
    const available = [...allQualifyingIds].filter(id => !usedIds.has(id) && !potIds.has(id));
    if (!available.length) return; // brak sensownego zamiennika - zostawiam jak jest (skrajny przypadek)
    const replacementId = rand(available);
    const replacementTeam = resolveOpponentTeam({ source: 'custom', id: replacementId });
    if (!replacementTeam) return;
    pots.forEach(pot => {
      const idx = pot.findIndex(t => t.id === eliminatedId);
      if (idx !== -1) pot[idx] = replacementTeam;
    });
    potIds.delete(eliminatedId);
    potIds.add(replacementId);
  });
  return pots;
}

function initSwissLeague(def) {
  const ch = state.challenge;
  const myTeam = swissMyTeamObj();

  if (def.swiss.pots) {
    // ── System koszykowy (4 koszyki po 9) ──
    let pots = def.swiss.pots.map(pot => pot.map(spec => {
      if (spec.source === 'me') return myTeam;
      return resolveOpponentTeam(spec);
    }));
    if (pots.some(pot => pot.some(t => !t))) {
      alert('Brak danych któregoś z uczestników fazy ligowej — sprawdź def.swiss.pots i plik drużyn tego wyzwania.');
      return false;
    }
    if (pots.length !== 4 || pots.some(pot => pot.length !== 9)) {
      alert('Faza ligowa systemem koszykowym wymaga DOKŁADNIE 4 koszyków po 9 drużyn (patrz def.swiss.pots).');
      return false;
    }
    pots = substituteEliminatedPotTeam(def, ch, pots);
    const teams = pots.flat();
    const fixtures = buildSwissPotFixtures(pots);
    ch.swissTeams = teams;
    ch.swissPots = pots.map(pot => pot.map(t => t.label)); // do ekranu losowania — tylko etykiety, przeżywa save/load
    ch.swissRounds = groupFixturesIntoRounds(fixtures, myTeam, def.swiss.matches || 8);
    ch.swissMatchIdx = 0;
    ch.swissTable = initSeasonTable(teams);
    return true;
  }

  // ── Fallback: stara, płaska lista uczestników + obcięty round-robin ──
  const opponents = def.swiss.teams.map(resolveOpponentTeam);
  if (opponents.some(o => !o)) {
    alert('Brak danych któregoś z uczestników fazy ligowej — sprawdź listę def.swiss.teams i plik drużyn tego wyzwania.');
    return false;
  }
  const teams = [myTeam, ...opponents];
  if (teams.length % 2 !== 0) {
    alert(`Faza ligowa wymaga PARZYSTEJ liczby uczestników (masz ${teams.length}, z Tobą włącznie). Dodaj lub usuń jedną drużynę w def.swiss.teams.`);
    return false;
  }
  const matchesCount = def.swiss.matches || 8;
  const allRounds = generateRoundRobin(teams);
  ch.swissTeams = teams;
  ch.swissPots = null;
  ch.swissRounds = allRounds.slice(0, Math.min(matchesCount, allRounds.length));
  ch.swissMatchIdx = 0;
  ch.swissTable = initSeasonTable(teams);
  return true;
}

// ── Panel "Twoje losowanie" — patrz LOSOWANIE.js ────────────

// Zwraca moje 8 meczów fazy ligowej, POGRUPOWANE wg koszyka rywala (koszyk 1
// → 2 mecze, koszyk 2 → 2, koszyk 3 → 2, koszyk 4 → 2) — w tej kolejności
// odbywa się interaktywne losowanie na ekranie.
// ── EKRAN LOSOWANIA — patrz LOSOWANIE.js ────────────────────

function goSwissLeagueScreen(def) {
  const ch = state.challenge;
  if (!ch.swissRounds) { if (!initSwissLeague(def)) return; }
  if (ch.swissMatchIdx >= ch.swissRounds.length) { resolveSwissLeagueAndAdvance(def); return; }

  const round = ch.swissRounds[ch.swissMatchIdx];
  const m = round.find(mt => mt.home.isPlayer || mt.away.isPlayer);
  const oppTeam = m.home.isPlayer ? m.away : m.home;
  const advanceDirect = def.swiss.advanceDirect || 8;
  document.getElementById('challenge-title').textContent = def.title;
  document.getElementById('challenge-round-label').textContent =
    `Faza ligowa — kolejka ${ch.swissMatchIdx + 1}/${ch.swissRounds.length} (top ${advanceDirect} → 1/8, miejsca ${advanceDirect + 1}-${def.swiss.advancePlayoff || 24} → baraż)`;
  document.getElementById('challenge-opponent-preview').textContent = `Rywal: ${oppTeam.label} (OVR ${calcTeamOverall(oppTeam.roster)})${m.home.isPlayer ? ' — u siebie' : ' — na wyjeździe'}`;
  document.getElementById('challenge-agg-info').textContent = '';
  document.getElementById('btn-play-challenge-match').disabled = false;
  document.getElementById('btn-play-challenge-match').textContent = '▶ ROZEGRAJ MECZ';
  document.getElementById('btn-play-challenge-match').onclick = () => setupChallengeMatch();
  document.getElementById('btn-toggle-swiss-draw').style.display = 'inline-block';
  renderSeasonTableInto('challenge-group-table', sortedSeasonTable(ch.swissTable), advanceDirect, def.swiss.advancePlayoff || 24);
  renderSwissDrawReveal(def);
  document.getElementById('challenge-draw-reveal').style.display = 'none'; // dostępne przyciskiem, nie od razu
  showScreen('screen-challenge');
}

function finishSwissLeagueMatch(sim, m, opp, def) {
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

  const myLabel = ch.currentMyTeam.label;
  const homeLabel = m.home.isPlayer ? myLabel : opp.label;
  const awayLabel = m.home.isPlayer ? opp.label : myLabel;
  updateSeasonTable(ch.swissTable, homeLabel, awayLabel, m.home.isPlayer ? sim.gf : sim.ga, m.home.isPlayer ? sim.ga : sim.gf);

  // Pozostałe mecze TEJ kolejki (bez Twojego udziału) — rozstrzygane w tle.
  const round = ch.swissRounds[ch.swissMatchIdx];
  round.forEach(mt => {
    if (mt.home.isPlayer || mt.away.isPlayer) return;
    const r = resolveOtherMatch(mt.home, mt.away, false, 'home'); // faza ligowa - gospodarz dostaje własny bonus
    updateSeasonTable(ch.swissTable, mt.home.label, mt.away.label, r.gf, r.ga);
  });

  addHistoryCard('WYZWANIE — FAZA LIGOWA', `kolejka ${ch.swissMatchIdx + 1}/${ch.swissRounds.length} vs ${opp.label}`, scoreText, resultClass);

  ch.swissMatchIdx++;
  // Odświeżam OD RAZU — w fazie ligowej ZAWSZE grasz swój mecz co kolejkę
  // (nie ma "bye week" jak w Sezonie), więc nie ma na co czekać. Przycisk
  // "NASTĘPNA KOLEJKA" tu nie miał realnego sensu — tylko dublował klik.
  goToChallengeRound();
}

function resolveSwissLeagueAndAdvance(def) {
  const ch = state.challenge;
  const table = sortedSeasonTable(ch.swissTable);
  const myPos = table.findIndex(r => r.isPlayer) + 1;
  const advanceDirect = def.swiss.advanceDirect || 8;
  const advancePlayoff = def.swiss.advancePlayoff || 24;

  // Rozstawienie po fazie ligowej — pozycje 1..advancePlayoff, z etykietami.
  ch.swissSeeding = table.slice(0, advancePlayoff).map((r, i) => ({ label: r.label, seed: i + 1 }));

  if (myPos > advancePlayoff) {
    document.getElementById('challenge-end-summary').textContent =
      `Kończysz fazę ligową na ${myPos}. miejscu — poza strefą baraży (top ${advancePlayoff}). Koniec przygody w tym wyzwaniu.`;
    renderSeasonTableInto('challenge-end-table', table, advanceDirect, def.swiss.advancePlayoff || 24);
    showScreen('screen-challenge-end');
    return;
  }

  if (myPos <= advanceDirect) {
    // Prosto do 1/8: baraże pozostałych rozstrzygamy w tle, budujemy drabinkę 16.
    document.getElementById('po-commentary').textContent = `Kończysz fazę ligową na ${myPos}. miejscu — awans prosto do 1/8 finału!`;
    buildKnockoutAfterPlayoffs(def, null);
    ch.phase = 'swissKnockout';
  } else {
    // Baraż: rywal z lustrzanego miejsca (9. z 24., 10. z 23., ...).
    const pairSum = advanceDirect + advancePlayoff + 1; // np. 8+24+1 = 33
    const oppSeed = pairSum - myPos;
    ch.playoffOppLabel = ch.swissSeeding.find(s => s.seed === oppSeed).label;
    ch.phase = 'swissPlayoff';
    document.getElementById('po-commentary').textContent =
      `Kończysz fazę ligową na ${myPos}. miejscu — czeka Cię dwumeczowy baraż o 1/8 finału (rywal: ${ch.playoffOppLabel}).`;
  }
  ch.mySeed = myPos;
  ch.leg = 1; ch.myAgg = 0; ch.oppAgg = 0;
  goToChallengeRound();
}

function swissTeamByLabel(label) {
  return state.challenge.swissTeams.find(t => t.label === label) || null;
}

// Dwumecz w tle między dwiema drużynami (po overallach) — zwraca etykietę zwycięzcy.
function simBgTie(teamA, teamB) {
  const l1 = resolveOtherMatch(teamA, teamB, false, 'home'); // pierwszy mecz - teamA u siebie
  const l2 = resolveOtherMatch(teamB, teamA, { myAggOffset: l1.ga, oppAggOffset: l1.gf }, 'home'); // rewanż - teamB u siebie
  const teamAaggGoals = l1.gf + l2.ga, teamBaggGoals = l1.ga + l2.gf;
  if (teamAaggGoals !== teamBaggGoals) return teamAaggGoals > teamBaggGoals ? teamA.label : teamB.label;
  return l2.result === 'W' ? teamB.label : teamA.label; // remis agregatu rozstrzygnęły karne pełnego silnika
}

// Buduje 16-zespołową drabinkę po barażach: top 8 z tabeli + 8 zwycięzców baraży.
// myPlayoffWinnerLabel: null jeśli gracz wszedł z top 8 (jego baraż nie istnieje),
// albo etykieta gracza, jeśli właśnie wygrał swój baraż (jego para pomijana w tle).
function buildKnockoutAfterPlayoffs(def, myPlayoffWinnerLabel) {
  const ch = state.challenge;
  const advanceDirect = def.swiss.advanceDirect || 8;
  const advancePlayoff = def.swiss.advancePlayoff || 24;
  const pairSum = advanceDirect + advancePlayoff + 1;

  const winners = [];
  const bgResults = [];
  for (let seed = advanceDirect + 1; seed < pairSum - seed; seed++) {
    const aLabel = ch.swissSeeding.find(s => s.seed === seed).label;
    const bLabel = ch.swissSeeding.find(s => s.seed === pairSum - seed).label;
    const involvesMe = (ch.mySeed === seed || ch.mySeed === pairSum - seed);
    if (involvesMe) {
      winners.push({ label: myPlayoffWinnerLabel, seed: ch.mySeed });
      continue;
    }
    const winnerLabel = simBgTie(swissTeamByLabel(aLabel), swissTeamByLabel(bLabel));
    winners.push({ label: winnerLabel, seed: winnerLabel === aLabel ? seed : pairSum - seed });
    bgResults.push(`${aLabel} vs ${bLabel} → ${winnerLabel}`);
  }
  if (bgResults.length) addHistoryCard('WYZWANIE — BARAŻE', bgResults.join(' • '), '', '');

  ch.koTeams = [
    ...ch.swissSeeding.slice(0, advanceDirect).map(s => ({ label: s.label, seed: s.seed })),
    ...winners.filter(w => w.label),
  ].sort((a, b) => a.seed - b.seed);
  ch.koRoundIdx = 0;
}

const SWISS_KO_NAMES = { 16: '1/8 finału', 8: 'Ćwierćfinał', 4: 'Półfinał', 2: 'Finał' };

// Wejście w rundę drabinki (albo baraż) — paruje najlepszego z najsłabszym wg
// rozstawienia z fazy ligowej, mecze bez Ciebie rozstrzyga w tle, Twój dwumecz
// przygotowuje jako dynamiczną rundę dla wspólnej logiki finishTwoLeggedRoundMatch.
function goSwissKnockoutRound(def) {
  const ch = state.challenge;

  if (ch.phase === 'swissPlayoff') {
    const oppTeam = swissTeamByLabel(ch.playoffOppLabel);
    ch.dynamicRound = {
      name: 'Baraż o 1/8 finału', legs: 2,
      firstLegHome: true, // lepiej rozstawiony gra rewanż u siebie — Ty grasz pierwszy mecz u siebie tylko gdy jesteś gorzej rozstawiony; upraszczamy: zawsze najpierw u siebie
      opponent: { source: 'resolved', team: oppTeam },
    };
    displayChallengeRoundInfo(def, ch.dynamicRound);
    if (ch.swissTable) renderSeasonTableInto('challenge-group-table', sortedSeasonTable(ch.swissTable), def.swiss.advanceDirect || 8, def.swiss.advancePlayoff || 24);
    return;
  }

  // ── Drabinka 16 → 8 → 4 → finał ──
  const teams = ch.koTeams;
  if (!teams || !teams.length) { finishChallenge(false); return; }
  if (teams.length === 1) { finishChallenge(true); return; }

  const roundName = SWISS_KO_NAMES[teams.length] || `Runda (${teams.length} drużyn)`;
  const isFinal = teams.length === 2;

  const pairs = [];
  for (let i = 0; i < teams.length / 2; i++) pairs.push([teams[i], teams[teams.length - 1 - i]]);

  const myPairIdx = pairs.findIndex(p => swissPairHasMe(p));
  if (myPairIdx === -1) { finishChallenge(false); return; } // teoretycznie niemożliwe

  // Tło: wszystkie pary poza moją.
  const winners = [];
  const bgResults = [];
  pairs.forEach((pair, idx) => {
    if (idx === myPairIdx) return;
    const a = swissTeamByLabel(pair[0].label), b = swissTeamByLabel(pair[1].label);
    const winnerLabel = simBgTie(a, b);
    winners.push(pair[0].label === winnerLabel ? pair[0] : pair[1]);
    bgResults.push(`${pair[0].label} vs ${pair[1].label} → ${winnerLabel}`);
  });
  if (bgResults.length) addHistoryCard(`WYZWANIE — ${roundName.toUpperCase()}`, bgResults.join(' • '), '', '');
  ch.koBgWinners = winners;
  ch.koMyPair = pairs[myPairIdx];

  const myEntry = ch.koMyPair.find(t => swissEntryIsMe(t));
  const oppEntry = ch.koMyPair.find(t => !swissEntryIsMe(t));
  ch.dynamicRound = {
    name: roundName,
    legs: isFinal ? 1 : 2,
    neutral: isFinal,
    firstLegHome: true,
    opponent: { source: 'resolved', team: swissTeamByLabel(oppEntry.label) },
  };
  ch.koMySeedEntry = myEntry;
  displayChallengeRoundInfo(def, ch.dynamicRound);
  if (ch.swissTable) renderSeasonTableInto('challenge-group-table', sortedSeasonTable(ch.swissTable), def.swiss.advanceDirect || 8, def.swiss.advancePlayoff || 24);
}

function swissEntryIsMe(entry) {
  const t = swissTeamByLabel(entry.label);
  return !!(t && t.isPlayer);
}
function swissPairHasMe(pair) { return swissEntryIsMe(pair[0]) || swissEntryIsMe(pair[1]); }

function resolveSwissQualifying(def, advanced) {
  const ch = state.challenge;
  if (!advanced) { document.getElementById('challenge-btn-next-round').style.display = 'none'; finishChallenge(false); return; }
  ch.roundIdx++;
  ch.leg = 1; ch.myAgg = 0; ch.oppAgg = 0;
  const nextQ = def.qualifying[ch.roundIdx];
  document.getElementById('po-commentary').textContent += nextQ
    ? ' Awansujesz do kolejnej rundy eliminacji!'
    : ' Awansujesz do fazy ligowej! Czas na losowanie...';
  if (!nextQ) ch.phase = 'swissDraw';
  // Odświeżam OD RAZU — dotąd ekran "wisiał" na poprzedniej rundzie/rywalu
  // (np. Aarhus GF) aż do dodatkowego kliknięcia, co wyglądało jak
  // zawieszenie — dotyczyło to też przejścia do fazy ligowej.
  goToChallengeRound();
}

function resolveSwissKnockoutResult(def, advanced) {
  const ch = state.challenge;
  if (!advanced) { document.getElementById('challenge-btn-next-round').style.display = 'none'; finishChallenge(false); return; }

  ch.leg = 1; ch.myAgg = 0; ch.oppAgg = 0;

  if (ch.phase === 'swissPlayoff') {
    // Wygrany baraż — buduję drabinkę 16 (moja para pominięta w tle).
    const myLabel = swissMyLeagueLabel();
    buildKnockoutAfterPlayoffs(def, myLabel);
    ch.phase = 'swissKnockout';
    document.getElementById('po-commentary').textContent += ' Wygrywasz baraż — awans do 1/8 finału!';
  } else {
    // Wygrana runda drabinki — zwycięzcy tła + ja przechodzą dalej.
    const isFinal = ch.koTeams.length === 2;
    if (isFinal) { document.getElementById('challenge-btn-next-round').style.display = 'none'; finishChallenge(true); return; }
    ch.koTeams = [...ch.koBgWinners, ch.koMySeedEntry].sort((a, b) => a.seed - b.seed);
    document.getElementById('po-commentary').textContent += ' Awansujesz do kolejnej rundy!';
  }
  goToChallengeRound();
}

function swissMyLeagueLabel() {
  const me = state.challenge.swissTeams.find(t => t.isPlayer);
  return me ? me.label : (state.myClub || 'TWOJA DRUŻYNA');
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
