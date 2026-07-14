// ============================================================
// DRAFT.JS — cały proces draftowania: losowanie drużyn, wybór
// zawodników/rezerwowych/trenera, plansza formacji, ustawienia draftu,
// oraz "Zagraj prawdziwą drużyną".
// ============================================================


// ── DEFINICJA SLOTÓW (uproszczona) ─────────────────────────

const SLOTS = [
  { id: 'GK',    pos: 'GK',  label: 'BRAMKARZ',  x: 50, y: 91 },
  { id: 'DEF_1', pos: 'DEF', label: 'OBROŃCA',   x: 15, y: 72 },
  { id: 'DEF_2', pos: 'DEF', label: 'OBROŃCA',   x: 38, y: 72 },
  { id: 'DEF_3', pos: 'DEF', label: 'OBROŃCA',   x: 62, y: 72 },
  { id: 'DEF_4', pos: 'DEF', label: 'OBROŃCA',   x: 85, y: 72 },
  { id: 'MID_1', pos: 'MID', label: 'POMOCNIK',  x: 15, y: 50 },
  { id: 'MID_2', pos: 'MID', label: 'POMOCNIK',  x: 38, y: 50 },
  { id: 'MID_3', pos: 'MID', label: 'POMOCNIK',  x: 62, y: 50 },
  { id: 'MID_4', pos: 'MID', label: 'POMOCNIK',  x: 85, y: 50 },
  { id: 'FWD_1', pos: 'FWD', label: 'NAPASTNIK', x: 35, y: 22 },
  { id: 'FWD_2', pos: 'FWD', label: 'NAPASTNIK', x: 65, y: 22 },
];

const POS_LABELS = { GK: 'BRAMKARZA', DEF: 'OBROŃCĘ', MID: 'POMOCNIKA', FWD: 'NAPASTNIKA' };

// Ławka rezerwowych — TAK SAMO sztywno skodowana pozycyjnie jak główny skład,
// żeby fizycznie nie dało się skończyć draftu z przekrzywionym składem
// (np. 4 pomocników i 0 napastników). Zawsze dokładnie: 1 GK, 2 DEF, 2 MID, 1 FWD.
const RESERVE_SLOTS = [
  { id: 'RES_GK',    pos: 'GK',  label: 'REZERWOWY BRAMKARZ' },
  { id: 'RES_DEF_1', pos: 'DEF', label: 'REZERWOWY OBROŃCA' },
  { id: 'RES_DEF_2', pos: 'DEF', label: 'REZERWOWY OBROŃCA' },
  { id: 'RES_MID_1', pos: 'MID', label: 'REZERWOWY POMOCNIK' },
  { id: 'RES_MID_2', pos: 'MID', label: 'REZERWOWY POMOCNIK' },
  { id: 'RES_FWD_1', pos: 'FWD', label: 'REZERWOWY NAPASTNIK' },
];
const RESERVE_POS_LIMITS = { GK: 1, DEF: 2, MID: 2, FWD: 1 };
const DRAFT_BENCH_LIMIT = RESERVE_SLOTS.length; // 6 — zachowane dla wstecznej zgodności odwołań

function getAllReserveIds() {
  return Object.keys(state.squad).filter(id => id.startsWith('RES_') && state.squad[id]);
}

function benchSize() {
  return getAllReserveIds().length;
}

function ensureBenchIds() {
  // Ważne: "ławka" (kadra meczowa) może zawierać ZARÓWNO oryginalnych rezerwowych,
  // JAK I zawodników, którzy wypadli z jedenastki po zamianie (nie tylko RES_...!).
  // Walidujemy więc tylko to, że każdy istnieje w składzie i nie gra aktualnie
  // w jedenastce — NIE że musi pochodzić z puli rezerwowych.
  if (state.benchIds && state.benchIds.every(id => state.squad[id] && !state.startingXI.includes(id))) return;
  const allReserves = getAllReserveIds();
  state.benchIds = allReserves
    .slice()
    .sort((a, b) => state.squad[b].overall - state.squad[a].overall)
    .slice(0, 5);
}

function goToRealTeamSetup() {
  const seasons = [...new Set(TEAMS_DATA.map(t => t.season))].sort().reverse();
  const sel = document.getElementById('realteam-season');
  sel.innerHTML = seasons.map(s => `<option value="${s}">${s}</option>`).join('');
  sel.value = seasons[0];
  updateRealTeamClubOptions();
  showScreen('screen-real-team-setup');
}

function updateRealTeamClubOptions() {
  const season = document.getElementById('realteam-season').value;
  const clubs = TEAMS_DATA.filter(t => t.season === season).map(t => t.club).sort();
  const sel = document.getElementById('realteam-club');
  sel.innerHTML = clubs.map(c => `<option value="${c}">${c}</option>`).join('');
  updateRealTeamPreview();
}

function updateRealTeamPreview() {
  const season = document.getElementById('realteam-season').value;
  const club = document.getElementById('realteam-club').value;
  const t = TEAMS_DATA.find(tt => tt.season === season && tt.club === club);
  const el = document.getElementById('realteam-preview');
  if (!t) { el.textContent = ''; return; }
  const obj = teamToBracketObj(t);
  el.textContent = `${obj.label} — Overall: ${obj.overall}`;
}

function assignRealTeamToSquad(t) {
  const st = t.players.filter(p => p.starting);
  const usePool = st.length >= 11 ? st : t.players;
  const used = new Set();
  SLOTS.forEach(slot => {
    let candidates = usePool.filter(p => p.position === slot.pos && !used.has(p.name)).sort((a, b) => b.overall - a.overall);
    let pick = candidates[0];
    if (!pick) {
      const fallbackPool = usePool.filter(p => !used.has(p.name)).sort((a, b) => b.overall - a.overall);
      pick = fallbackPool[0];
    }
    if (!pick) return;
    used.add(pick.name);
    state.squad[slot.id] = {
      name: pick.name, club: t.club, season: t.season, overall: pick.overall,
      pos: slot.pos, label: slot.label, apps: pick.apps, goals: pick.goals, birthYear: pick.birthYear,
    };
  });

  // Ławka — najpierw dokładnie 6 wg TEJ SAMEJ struktury co draft (1 GK, 2 DEF, 2 MID,
  // 1 FWD), żeby "Zagraj prawdziwą drużyną" dawało tak samo kompletny, niekrzywy skład.
  // Reszta prawdziwych rezerwowych (wiele klubów w bazie ma ich więcej niż 6) trafia
  // jako "dodatkowi" — dostępni do wpisania w ZARZĄDZAJ ZESPOŁEM, poza sztywną szóstką.
  const reservePool = t.players.filter(p => !p.starting && !used.has(p.name)).sort((a, b) => b.overall - a.overall);

  RESERVE_SLOTS.forEach(slot => {
    const idx = reservePool.findIndex(p => p.position === slot.pos && !used.has(p.name));
    const pick = idx >= 0 ? reservePool[idx] : null;
    if (!pick) return;
    used.add(pick.name);
    state.squad[slot.id] = {
      name: pick.name, club: t.club, season: t.season, overall: pick.overall,
      pos: slot.pos, label: slot.label, apps: pick.apps, goals: pick.goals,
      birthYear: pick.birthYear, isReserve: true,
    };
  });

  const extraReserves = reservePool.filter(p => !used.has(p.name));
  extraReserves.forEach((pick, i) => {
    const slotId = 'RES_EXTRA_' + (i + 1);
    used.add(pick.name);
    state.squad[slotId] = {
      name: pick.name, club: t.club, season: t.season, overall: pick.overall,
      pos: pick.position, label: 'REZERWOWY', apps: pick.apps, goals: pick.goals,
      birthYear: pick.birthYear, isReserve: true,
    };
  });

  // Trener — prawdziwy, jeśli baza go ma; inaczej zaślepka.
  const realCoach = (t.coaches && t.coaches[0]) || { name: 'Nieznany Trener' };
  state.coach = { name: realCoach.name || 'Nieznany Trener' };
  state.startingXI = null; // wymuszamy ensureStartingXI() na nowo, z pelnym skladem
  state.benchIds = null; // wymuszamy ensureBenchIds() na nowo — domyslnie top 5 po overallu
}

function confirmRealTeam() {
  const season = document.getElementById('realteam-season').value;
  const club = document.getElementById('realteam-club').value;
  const t = TEAMS_DATA.find(tt => tt.season === season && tt.club === club);
  if (!t) return;

  const keepSpeed = state.speed || 'extreme';
  const keepStyle = state.commentaryStyle || 'waldemar';
  state = { squad: {}, rerolls: 2, currentTeam: null, usedTeams: new Set(), bracket: [], roundIdx: 0, myOverall: 0, speed: keepSpeed, commentaryStyle: keepStyle, tournamentPhase: 'knockout', mundial: null, mundialVariant: 'champions', myClub: club, fogOfWar: false, fogOfWarApplied: false };

  assignRealTeamToSquad(t);
  showResult();
}

const POS_LIMITS = { GK: 1, DEF: 4, MID: 4, FWD: 2 };

function squadCount(pos) {
  return Object.values(state.squad).filter(p => p.pos === pos && !p.isReserve).length;
}

function availablePositions() {
  return Object.keys(POS_LIMITS).filter(pos => squadCount(pos) < POS_LIMITS[pos]);
}

// Odpowiedniki squadCount/availablePositions, ale dla ławki rezerwowych —
// każda pozycja ma tu swój OSOBNY limit (1 GK, 2 DEF, 2 MID, 1 FWD).
function benchCount(pos) {
  return RESERVE_SLOTS.filter(s => s.pos === pos && state.squad[s.id]).length;
}

function availableReservePositions() {
  return Object.keys(RESERVE_POS_LIMITS).filter(pos => benchCount(pos) < RESERVE_POS_LIMITS[pos]);
}

function squadSize() {
  return Object.values(state.squad).filter(p => !p.isReserve).length;
}

let draftFilterMinSeason = null;

let draftFilterMaxSeason = null;

let draftFilterClub = '';

function seasonStartYear(s) { return parseInt(s.slice(0, 4), 10); }

function getFilteredTeamsPool() {
  let pool = TEAMS_DATA;
  if (draftFilterClub) pool = pool.filter(t => t.club === draftFilterClub);
  if (draftFilterMinSeason) {
    const minY = seasonStartYear(draftFilterMinSeason);
    pool = pool.filter(t => seasonStartYear(t.season) >= minY);
  }
  if (draftFilterMaxSeason) {
    const maxY = seasonStartYear(draftFilterMaxSeason);
    pool = pool.filter(t => seasonStartYear(t.season) <= maxY);
  }
  return pool;
}

function goToDraftSetup() {
  const seasons = [...new Set(TEAMS_DATA.map(t => t.season))].sort();
  const clubs = [...new Set(TEAMS_DATA.map(t => t.club))].sort();

  const minSel = document.getElementById('draft-season-min');
  const maxSel = document.getElementById('draft-season-max');
  const clubSel = document.getElementById('draft-club-filter');

  minSel.innerHTML = seasons.map(s => `<option value="${s}">${s}</option>`).join('');
  maxSel.innerHTML = seasons.map(s => `<option value="${s}">${s}</option>`).join('');
  minSel.value = seasons[0];
  maxSel.value = seasons[seasons.length - 1];

  clubSel.innerHTML = '<option value="">Wszystkie kluby</option>' +
    clubs.map(c => `<option value="${c}">${c}</option>`).join('');
  clubSel.value = '';

  updateDraftPoolCount();
  showScreen('screen-draft-setup');
}

function updateDraftPoolCount() {
  draftFilterMinSeason = document.getElementById('draft-season-min').value;
  draftFilterMaxSeason = document.getElementById('draft-season-max').value;
  draftFilterClub = document.getElementById('draft-club-filter').value;

  const pool = getFilteredTeamsPool();
  const el = document.getElementById('draft-pool-count');
  const btn = document.getElementById('btn-confirm-draft-setup');

  if (pool.length === 0) {
    el.textContent = '⚠ Brak drużyn spełniających te kryteria — zmień zakres.';
    el.style.color = 'var(--red)';
    btn.disabled = true;
  } else {
    const repeatsWarning = pool.length < 11
      ? ` (mniej niż 11 — niektóre sezony powtórzą się w trakcie draftu)`
      : '';
    el.textContent = `Dostępnych drużyn-sezonów: ${pool.length}${repeatsWarning}`;
    el.style.color = pool.length < 11 ? 'var(--gold)' : 'var(--green-ll)';
    btn.disabled = false;
  }
}

function confirmDraftSetup() {
  updateDraftPoolCount(); // upewnij się, że filtry są aktualne
  if (getFilteredTeamsPool().length === 0) return;
  startDraft();
}

function startDraft() {
  const keepSpeed = state.speed || 'extreme';
  const keepStyle = state.commentaryStyle || 'waldemar';
  const fogCheckbox = document.getElementById('fog-of-war-checkbox');
  const fogOfWar = !!(fogCheckbox && fogCheckbox.checked);
  state = { squad:{}, rerolls:2, currentTeam:null, usedTeams:new Set(), bracket:[], roundIdx:0, myOverall:0, speed: keepSpeed, commentaryStyle: keepStyle, tournamentPhase:'knockout', mundial:null, mundialVariant:'champions', fogOfWar, fogOfWarApplied: false };
  showScreen('screen-draft');
  drawNextTeam();
  renderFormation();
}

function draftIsComplete() {
  return squadSize() >= 11 && benchSize() >= RESERVE_SLOTS.length && !!state.coach;
}

function teamHasClickableOption(team) {
  const openMainPos = availablePositions();
  const openBenchPos = availableReservePositions();
  const needCoach = !state.coach;
  const hasStarterForNeededPos = openMainPos.length > 0 && team.players.some(p => p.starting && openMainPos.includes(p.position));
  const hasReserveForBench = openBenchPos.length > 0 && team.players.some(p => !p.starting && openBenchPos.includes(p.position));
  const hasCoachOffer = needCoach; // zawsze mamy przynajmniej zaslepke
  return hasStarterForNeededPos || hasReserveForBench || hasCoachOffer;
}

function drawNextTeam() {
  if (draftIsComplete()) { applyFogOfWarIfNeeded(); showResult(); return; }

  const mainPicked = squadSize();
  const benchPicked = benchSize();
  document.getElementById('draft-progress').textContent =
    `SKŁAD ${mainPicked}/11 · ŁAWKA ${benchPicked}/${RESERVE_SLOTS.length} · TRENER ${state.coach ? '✓' : '—'}`;
  const openMainPos = availablePositions();
  const openBenchPos = availableReservePositions();
  const labelParts = openMainPos.map(p => POS_PL[p]).concat(openBenchPos.map(p => POS_PL[p] + ' (rez.)'));
  document.getElementById('draft-slot-name').textContent = labelParts.join(' · ') || '—';
  document.getElementById('reroll-info').textContent = `${state.rerolls} lewe`;
  document.getElementById('btn-reroll').disabled = state.rerolls <= 0;

  const basePool = getFilteredTeamsPool();
  let candidates = basePool.filter(t => !state.usedTeams.has(t.club + t.season));
  if (!candidates.length) candidates = basePool; // pula wyczerpana — pozwalamy na powtórkę sezonu
  if (!candidates.length) { alert('Brak drużyn spełniających wybrane kryteria!'); return; }

  let team = null;
  for (let i = 0; i < 50; i++) {
    const candidate = rand(candidates);
    if (teamHasClickableOption(candidate)) { team = candidate; break; }
  }
  if (!team) { alert('Nie znaleziono drużyny z czymkolwiek do wyboru w tym zakresie — poszerz filtr sezonów/klubu.'); return; }

  state.currentTeam = team;
  state.usedTeams.add(team.club + team.season);

  document.getElementById('drawn-club').textContent = team.club;
  document.getElementById('drawn-season').textContent = team.season;

  renderUnifiedPlayerList(team);
}

function rerollTeam() {
  if (state.rerolls <= 0) return;
  state.rerolls--;
  if (state.currentTeam) state.usedTeams.delete(state.currentTeam.club + state.currentTeam.season);
  drawNextTeam();
}

function renderUnifiedPlayerList(team) {
  const list = document.getElementById('player-list');
  list.innerHTML = '';
  const avail = availablePositions();
  const availBench = availableReservePositions();
  const needCoach = !state.coach;

  // ── TRENERZY — osobna sekcja na samym szczycie ──
  if (needCoach) {
    const coachHeader = document.createElement('div');
    coachHeader.style.cssText = 'font-family:var(--font-hud);font-size:6px;color:#c99bf0;padding:6px 4px 3px;letter-spacing:1px;margin-top:2px;';
    coachHeader.textContent = 'TRENERZY TEJ DRUŻYNY';
    list.appendChild(coachHeader);

    const coaches = (team.coaches && team.coaches.length) ? team.coaches : [{ name: 'Nieznany Trener' }];
    coaches.forEach(c => {
      const row = document.createElement('div');
      row.className = 'player-row pos-match';
      row.style.borderColor = '#9b59b6';
      row.innerHTML = '<span class="player-pos" style="color:#c99bf0;">T</span><span class="player-name">' + (c.name || 'Nieznany Trener') + '</span>';
      row.addEventListener('click', () => pickCoach(c));
      list.appendChild(row);
    });
  }

  // ── ZAWODNICY — starterzy do jedenastki, rezerwowi na ławkę (obie z limitem POZYCYJNYM) ──
  POS_ORDER.forEach(pos => {
    const group = team.players
      .filter(p => p.position === pos)
      .sort((a,b) => {
        if (a.starting !== b.starting) return a.starting ? -1 : 1;
        return a.name.localeCompare(b.name, 'pl');
      });
    if (!group.length) return;

    const isAvail = avail.includes(pos);
    const isBenchAvail = availBench.includes(pos);
    const left = POS_LIMITS[pos] - squadCount(pos);
    const benchLeft = RESERVE_POS_LIMITS[pos] - benchCount(pos);
    const header = document.createElement('div');
    header.style.cssText = 'font-family:var(--font-hud);font-size:6px;color:' +
      ((isAvail || isBenchAvail) ? 'var(--accent)' : 'var(--gray)') +
      ';padding:6px 4px 3px;letter-spacing:1px;border-top:1px solid var(--border);margin-top:2px;';
    const parts = [];
    if (isAvail) parts.push(left + ' wolne');
    if (isBenchAvail) parts.push(benchLeft + ' na ławkę');
    header.textContent = POS_FULL[pos] + (parts.length ? '  (' + parts.join(', ') + ')' : '  KOMPLET');
    list.appendChild(header);

    group.forEach(p => {
      const canPickMain = p.starting && avail.includes(p.position);
      const canPickBench = !p.starting && availBench.includes(p.position);
      const canPick = canPickMain || canPickBench;
      const row = document.createElement('div');
      row.className = 'player-row' + (canPick ? ' pos-match' : '') + (p.starting ? '' : ' reserve');

      row.innerHTML =
        '<span class="player-pos">' + POS_PL[p.position] + '</span>' +
        '<span class="player-name">' + p.name + '</span>' +
        (!p.starting ? '<span class="player-res">REZ</span>' : '');

      if (canPickMain) {
        row.addEventListener('click', () => pickMainPlayer(p));
      } else if (canPickBench) {
        row.addEventListener('click', () => pickBenchPlayer(p));
      } else {
        row.style.opacity = '0.35';
        row.style.cursor = 'not-allowed';
      }
      list.appendChild(row);
    });
  });
}

function pickMainPlayer(player) {
  const pos = player.position;
  const posSlots = SLOTS.filter(s => s.pos === pos);
  const freeSlot = posSlots.find(s => !state.squad[s.id]);
  if (!freeSlot) return; // nie powinno się zdarzyć

  state.squad[freeSlot.id] = {
    name: player.name,
    club: state.currentTeam.club,
    season: state.currentTeam.season,
    overall: player.overall,
    pos: pos,
    label: freeSlot.label,
    apps: player.apps,
    goals: player.goals,
    birthYear: player.birthYear,
  };

  afterPick();
}

function pickBenchPlayer(player) {
  const pos = player.position;
  const posSlots = RESERVE_SLOTS.filter(s => s.pos === pos);
  const freeSlot = posSlots.find(s => !state.squad[s.id]);
  if (!freeSlot) return; // ta pozycja na ławce jest już pełna — nie powinno się zdarzyć (UI nie powinno tego pozwolić)

  state.squad[freeSlot.id] = {
    name: player.name,
    club: state.currentTeam.club,
    season: state.currentTeam.season,
    overall: player.overall,
    pos: pos,
    label: freeSlot.label,
    apps: player.apps,
    goals: player.goals,
    isReserve: true,
    birthYear: player.birthYear,
  };

  afterPick();
}

function pickCoach(coach) {
  state.coach = { name: coach.name || 'Nieznany Trener' };
  afterPick();
}

function afterPick() {
  renderFormation();
  if (draftIsComplete()) {
    setTimeout(showResult, 300);
    return;
  }
  drawNextTeam();
}

const POS_ORDER = ['GK','DEF','MID','FWD'];

const POS_PL    = { GK:'B', DEF:'O', MID:'P', FWD:'N' };

const POS_FULL  = { GK:'BRAMKARZE', DEF:'OBROŃCY', MID:'POMOCNICY', FWD:'NAPASTNICY' };

function renderFormation() {
  // Mini-boisko
  const pitch = document.getElementById('mini-pitch');
  pitch.innerHTML = '';
  SLOTS.forEach((slot, i) => {
    const player = state.squad[slot.id];
    const isCurrent = !player && availablePositions().includes(slot.pos);
    const div = document.createElement('div');
    div.className = 'pitch-player';
    div.style.left = slot.x + '%';
    div.style.top  = slot.y + '%';
    const dotClass = player ? 'filled' : (isCurrent ? 'current' : 'empty');
    const dotLabel = player ? (player.overall >= 88 ? '★' : '') : (isCurrent ? '?' : '');
    div.innerHTML = `
      <div class="pitch-dot ${dotClass}">${dotLabel}</div>
      <div class="pitch-name">${player ? player.name.split(' ').slice(-1)[0] : ''}</div>
    `;
    pitch.appendChild(div);
  });

  // Ławka rezerwowych + trener — pod boiskiem
  const bench = document.getElementById('bench-strip');
  bench.innerHTML = '';
  RESERVE_SLOTS.map(s => s.id).forEach(id => {
    const player = state.squad[id];
    const isCurrent = !player;
    const wrap = document.createElement('div');
    wrap.className = 'bench-dot-wrap';
    const dotClass = player ? 'filled' : (isCurrent ? 'current' : 'empty');
    wrap.innerHTML = `
      <div class="bench-dot ${dotClass}"></div>
      <div class="bench-name">${player ? player.name : (isCurrent ? '?' : '—')}</div>
    `;
    bench.appendChild(wrap);
  });
  const coachWrap = document.createElement('div');
  coachWrap.className = 'bench-dot-wrap';
  const coachDotClass = state.coach ? 'coach filled' : (!state.coach ? 'coach current' : 'coach empty');
  coachWrap.innerHTML = `
    <div class="bench-dot ${coachDotClass}">T</div>
    <div class="bench-name">${state.coach ? state.coach.name : '?'}</div>
  `;
  bench.appendChild(coachWrap);

  // Slots lista
  const list = document.getElementById('slots-list');
  list.innerHTML = '';
  SLOTS.forEach((slot, i) => {
    const player = state.squad[slot.id];
    const isCurrent = !player && availablePositions().includes(slot.pos);
    const row = document.createElement('div');
    row.className = `slot-row${player ? ' filled' : ''}${isCurrent ? ' current' : ''}`;

    row.innerHTML = player
      ? '<span class="slot-pos">' + (POS_PL[slot.pos]||slot.pos) + '</span>' +
        '<span class="slot-name">' + player.name + '</span>' +
        '<span class="slot-club" style="font-size:13px;color:var(--gray);white-space:nowrap;">' + player.club + ' ' + player.season + '</span>'
      : '<span class="slot-pos">' + (POS_PL[slot.pos]||slot.pos) + '</span>' +
        '<span class="slot-name" style="color:' + (isCurrent ? 'var(--accent)' : 'var(--gray)') + ';">' +
        (isCurrent ? '▶ WYBIERZ' : '—') + '</span>';
    list.appendChild(row);
  });
  RESERVE_SLOTS.forEach(slot => {
    const player = state.squad[slot.id];
    const isCurrent = !player;
    const row = document.createElement('div');
    row.className = `slot-row${player ? ' filled' : ''}${isCurrent ? ' current' : ''}`;
    row.style.opacity = '0.7';
    row.innerHTML = player
      ? '<span class="slot-pos">' + POS_PL[player.pos] + '</span>' +
        '<span class="slot-name">' + player.name + ' (REZ)</span>' +
        '<span class="slot-club" style="font-size:13px;color:var(--gray);white-space:nowrap;">' + player.club + ' ' + player.season + '</span>'
      : '<span class="slot-pos">' + POS_PL[slot.pos] + '</span>' +
        '<span class="slot-name" style="color:' + (isCurrent ? 'var(--accent)' : 'var(--gray)') + ';">' +
        (isCurrent ? '▶ WYBIERZ REZERWOWEGO' : '—') + '</span>';
    list.appendChild(row);
  });
  {
    const row = document.createElement('div');
    const isCurrent = !state.coach;
    row.className = `slot-row${state.coach ? ' filled' : ''}${isCurrent ? ' current' : ''}`;
    row.style.borderColor = '#9b59b6';
    row.innerHTML = state.coach
      ? '<span class="slot-pos" style="color:#c99bf0;">T</span><span class="slot-name">' + state.coach.name + '</span>'
      : '<span class="slot-pos" style="color:#c99bf0;">T</span><span class="slot-name" style="color:var(--accent);">▶ WYBIERZ TRENERA</span>';
    list.appendChild(row);
  }
}
