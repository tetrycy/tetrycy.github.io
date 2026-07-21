// ============================================================
// GÓRNIK ZABRZE W PUCHARZE ZDOBYWCÓW PUCHARÓW 1969/70
// 1/16 Olympiakos → 1/8 Glasgow Rangers → 1/4 Lewski Sofia →
// 1/2 AS Roma → FINAŁ Manchester City (pojedynczy mecz, neutralny teren).
//
// UWAGA — SPECJALNA ZASADA TEGO WYZWANIA: jeśli po dwóch meczach (mecz +
// rewanż) nadal jest remis na dwumeczu, o awansie NIE decydują bramki na
// wyjeździe — rozgrywa się TRZECI, DECYDUJĄCY MECZ na neutralnym terenie.
// Jeśli i ten mecz zakończy się remisem, o awansie decyduje rzut monetą.
// (tiebreak: 'replay' w każdej rundzie dwumeczowej poniżej)
//
// Zakłada, że główna baza TEAMS_DATA zawiera klub "Górnik Zabrze" z sezonem
// "1969/70" (DANE/sezon-1969-70.js) — jeśli nazwa klubu/sezonu jest tam
// zapisana inaczej, popraw pola club / clubSeason poniżej.
// ============================================================

window.WYZWANIA = window.WYZWANIA || [];
window.WYZWANIA.push({
  id: 'gornik-pzp-6970',
  title: 'Górnik Zabrze w Pucharze Zdobywców Pucharów 1969/70',
  description: 'Olympiakos, Glasgow Rangers, Lewski Sofia, AS Roma i finał z Manchester City. Remis na dwumeczu? Trzeci mecz na neutralnym terenie, a przy kolejnym remisie — rzut monetą.',
  club: 'Górnik Zabrze',
  clubSeason: '1969/70',

  rounds: [
    {
      name: '1/16 finału',
      legs: 2,
      firstLegHome: true,
      tiebreak: 'replay',
      opponent: { source: 'custom', id: 'olympiakos-6970' },
    },
    {
      name: '1/8 finału',
      legs: 2,
      firstLegHome: true,
      tiebreak: 'replay',
      opponent: { source: 'custom', id: 'glasgow-rangers-6970' },
    },
    {
      name: 'Ćwierćfinał',
      legs: 2,
      firstLegHome: true,
      tiebreak: 'replay',
      opponent: { source: 'custom', id: 'lewski-sofia-6970' },
    },
    {
      name: 'Półfinał',
      legs: 2,
      firstLegHome: true,
      tiebreak: 'replay',
      opponent: { source: 'custom', id: 'as-roma-6970' },
    },
    {
      name: 'Finał',
      legs: 1, // pojedynczy mecz, bez rewanżu
      neutral: true, // neutralny teren
      opponent: { source: 'custom', id: 'manchester-city-6970' },
    },
  ],
});
