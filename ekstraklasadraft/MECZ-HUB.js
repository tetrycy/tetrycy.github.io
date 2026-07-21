// ============================================================
// MECZ-HUB.JS — WYRAŹNE ROZDZIELENIE meczu i reszty gry.
//
// Jedyne miejsce w całym kodzie, które decyduje, KIEDY gra wraca z
// zamkniętego środowiska meczu (screen-match) na właściwy ekran
// poza-meczowy ("hub": screen-playoff / screen-season / screen-challenge).
// Dzięki temu, że to jest jedno miejsce, dziesiątki funkcji w PLAYOFF.js/
// MUNDIAL.js/tryby.js/wyzwania.js/KREATOR-TURNIEJU.js, które ustawiają
// przycisk "następna runda/kolejka", NIE MUSIAŁY zostać zmienione — nadal
// robią dokładnie to, co robiły. Zmieniło się tylko to, GDZIE fizycznie
// leży ten przycisk (na hubie, nie na ekranie meczu) i to, że hub pokazuje
// się dopiero PO kliknięciu "ZATWIERDŹ WYNIK" tutaj, a nie automatycznie.
//
// WAŻNE O KOLEJNOŚCI WCZYTYWANIA: ten plik jest wczytywany JAKO OSTATNI
// w index.html (po TRAITS.js) — z tego samego powodu co TRAITS.js: musi
// owinąć FINALNĄ, w pełni złożoną wersję finishMatch(), która przechodzi
// przez wszystkie tryby gry (tryby.js → KREATOR-TURNIEJU.js → wyzwania.js).
//
// PRZEPŁYW:
//   1. Gracz klika "ROZEGRAJ MECZ" na hubie → setup*Match() → resetMatchScreen()
//      → showScreen('screen-match'). Od tej chwili widać WYŁĄCZNIE mecz.
//   2. Mecz się kończy (wynik, ewentualne karne) → zamiast od razu
//      aktualizować tabele/drabinki, pokazujemy "✅ ZATWIERDŹ WYNIK" —
//      GRACZ nadal jest na screen-match, widzi wynik, nic więcej.
//   3. Klik "ZATWIERDŹ WYNIK" → dopiero TERAZ woła się prawdziwy,
//      w pełni złożony finishMatch() (aktualizacja tabel/drabinki/historii —
//      dokładnie to, co już było w każdym trybie gry), a zaraz po nim —
//      automatyczny powrót na właściwy hub (mapowanie wg state.tournamentPhase).
//   4. Hub pokazuje zaktualizowany stan (tabela/drabinka/terminarz) z
//      gotowym przyciskiem "ROZEGRAJ MECZ"/"NASTĘPNA RUNDA" — bez potrzeby
//      dodatkowego, osobnego ekranu wyniku.
// ============================================================

const MATCH_HUB_BY_PHASE = {
  knockout: 'screen-playoff',
  groups: 'screen-playoff',
  mundial26: 'screen-playoff',
  season: 'screen-season',
  nbaPlayoff: 'screen-season',
  challenge: 'screen-challenge',
  customPuchar: 'screen-challenge',
};

function goToHubAfterMatch() {
  if (state.isQuickMatch) { showScreen('screen-title'); return; }
  const hub = MATCH_HUB_BY_PHASE[state.tournamentPhase];
  if (hub) showScreen(hub);
}

(function wrapFinishMatchForHubReturn() {
  if (typeof finishMatch !== 'function') return; // ochronnie — gdyby coś się nie wczytało
  const _origFinishMatch = finishMatch;
  finishMatch = function (sim, m, opp) {
    if (!state.replayDecisionMade) {
      // NAPRAWA: jeśli mecz zakończył się remisem w trybie, gdzie remis
      // wymaga dogrywki/karnych, rozstrzygamy to TERAZ — zanim jeszcze
      // pokażemy "DALEJ" — żeby gracz zobaczył wynik dogrywki/karnych NA
      // EKRANIE MECZU, zamiast dowiedzieć się o nim dopiero po fakcie, gdy
      // ekran już przeniósł go z powrotem do huba. Każdy tryb, który tego
      // potrzebuje, dopisuje tu swój hak (na razie: Mundial 2026, NBA STYLE
      // Trybu Sezonu — inne tryby z dogrywką/karnymi do zrobienia osobno).
      if (sim.result === 'D') {
        const showConfirmButtons = () => {
          state.pendingMatchFinish = { sim, m, opp };
          const skipBtn = document.getElementById('btn-skip-match');
          const pauseBtn = document.getElementById('btn-pause-match');
          const confirmBtn = document.getElementById('btn-confirm-match-result');
          const replayBtn = document.getElementById('btn-replay-match');
          if (skipBtn) skipBtn.style.display = 'none';
          if (pauseBtn) pauseBtn.style.display = 'none';
          if (confirmBtn) confirmBtn.style.display = 'inline-block';
          // POWTÓRZ MECZ to osobna cecha trenerska (patrz TRAITS.js) — jedno
          // powtórzenie na mecz, tylko jeśli trener gracza ją ma.
          const canReplay = (typeof myCoachHasTrait === 'function') && myCoachHasTrait('replayMatch') && !state.replayUsedForThisMatch;
          if (replayBtn) replayBtn.style.display = canReplay ? 'inline-block' : 'none';
        };
        // Mundial 2026: jeśli trzeba karnych, odsłania je NAJPIERW (po
        // kolei, z dramaturgią), i dopiero PO animacji pokazuje przyciski —
        // inaczej gracz zobaczyłby "DALEJ" zanim jeszcze karne się rozegrały.
        if (typeof m26DecideDrawEarly === 'function') {
          m26DecideDrawEarly(sim, m, opp, showConfirmButtons);
        } else {
          showConfirmButtons();
        }
        if (typeof nbaDecideDrawEarly === 'function') nbaDecideDrawEarly(sim, m, opp);
        return;
      }
      state.pendingMatchFinish = { sim, m, opp };
      const skipBtn = document.getElementById('btn-skip-match');
      const pauseBtn = document.getElementById('btn-pause-match');
      const confirmBtn = document.getElementById('btn-confirm-match-result');
      const replayBtn = document.getElementById('btn-replay-match');
      if (skipBtn) skipBtn.style.display = 'none';
      if (pauseBtn) pauseBtn.style.display = 'none';
      if (confirmBtn) confirmBtn.style.display = 'inline-block';
      // POWTÓRZ MECZ to osobna cecha trenerska (patrz TRAITS.js) — jedno
      // powtórzenie na mecz, tylko jeśli trener gracza ją ma.
      const canReplay = (typeof myCoachHasTrait === 'function') && myCoachHasTrait('replayMatch') && !state.replayUsedForThisMatch;
      if (replayBtn) replayBtn.style.display = canReplay ? 'inline-block' : 'none';
      return;
    }
    state.replayDecisionMade = false;
    _origFinishMatch(sim, m, opp);
    // Dopiero TERAZ — po tym, jak dany tryb gry zaktualizował swoje tabele/
    // drabinki i przygotował swój przycisk kontynuacji na hubie — wracamy
    // z zamkniętego środowiska meczu na ten hub.
    goToHubAfterMatch();
  };
})();

function confirmMatchResult() {
  const confirmBtn = document.getElementById('btn-confirm-match-result');
  const replayBtn = document.getElementById('btn-replay-match');
  if (confirmBtn) confirmBtn.style.display = 'none';
  if (replayBtn) replayBtn.style.display = 'none';
  const pending = state.pendingMatchFinish;
  state.pendingMatchFinish = null;
  state.replayDecisionMade = true;
  if (pending) finishMatch(pending.sim, pending.m, pending.opp);
}

function replayCurrentMatch() {
  const confirmBtn = document.getElementById('btn-confirm-match-result');
  const replayBtn = document.getElementById('btn-replay-match');
  if (confirmBtn) confirmBtn.style.display = 'none';
  if (replayBtn) replayBtn.style.display = 'none';
  state.pendingMatchFinish = null;
  state.replayUsedForThisMatch = true; // jedno powtórzenie na mecz — zużyte

  // Ręczne posprzątanie widoku po odrzuconej próbie — playMatch() resetuje
  // stan (liczniki, strzelców, kartki), ale nie czyści już narysowanych
  // elementów DOM z poprzedniej, odrzuconej symulacji.
  const timelineEl = document.getElementById('po-timeline');
  if (timelineEl) timelineEl.innerHTML = '';
  const scoreEl = document.getElementById('po-score');
  if (scoreEl) { scoreEl.textContent = 'VS'; scoreEl.className = 'match-score'; }
  const commentaryEl = document.getElementById('po-commentary');
  if (commentaryEl) commentaryEl.textContent = '';
  const sbMe = document.getElementById('po-scoreboard-me');
  const sbOpp = document.getElementById('po-scoreboard-opp');
  if (sbMe) sbMe.innerHTML = '';
  if (sbOpp) sbOpp.innerHTML = '';

  playMatch();
}
