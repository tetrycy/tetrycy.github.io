// ============================================================
// MECZ-UI.JS — ekran żywego meczu: banery klubowe, tempo, taktyka,
// reakcje trenerskie, zmęczenie, podgląd składów, pauza/pomiń.
// ============================================================


function applyLineClubColor(line, baseClass, ev) {
  if (baseClass !== 'tl-flavor') return;
  if (ev.team && state.liveKitColors) {
    const kit = ev.team === 'me' ? state.liveKitColors.my : state.liveKitColors.opp;
    if (kit && kit.primary) {
      line.classList.add('tl-team-fill');
      line.style.background = kit.primary;
      line.style.color = kit.secondary || '#fff';
      return;
    }
  }
  line.classList.add('tl-flavor-neutral');
}

function renderScoreboard() {
  function buildLines(scorers, cards) {
    const lines = scorers.map(s => `⚽ ${s.player}${s.minute != null ? " " + s.minute + "'" : ''}${s.penalty ? ' (k.)' : ''}`);
    cards.forEach(c => lines.push(`${c.type === 'red' ? '🟥' : '🟨'} ${c.player}${c.minute != null ? " " + c.minute + "'" : ''}`));
    return lines.join('<br>');
  }
  document.getElementById('po-scoreboard-me').innerHTML = buildLines(state.liveScorersMe || [], state.liveCardsMe || []);
  document.getElementById('po-scoreboard-opp').innerHTML = buildLines(state.liveScorersOpp || [], state.liveCardsOpp || []);
}

function applyClubBanners(myTeam, opp) {
  const myBanner = document.getElementById('po-my-name-banner');
  const oppBanner = document.getElementById('po-opp-name-banner');
  const resetBanner = (el) => { el.style.background = 'transparent'; el.style.color = 'var(--white)'; };
  resetBanner(myBanner);
  resetBanner(oppBanner);
  state.liveKitColors = null; // resetujemy — jeśli nic dalej nie ustawi, kolorowanie komentarza zostaje neutralne

  if (typeof getClubKitColors !== 'function') return; // KLUBY-KOLORY.js nie wczytany — bezpiecznie nic nie robimy

  let myClub = myTeam.club || null;
  const oppClub = opp.club || null;

  // Brak prawdziwego klubu, ale gracz nazwał zespół i wybrał barwy — rejestrujemy
  // je tymczasowo pod specjalnym kluczem, żeby DARMOWO skorzystać z tej samej
  // logiki wykrywania kolizji (bez duplikowania jej tutaj).
  if (!myClub && state.myTeamColors) {
    myClub = '__MOJA_DRUZYNA_TYMCZASOWA__';
    window.CLUB_COLORS[myClub] = { home: state.myTeamColors, away: state.myTeamColors };
  }

  if (!myClub && !oppClub) return;

  const kits = getClubKitColors(myClub || '', oppClub || '');
  state.liveKitColors = kits; // zapamiętujemy na cały mecz — używane też do kolorowania linijek komentarza
  if (kits.my.primary) { myBanner.style.background = kits.my.primary; myBanner.style.color = kits.my.secondary || '#fff'; }
  if (kits.opp.primary) { oppBanner.style.background = kits.opp.primary; oppBanner.style.color = kits.opp.secondary || '#fff'; }
}

function resetMatchScreen(opp, myTeam, venue) {
  venue = venue || 'neutral'; // domyślnie neutralny teren — dotyczy Play-offów/Mundiali/starych trybów
  state.isAwayMatch = (venue === 'away');
  document.getElementById('match-card-container').parentElement.classList.toggle('away-match', venue === 'away');
  document.getElementById('btn-manage-squad').style.display = 'inline-block';
  document.getElementById('btn-save-game').style.display = 'inline-block';
  document.getElementById('po-opp-name-banner').textContent = opp.label;
  document.getElementById('po-my-name-banner').textContent = myTeam.label || 'TWOJA DRUŻYNA';
  applyClubBanners(myTeam, opp);
  document.getElementById('po-opp-ovr').textContent = `OVR ${opp.overall}`;
  document.getElementById('po-opp-ovr').style.color = 'var(--gray)';
  document.getElementById('po-my-ovr').textContent = `OVR ${state.myOverall}`;
  document.getElementById('po-my-ovr').style.color = 'var(--gold)';
  document.getElementById('po-score').textContent = 'VS';
  document.getElementById('po-score').className = 'match-score';
  document.getElementById('po-timeline').innerHTML = '';
  document.getElementById('po-commentary').textContent = '';
  document.getElementById('btn-play-match').style.display = 'inline-block';
  document.getElementById('btn-skip-match').style.display = 'none';
  document.getElementById('btn-next-round').style.display = 'none';
  document.getElementById('btn-playoff-end').style.display = 'none';

  // Skład aktywny NA TEN MECZ — świeża kopia (z id slotów) z trwałego stanu
  // drużyny. Ewentualne zmiany zawodników zrobione w trakcie tego meczu
  // (patrz confirmLineupSwap) mutują WYŁĄCZNIE tę kopię — nigdy state.startingXI
  // ani state.squad — więc znikają same, gdy zacznie się kolejny mecz.
  ensureStartingXI();
  ensureBenchIds();
  const activeIds = state.startingXI.filter(id => state.squad[id]);
  state.liveActiveIds = activeIds.slice();
  state.liveBenchAvailable = state.benchIds.filter(id => state.squad[id] && !activeIds.includes(id));
  state.liveIneligibleIds = new Set();
  state.replayUsedForThisMatch = false; // POWTÓRZ MECZ (traits) — jedno powtórzenie na mecz
  state.matchSubPendingReserveId = null;
  // TRENING poziom 2 (per zawodnik): każdy z przypisanym poziomem 2 dostaje
  // trwałą deltę ±2 do overallu — przed policzeniem formy dnia poniżej.
  applyPermanentTrainingTick();
  // TRENING poziom 1 (per zawodnik): forma dnia ±3, losowana raz na mecz dla
  // każdego zawodnika z przypisanym poziomem 1 (nie tylko wystawionej jedenastki),
  // żeby zmiennik wchodzący później też miał swoją formę zamiast wartości bazowej.
  state.liveTrainingDeltas = computeMatchTrainingFluctuations();

  state.liveMatchRoster = activeIds.map(id => {
    const p = state.squad[id];
    return { name: p.name, pos: p.pos, overall: p.overall, birthYear: p.birthYear, season: p.season, __slotId: id };
  });
  state.liveMatchRoster = applyTrainingDeltasToRoster(state.liveMatchRoster);
  myTeam.roster = state.liveMatchRoster;

  document.getElementById('lineup-my-title').textContent = myTeam.label || 'TWOJA DRUŻYNA';
  document.getElementById('lineup-opp-title').textContent = opp.label;
  renderLineups(myTeam.roster, opp.roster, opp.reserves);
  updateSpeedButtons();
  updateCommentaryButtons();
  resetTacticsPanel();
  highlightZone('CENTER');
  state.liveZoneCounts = { GOAL_ME: 0, BOX_ME: 0, CENTER: 0, BOX_OPP: 0, GOAL_OPP: 0 };
  updateZonePercentages();
  state.liveScorersMe = []; state.liveScorersOpp = [];
  state.liveCardsMe = []; state.liveCardsOpp = [];
  state.liveFatigueMy = null; state.liveFatigueOpp = null;
  renderScoreboard();

  // Miejsce rozgrywania meczu — losujemy bonus RAZ, na start meczu, i trzymamy
  // przez całe spotkanie (ta sama wartość używana w podglądzie i w silniku).
  const venueResult = computeVenueBonuses(venue);
  state.matchVenueBonus = { my: venueResult.myBonus, opp: venueResult.oppBonus };
  const venueLabel = venue === 'home' ? '🏠 U SIEBIE' : venue === 'away' ? 'NA WYJEŹDZIE' : '⚖ TEREN NEUTRALNY';
  document.getElementById('po-venue-label').textContent = venueLabel;

  // Trzy overalle formacji (OBRONA/POMOC/ATAK) — tego samego modelu, którego używa silnik V2
  const myL = lineAverages(myTeam.roster);
  const oppL = lineAverages(opp.roster);
  document.getElementById('po-my-lines').textContent =
    `OBR ${(myL.DEF + venueResult.myBonus.DEF).toFixed(1)} · POM ${(myL.MID + venueResult.myBonus.MID).toFixed(1)} · ATK ${(myL.FWD + venueResult.myBonus.FWD).toFixed(1)}`;
  document.getElementById('po-opp-lines').textContent =
    `OBR ${(oppL.DEF + venueResult.oppBonus.DEF).toFixed(1)} · POM ${(oppL.MID + venueResult.oppBonus.MID).toFixed(1)} · ATK ${(oppL.FWD + venueResult.oppBonus.FWD).toFixed(1)}`;
}

const SPEED_LEVELS = ['veryslow', 'slow', 'normal', 'fast', 'veryfast', 'ultra', 'extreme'];

const SPEED_MS = { veryslow: 5500, slow: 3500, normal: 2000, fast: 900, veryfast: 400, ultra: 200, extreme: 130 };

const SPEED_LABELS = {
  veryslow: 'BARDZO WOLNO', slow: 'WOLNO', normal: 'NORMALNIE', fast: 'SZYBKO',
  veryfast: 'BŁYSKAWICZNIE', ultra: 'ULTRA (2×)', extreme: 'EKSTREMALNIE (3×)',
};

function setSpeed(s) {
  state.speed = s;
  updateSpeedButtons();
  // Jeśli mecz właśnie trwa, restartujemy timer z nowym tempem — bez tego zmiana
  // nie miała żadnego efektu aż do następnego meczu.
  if (liveTimer && state.liveStepFn) {
    clearInterval(liveTimer);
    liveTimer = setInterval(state.liveStepFn, SPEED_MS[s] || SPEED_MS.normal);
  }
}

function onSpeedSliderChange(idx) {
  setSpeed(SPEED_LEVELS[parseInt(idx, 10)] || 'veryslow');
}

function updateSpeedButtons() {
  const idx = SPEED_LEVELS.indexOf(state.speed);
  const slider = document.getElementById('speed-slider');
  if (slider) slider.value = idx >= 0 ? idx : 0;
  const label = document.getElementById('speed-slider-label');
  if (label) label.textContent = SPEED_LABELS[state.speed] || SPEED_LABELS.veryslow;
}

function toggleBigCommentaryText() {
  state.bigCommentaryText = document.getElementById('big-text-toggle').checked;
  const timelineEl = document.getElementById('po-timeline');
  if (timelineEl) timelineEl.style.fontSize = state.bigCommentaryText ? '' : '16px';
}

function setCommentaryStyle(s) {
  state.commentaryStyle = s;
  updateCommentaryButtons();
}

function updateCommentaryButtons() {
  ['classic','waldemar'].forEach(s => {
    const el = document.getElementById('style-' + s);
    if (el) el.classList.toggle('active', state.commentaryStyle === s);
  });
}

function toggleLineups() {
  const panel = document.getElementById('lineups-panel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function toggleCommentaryOptionsPanel() {
  const panel = document.getElementById('commentary-options-details');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

// Otwarcie taktyki w trakcie żywego meczu automatycznie pauzuje grę — łatwiej
// spokojnie przemyśleć zmianę niż robić to "w locie", gdy akcja leci dalej.
function toggleTacticsPanel() {
  const panel = document.getElementById('tactics-details');
  const willShow = panel.style.display === 'none';
  panel.style.display = willShow ? 'block' : 'none';
  if (willShow && state.liveGen && !livePaused) {
    toggleLivePause();
  }
}

const LINEUP_POS_ORDER = ['GK','DEF','MID','FWD'];

function fatigueBarHtml(pct) {
  if (pct == null) return '';
  let color;
  if (pct >= 98) color = '#2ecc71';       // pełne siły - zielony
  else if (pct >= 95) color = '#7ec850';  // lekko zmęczony - inny odcień zielonego
  else if (pct >= 93) color = '#f1c40f';  // żółty
  else if (pct >= 91) color = '#e67e22';  // pomarańczowy
  else color = '#e74c3c';                 // czerwony - najbardziej zmęczony
  return `<span style="display:inline-block;width:36px;height:6px;background:#333;border-radius:2px;overflow:hidden;margin-left:6px;vertical-align:middle;">
    <span style="display:block;width:${pct}%;height:100%;background:${color};"></span>
  </span>`;
}

function getFatiguePct(name, side) {
  const arr = side === 'me' ? state.liveFatigueMy : state.liveFatigueOpp;
  if (!arr) return null;
  const entry = arr.find(f => f.name === name);
  return entry ? entry.pct : null;
}

function refreshFatigueDisplay() {
  const panel = document.getElementById('lineups-panel');
  if (panel.style.display !== 'none' && panel.style.display) {
    renderMyLineupWithSwap();
    if (state.liveOppRosterForDisplay) renderLineupList('lineup-opp-list', state.liveOppRosterForDisplay, state.liveOppReservesForDisplay);
  }
  // Ogólne overalle na górze (po-my-ovr / po-opp-ovr) też liczą się na żywo,
  // jako średnia zmęczonych overalli z aktualnego składu na boisku.
  if (state.liveFatigueMy && state.liveMyRosterForOvr) {
    const avgMy = state.liveMyRosterForOvr.reduce((sum, p) => {
      const pct = getFatiguePct(p.name, 'me');
      return sum + (pct != null ? p.overall - (100 - pct) : p.overall);
    }, 0) / state.liveMyRosterForOvr.length;
    document.getElementById('po-my-ovr').textContent = `OVR ${Math.round(avgMy)}`;
  }
  if (state.liveFatigueOpp && state.liveOppRosterForDisplay) {
    const avgOpp = state.liveOppRosterForDisplay.reduce((sum, p) => {
      const pct = getFatiguePct(p.name, 'opp');
      return sum + (pct != null ? p.overall - (100 - pct) : p.overall);
    }, 0) / state.liveOppRosterForDisplay.length;
    document.getElementById('po-opp-ovr').textContent = `OVR ${Math.round(avgOpp)}`;
  }
}

function renderLineups(myRoster, oppRoster, oppReserves) {
  state.liveOppRosterForDisplay = oppRoster;
  state.liveOppReservesForDisplay = oppReserves;
  state.liveMyRosterForOvr = myRoster;
  renderMyLineupWithSwap();
  renderLineupList('lineup-opp-list', oppRoster, oppReserves);
}

// UWAGA: ten panel to ZMIANY W TRAKCIE MECZU, nie edycja trwałego składu.
// Działa wyłącznie na state.liveActiveIds/state.liveMatchRoster/state.liveBenchAvailable
// (kopia zrobiona na starcie meczu w resetMatchScreen) — nigdy nie rusza
// state.startingXI/state.benchIds/state.squad. Każda zmiana jest nieodwracalna:
// kto zejdzie (state.liveIneligibleIds), ten nie wraca do końca TEGO meczu.
// Trwałe zmiany jedenastki robi się między meczami w ZARZĄDZAJ ZESPOŁEM.
function renderMyLineupWithSwap() {
  if (!state.liveActiveIds) return;
  const el = document.getElementById('lineup-my-list');
  el.innerHTML = '';

  const pendingReservePos = state.matchSubPendingReserveId ? (state.squad[state.matchSubPendingReserveId] || {}).pos : null;

  const activeSorted = state.liveActiveIds.filter(id => state.squad[id]).sort((a, b) => {
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
    const liveOvr = getFatiguePct(p.name, 'me') != null ? p.overall - (100 - getFatiguePct(p.name, 'me')) : p.overall;
    row.innerHTML = `
      <span class="lineup-pos">${POS_PL[p.pos] || p.pos}</span>
      <span class="lineup-name">${p.name}</span>
      <span class="lineup-ovr c-${ovrClass(liveOvr)}">${liveOvr}</span>
      ${fatigueBarHtml(getFatiguePct(p.name, 'me'))}
    `;
    if (pendingReservePos) {
      if (isSwapTarget) {
        row.style.cursor = 'pointer';
        row.style.outline = '1px solid var(--accent)';
        row.addEventListener('click', () => confirmMatchSub(id));
      } else {
        row.style.opacity = '0.4'; // inna pozycja - nie mozna tu wstawic tego rezerwowego
      }
    }
    el.appendChild(row);
  });

  const benchIds = state.liveBenchAvailable.filter(id => state.squad[id]);
  if (benchIds.length) {
    const benchHeader = document.createElement('div');
    benchHeader.style.cssText = 'font-family:var(--font-hud);font-size:6px;color:var(--gray);letter-spacing:1px;margin:10px 0 4px;';
    benchHeader.textContent = state.matchSubPendingReserveId
      ? `ŁAWKA — kliknij zawodnika NA TEJ SAMEJ POZYCJI (${POS_PL[pendingReservePos] || pendingReservePos}) po lewej, kogo zastąpi`
      : 'ŁAWKA — zmiana jest nieodwracalna do końca tego meczu';
    el.appendChild(benchHeader);

    benchIds.forEach(id => {
      const p = state.squad[id];
      const isPending = state.matchSubPendingReserveId === id;
      const row = document.createElement('div');
      row.className = 'lineup-row';
      row.style.opacity = isPending ? '1' : '0.6';
      row.style.cursor = 'pointer';
      if (isPending) row.style.outline = '1px solid var(--gold)';
      row.innerHTML = `
        <span class="lineup-pos">${POS_PL[p.pos] || p.pos}</span>
        <span class="lineup-name">${p.name}</span>
        <span class="lineup-ovr c-${ovrClass(p.overall)}">${p.overall}</span>
        <span style="color:var(--accent);margin-left:6px;">${isPending ? '⏳' : '→'}</span>
      `;
      row.addEventListener('click', () => startMatchSub(id));
      el.appendChild(row);
    });
  }

  if (state.liveIneligibleIds && state.liveIneligibleIds.size) {
    const outHeader = document.createElement('div');
    outHeader.style.cssText = 'font-family:var(--font-hud);font-size:6px;color:var(--gray);letter-spacing:1px;margin:10px 0 4px;';
    outHeader.textContent = 'ZESZLI Z BOISKA (nie mogą wrócić do końca meczu)';
    el.appendChild(outHeader);
    [...state.liveIneligibleIds].forEach(id => {
      const p = state.squad[id];
      if (!p) return;
      const row = document.createElement('div');
      row.className = 'lineup-row';
      row.style.opacity = '0.35';
      row.innerHTML = `
        <span class="lineup-pos">${POS_PL[p.pos] || p.pos}</span>
        <span class="lineup-name">${p.name}</span>
        <span class="lineup-ovr c-${ovrClass(p.overall)}">${p.overall}</span>
      `;
      el.appendChild(row);
    });
  }
}

// ── Zmiany W TRAKCIE MECZU (nieodwracalne, tylko na ten mecz) ──
// Osobne od startLineupSwap/confirmLineupSwap poniżej, które to z kolei są
// współdzielone z ekranem ZARZĄDZAJ ZESPOŁEM (ZESPOL.js) i tam NADAL trwale
// zmieniają state.startingXI/state.benchIds — to jest w pełni zamierzone,
// bo ten ekran służy właśnie do trwałych zmian między meczami.
function startMatchSub(reserveId) {
  state.matchSubPendingReserveId = (state.matchSubPendingReserveId === reserveId) ? null : reserveId;
  if (document.getElementById('lineup-my-list')) renderMyLineupWithSwap();
}

function confirmMatchSub(activeId) {
  const reserveId = state.matchSubPendingReserveId;
  if (!reserveId) return;
  if (!state.liveActiveIds || !state.liveActiveIds.includes(activeId)) { state.matchSubPendingReserveId = null; return; }
  const activePlayer = state.squad[activeId];
  const reservePlayer = state.squad[reserveId];
  if (!activePlayer || !reservePlayer || activePlayer.pos !== reservePlayer.pos) {
    alert(`Nie można zamienić — ${reservePlayer ? reservePlayer.name : 'rezerwowy'} gra na innej pozycji.`);
    return;
  }
  if (!state.liveBenchAvailable.includes(reserveId)) {
    // Rezerwowy niedostępny w TYM meczu (już wszedł, albo zszedł i nie może wrócić).
    state.matchSubPendingReserveId = null;
    if (document.getElementById('lineup-my-list')) renderMyLineupWithSwap();
    return;
  }

  // Zamiana dotyczy WYŁĄCZNIE tego meczu i jest nieodwracalna: schodzący trafia
  // do state.liveIneligibleIds i nie pojawi się już ani w jedenastce, ani na ławce
  // do końca spotkania. Trwały state.startingXI/state.benchIds pozostaje nietknięty.
  state.liveActiveIds = state.liveActiveIds.filter(id => id !== activeId).concat([reserveId]);
  state.liveBenchAvailable = state.liveBenchAvailable.filter(id => id !== reserveId);
  state.liveIneligibleIds.add(activeId);

  // Ta sama tablica obiektowa, którą trzyma (przez referencję) trwający silnik
  // meczu (jeśli mecz już się toczy) — podmiana w miejscu, żeby zmiana realnie
  // zadziałała w bieżącej symulacji, a nie tylko w podglądzie składu.
  if (state.liveMatchRoster) {
    const idx = state.liveMatchRoster.findIndex(p => p.__slotId === activeId);
    if (idx !== -1) {
      state.liveMatchRoster[idx] = applyTrainingDeltasToRoster([{
        name: reservePlayer.name, pos: reservePlayer.pos, overall: reservePlayer.overall,
        birthYear: reservePlayer.birthYear, season: reservePlayer.season, __slotId: reserveId,
      }])[0];
    }
  }

  state.matchSubPendingReserveId = null;
  if (document.getElementById('lineup-my-list')) renderMyLineupWithSwap();
}

// ── Zmiany TRWAŁE, między meczami (ekran ZARZĄDZAJ ZESPOŁEM w ZESPOL.js) ──
function startLineupSwap(reserveId) {
  state.swapPendingReserveId = (state.swapPendingReserveId === reserveId) ? null : reserveId;
  if (document.getElementById('lineup-my-list')) renderMyLineupWithSwap();
}

function confirmLineupSwap(activeId) {
  const reserveId = state.swapPendingReserveId;
  if (!reserveId) return;
  const activePlayer = state.squad[activeId];
  const reservePlayer = state.squad[reserveId];
  if (!activePlayer || !reservePlayer || activePlayer.pos !== reservePlayer.pos) {
    alert(`Nie można zamienić — ${reservePlayer ? reservePlayer.name : 'rezerwowy'} gra na innej pozycji.`);
    return;
  }
  if (state.startingXI.includes(reserveId)) {
    // Ten "rezerwowy" już gra w jedenastce — nie ma czego zamieniać (zapobiega
    // wpuszczaniu tego samego zawodnika wielokrotnie / duplikatom w składzie).
    state.swapPendingReserveId = null;
    if (document.getElementById('lineup-my-list')) renderMyLineupWithSwap();
    return;
  }
  // Zamiana ról: kto wchodzi (rezerwowy) opuszcza ławkę, kto wypada (aktywny)
  // trafia na jego miejsce na ławce — jedenastka i ławka zawsze się nie powielają.
  state.startingXI = state.startingXI.filter(id => id !== activeId).concat([reserveId]);
  state.benchIds = state.benchIds.filter(id => id !== reserveId).concat([activeId]);
  state.myOverall = calcTeamOverall(getStartingXISquad());
  state.swapPendingReserveId = null;
  if (document.getElementById('lineup-my-list')) renderMyLineupWithSwap();
}

function renderLineupList(elId, roster, reserves) {
  const el = document.getElementById(elId);
  el.innerHTML = '';
  if (!roster || !roster.length) {
    el.innerHTML = '<div style="color:var(--gray);font-size:14px;">Brak danych</div>';
    return;
  }
  const sorted = [...roster].sort((a,b) => {
    const pa = LINEUP_POS_ORDER.indexOf(a.pos), pb = LINEUP_POS_ORDER.indexOf(b.pos);
    if (pa !== pb) return pa - pb;
    return b.overall - a.overall;
  });
  sorted.forEach(p => {
    const row = document.createElement('div');
    row.className = 'lineup-row';
    const oppFatiguePct = getFatiguePct(p.name, 'opp');
    const liveOvr = oppFatiguePct != null ? p.overall - (100 - oppFatiguePct) : p.overall;
    row.innerHTML = `
      <span class="lineup-pos">${POS_PL[p.pos] || p.pos}</span>
      <span class="lineup-name">${p.name}</span>
      <span class="lineup-ovr c-${ovrClass(liveOvr)}">${liveOvr}</span>
      ${fatigueBarHtml(oppFatiguePct)}
    `;
    el.appendChild(row);
  });

  // Ławka rywala — informacyjnie, dla symetrii z Twoją stroną (5 najlepszych rezerwowych).
  if (reserves && reserves.length) {
    const benchHeader = document.createElement('div');
    benchHeader.style.cssText = 'font-family:var(--font-hud);font-size:6px;color:var(--gray);letter-spacing:1px;margin:10px 0 4px;';
    benchHeader.textContent = 'ŁAWKA';
    el.appendChild(benchHeader);
    reserves.forEach(p => {
      const row = document.createElement('div');
      row.className = 'lineup-row';
      row.style.opacity = '0.6';
      row.innerHTML = `
        <span class="lineup-pos">${POS_PL[p.pos] || p.pos}</span>
        <span class="lineup-name">${p.name}</span>
        <span class="lineup-ovr c-${ovrClass(p.overall)}">${p.overall}</span>
      `;
      el.appendChild(row);
    });
  }
}

// ── SILNIK MECZU TEKSTOWEGO (V2, w silnik.js) ─────────────────

// Buduje pełną sekwencję zdarzeń meczu — gole, kartki, karne, sytuacje — z realnymi nazwiskami


let matchTimers = [];

function readTactics() {
  const podania = parseInt(document.getElementById('podania-slider').value, 10) || 0;
  const agresja = parseInt(document.getElementById('agresja-slider').value, 10) || 0;
  const venueBonus = state.matchVenueBonus || { my: { DEF: 0, MID: 0, FWD: 0 }, opp: { DEF: 0, MID: 0, FWD: 0 } };
  return {
    mentality: parseInt(document.getElementById('mentality-slider').value, 10) || 0,
    podania,
    agresja,
    busParking: document.getElementById('tg-busparking').classList.contains('active'),
    stoperAtak: document.getElementById('tg-stoper-atak').classList.contains('active'),
    myHomeBonus: venueBonus.my,
    oppHomeBonus: venueBonus.opp,
  };
}

function announceTacticChange(text) {
  if (!state.liveGen) return; // ma sens tylko w trakcie trwającego meczu
  const timelineEl = document.getElementById('po-timeline');
  if (!timelineEl) return;
  const line = document.createElement('div');
  line.className = 'tl-row tl-tactic';
  line.textContent = text;
  timelineEl.prepend(line);
  timelineEl.scrollTop = 0;
}

function onPodaniaChange(rawValue) {
  const v = parseInt(rawValue, 10) || 0;
  if (v === 0) {
    announceTacticChange(rand(['📋 Trener wraca do neutralnego planu na grę z piłką.']));
  } else if (v < 0) {
    announceTacticChange(rand(['⚽ Trener gestykuluje z linii — każe budować akcje, trzymać piłkę przy nodze!', '⚽ Zmiana instrukcji: teraz gramy na spokojnie, dłużej przy piłce.']));
  } else {
    announceTacticChange(rand(['⚡ Trener krzyczy: szybciej, do przodu! Gramy prostopadłymi podaniami!', '⚡ Zmiana nastawienia — teraz liczy się tempo, nie utrzymanie piłki.']));
  }
}

function onAgresywnoscChange(rawValue) {
  const v = parseInt(rawValue, 10) || 0;
  if (v === 0) {
    announceTacticChange(rand(['📋 Trener wraca do normalnego, wyważonego stylu odbioru piłki.']));
  } else if (v > 0) {
    announceTacticChange(rand(['🥊 Trener każe ostrzej wchodzić do pojedynków — pressing na całego!', '🥊 Zmiana: teraz gramy twardo, bez taryfy ulgowej.']));
  } else {
    announceTacticChange(rand(['🧊 Trener uspokaja zawodników — żadnego ryzyka w pojedynkach.', '🧊 Zmiana nastawienia na ostrożniejsze wejścia w kontakt.']));
  }
}

function onMentalityChange(rawValue) {
  const v = parseInt(rawValue != null ? rawValue : document.getElementById('mentality-slider').value, 10) || 0;
  const label = document.getElementById('mentality-slider-label');
  if (label) {
    const name = v === 0 ? 'NEUTRALNA' : v > 0 ? 'OFENSYWNA' : 'DEFENSYWNA';
    label.textContent = `${name} (${v > 0 ? '+' : ''}${v})`;
  }
  if (state.redrawLines) state.redrawLines();
}

function onMentalityCommit(rawValue) {
  const v = parseInt(rawValue, 10) || 0;
  if (v === 0) {
    announceTacticChange(rand(['📋 Trener wraca do zrównoważonego, neutralnego planu na mecz.']));
  } else if (v > 0) {
    announceTacticChange(rand(['⚔️ Trener wysyła sygnał znad linii: do przodu, gramy ofensywnie!', '⚔️ Zmiana nastawienia na ofensywne — więcej ryzyka, więcej ataku.']));
  } else {
    announceTacticChange(rand(['🛡️ Trener każe się cofnąć — teraz priorytetem jest defensywa.', '🛡️ Zmiana nastawienia na defensywne.']));
  }
}

function toggleTactic(id) {
  const nowActive = !document.getElementById(id).classList.contains('active');
  document.getElementById(id).classList.toggle('active');
  if (id === 'tg-busparking') {
    updateSpecialModeLocks();
    announceTacticChange(nowActive
      ? rand(['🚌 Trener każe cofnąć całą drużynę — parkujemy autobus!', '🚌 Sygnał znad linii: wszyscy do obrony, bronimy wyniku!'])
      : rand(['🚌 Trener odwołuje autobus — wracamy do normalnej gry.', '🚌 Koniec głębokiej obrony, drużyna znów rusza do przodu.']));
  }
  if (id === 'tg-stoper-atak') {
    if (state.redrawLines) state.redrawLines();
    announceTacticChange(nowActive
      ? rand(['🔼 Trener wysyła stopera do ataku — desperacki ruch!', '🔼 Zmiana: środkowy obrońca rusza pod pole karne rywala!'])
      : rand(['🔼 Stoper wraca na swoją pozycję w obronie.', '🔼 Koniec eksperymentu — obrońca cofa się do defensywy.']));
  }
}

let chaosPending = false;

function triggerChaos() {
  if (!state.liveGen) return;
  chaosPending = true;
  const btn = document.getElementById('btn-chaos');
  btn.disabled = true;
  btn.dataset.used = '1';
  btn.textContent = '🔥 CHAOS w toku...';
  updateSpecialModeLocks();
  announceTacticChange(rand(['🔥 Trener krzyczy z linii: MUSIMY NA CHAOS!', '🔥 Szaleństwo znad ławki — trener rzuca wszystkich do przodu!']));
}

let opierdolPending = false;

function triggerOpierdol() {
  if (!state.liveGen) return;
  opierdolPending = true;
  const btn = document.getElementById('btn-opierdol');
  btn.disabled = true;
  btn.dataset.used = '1';
  btn.textContent = '💪 OPIERDOL w toku...';
  updateSpecialModeLocks();
  announceTacticChange(rand(['💪 Trener robi drużynie solidny opierdol w przerwie gry!', '💪 Ostra wymiana zdań na boisku — trener żąda więcej!']));
}

let awanturaPending = false;

let awanturaUsedThisMatch = false;

function triggerAwantura() {
  if (!state.liveGen || awanturaUsedThisMatch) return;
  awanturaPending = true;
  awanturaUsedThisMatch = true;
  const btn = document.getElementById('btn-awantura');
  btn.textContent = '🗯️ AWANTURA — koniec reagowania';
  lockAllTacticsPermanently();
  announceTacticChange(rand(['🗯️ Trener wdaje się w ostrą wymianę zdań z czwartym sędzią przy linii!', '🗯️ Awantura przy ławce — trener nie kryje frustracji!']));
}

function lockAllTacticsPermanently() {
  ['mentality-slider', 'podania-slider', 'agresja-slider', 'tg-busparking', 'tg-stoper-atak', 'btn-opierdol', 'btn-chaos', 'btn-awantura'].forEach(id => {
    document.getElementById(id).disabled = true;
  });
}

function highlightZone(zone) {
  const zones = ['GOAL_ME', 'BOX_ME', 'CENTER', 'BOX_OPP', 'GOAL_OPP'];
  zones.forEach(z => {
    const el = document.getElementById('zone-' + z);
    if (!el) return;
    el.classList.remove('active', 'goal-zone');
    if (z === zone) {
      el.classList.add('active');
      if (z === 'GOAL_ME' || z === 'GOAL_OPP') el.classList.add('goal-zone');
    }
  });
}

function trackZoneVisit(zone) {
  if (!state.liveZoneCounts) return;
  if (state.liveZoneCounts[zone] == null) return;
  state.liveZoneCounts[zone]++;
  updateZonePercentages();
}

function updateZonePercentages() {
  const counts = state.liveZoneCounts;
  if (!counts) return;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  ['GOAL_ME', 'BOX_ME', 'CENTER', 'BOX_OPP', 'GOAL_OPP'].forEach(z => {
    const el = document.getElementById('pct-' + z);
    if (!el) return;
    el.textContent = total > 0 ? Math.round(counts[z] / total * 100) + '%' : '';
  });
}

function resetTacticsPanel() {
  document.getElementById('tg-busparking').classList.remove('active');
  document.getElementById('tg-stoper-atak').classList.remove('active');
  document.getElementById('mentality-slider').value = 0;
  onMentalityChange(0);
  document.getElementById('podania-slider').value = 0;
  document.getElementById('agresja-slider').value = 0;
  ['mentality-slider', 'podania-slider', 'agresja-slider', 'tg-busparking', 'tg-stoper-atak', 'btn-opierdol', 'btn-chaos', 'btn-awantura'].forEach(id => {
    document.getElementById(id).disabled = false;
  });
  awanturaPending = false;
  awanturaUsedThisMatch = false;
  document.getElementById('btn-awantura').textContent = '🗯️ AWANTURA Z TECHNICZNYM';
  chaosPending = false;
  const chaosBtn = document.getElementById('btn-chaos');
  chaosBtn.disabled = false;
  chaosBtn.textContent = '🔥 MUSIMY NA CHAOS';
  chaosBtn.dataset.used = '0';
  opierdolPending = false;
  const opierdolBtn = document.getElementById('btn-opierdol');
  opierdolBtn.disabled = false;
  opierdolBtn.textContent = '💪 OPIERDOL (do 65\')';
  opierdolBtn.dataset.used = '0';
  updateSpecialModeLocks();
}

function updateSpecialModeLocks() {
  if (awanturaUsedThisMatch) { lockAllTacticsPermanently(); return; } // nadrzędna blokada
  const busActive = document.getElementById('tg-busparking').classList.contains('active');
  const chaosBtn = document.getElementById('btn-chaos');
  const opierdolBtn = document.getElementById('btn-opierdol');
  const busBtn = document.getElementById('tg-busparking');
  const chaosUsedFlag = chaosBtn.dataset.used === '1' || chaosPending;
  const opierdolUsedFlag = opierdolBtn.dataset.used === '1' || opierdolPending;
  chaosBtn.disabled = busActive || opierdolUsedFlag;
  opierdolBtn.disabled = busActive || chaosUsedFlag;
  busBtn.disabled = chaosUsedFlag || opierdolUsedFlag;
}

let liveTimer = null;

let livePaused = false;

function playMatch() {
  const { m, opp, myTeam } = getCurrentMatchContext();
  if (!m || !opp || !myTeam) return; // brak aktywnego meczu do rozegrania (np. tryb się już skończył)

  document.getElementById('btn-play-match').style.display = 'none';
  document.getElementById('btn-pause-match').style.display = 'inline-block';
  document.getElementById('btn-manage-squad').style.display = 'none';
  document.getElementById('btn-save-game').style.display = 'none';
  document.getElementById('btn-pause-match').textContent = '⏸ PAUZA';
  document.getElementById('btn-skip-match').style.display = 'inline-block';
  state.currentMatch = m;
  state.currentOpp = opp;
  state.currentMyTeam = myTeam;

  const timelineEl = document.getElementById('po-timeline');
  const scoreEl = document.getElementById('po-score');
  const myLinesEl = document.getElementById('po-my-lines');
  const oppLinesEl = document.getElementById('po-opp-lines');
  const STEP_MS = SPEED_MS[state.speed] || SPEED_MS.normal;

  state.liveGen = simulateMatchV2Live(state.liveMatchRoster, opp.roster, opp.label, readTactics());
  highlightZone('CENTER');
  state.liveMyBase = null; state.liveOppBase = null;
  const vBonus = state.matchVenueBonus || { my: { DEF: 0, MID: 0, FWD: 0 }, opp: { DEF: 0, MID: 0, FWD: 0 } };
  state.liveMyMods = { DEF: vBonus.my.DEF, MID: vBonus.my.MID, FWD: vBonus.my.FWD };
  state.liveOppMods = { DEF: vBonus.opp.DEF, MID: vBonus.opp.MID, FWD: vBonus.opp.FWD };
  state.liveGF = 0; state.liveGA = 0;
  state.liveScorersMe = []; state.liveScorersOpp = [];
  state.liveCardsMe = []; state.liveCardsOpp = [];
  state.liveZoneCounts = { GOAL_ME: 0, BOX_ME: 0, CENTER: 0, BOX_OPP: 0, GOAL_OPP: 0 };
  state.liveResult = null;
  livePaused = false;

  function redrawLines() {
    if (!state.liveMyBase) return;
    const stoperOn = document.getElementById('tg-stoper-atak').classList.contains('active');
    const mentalitySlider = document.getElementById('mentality-slider');
    const mentality = mentalitySlider ? (parseInt(mentalitySlider.value, 10) || 0) : 0;
    const defAdj = (stoperOn ? -10 : 0) - mentality;
    const atkAdj = (stoperOn ? 5 : 0) + mentality;
    myLinesEl.textContent = `OBR ${(state.liveMyBase.DEF + state.liveMyMods.DEF + defAdj).toFixed(1)} · POM ${(state.liveMyBase.MID + state.liveMyMods.MID).toFixed(1)} · ATK ${(state.liveMyBase.FWD + state.liveMyMods.FWD + atkAdj).toFixed(1)}`;
    oppLinesEl.textContent = `OBR ${(state.liveOppBase.DEF + state.liveOppMods.DEF).toFixed(1)} · POM ${(state.liveOppBase.MID + state.liveOppMods.MID).toFixed(1)} · ATK ${(state.liveOppBase.FWD + state.liveOppMods.FWD).toFixed(1)}`;
  }
  state.redrawLines = redrawLines;

  function applyEvent(ev) {
    if (ev.type === 'goal') {
      if (ev.team === 'me') state.liveGF++; else state.liveGA++;
      scoreEl.textContent = formatScoreText(state.liveGF, state.liveGA);
      if (ev.scorer) {
        (ev.team === 'me' ? state.liveScorersMe : state.liveScorersOpp).push({ player: ev.scorer, minute: ev.minute, penalty: !!ev.penalty });
        renderScoreboard();
      }
    }
    if ((ev.type === 'yellow' || ev.type === 'red') && ev.player) {
      (ev.team === 'me' ? state.liveCardsMe : state.liveCardsOpp).push({ player: ev.player, minute: ev.minute, type: ev.type });
      renderScoreboard();
    }
    if (ev.zone) { highlightZone(ev.zone); trackZoneVisit(ev.zone); }
    if (ev.line) {
      const impactMatch = ev.text.match(/Overall ([+-]\d+)/);
      const delta = impactMatch ? parseInt(impactMatch[1], 10) : 0;
      if (delta) {
        const mods = ev.team === 'me' ? state.liveMyMods : state.liveOppMods;
        if (ev.allLines) { ['DEF','MID','FWD'].forEach(l => { mods[l] += delta; }); }
        else { mods[ev.line] += delta; }
        redrawLines();
        (ev.team === 'me' ? myLinesEl : oppLinesEl).style.color = delta < 0 ? 'var(--red)' : 'var(--green-ll)';
      }
    }
    const line = document.createElement('div');
    const baseClass = tlClass(ev);
    line.className = `tl-row ${baseClass}`;
    applyLineClubColor(line, baseClass, ev);
    const isPenaltyAward = ev.type === 'penalty' && !ev.text.startsWith('↳');
    if (ev.type === 'goal') line.classList.add('tl-blink-goal');
    if (ev.type === 'red') line.classList.add('tl-blink-red');
    if (ev.type === 'yellow') line.classList.add('tl-blink-yellow');
    if (isPenaltyAward) line.classList.add('tl-blink-penalty');
    line.textContent = ev.minute != null ? tlText(ev) : ev.text;
    if (ev.type === 'injury') line.textContent += ' ✚';
    timelineEl.prepend(line);
    timelineEl.scrollTop = 0;

    // Gol zawsze dostaje chwilę dramaturgii — twarda pauza ok. 1,5s, niezależnie
    // od wybranego tempa komentarza. Zapowiedź karnego dostaje krótszą pauzę
    // (0,8s) — moment napięcia, zanim wiadomo, czy trafi. Zatrzymujemy timer
    // i wznawiamy go po pauzie z tym samym tempem co wcześniej (respektując
    // PAUZĘ, jeśli gracz kliknął ją właśnie w tym momencie).
    if ((ev.type === 'goal' || isPenaltyAward) && liveTimer) {
      clearInterval(liveTimer);
      liveTimer = null;
      const holdMs = ev.type === 'goal' ? 1500 : 800;
      setTimeout(() => {
        if (state.liveGen && !livePaused) {
          const stepMs = SPEED_MS[state.speed] || SPEED_MS.normal;
          liveTimer = setInterval(state.liveStepFn || step, stepMs);
        }
      }, holdMs);
    }
  }

  let eventQueue = []; // kolejka pojedynczych linii — jedna na tick, nawet gdy silnik zwróci kilka naraz
  state.liveEventQueue = eventQueue;

  function step() {
    if (livePaused) return;

    if (eventQueue.length > 0) {
      applyEvent(eventQueue.shift());
      return; // dokładnie jedna linijka na tick
    }

    const tactics = readTactics();
    if (chaosPending) { tactics.triggerChaos = true; chaosPending = false; }
    if (opierdolPending) { tactics.triggerOpierdol = true; opierdolPending = false; }
    if (awanturaPending) { tactics.triggerAwantura = true; awanturaPending = false; }
    const res = state.liveGen.next(tactics);
    if (res.done) {
      clearInterval(liveTimer);
      liveTimer = null;
      state.liveGen = null;
      finishMatch(res.value, m, opp);
      return;
    }
    if (res.value) {
      if (res.value.i > 70) {
        const opierdolBtn = document.getElementById('btn-opierdol');
        if (!opierdolBtn.disabled) { opierdolBtn.disabled = true; opierdolBtn.textContent = 'OPIERDOL (za pó\u017ano)'; }
      }
      if (res.value.fatigueMy) { state.liveFatigueMy = res.value.fatigueMy; state.liveFatigueOpp = res.value.fatigueOpp; refreshFatigueDisplay(); }
      if (res.value.newEvents && res.value.newEvents.length) {
        eventQueue.push(...res.value.newEvents);
        applyEvent(eventQueue.shift());
      }
    }
  }

  // Pierwsze wywolanie .next() bez argumentu tylko odpala generator do pierwszego yield —
  // korzystamy z niego, zeby pobrac bazowe linie (myBase/oppBase) zanim ruszy odtwarzanie.
  const primer = state.liveGen.next();
  state.liveMyBase = lineAverages(state.liveMatchRoster);
  state.liveOppBase = lineAverages(opp.roster);
  redrawLines();
  if (primer.value && primer.value.fatigueMy) { state.liveFatigueMy = primer.value.fatigueMy; state.liveFatigueOpp = primer.value.fatigueOpp; }
  if (primer.value && primer.value.newEvents) primer.value.newEvents.forEach(applyEvent);

  state.liveStepFn = step;
  liveTimer = setInterval(step, STEP_MS);
}

function toggleLivePause() {
  livePaused = !livePaused;
  document.getElementById('btn-pause-match').textContent = livePaused ? '▶ WZNÓW' : '⏸ PAUZA';
  if (livePaused) {
    // Zatrzymujemy tickowanie, jeśli akurat trwa.
    if (liveTimer) { clearInterval(liveTimer); liveTimer = null; }
  } else {
    // Wznawiamy TYLKO jeśli nie ma już działającego interwału — to też naprawia
    // przypadek, gdy gracz kliknął PAUZĘ dokładnie w oknie ciszy po golu/karnym
    // (kiedy liveTimer jest chwilowo null, czekając na własne wznowienie) —
    // bez tego mecz zamarzał na stałe, bo nic nigdy nie tworzyło nowego interwału.
    if (!liveTimer && state.liveGen) {
      const stepMs = SPEED_MS[state.speed] || SPEED_MS.normal;
      liveTimer = setInterval(state.liveStepFn || step, stepMs);
    }
  }
}

function skipMatchAnimation() {
  if (liveTimer) { clearInterval(liveTimer); liveTimer = null; }
  const m = state.currentMatch, opp = state.currentOpp;
  if (!state.liveGen) return;

  const timelineEl = document.getElementById('po-timeline');
  const tactics = readTactics(); // taktyka "zamrożona" na tym, co było ustawione w chwili pominięcia
  if (chaosPending) { tactics.triggerChaos = true; chaosPending = false; }
  if (opierdolPending) { tactics.triggerOpierdol = true; opierdolPending = false; }
  if (awanturaPending) { tactics.triggerAwantura = true; awanturaPending = false; }

  let finalResult = null;
  let lastZone = null;
  let guard = 0;

  // Najpierw dociągamy to, co już czekało w kolejce (jeszcze niewyświetlone linijki).
  if (state.liveEventQueue && state.liveEventQueue.length) {
    state.liveEventQueue.splice(0).forEach(ev => {
      if (ev.zone) { lastZone = ev.zone; trackZoneVisit(ev.zone); }
      if (ev.type === 'goal') {
        if (ev.team === 'me') state.liveGF++; else state.liveGA++;
        if (ev.scorer) (ev.team === 'me' ? state.liveScorersMe : state.liveScorersOpp).push({ player: ev.scorer, minute: ev.minute, penalty: !!ev.penalty });
      }
      if ((ev.type === 'yellow' || ev.type === 'red') && ev.player) {
        (ev.team === 'me' ? state.liveCardsMe : state.liveCardsOpp).push({ player: ev.player, minute: ev.minute, type: ev.type });
      }
      if (ev.line) {
        const impactMatch = ev.text.match(/Overall ([+-]\d+)/);
        const delta = impactMatch ? parseInt(impactMatch[1], 10) : 0;
        if (delta) {
          const mods = ev.team === 'me' ? state.liveMyMods : state.liveOppMods;
          if (ev.allLines) { ['DEF','MID','FWD'].forEach(l => { mods[l] += delta; }); }
          else { mods[ev.line] += delta; }
        }
      }
      const line = document.createElement('div');
      const baseClass = tlClass(ev);
      line.className = `tl-row ${baseClass}`;
      applyLineClubColor(line, baseClass, ev);
      if (ev.type === 'goal') line.classList.add('tl-blink-goal');
      if (ev.type === 'red') line.classList.add('tl-blink-red');
      if (ev.type === 'yellow') line.classList.add('tl-blink-yellow');
      if (ev.type === 'penalty' && !ev.text.startsWith('↳')) line.classList.add('tl-blink-penalty');
      line.textContent = ev.minute != null ? tlText(ev) : ev.text;
      if (ev.type === 'injury') line.textContent += ' ✚';
      timelineEl.prepend(line);
    });
  }

  while (guard++ < 300) { // zabezpieczenie przed nieskończoną pętlą — mecz ma najwyżej 100 zdarzeń
    const res = state.liveGen.next(tactics);
    if (res.done) { finalResult = res.value; break; }
    if (res.value && res.value.newEvents) {
      res.value.newEvents.forEach(ev => {
        if (ev.zone) { lastZone = ev.zone; trackZoneVisit(ev.zone); }
        if (ev.type === 'goal') {
        if (ev.team === 'me') state.liveGF++; else state.liveGA++;
        if (ev.scorer) (ev.team === 'me' ? state.liveScorersMe : state.liveScorersOpp).push({ player: ev.scorer, minute: ev.minute, penalty: !!ev.penalty });
      }
      if ((ev.type === 'yellow' || ev.type === 'red') && ev.player) {
        (ev.team === 'me' ? state.liveCardsMe : state.liveCardsOpp).push({ player: ev.player, minute: ev.minute, type: ev.type });
      }
        if (ev.line) {
          const impactMatch = ev.text.match(/Overall ([+-]\d+)/);
          const delta = impactMatch ? parseInt(impactMatch[1], 10) : 0;
          if (delta) {
            const mods = ev.team === 'me' ? state.liveMyMods : state.liveOppMods;
            if (ev.allLines) { ['DEF','MID','FWD'].forEach(l => { mods[l] += delta; }); }
            else { mods[ev.line] += delta; }
          }
        }
        const line = document.createElement('div');
        const baseClass = tlClass(ev);
        line.className = `tl-row ${baseClass}`;
        applyLineClubColor(line, baseClass, ev);
        if (ev.type === 'goal') line.classList.add('tl-blink-goal');
        if (ev.type === 'red') line.classList.add('tl-blink-red');
        if (ev.type === 'yellow') line.classList.add('tl-blink-yellow');
        if (ev.type === 'penalty' && !ev.text.startsWith('↳')) line.classList.add('tl-blink-penalty');
        line.textContent = ev.minute != null ? tlText(ev) : ev.text;
        if (ev.type === 'injury') line.textContent += ' ✚';
        timelineEl.prepend(line);
      });
    }
  }
  timelineEl.scrollTop = 0;
  if (lastZone) highlightZone(lastZone);
  if (!finalResult) finalResult = { result: state.liveGF > state.liveGA ? 'W' : state.liveGF < state.liveGA ? 'L' : 'D', gf: state.liveGF, ga: state.liveGA };
  document.getElementById('po-score').textContent = formatScoreText(finalResult.gf, finalResult.ga);

  // Finalne overalle formacji, uwzględniające czerwone/kontuzje/formę z całego meczu
  const myLinesEl = document.getElementById('po-my-lines');
  const oppLinesEl = document.getElementById('po-opp-lines');
  const myChanged = state.liveMyMods.DEF || state.liveMyMods.MID || state.liveMyMods.FWD;
  const oppChanged = state.liveOppMods.DEF || state.liveOppMods.MID || state.liveOppMods.FWD;
  state.redrawLines();
  if (myChanged) myLinesEl.style.color = myChanged < 0 ? 'var(--red)' : 'var(--green-ll)';
  if (oppChanged) oppLinesEl.style.color = oppChanged < 0 ? 'var(--red)' : 'var(--green-ll)';
  renderScoreboard();

  state.liveGen = null;
  finishMatch(finalResult, m, opp);
}

function finishMatch(sim, m, opp) {
  document.getElementById('btn-skip-match').style.display = 'none';
  document.getElementById('btn-pause-match').style.display = 'none';
  if (state.tournamentPhase === 'groups') finishGroupMatch(sim, m, opp);
  else finishKnockoutMatch(sim, m, opp);
}
