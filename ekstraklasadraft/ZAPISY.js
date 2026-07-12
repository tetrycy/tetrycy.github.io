// ============================================================
// ZAPISY.JS — wielosłotowe zapisy drużyn i gier, oraz Szybki Mecz.
// ============================================================


const SQUAD_SAVES_KEY = 'ekstraklasa_draft_squad_saves';

function getSquadSaves() {
  const raw = localStorage.getItem(SQUAD_SAVES_KEY);
  return raw ? JSON.parse(raw) : [];
}

function setSquadSaves(list) {
  localStorage.setItem(SQUAD_SAVES_KEY, JSON.stringify(list));
}

function saveSquad() {
  const saves = getSquadSaves();
  const typed = prompt('Nazwa drużyny (zostaw puste dla domyślnej):', '');
  if (typed === null) return; // gracz kliknął Cancel
  const name = typed.trim() || `Drużyna ${saves.length + 1}`;
  saves.push({
    id: Date.now(),
    name,
    squad: state.squad,
    coach: state.coach,
    startingXI: state.startingXI,
    myTeamName: state.myTeamName,
    myTeamColors: state.myTeamColors,
    myClub: state.myClub,
    savedAt: new Date().toLocaleString('pl-PL'),
  });
  setSquadSaves(saves);
  alert(`Zapisano: „${name}”. Znajdziesz ją w folderze zapisanych drużyn.`);
}

function loadSquadSlot(id) {
  const entry = getSquadSaves().find(s => s.id === id);
  if (!entry) return;
  const keepSpeed = state.speed || 'extreme';
  const keepStyle = state.commentaryStyle || 'waldemar';
  state = {
    squad: entry.squad, coach: entry.coach || null, startingXI: entry.startingXI || null,
    myTeamName: entry.myTeamName || null, myTeamColors: entry.myTeamColors || null, myClub: entry.myClub || null,
    rerolls: 2, currentTeam: null, usedTeams: new Set(), bracket: [], roundIdx: 0, myOverall: 0,
    speed: keepSpeed, commentaryStyle: keepStyle, tournamentPhase: 'knockout', mundial: null, mundialVariant: 'champions',
    fogOfWar: false, fogOfWarApplied: false,
  };
  showResult();
}

function deleteSquadSlot(id) {
  if (!confirm('Usunąć tę drużynę na stałe?')) return;
  setSquadSaves(getSquadSaves().filter(s => s.id !== id));
  renderSquadSaves();
}

function goToSquadSaves(context) {
  state.squadPickerContext = context || null;
  renderSquadSaves();
  showScreen('screen-squad-saves');
}

function backFromSquadSaves() {
  const ctx = state.squadPickerContext;
  state.squadPickerContext = null;
  if (ctx && ctx.type === 'challenge') { goToChallengeTeamChoice(ctx.challengeId); return; }
  showScreen('screen-draft-setup');
}

function renderSquadSaves() {
  const list = document.getElementById('squad-saves-list');
  const saves = getSquadSaves();
  if (!saves.length) { list.innerHTML = '<div style="color:var(--gray);font-size:14px;">Brak zapisanych drużyn.</div>'; return; }
  list.innerHTML = '';
  const ctx = state.squadPickerContext;
  saves.slice().reverse().forEach(entry => {
    const row = document.createElement('div');
    row.className = 'slot-row filled';
    row.style.marginBottom = '4px';
    const loadCall = (ctx && ctx.type === 'challenge') ? `loadSquadForChallenge(${entry.id})` : `loadSquadSlot(${entry.id})`;
    row.innerHTML = `
      <span class="slot-name">${entry.name}</span>
      <span style="font-size:12px;color:var(--gray);white-space:nowrap;">${entry.savedAt}</span>
      <button class="btn btn-sm" style="padding:2px 8px;" onclick="${loadCall}">📂 WCZYTAJ</button>
      <button class="btn btn-sm" style="padding:2px 8px;color:var(--red);" onclick="deleteSquadSlot(${entry.id})">✕</button>
    `;
    list.appendChild(row);
  });
}

const GAME_SAVES_KEY = 'ekstraklasa_draft_game_saves';

function getGameSaves() {
  const raw = localStorage.getItem(GAME_SAVES_KEY);
  return raw ? JSON.parse(raw, (k, v) => (v && v.__set ? new Set(v.__set) : v)) : [];
}

function setGameSaves(list) {
  localStorage.setItem(GAME_SAVES_KEY, JSON.stringify(list, (k, v) => (v instanceof Set ? { __set: [...v] } : v)));
}

function defaultGameSaveName() {
  const modeLabel = {
    knockout: 'Play-offy/Mundial', season: 'Sezon', groups: 'Faza grupowa', challenge: 'Wyzwanie', customPuchar: 'Kreator — Puchar',
  }[state.tournamentPhase] || 'Gra';
  const teamLabel = state.myClub || state.myTeamName || 'Moja Drużyna';
  return `${modeLabel} — ${teamLabel}`;
}

function saveGame() {
  if (state.liveGen) {
    alert('Nie można zapisać w trakcie trwającego meczu — dokończ mecz, a zapiszesz zaraz potem.');
    return;
  }
  const saves = getGameSaves();
  const typed = prompt('Nazwa zapisu (zostaw puste dla domyślnej):', defaultGameSaveName());
  if (typed === null) return;
  const name = typed.trim() || defaultGameSaveName();
  saves.push({ id: Date.now(), name, state, savedAt: new Date().toLocaleString('pl-PL') });
  setGameSaves(saves);
  alert(`Gra zapisana: „${name}”.`);
}

function loadGameSlot(id) {
  const entry = getGameSaves().find(s => s.id === id);
  if (!entry) return;
  state = JSON.parse(JSON.stringify(entry.state, (k, v) => (v instanceof Set ? { __set: [...v] } : v)), (k, v) => (v && v.__set ? new Set(v.__set) : v));
  state.liveGen = null; // generatora meczu nigdy nie zapisujemy — nie ma trwającego meczu po wczytaniu

  if (state.tournamentPhase === 'challenge' && state.challenge) {
    // Wyzwanie — wracamy prosto na ekran bieżącej rundy (goToChallengeRound
    // tylko wyświetla stan z state.challenge, niczego nie regeneruje).
    goToChallengeRound();
  } else if (state.tournamentPhase === 'customPuchar' && state.customPuchar) {
    // Kreator turnieju (puchar) — wznawiamy widok bieżącego meczu bez
    // przelosowywania par/grup (setup* regenerują — te funkcje NIE).
    if (state.customPuchar.mode === 'group') goToMyGroupMatch();
    else showPucharKnockoutMatchInfo();
  } else if (state.tournamentPhase === 'season' && state.season) {
    renderSeasonScreen();
    showScreen('screen-season');
  } else if (state.tournamentPhase === 'groups') {
    setupGroupMatch();
  } else if (state.squad && Object.keys(state.squad).length && state.bracket && state.bracket.length) {
    setupKnockoutMatch();
  } else {
    showScreen('screen-title');
  }
}

function deleteGameSlot(id) {
  if (!confirm('Usunąć ten zapis na stałe?')) return;
  setGameSaves(getGameSaves().filter(s => s.id !== id));
  renderGameSaves();
}

function goToGameSaves() {
  renderGameSaves();
  showScreen('screen-game-saves');
}

function renderGameSaves() {
  const list = document.getElementById('game-saves-list');
  const saves = getGameSaves();
  if (!saves.length) { list.innerHTML = '<div style="color:var(--gray);font-size:14px;">Brak zapisanych gier.</div>'; return; }
  list.innerHTML = '';
  saves.slice().reverse().forEach(entry => {
    const row = document.createElement('div');
    row.className = 'slot-row filled';
    row.style.marginBottom = '4px';
    row.innerHTML = `
      <span class="slot-name">${entry.name}</span>
      <span style="font-size:12px;color:var(--gray);white-space:nowrap;">${entry.savedAt}</span>
      <button class="btn btn-sm" style="padding:2px 8px;" onclick="loadGameSlot(${entry.id})">📂 WCZYTAJ</button>
      <button class="btn btn-sm" style="padding:2px 8px;color:var(--red);" onclick="deleteGameSlot(${entry.id})">✕</button>
    `;
    list.appendChild(row);
  });
}

function quickMatch() {
  const teamA = rand(TEAMS_DATA);
  let teamB = rand(TEAMS_DATA);
  let guard = 0;
  while (teamB.club === teamA.club && teamB.season === teamA.season && guard++ < 20) teamB = rand(TEAMS_DATA);

  const keepSpeed = state.speed || 'extreme';
  const keepStyle = state.commentaryStyle || 'waldemar';
  state = {
    squad: {}, rerolls: 2, currentTeam: null, usedTeams: new Set(), bracket: [], roundIdx: 0, myOverall: 0,
    speed: keepSpeed, commentaryStyle: keepStyle, tournamentPhase: 'knockout', mundial: null, mundialVariant: 'champions',
    myClub: teamA.club, fogOfWar: false, fogOfWarApplied: false,
  };
  assignRealTeamToSquad(teamA);
  ensureStartingXI();
  state.myOverall = calcTeamOverall(getStartingXISquad());

  const opp = teamToBracketObj(teamB);
  const myRoster = Object.values(getStartingXISquad()).map(s => ({ name: s.name, pos: s.pos, overall: s.overall, birthYear: s.birthYear, season: s.season }));
  const myTeam = { label: state.myClub || state.myTeamName || 'TWOJA DRUŻYNA', overall: state.myOverall, isPlayer: true, roster: myRoster, club: state.myClub || null };

  state.bracket = [[{ home: myTeam, away: opp, played: false }]];
  state.roundIdx = 0;

  document.getElementById('playoff-round-label').textContent = 'SZYBKI MECZ';
  document.getElementById('playoff-round-title').textContent = 'SZYBKI MECZ';
  document.getElementById('playoff-history-title').textContent = 'SZYBKI MECZ';
  document.getElementById('groups-panel').style.display = 'none';
  resetMatchScreen(opp, myTeam, 'neutral');
  showScreen('screen-playoff');
}
