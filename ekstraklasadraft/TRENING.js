// ============================================================
// TRENING.JS — MGŁA WOJNY (losowość draftu) i TRENING (forma/rozwój
// zawodników, ustawiany INDYWIDUALNIE dla każdego zawodnika w
// ZARZĄDZAJ ZESPOŁEM).
// Ładowany razem z resztą modułów gry — korzysta z globalnego state,
// clamp() i rand() z RDZEN.js.
// ============================================================

// ── MGŁA WOJNY ──────────────────────────────────────────────
// Włączana checkboxem w USTAWIENIACH DRAFTU (screen-draft-setup).
// Stosowana RAZ, dokładnie w momencie ukończenia draftu (DRAFT.js →
// drawNextTeam() → draftIsComplete()) — NIE dotyczy "ZAGRAJ PRAWDZIWĄ
// DRUŻYNĄ" ani wczytanych zapisów, tylko świeżo wydraftowanych
// zawodników. Każdy zawodnik w state.squad dostaje losowe przesunięcie
// overallu w przedziale [-5, +5] względem wartości z bazy. Flaga
// state.fogOfWarApplied pilnuje, żeby nie przelosować przy każdym
// powrocie na ekran wyniku.
function applyFogOfWarIfNeeded() {
  if (!state.fogOfWar || state.fogOfWarApplied) return;
  Object.keys(state.squad).forEach(id => {
    const p = state.squad[id];
    p.overall = clamp(p.overall + randIntRange(5), 1, MAX_OVR);
  });
  state.fogOfWarApplied = true;
}

// ── TRENING (per zawodnik) ──────────────────────────────────
// Każdy zawodnik w state.squad ma własne pole trainingLevel: 0/1/2
// (brak pola = 0), ustawiane selectem przy jego wierszu w ZARZĄDZAJ
// ZESPOŁEM (ZESPOL.js → renderManageSquad/renderManageReserveRow).
// Zapisuje się razem z resztą stanu gry (saveGame/loadGame). Resetuje
// się naturalnie przy nowym drafcie/wczytaniu innego składu — nowe
// obiekty zawodników po prostu nie mają tego pola (traktowane jak 0).
//
// Poziom 0 — nic się nie zmienia.
// Poziom 1 — przed KAŻDYM meczem ten zawodnik dostaje losową wartość
//   z przedziału ±3 (każda liczba całkowita z [-3, 3], łącznie z 0)
//   do overallu, WYŁĄCZNIE na ten jeden mecz — nic nie zapisuje się
//   trwale.
// Poziom 2 — przed KAŻDYM meczem ten zawodnik dostaje losową wartość
//   z przedziału ±2 do overallu TRWALE — zostaje w state.squad aż do
//   zmiany drużyny (nowy draft / inna prawdziwa drużyna / wczytanie
//   innego składu).
function randIntRange(magnitude) {
  // Losowa liczba całkowita z przedziału [-magnitude, +magnitude], łącznie z 0.
  return Math.floor(Math.random() * (2 * magnitude + 1)) - magnitude;
}

function playerTrainingLevel(id) {
  const p = state.squad[id];
  return (p && p.trainingLevel) || 0;
}

// Wywoływane raz na mecz (MECZ-UI.js → resetMatchScreen), PRZED zbudowaniem
// roster'u na ten mecz. Dla każdego zawodnika z poziomem 1 losuje tymczasową
// (tylko-na-ten-mecz) deltę i zapisuje w state.liveTrainingDeltas — potem
// nakładaną przez applyTrainingDeltasToRoster na wystawioną jedenastkę i na
// każdego zmiennika wchodzącego w trakcie meczu.
function computeMatchTrainingFluctuations() {
  const deltas = {};
  Object.keys(state.squad).forEach(id => {
    if (playerTrainingLevel(id) === 1) deltas[id] = randIntRange(3);
  });
  return deltas;
}

// Nakłada wcześniej wylosowaną (computeMatchTrainingFluctuations) formę dnia
// na roster — działa na dowolnym roster'ze z polem __slotId. Nie mutuje wejścia.
function applyTrainingDeltasToRoster(roster) {
  const deltas = state.liveTrainingDeltas || {};
  return roster.map(p => {
    const delta = p.__slotId != null ? (deltas[p.__slotId] || 0) : 0;
    if (!delta) return p;
    return Object.assign({}, p, { overall: clamp(p.overall + delta, 1, MAX_OVR) });
  });
}

// Wywoływane raz na mecz. Dla KAŻDEGO zawodnika z poziomem 2 losuje TRWAŁĄ
// deltę z przedziału ±2 i od razu nakłada ją na state.squad[id].overall.
function applyPermanentTrainingTick() {
  const ticks = [];
  Object.keys(state.squad).forEach(id => {
    if (playerTrainingLevel(id) !== 2) return;
    const p = state.squad[id];
    // Cecha "Szybki rozwój" (patrz PLAYER-TRAITS.js) — szerszy przedział
    // losowania (±3 zamiast ±2), więc trening średnio działa mocniej.
    const hasBoost = typeof playerHasTrait === 'function' && playerHasTrait(p, 'trainingBoost');
    const delta = randIntRange(hasBoost ? 3 : 2);
    if (!delta) return;
    p.overall = clamp(p.overall + delta, 1, MAX_OVR);
    ticks.push({ name: p.name, delta });
  });
  state.lastTrainingTicks = ticks;
}

// ── UI pomocnicze (wywoływane z ZESPOL.js) ──────────────────
function trainingSelectHtml(id) {
  const level = playerTrainingLevel(id);
  return `<select class="training-select" data-training-id="${id}" title="Poziom treningu" style="margin-left:6px;font-size:11px;padding:1px 2px;background:var(--bg2,#111);color:inherit;border:1px solid var(--border);">
    <option value="0" ${level === 0 ? 'selected' : ''}>Tr. 0</option>
    <option value="1" ${level === 1 ? 'selected' : ''}>Tr. 1</option>
    <option value="2" ${level === 2 ? 'selected' : ''}>Tr. 2</option>
  </select>`;
}

function setPlayerTrainingLevel(id, level) {
  if (!state.squad[id]) return;
  state.squad[id].trainingLevel = parseInt(level, 10) || 0;
}
