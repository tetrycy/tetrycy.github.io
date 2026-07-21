// ============================================================
// TRAITS.JS — cechy trenerskie ("traits"). Czyta state.coach i dane
// z TRENERZY.js, dostarcza silnikowi (silnik.js) gotowe modyfikatory,
// oraz (dla POWTÓRZ MECZ) spina się z zakończeniem meczu w UI.
//
// WAŻNE O KOLEJNOŚCI WCZYTYWANIA: ten plik jest wczytywany JAKO
// OSTATNI w index.html, PO wszystkich plików trybów gry (tryby.js,
// KREATOR-TURNIEJU.js, wyzwania.js). Powód: finishMatch() jest przez
// te pliki wielokrotnie nadpisywana (każdy owija poprzednią wersję),
// więc dopiero PO wczytaniu wszystkiego istnieje jej ostateczna,
// w pełni złożona wersja — i dopiero wtedy można ją bezpiecznie owinąć
// dla cechy POWTÓRZ MECZ, tak żeby działała we WSZYSTKICH trybach
// (playoff, mundial, sezon, wyzwania, kreator turnieju), a nie tylko
// w jednym z nich.
//
// FORMAT DANYCH W TRENERZY.js: każdy trener ma pole "traits" — tablicę
// obiektów (może mieć kilka cech naraz). Trener bez wpisu, albo ze
// starym { type: 'nothing' }, ma po prostu brak cech — nic się nie
// wywali, silnik po prostu nic nie robi.
//
// KATALOG TYPÓW CECH (v1):
//
//   { type: 'lineBoost', line: 'DEF'|'MID'|'FWD', amount: liczba }
//     Stały bonus (może być ujemny) do jednej linii formacji, doliczany
//     RAZ na starcie meczu do bazowej siły tej linii. Typowe wartości:
//     +1 / +2 / +3 (albo ujemne dla słabego taktyka).
//
//   { type: 'subtypeBoost', label: '<dokładna etykieta z MEDIUM/HIGH_SUBTYPES>', pGoalMult: liczba }
//     Mnożnik skuteczności KONKRETNEGO typu akcji (np. tylko rzuty
//     rożne, tylko długi wyrzut z autu). Działa WYŁĄCZNIE dla Twoich
//     akcji. Rekomendowane ~1.10 (10% więcej), żeby nie wypaczać gry.
//     Dostępne etykiety (patrz komentarze.js): 'posiadanie', 'rzut rożny',
//     'długi wyrzut z autu', 'rzut wolny z daleka', 'akcja indywidualna',
//     'strzał z daleka', 'dośrodkowanie', 'piłka na wolne pole',
//     'akcja kombinacyjna', 'rzut wolny tuż sprzed pola karnego',
//     'drybling w polu karnym', 'szybka kontra'.
//
//   { type: 'categoryBoost', category: 'possession'|'sfg'|'ind'|'counter', pGoalMult: liczba }
//     Mnożnik skuteczności CAŁEJ kategorii akcji (np. wszystkie kontry,
//     wszystkie stałe fragmenty gry). Działa WYŁĄCZNIE dla Twoich akcji.
//     Rekomendowane ~1.10 (10% więcej).
//
//   { type: 'refereeFavorite', awardChanceBonus: liczba }
//     LUBIANY PRZEZ SĘDZIÓW — przesuwa czysty 50/50 przy przyznawaniu
//     rzutu karnego na Twoją korzyść. Rekomendowane 0.10–0.20
//     (np. 0.15 → 65/35 zamiast 50/50 w Twoją stronę).
//
//   { type: 'provocateur', oppRedChanceBonus: liczba }
//     PROWOKATOR — zwiększa szanse na czerwoną kartkę dla RYWALA: i przy
//     losowaniu "kto zawinił" przy bezpośredniej czerwonej (50/50 na
//     niekorzyść rywala), i jako niezależna, dodatkowa szansa, że zwykła
//     żółta kartka rywala od razu skończy się czerwoną. Rekomendowane 0.10–0.20.
//
//   { type: 'bloodOnBoots', pGoalMultOpp: liczba (np. 0.55), extraRedChance: liczba (np. 0.30) }
//     KREW NA BUTACH — silniejsza, ZAWSZE WŁĄCZONA wersja "Agresywnego
//     odbioru": obniża skuteczność KAŻDEJ akcji rywala (nie tylko gdy
//     ręcznie włączysz taktykę), kosztem podniesionego ryzyka czerwonej
//     kartki dla WŁASNYCH graczy. Sumuje się z ręczną taktyką, jeśli też
//     aktywna. Kary tak mocne jak dziś najmocniejsza wersja Agresywnego
//     odbioru albo mocniejsze — to świadomy trade-off tej cechy.
//
//   { type: 'replayMatch' }
//     POWTÓRZ MECZ — po zakończeniu meczu (dowolny tryb gry) pokazuje
//     wybór: zatwierdź wynik i idź dalej, albo powtórz mecz od zera
//     (nowa symulacja, ten sam przeciwnik) — JEDEN RAZ na mecz. Po
//     wykorzystaniu powtórzenia drugie zakończenie tego samego meczu
//     pokazuje już tylko ZATWIERDŹ WYNIK, bez opcji kolejnej powtórki.
//
// Wszystkie cechy oprócz "replayMatch" działają dziś WYŁĄCZNIE dla
// trenera GRACZA (state.coach) — rywale/AI nie mają jeszcze swoich
// trenerów podpiętych do silnika.
//
// { type: 'nothing' } — zaślepka, zero efektu. Zostaje jako domyślny
// stan każdego trenera, dopóki nie przypiszesz mu czegoś konkretnego —
// getMyCoachTraits() bezpiecznie zwraca dla niej pustą tablicę cech.
// ============================================================

// ── PRESETY — krótkie kody zamiast pełnych obiektów ──────────
// Zamiast wpisywać cały obiekt cechy, w TRENERZY.js można po prostu
// wpisać STRING (jedno słowo/krótki kod) z tej listy — silnik sam go
// rozwinie do pełnego obiektu z rozsądną, domyślną wartością. Można
// dowolnie mieszać presety i pełne obiekty w tej samej tablicy "traits".
// Przykład:
//   window.TRENERZY["Jan Kowalski"] = { traits: ['provocateur', 'sfg', 'DEF+2'] };
//
// KATEGORIE (nazwa = sama kategoria, pGoalMult ~1.08–1.10):
//   'possession' | 'sfg' | 'ind' | 'counter'
//
// KONKRETNE TYPY AKCJI (pGoalMult 1.20 — węższy zasięg, więc mocniejszy):
//   'rzutRozny' | 'wyrzutZAutu' | 'wolnyZDaleka' | 'akcjaIndywidualna' |
//   'strzalZDaleka' | 'dosrodkowanie' | 'pilkaNaWolnePole' |
//   'wolnyPrzedPolem' | 'dryblingWPolu' | 'szybkaKontra'
//
// KARTKI / KARNE (domyślne wartości, patrz TRAIT_PRESETS niżej):
//   'refereeFavorite' | 'provocateur' | 'bloodOnBoots'
//
// META:
//   'replayMatch'
//
// LINIA FORMACJI — specjalny format "LINIA+/-LICZBA" (nie ma w słowniku
// presetów, bo liczbę wybierasz Ty): 'DEF+1', 'DEF+2', 'DEF+3', 'MID-1',
// 'FWD+3' itd. — dowolna linia (DEF/MID/FWD) i dowolna liczba całkowita.
const TRAIT_PRESETS = {
  // — kategorie akcji —
  possession: { type: 'categoryBoost', category: 'possession', pGoalMult: 1.08 },
  sfg:        { type: 'categoryBoost', category: 'sfg',        pGoalMult: 1.10 },
  ind:        { type: 'categoryBoost', category: 'ind',        pGoalMult: 1.10 },
  counter:    { type: 'categoryBoost', category: 'counter',    pGoalMult: 1.10 },

  // — konkretne typy akcji —
  rzutRozny:         { type: 'subtypeBoost', label: 'rzut rożny', pGoalMult: 1.20 },
  wyrzutZAutu:       { type: 'subtypeBoost', label: 'długi wyrzut z autu', pGoalMult: 1.20 },
  wolnyZDaleka:      { type: 'subtypeBoost', label: 'rzut wolny z daleka', pGoalMult: 1.20 },
  akcjaIndywidualna: { type: 'subtypeBoost', label: 'akcja indywidualna', pGoalMult: 1.20 },
  strzalZDaleka:     { type: 'subtypeBoost', label: 'strzał z daleka', pGoalMult: 1.20 },
  dosrodkowanie:     { type: 'subtypeBoost', label: 'dośrodkowanie', pGoalMult: 1.20 },
  pilkaNaWolnePole:  { type: 'subtypeBoost', label: 'piłka na wolne pole', pGoalMult: 1.20 },
  wolnyPrzedPolem:   { type: 'subtypeBoost', label: 'rzut wolny tuż sprzed pola karnego', pGoalMult: 1.20 },
  dryblingWPolu:     { type: 'subtypeBoost', label: 'drybling w polu karnym', pGoalMult: 1.20 },
  szybkaKontra:      { type: 'subtypeBoost', label: 'szybka kontra', pGoalMult: 1.20 },

  // — kartki / karne —
  refereeFavorite: { type: 'refereeFavorite', awardChanceBonus: 0.15 },
  provocateur:     { type: 'provocateur', oppRedChanceBonus: 0.15 },
  bloodOnBoots:    { type: 'bloodOnBoots', pGoalMultOpp: 0.55, extraRedChance: 0.30 },

  // — meta —
  replayMatch: { type: 'replayMatch' },
};

// Rozpoznaje krótki format "DEF+2" / "MID-1" / "FWD+3" (dowolna linia,
// dowolna liczba całkowita, dodatnia lub ujemna) i zamienia na lineBoost.
const LINE_BOOST_SHORTHAND = /^(DEF|MID|FWD)([+-]\d+)$/;

// Zamienia string (preset albo krótki format linii) na pełny obiekt cechy.
// Obiekty (pełny, ręcznie napisany format) przechodzą bez zmian — więc
// stary, w pełni rozpisany zapis cały czas działa, to nie jest przełom.
function resolveTraitEntry(entry) {
  if (typeof entry !== 'string') return entry; // już pełny obiekt — bez zmian
  if (TRAIT_PRESETS[entry]) return TRAIT_PRESETS[entry];
  const m = entry.match(LINE_BOOST_SHORTHAND);
  if (m) return { type: 'lineBoost', line: m[1], amount: parseInt(m[2], 10) };
  console.warn('TRAITS: nieznany preset cechy trenerskiej:', entry);
  return { type: 'nothing' };
}

function resolveTraits(rawTraits) {
  return (rawTraits || []).map(resolveTraitEntry);
}

// ── ODCZYT CECH TRENERA GRACZA ────────────────────────────────
function getMyCoachTraits() {
  if (!state.coach || !state.coach.name) return [];
  const entry = window.TRENERZY && window.TRENERZY[state.coach.name];
  return (entry && Array.isArray(entry.traits)) ? resolveTraits(entry.traits) : [];
}

// Wersja niezależna od globalnego state.coach, używana w meczach AI-vs-AI.
// Obiekt drużyny może przechowywać trenera jako {name}, zwykły string albo
// tablicę coaches z danych sezonu. Ostatni trener na liście reprezentuje
// końcowy stan danego sezonu.
function getTeamCoachTraits(team) {
  if (!team) return [];
  let coach = team.coach || null;
  if (!coach && Array.isArray(team.coaches) && team.coaches.length) coach = team.coaches[team.coaches.length - 1];
  const name = typeof coach === 'string' ? coach : (coach && coach.name);
  if (!name) return [];
  const entry = window.TRENERZY && window.TRENERZY[name];
  return (entry && Array.isArray(entry.traits)) ? resolveTraits(entry.traits) : [];
}

function myCoachHasTrait(type) {
  return getMyCoachTraits().some(t => t.type === type);
}

// ── PROFIL TRENERA — patrz PROFILE.js ───────────────────────

// ── LINE BOOST ─────────────────────────────────────────────
// Stosowane RAZ, na starcie meczu, na obiekcie myBase (lineAverages),
// PRZED doliczeniem modyfikatorów meczowych (myMods).
function applyCoachLineBoosts(base, traits) {
  traits.forEach(t => {
    if (t.type === 'lineBoost' && base[t.line] != null) {
      // To modyfikator meczowy, nie trwała zmiana karty zawodnika. Nie
      // dociskamy go do 120, bo wtedy ten sam bonus znikałby drużynie 120 OVR
      // i łamał zasadę, że liczy się wyłącznie różnica siły.
      base[t.line] += t.amount;
    }
  });
  return base;
}

// ── SUBTYPE / CATEGORY BOOST ───────────────────────────────
// Wywoływane dla KAŻDEJ Twojej akcji, zaraz po wylosowaniu subtype,
// tuż przed sprawdzeniem szansy na gola.
function applyCoachSubtypeBoost(pGoal, subtype, traits) {
  let result = pGoal;
  traits.forEach(t => {
    if (t.type === 'subtypeBoost' && t.label === subtype.label) result *= t.pGoalMult;
    else if (t.type === 'categoryBoost' && t.category === subtype.category) result *= t.pGoalMult;
  });
  return result;
}

// ── LUBIANY PRZEZ SĘDZIÓW ──────────────────────────────────
function getCoachPenaltyAwardBonus(traits) {
  return traits.reduce((sum, t) => t.type === 'refereeFavorite' ? sum + t.awardChanceBonus : sum, 0);
}

// ── PROWOKATOR ──────────────────────────────────────────────
function getCoachOppRedBonus(traits) {
  return traits.reduce((sum, t) => t.type === 'provocateur' ? sum + t.oppRedChanceBonus : sum, 0);
}

// ── KREW NA BUTACH ──────────────────────────────────────────
// Kilka takich cech naraz (teoretycznie) mnoży pGoalMultOpp i bierze
// najwyższą wartość extraRedChance — w praktyce trener ma zwykle
// najwyżej jedną tego typu cechę.
function getCoachAggressionBonus(traits) {
  return traits.reduce((acc, t) => {
    if (t.type !== 'bloodOnBoots') return acc;
    return {
      pGoalMultOpp: acc.pGoalMultOpp * t.pGoalMultOpp,
      extraRedChance: Math.max(acc.extraRedChance, t.extraRedChance),
    };
  }, { pGoalMultOpp: 1, extraRedChance: 0 });
}
