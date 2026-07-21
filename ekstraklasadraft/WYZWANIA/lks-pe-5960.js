// ============================================================
// ŁKS ŁÓDŹ W PUCHARZE EUROPY 1959/60 — wyzwanie alternatywne
// Jeunesse Esch → Real Madryt → FC Barcelona → FINAŁ Eintracht Frankfurt.
//
// Zasada historyczna jak w wyzwaniu Górnika: jeśli po meczu i rewanżu jest
// remis na dwumeczu, nie decydują bramki na wyjeździe — rozgrywa się trzeci,
// decydujący mecz na neutralnym terenie. Jeśli trzeci mecz też kończy się
// remisem, silnik rozstrzyga awans rzutem monetą.
//
// UWAGA: To wyzwanie zakłada, że główna baza TEAMS_DATA zawiera klub
// "ŁKS Łódź" z sezonem "1959/60". Jeśli w data.js nazwa klubu lub sezonu
// są zapisane inaczej, popraw pola club / clubSeason poniżej.
// ============================================================

window.WYZWANIA = window.WYZWANIA || [];
window.WYZWANIA.push({
  id: 'lks-pe-5960',
  title: 'ŁKS Łódź w Pucharze Europy 1959/60',
  description: 'Poprowadź ŁKS przez alternatywną ścieżkę Pucharu Europy: Jeunesse Esch, Real Madryt, FC Barcelona i finał z Eintrachtem Frankfurt. Remis na dwumeczu oznacza trzeci mecz na neutralnym terenie.',
  club: 'ŁKS Łódź',
  clubSeason: '1959/60',

  rounds: [
    {
      name: 'Pierwsza runda',
      legs: 2,
      firstLegHome: true,
      tiebreak: 'replay',
      opponent: { source: 'custom', id: 'jeunesse-esch-5960' },
    },
    {
      name: 'Ćwierćfinał',
      legs: 2,
      firstLegHome: true,
      tiebreak: 'replay',
      opponent: { source: 'custom', id: 'real-madryt-5960' },
    },
    {
      name: 'Półfinał',
      legs: 2,
      firstLegHome: true,
      tiebreak: 'replay',
      opponent: { source: 'custom', id: 'fc-barcelona-5960' },
    },
    {
      name: 'Finał',
      legs: 1,
      neutral: true,
      opponent: { source: 'custom', id: 'eintracht-frankfurt-5960' },
    },
  ],
});
