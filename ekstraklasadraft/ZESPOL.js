// ============================================================
// ZESPOL.JS — ekran po drafcie, nazwa/barwy własnej drużyny,
// ekran ZARZĄDZAJ ZESPOŁEM (jedenastka/ławka/poza składem, między meczami).
// ============================================================


function getStartingXISquad() {
  if (!state.startingXI || !state.startingXI.length) return state.squad;
  const result = {};
  state.startingXI.forEach(id => { if (state.squad[id]) result[id] = state.squad[id]; });
  return result;
}

function ensureStartingXI() {
  // Najpierw czyścimy: usuwamy duplikaty i id, które już nie istnieją w
  // state.squad (np. po jakiejś wcześniejszej niespójności) — dopiero na
  // OCZYSZCZONEJ liście sprawdzamy, czy jest dokładnie 11. Bez tego czyszczenia
  // zepsuta tablica (np. z duplikatem) mogła przejść test długości przypadkiem
  // i pierwszy skład rósł/duplikował się dalej zamiast się naprawić.
  const cleaned = (state.startingXI || []).filter((id, i, arr) => state.squad[id] && arr.indexOf(id) === i);
  if (cleaned.length === 11) { state.startingXI = cleaned; return; }
  const mainSlots = Object.keys(state.squad).filter(id => !state.squad[id].isReserve);
  state.startingXI = mainSlots.length === 11 ? mainSlots : Object.keys(state.squad).slice(0, 11);
}

function ensureTeamNameDefaults() {
  if (state.myClub) return;
  if (!state.myTeamName) state.myTeamName = 'Moja Drużyna';
  if (!state.myTeamColors) {
    const PALETTE = ["#E63946", "#457B9D", "#2A9D8F", "#F4A261", "#8AB17D", "#9B5DE5", "#00BBF9", "#FB8500"];
    const primary = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const secondary = Math.random() < 0.5 ? '#FFFFFF' : '#000000';
    state.myTeamColors = { primary, secondary };
  }
}

function goToModeSelect() {
  showScreen('screen-mode-select');
}

function goToManageSquad() {
  ensureStartingXI();
  ensureBenchIds();
  state.swapPendingReserveId = null;
  state.manageSquadReturnScreen = state.currentScreenId || 'screen-result';
  renderManageSquad();
  const autoSubsCheckbox = document.getElementById('auto-subs-checkbox');
  if (autoSubsCheckbox) autoSubsCheckbox.checked = !!state.autoSubsEnabled;
  showScreen('screen-manage-squad');
}

function toggleAutoSubs() {
  const checkbox = document.getElementById('auto-subs-checkbox');
  state.autoSubsEnabled = !!(checkbox && checkbox.checked);
}

function returnFromManageSquad() {
  showScreen(state.manageSquadReturnScreen || 'screen-result');
}

function renderManageSquad() {
  const pendingReservePos = state.swapPendingReserveId ? (state.squad[state.swapPendingReserveId] || {}).pos : null;

  // ── JEDENASTKA ──
  const xiList = document.getElementById('manage-xi-list');
  xiList.innerHTML = '';
  const activeSorted = state.startingXI.filter(id => state.squad[id]).sort((a, b) => {
    const pa = state.squad[a], pb = state.squad[b];
    const oa = LINEUP_POS_ORDER.indexOf(pa.pos), ob = LINEUP_POS_ORDER.indexOf(pb.pos);
    if (oa !== ob) return oa - ob;
    return pb.overall - pa.overall;
  });
  activeSorted.forEach(id => {
    const p = state.squad[id];
    const isSwapTarget = pendingReservePos && p.pos === pendingReservePos;
    const row = document.createElement('div');
    row.className = 'lineup-row';
    row.innerHTML = `
      <span class="lineup-pos">${POS_PL[p.pos] || p.pos}</span>
      <span class="lineup-name">${p.name}</span>
      <span style="font-size:12px;color:var(--gray);margin-left:6px;">${getPlayerAge(p)} lat</span>
      <span class="lineup-ovr c-${ovrClass(p.overall)}">${p.overall}</span>
      ${trainingSelectHtml(id)}
    `;
    const trainingSel = row.querySelector('.training-select');
    if (trainingSel) {
      trainingSel.addEventListener('click', e => e.stopPropagation());
      trainingSel.addEventListener('change', e => { e.stopPropagation(); setPlayerTrainingLevel(id, e.target.value); });
    }
    if (pendingReservePos) {
      if (isSwapTarget) {
        row.style.cursor = 'pointer';
        row.style.outline = '1px solid var(--accent)';
        row.addEventListener('click', () => { confirmLineupSwap(id); renderManageSquad(); });
      } else {
        row.style.opacity = '0.4';
      }
    }
    xiList.appendChild(row);
  });

  // ── W KADRZE MECZOWEJ (state.benchIds) ──
  const benchList = document.getElementById('manage-bench-list');
  benchList.innerHTML = '';
  const benchIds = state.benchIds.filter(id => state.squad[id] && !state.startingXI.includes(id));
  if (!benchIds.length) benchList.innerHTML = '<div style="color:var(--gray);font-size:14px;">Nikogo tu jeszcze nie ma.</div>';
  benchIds.forEach(id => renderManageReserveRow(benchList, id, true));

  // ── POZA SKŁADEM (rezerwowi NIE w benchIds) ──
  const outsideList = document.getElementById('manage-outside-list');
  outsideList.innerHTML = '';
  const outsideIds = getAllReserveIds().filter(id => !state.benchIds.includes(id) && !state.startingXI.includes(id));
  if (!outsideIds.length) outsideList.innerHTML = '<div style="color:var(--gray);font-size:14px;">Nikogo tu nie ma — wszyscy rezerwowi są w kadrze meczowej.</div>';
  outsideIds.forEach(id => renderManageReserveRow(outsideList, id, false));
}

function renderManageReserveRow(container, id, isInBench) {
  const p = state.squad[id];
  const isPending = state.swapPendingReserveId === id;
  const row = document.createElement('div');
  row.className = 'lineup-row';
  row.style.opacity = isPending ? '1' : '0.85';
  if (isPending) row.style.outline = '1px solid var(--gold)';
  row.innerHTML = `
    <span class="lineup-pos">${POS_PL[p.pos] || p.pos}</span>
    <span class="lineup-name">${p.name}</span>
    <span style="font-size:12px;color:var(--gray);margin-left:6px;">${getPlayerAge(p)} lat</span>
    <span class="lineup-ovr c-${ovrClass(p.overall)}">${p.overall}</span>
    ${trainingSelectHtml(id)}
    <span style="color:var(--accent);margin-left:6px;cursor:pointer;" data-action="swap">${isPending ? '⏳' : '⇄ zamień'}</span>
    <span style="color:var(--gray);margin-left:6px;cursor:pointer;text-decoration:underline;" data-action="toggle">${isInBench ? 'wypisz z kadry' : 'wpisz do kadry'}</span>
  `;
  const swapSpan = row.querySelector('[data-action="swap"]');
  const toggleSpan = row.querySelector('[data-action="toggle"]');
  const trainingSel = row.querySelector('.training-select');
  if (trainingSel) trainingSel.addEventListener('change', e => setPlayerTrainingLevel(id, e.target.value));
  swapSpan.addEventListener('click', () => { startLineupSwap(id); renderManageSquad(); });
  toggleSpan.addEventListener('click', () => {
    if (isInBench) {
      state.benchIds = state.benchIds.filter(x => x !== id);
    } else {
      if (state.benchIds.length >= 5) { alert('Kadra meczowa jest już pełna (5 miejsc) — najpierw wypisz kogoś, żeby zrobić miejsce.'); return; }
      state.benchIds = state.benchIds.concat([id]);
    }
    renderManageSquad();
  });
  container.appendChild(row);
}

function toggleTeamNameEditor() {
  const el = document.getElementById('team-name-editor');
  const willShow = el.style.display === 'none' || !el.style.display;
  if (willShow) {
    document.getElementById('team-name-input').value = (state.myTeamName && state.myTeamName !== 'Moja Drużyna') ? state.myTeamName : '';
    document.getElementById('team-color-primary').value = (state.myTeamColors && state.myTeamColors.primary) || '#C8102E';
    document.getElementById('team-color-secondary').value = (state.myTeamColors && state.myTeamColors.secondary) || '#FFFFFF';
  }
  el.style.display = willShow ? 'block' : 'none';
}

function saveTeamNameAndColors() {
  const name = document.getElementById('team-name-input').value.trim();
  const primary = document.getElementById('team-color-primary').value;
  const secondary = document.getElementById('team-color-secondary').value;
  state.myTeamName = name || 'Moja Drużyna';
  state.myTeamColors = { primary, secondary };
  document.getElementById('team-name-editor').style.display = 'none';
}

function showResult() {
  if (state.pendingMundial26AfterDraft) {
    state.pendingMundial26AfterDraft = false;
    ensureStartingXI();
    state.myOverall = calcTeamOverall(getStartingXISquad());
    ensureTeamNameDefaults();
    goToMundial26Setup();
    return;
  }
  showScreen('screen-result');
  ensureStartingXI();
  const ovr = calcTeamOverall(getStartingXISquad());
  state.myOverall = ovr;
  ensureTeamNameDefaults();

  const el = document.getElementById('result-rating');
  el.textContent = ovr;
  el.className = `result-rating c-${ovrClass(ovr)}`;

  const sq = document.getElementById('result-squad');
  sq.innerHTML = '';
  SLOTS.forEach(slot => {
    const p = state.squad[slot.id];
    if (!p) return;
    const row = document.createElement('div');
    row.className = 'slot-row filled';
    row.style.marginBottom = '3px';
    row.innerHTML = `
      <span class="slot-pos">${p.pos}</span>
      <span class="slot-name">${p.name}</span>
      <span class="slot-club">${p.club} ${p.season}</span>
      <span class="slot-ovr c-${ovrClass(p.overall)}">${p.overall}</span>
    `;
    sq.appendChild(row);
  });

  getAllReserveIds().forEach(id => {
    const p = state.squad[id];
    if (!p) return;
    const row = document.createElement('div');
    row.className = 'slot-row filled';
    row.style.marginBottom = '3px';
    row.style.opacity = '0.55';
    row.innerHTML = `
      <span class="slot-pos">${p.pos}</span>
      <span class="slot-name">${p.name} <span style="font-size:11px;color:var(--gray);">(REZ)</span></span>
      <span class="slot-club">${p.club} ${p.season}</span>
      <span class="slot-ovr c-${ovrClass(p.overall)}">${p.overall}</span>
    `;
    sq.appendChild(row);
  });

  if (state.coach) {
    const row = document.createElement('div');
    row.className = 'slot-row filled';
    row.style.marginBottom = '3px';
    row.style.opacity = '0.55';
    row.style.borderColor = '#9b59b6';
    row.innerHTML = `
      <span class="slot-pos" style="color:#c99bf0;">T</span>
      <span class="slot-name">${state.coach.name} <span style="font-size:11px;color:var(--gray);">(TRENER)</span></span>
    `;
    sq.appendChild(row);
  }
}
