// ============================================================
// HUB-SKELETON.JS — wspólny szkielet paska akcji dla WSZYSTKICH
// ekranów poza-meczowych ("hubów"): screen-playoff, screen-season,
// screen-challenge. Rdzeń (ROZEGRAJ MECZ / ZARZĄDZAJ ZESPOŁEM /
// ZAPISZ GRĘ / MENU) jest identyczny na wszystkich trzech, więc
// renderuje się go RAZ, z tego jednego miejsca — przyszła zmiana
// etykiety/kolejności/wyglądu robi się TUTAJ, zamiast osobno w trzech
// miejscach w index.html.
//
// index.html ma dla każdego huba tylko PUSTY kontener (np.
// <div id="playoff-hub-actions">) — wypełnia go poniższe wywołanie,
// wykonywane raz, zaraz po wczytaniu tego pliku. Elementy dodatkowe,
// specyficzne dla danego huba (np. "NASTĘPNA RUNDA", "Zobacz
// losowanie"), zostają — każdy hub wciąż może dodać własne, tylko
// wspólny rdzeń jest scalony.
//
// WAŻNE: id-ki przycisków ROZEGRAJ MECZ/kontynuacji są celowo TAKIE
// SAME jak wcześniej (btn-play-match-hub, btn-play-challenge-match,
// btn-next-round, season-btn-next-round, challenge-btn-next-round,
// btn-playoff-end, btn-toggle-swiss-draw) — cała reszta kodu (PLAYOFF.js,
// MUNDIAL.js, tryby.js, wyzwania.js, KREATOR-TURNIEJU.js) dalej znajduje
// je po tych samych nazwach, bez żadnych zmian.
// ============================================================

function renderHubActionBar(containerId, playId, playLabel, playOnclick, extraHtml) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <button class="btn btn-gold" id="${playId}" onclick="${playOnclick}">${playLabel}</button>
    <button class="btn btn-sm" onclick="goToManageSquad()">🗂️ ZARZĄDZAJ ZESPOŁEM</button>
    ${extraHtml || ''}
    <button class="btn btn-sm" onclick="saveGame()">💾 ZAPISZ GRĘ</button>
    <button class="btn btn-sm" onclick="showScreen('screen-title')">← MENU</button>
  `;
}

renderHubActionBar('playoff-hub-actions', 'btn-play-match-hub', '▶ ROZEGRAJ MECZ', 'setupMatch()', `
  <button class="btn btn-sm" id="btn-next-round" onclick="advance()" style="display:none;">NASTĘPNA RUNDA →</button>
  <button class="btn btn-red btn-sm" id="btn-playoff-end" onclick="showScreen('screen-title')" style="display:none;">← MENU</button>
`);

renderHubActionBar('season-hub-actions', 'btn-play-match-season', '▶ ROZEGRAJ MECZ', 'setupSeasonMatch()', `
  <button class="btn btn-sm" id="season-btn-next-round" style="display:none;">NASTĘPNA KOLEJKA →</button>
`);

renderHubActionBar('challenge-hub-actions', 'btn-play-challenge-match', '▶ ROZEGRAJ MECZ', 'setupChallengeMatch()', `
  <button class="btn btn-sm" id="btn-toggle-swiss-draw" onclick="toggleSwissDrawReveal()" style="display:none;">🎟 Zobacz losowanie</button>
  <button class="btn btn-sm" id="challenge-btn-next-round" style="display:none;">DALEJ →</button>
`);
