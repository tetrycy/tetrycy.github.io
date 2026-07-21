// ============================================================
// PLAYER-TRAITS.JS — cechy indywidualne zawodników (jak TRAITS.js dla
// trenera, ale przypięte do konkretnego piłkarza w składzie).
//
// FORMAT: player.traits = ['longShots', 'trainingBoost', ...] — zwykła
// tablica kluczy (stringów) na obiekcie zawodnika w state.squad. Puste/
// brak pola = zawodnik bez żadnych cech (domyślne, bezpieczne zachowanie
// wszędzie, gdzie to sprawdzamy).
//
// NA RAZIE dwie cechy jako przykład/dowód działania:
//   - longShots ("Strzały z dystansu") — podbija skuteczność Twojej
//     drużyny akurat w akcjach typu "strzał z daleka" (ta sama kategoria
//     zdarzeń co coachowy subtypeBoost w TRAITS.js).
//   - trainingBoost ("Szybki rozwój") — większe skoki overallu z treningu
//     (patrz TRENING.js).
//
// MIEJSCE NA KOLEJNE (świadomie zostawione puste, żeby dopisywać bez
// przebudowy): karny specjalista, gra głową, twardziel/odporność na
// kontuzje, lider (mniej pomyłek drużyny w trudnych momentach), dryblingu
// mistrz (boost do "akcja indywidualna"), specjalista stałych fragmentów
// (boost do "rzut rożny"/"rzut wolny z daleka") itd.
// ============================================================

const PLAYER_TRAIT_PRESETS = {
  longShots: {
    label: 'Strzały z dystansu',
    description: 'Częściej trafia, gdy akcja to strzał z daleka.',
  },
  trainingBoost: {
    label: 'Szybki rozwój',
    description: 'Trening działa na niego mocniej — większe skoki formy/rozwoju.',
  },
};

function getPlayerTraits(player) {
  return (player && player.traits) || [];
}

function playerHasTrait(player, key) {
  return getPlayerTraits(player).includes(key);
}

// Czy KTOKOLWIEK z podanego składu (żywej jedenastki na boisku w danym
// momencie meczu) ma daną cechę — używane do podbicia skuteczności całej
// drużyny w konkretnym typie akcji (patrz silnik.js).
function teamHasPlayerTrait(roster, key) {
  return (roster || []).some(p => playerHasTrait(p, key));
}

// Czytelny, polski opis cechy — do profilu zawodnika (PROFILE.js).
function playerTraitLabel(key) {
  const preset = PLAYER_TRAIT_PRESETS[key];
  return preset ? preset.label : 'Nieznana cecha';
}
