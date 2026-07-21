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
    <button class="btn btn-sm btn-orange" onclick="instantSimulateFromHub('${playId}')">⚡ CHCĘ SAM WYNIK</button>
    <button class="btn btn-sm" onclick="goToManageSquad()">🗂️ ZARZĄDZAJ ZESPOŁEM</button>
    ${extraHtml || ''}
    <button class="btn btn-sm" onclick="saveGame()">💾 ZAPISZ GRĘ</button>
    <button class="btn btn-sm" onclick="goToSettingsScreen()" title="Ustawienia">⚙</button>
    <button class="btn btn-sm" onclick="goToResultsScreen()">📋 WYNIKI</button>
    <button class="btn btn-sm" onclick="showScreen('screen-title')">← MENU</button>
  `;
}

// "CHCĘ SAM WYNIK" — wchodzi w mecz dokładnie tak, jak zrobiłoby to
// kliknięcie "ROZEGRAJ MECZ" (woła TO SAMO, co aktualnie wisi pod tym
// przyciskiem — niezależnie, który tryb gry je ostatnio podpiął), tylko
// zamiast oglądać przebieg, od razu przewija do samego końca. Jakbyśmy
// wchodzili prosto na 90. minutę — przydatne, gdy liczy się tylko wynik.
function instantSimulateFromHub(playButtonId) {
  const playBtn = document.getElementById(playButtonId);
  if (playBtn && typeof playBtn.onclick === 'function') playBtn.onclick();
  else if (playBtn) playBtn.click();
  playMatch();
  skipMatchAnimation();
}

// ── USTAWIENIA GRY — mała ikonka ⚙ na każdym hubie ──────────────────
// Na razie jedna opcja (silnik dla meczów innych drużyn), ale to miejsce
// jest pomyślane, żeby z czasem dorzucać kolejne, bez szukania nowego
// miejsca w interfejsie za każdym razem.
function goToSettingsScreen() {
  state.settingsReturnScreen = state.currentScreenId || 'screen-title';
  const el = document.getElementById('other-matches-engine-radio-quick');
  const elFull = document.getElementById('other-matches-engine-radio-full');
  if (state.settings.otherMatchesEngine === 'full') { elFull.checked = true; } else { el.checked = true; }
  showScreen('screen-settings');
}

function applyOtherMatchesEngineSetting() {
  const full = document.getElementById('other-matches-engine-radio-full').checked;
  state.settings.otherMatchesEngine = full ? 'full' : 'quick';
}

function returnFromSettings() {
  showScreen(state.settingsReturnScreen || 'screen-title');
}

// ── PODGLĄD PRZEBIEGU MECZU W TLE (rozegranego pełnym silnikiem) ──────
// Pokazuje pełną oś czasu DOKŁADNIE tak samo jak żywy mecz (te same
// tlClass/tlText z silnik.js) — tylko od razu w całości, bez oglądania
// minuta po minucie (mecz już się skończył).
// ── Wspólny cache dla przycisków "▶ zobacz przebieg" ──────────────
// Zamiast wstrzykiwać całą oś czasu (potencjalnie 100+ zdarzeń) w atrybut
// onclick jako JSON, chowamy ją tu i odwołujemy się po indeksie — używane
// przez każdy tryb, który chce dać "zobacz przebieg" przy meczu w tle
// rozegranym pełnym silnikiem.
window.__replayCache = [];

// Buduje klikalny wiersz wyniku - drużyny, wynik, strzelcy widoczni od razu.
// Jeśli dostępny jest timeline, CAŁY wiersz jest klikalny (bez osobnego
// przycisku) i przenosi do podglądu przebiegu tego meczu.
function matchResultRowHtml(home, away, scoreText, timeline, scorersHome, scorersAway) {
  const scorersHomeText = formatScorersText(scorersHome);
  const scorersAwayText = formatScorersText(scorersAway);
  const scorersHtml = (scorersHomeText || scorersAwayText)
    ? `<div class="season-result-scorers">${scorersHomeText}${scorersHomeText && scorersAwayText ? ' — ' : ''}${scorersAwayText}</div>`
    : '';
  let clickAttr = '';
  if (timeline) {
    const idx = window.__replayCache.length;
    window.__replayCache.push({ timeline, labelA: home, labelB: away, scoreText });
    clickAttr = ` onclick="showCachedReplay(${idx})" style="cursor:pointer;"`;
  }
  return `<div class="season-result-row"${clickAttr}>
    <div class="season-result-score">${home} <b>${scoreText}</b> ${away}</div>
    ${scorersHtml}
  </div>`;
}

function showCachedReplay(idx) {
  const entry = window.__replayCache[idx];
  if (!entry) return;
  showMatchReplay(entry.timeline, entry.labelA, entry.labelB, entry.scoreText);
}

function showMatchReplay(timeline, labelA, labelB, scoreText) {
  state.replayReturnScreen = state.currentScreenId || 'screen-title';
  document.getElementById('replay-score-label').textContent = scoreText || '';
  document.getElementById('replay-team-a-name').textContent = labelA;
  document.getElementById('replay-team-b-name').textContent = labelB;
  document.getElementById('replay-score').textContent = scoreText || '— : —';

  // SCOREBOARD: gole/kartki/zmarnowane karne, wyciągnięte z CAŁEGO
  // zapisanego przebiegu — dokładnie ten sam format co żywy mecz
  // (⚽/🟨/🟥/❌), tylko zbiorczo na koniec zamiast na żywo.
  const scorersA = [], scorersB = [], cardsA = [], cardsB = [], missesA = [], missesB = [];
  (timeline || []).forEach(ev => {
    if (ev.type === 'goal' && ev.scorer) (ev.team === 'me' ? scorersA : scorersB).push({ player: ev.scorer, minute: ev.minute, penalty: !!ev.penalty });
    if ((ev.type === 'yellow' || ev.type === 'red') && ev.player) (ev.team === 'me' ? cardsA : cardsB).push({ player: ev.player, minute: ev.minute, type: ev.type });
    if (ev.type === 'penalty' && (ev.outcome === 'missed' || ev.outcome === 'saved') && ev.player) (ev.team === 'me' ? missesA : missesB).push({ player: ev.player, minute: ev.minute });
  });
  function buildLines(scorers, cards, misses) {
    const lines = scorers.map(s => `⚽ ${s.player}${s.minute != null ? " " + s.minute + "'" : ''}${s.penalty ? ' (k.)' : ''}`);
    cards.forEach(c => lines.push(`${c.type === 'red' ? '🟥' : '🟨'} ${c.player}${c.minute != null ? " " + c.minute + "'" : ''}`));
    misses.forEach(m => lines.push(`<span style="color:var(--gray);">❌ ${m.player}${m.minute != null ? " " + m.minute + "'" : ''} (k.)</span>`));
    return lines.join('<br>');
  }
  document.getElementById('replay-scoreboard-a').innerHTML = buildLines(scorersA, cardsA, missesA);
  document.getElementById('replay-scoreboard-b').innerHTML = buildLines(scorersB, cardsB, missesB);

  // BOISKO: procenty stref liczone z CAŁEGO zapisanego przebiegu — to nie
  // jest mecz na żywo (już się skończył), więc pokazujemy podsumowanie
  // całej gry, dokładnie tymi samymi strefami/procentami co ekran meczu.
  const zones = ['GOAL_ME', 'BOX_ME', 'CENTER', 'BOX_OPP', 'GOAL_OPP'];
  const counts = { GOAL_ME: 0, BOX_ME: 0, CENTER: 0, BOX_OPP: 0, GOAL_OPP: 0 };
  (timeline || []).forEach(ev => { if (ev.zone && counts[ev.zone] != null) counts[ev.zone]++; });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  zones.forEach(z => {
    const pctEl = document.getElementById('replay-pct-' + z);
    if (pctEl) pctEl.textContent = total > 0 ? Math.round(counts[z] / total * 100) + '%' : '';
  });

  showScreen('screen-match-replay');
}

function returnFromMatchReplay() {
  showScreen(state.replayReturnScreen || 'screen-title');
}

// ── TERMINARZ — moje mecze (rozegrane + nadchodzące) w bieżącym trybie ──
function goToFixturesScreen() {
  state.fixturesReturnScreen = state.currentScreenId || 'screen-title';
  const list = getMyFixtureList();
  const el = document.getElementById('fixtures-list');
  if (!list.length) {
    el.innerHTML = '<div style="color:var(--gray);padding:8px;">Ten tryb nie ma terminarza w tej postaci — sam bieżący rywal wystarczy na hubie.</div>';
  } else {
    el.innerHTML = list.map(f => {
      const label = f.groupLabel ? `${f.groupLabel} • Kolejka ${f.matchday}` : `Kolejka ${f.matchday}`;
      if (f.played) {
        return matchResultRowHtml(`${label} — Ja`, f.opp, f.scoreText, f.timeline, f.scorersHome, f.scorersAway);
      }
      const style = f.current ? 'border-color:var(--gold);' : '';
      return `<div class="season-result-row" style="${style}">
        <div class="season-result-score">${label} — vs ${f.opp} ${f.current ? '<b>(TERAZ)</b>' : '(nadchodzący)'}</div>
      </div>`;
    }).join('');
  }
  showScreen('screen-fixtures');
}

function returnFromFixtures() {
  showScreen(state.fixturesReturnScreen || 'screen-title');
}

// ── WYNIKI — wszystkie mecze bieżącego kontekstu (nie tylko moje) ──
function goToResultsScreen() {
  state.resultsReturnScreen = state.currentScreenId || 'screen-title';
  const html = getAllResultsHtml();
  document.getElementById('results-list').innerHTML = html || '<div style="color:var(--gray);padding:8px;">Ten tryb nie ma jeszcze żadnych wyników do pokazania.</div>';

  const isM26 = state.tournamentPhase === 'mundial26';
  document.getElementById('m26-results-subtabs').style.display = isM26 ? 'flex' : 'none';
  document.getElementById('groups-panel-results').style.display = 'none';
  document.getElementById('m26-bracket-overlay').style.display = 'none';
  document.getElementById('m26-classification-overlay').style.display = 'none';
  if (isM26) {
    document.getElementById('btn-m26-toggle-classification').style.display = state.mundial26.fullRanking ? 'inline-block' : 'none';
  }
  showScreen('screen-results');
}

function returnFromResults() {
  showScreen(state.resultsReturnScreen || 'screen-title');
}


function getAllResultsHtml() {
  if (state.tournamentPhase === 'season') return getAllSeasonResultsHtml();
  if (state.tournamentPhase === 'mundial26') return getAllM26ResultsHtml();
  return '';
}

// Sezon: pokazujemy wyniki OSTATNIEJ rozegranej kolejki (to, co i tak już
// pokazuje hub) — ale tutaj zawsze dostępne na żądanie, nie tylko od razu
// po meczu, i z pełnym podglądem przebiegu przy każdym.
function getAllSeasonResultsHtml() {
  const s = state.season;
  if (!s || !s.resultsHistory || !s.resultsHistory.length) return '';
  const last = s.resultsHistory[s.resultsHistory.length - 1];
  let html = `<div class="panel-title" style="font-size:12px;">KOLEJKA ${last.matchdayIdx + 1}</div>`;
  last.records.forEach(r => {
    // Prawdziwych strzelców (mój mecz, albo tło rozegrane pełnym silnikiem)
    // pokazujemy zawsze. Zmyślonych "na oko" (szybki tryb, mecz w tle) — nie,
    // żeby nie sugerować precyzji, której nie ma.
    const showScorers = r.isPlayerMatch || !!r.timeline;
    html += matchResultRowHtml(r.home, r.away, `${r.homeGoals}:${r.awayGoals}`, r.timeline, showScorers ? r.homeScorers : null, showScorers ? r.awayScorers : null);
  });
  return html;
}

function getAllM26ResultsHtml() {
  const m26 = state.mundial26;
  if (!m26) return '';
  let html = '';
  Object.keys(m26.groups).forEach(letter => {
    const results = m26.groupResults[letter] || [];
    if (!results.length) return;
    html += `<div class="panel-title" style="font-size:12px;margin-top:10px;">GRUPA ${letter}</div>`;
    results.forEach(r => { html += matchResultRowHtml(r.home, r.away, `${r.hg}:${r.ag}`, r.timeline, r.scorersHome, r.scorersAway); });
  });
  if (m26.phase === 'knockout' && m26.fullRanking && m26.rankBands) {
    [['GŁÓWNA DRABINKA', m26.rankBands.main], ['DRABINKA POCIESZENIA (33-48)', m26.rankBands.consolation]].forEach(([rootLabel, root]) => {
      let anyDecided = false;
      (function walk(n) {
        if (!n || !n.matches) return;
        if (n.depth > m26.revealedDepth) return; // ta runda jeszcze nieodsłonięta - jak w drabince
        const decided = n.matches.filter(m => m.winner);
        if (decided.length) {
          if (!anyDecided) { html += `<div class="panel-title" style="font-size:12px;margin-top:10px;">${rootLabel}</div>`; anyDecided = true; }
          decided.forEach(m => { html += matchResultRowHtml(m.teamA.label, m.teamB.label, m.scoreText || '?', m.timeline, m.scorersHome, m.scorersAway); });
        }
        walk(n.upper); walk(n.lower);
      })(root);
    });
  } else if (m26.phase === 'knockout' && m26.bracket) {
    m26.bracket.forEach((round, ri) => {
      const decided = round.filter(m => m.teamA && m.teamB && m.winner);
      if (!decided.length) return;
      html += `<div class="panel-title" style="font-size:12px;margin-top:10px;">${M26_ROUND_NAMES[ri]}</div>`;
      decided.forEach(m => { html += matchResultRowHtml(m.teamA.label, m.teamB.label, m.scoreText || '?', m.timeline, m.scorersHome, m.scorersAway); });
    });
  }
  return html;
}

function getMyFixtureList() {
  if (state.tournamentPhase === 'season') return getMySeasonFixtures();
  if (state.tournamentPhase === 'mundial26') return getMyM26FixtureList();
  return [];
}

function getMySeasonFixtures() {
  const s = state.season;
  if (!s || !s.fixtures) return [];
  const list = [];
  s.fixtures.forEach((md, i) => {
    const myMatch = md.find(m => m.home.isPlayer || m.away.isPlayer);
    if (!myMatch) return;
    const opp = myMatch.home.isPlayer ? myMatch.away : myMatch.home;
    if (i < s.matchdayIdx) {
      const hist = (s.resultsHistory || []).find(h => h.matchdayIdx === i);
      const rec = hist && hist.records.find(r => r.isPlayerMatch);
      list.push({ matchday: i + 1, opp: opp.label, played: true, scoreText: rec ? `${rec.homeGoals}:${rec.awayGoals}` : '?', timeline: rec && rec.timeline, scorersHome: rec && rec.homeScorers, scorersAway: rec && rec.awayScorers });
    } else {
      list.push({ matchday: i + 1, opp: opp.label, played: false, current: i === s.matchdayIdx });
    }
  });
  return list;
}

// Faza grupowa (rozegrane + bieżąca + nadchodzące — rywale znani od razu,
// bo terminarz grupy jest ustalony z góry) + dotychczasowy przebieg
// drabinki pucharowej, jeśli już się zaczęła (rywale kolejnych rund nie są
// jeszcze znani, więc pokazujemy tylko to, co już się rozegrało + bieżący mecz).
function getMyM26FixtureList() {
  const m26 = state.mundial26;
  if (!m26) return [];
  const list = [];
  const letter = myM26GroupLetter();
  if (letter && m26.groupFixtures[letter]) {
    m26.groupFixtures[letter].forEach((md, i) => {
      const myMatch = md.find(m => m.home.isPlayer || m.away.isPlayer);
      if (!myMatch) return;
      const opp = myMatch.home.isPlayer ? myMatch.away : myMatch.home;
      const myLabel = myMatch.home.isPlayer ? myMatch.home.label : myMatch.away.label;
      if (i < m26.matchdayIdx || (i === m26.matchdayIdx && m26.phase !== 'groups')) {
        const rec = (m26.groupResults[letter] || []).find(r =>
          (r.home === myLabel && r.away === opp.label) || (r.home === opp.label && r.away === myLabel)
        );
        const scoreText = rec ? (rec.home === myLabel ? `${rec.hg}:${rec.ag}` : `${rec.ag}:${rec.hg}`) : '?';
        list.push({ matchday: i + 1, opp: opp.label, played: true, scoreText, groupLabel: `GRUPA ${letter}`, timeline: rec && rec.timeline, scorersHome: rec && rec.scorersHome, scorersAway: rec && rec.scorersAway });
      } else {
        list.push({ matchday: i + 1, opp: opp.label, played: false, current: i === m26.matchdayIdx, groupLabel: `GRUPA ${letter}` });
      }
    });
  }
  if (m26.phase === 'knockout' && m26.fullRanking && m26.rankBands) {
    // Pełna klasyfikacja 1-48: moja ścieżka przez drzewo pasm miejsc —
    // wszystkie moje mecze dotąd rozegrane + bieżący.
    let node = m26.rankBands.main;
    let found = false;
    [m26.rankBands.main, m26.rankBands.consolation].forEach(root => {
      (function walk(n) {
        if (!n || !n.matches) return;
        n.matches.forEach(m => {
          const isMine = (m.teamA && m.teamA.isPlayer) || (m.teamB && m.teamB.isPlayer);
          if (!isMine) return;
          const iAmA = m.teamA.isPlayer;
          const opp = iAmA ? m.teamB : m.teamA;
          const roundLabel = n.size === 1 ? `${n.rankStart}. MIEJSCE` : (n.rankStart === 1 && n.size === 2) ? 'FINAŁ' : n.size === 2 ? `MECZ O ${n.rankStart}. MIEJSCE` : `O MIEJSCA ${n.rankStart}-${n.rankEnd}`;
          if (m.winner) {
            list.push({ matchday: list.length + 1, opp: opp.label, played: true, scoreText: m.scoreText || '?', groupLabel: roundLabel, timeline: m.timeline, scorersHome: m.scorersHome, scorersAway: m.scorersAway });
          } else {
            list.push({ matchday: list.length + 1, opp: opp.label, played: false, current: true, groupLabel: roundLabel });
          }
        });
        walk(n.upper); walk(n.lower);
      })(root);
    });
  } else if (m26.phase === 'knockout') {
    // Drabinka klasyczna: pokazujemy rozegrane rundy + bieżącą (rywale
    // kolejnych rund nie są jeszcze znani, więc terminarz kończy się tutaj).
    if (m26.bracket) {
      m26.bracket.forEach((round, ri) => {
        const myMatch = round.find(m => m.teamA && m.teamB && (m.teamA.isPlayer || m.teamB.isPlayer));
        if (!myMatch) return;
        const iAmA = myMatch.teamA.isPlayer;
        const opp = iAmA ? myMatch.teamB : myMatch.teamA;
        if (myMatch.winner) {
          list.push({ matchday: list.length + 1, opp: opp.label, played: true, scoreText: myMatch.scoreText || '?', groupLabel: M26_ROUND_NAMES[ri], timeline: myMatch.timeline, scorersHome: myMatch.scorersHome, scorersAway: myMatch.scorersAway });
        } else {
          list.push({ matchday: list.length + 1, opp: opp.label, played: false, current: true, groupLabel: M26_ROUND_NAMES[ri] });
        }
      });
    }
  }
  return list;
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
