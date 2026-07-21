// ============================================================
// WISŁA KRAKÓW W PUCHARZE UEFA 2002/03
// Runda kwalifikacyjna → 1. → 2. → 3. → 4. runda → ćwierćfinał →
// półfinał → FINAŁ (pojedynczy mecz, bez rewanżu).
// ============================================================

window.WYZWANIA = window.WYZWANIA || [];
window.WYZWANIA.push({
  id: 'wisla-uefa-0203',
  title: 'Wisła Kraków w Pucharze UEFA 2002/03',
  description: 'Poprowadź Wisłę Kraków przez kolejne rundy Pucharu UEFA — mecz i rewanż w każdej rundzie (finał wyjątkowo bez rewanżu, jeden decydujący mecz).',
  club: 'Wisła Kraków',
  clubSeason: '2002/03',
  rounds: [
    // UWAGA: firstLegHome ustawione domyślnie na true (pierwszy mecz u siebie) dla
    // wszystkich rund dwumeczowych poniżej — sprawdź i popraw dla każdej rundy osobno,
    // jeśli w rzeczywistym przebiegu było inaczej.
    {
      name: 'Runda kwalifikacyjna',
      legs: 2,
      firstLegHome: true,
      opponent: { source: 'custom', id: 'glentoran-fc' },
    },
    {
      name: '1. runda',
      legs: 2,
      firstLegHome: true,
      opponent: { source: 'custom', id: 'nk-primorje' },
    },
    {
      name: '2. runda',
      legs: 2,
      firstLegHome: true,
      opponent: { source: 'custom', id: 'ac-parma' },
    },
    {
      name: '3. runda',
      legs: 2,
      firstLegHome: true,
      opponent: { source: 'custom', id: 'schalke-04' },
    },
    {
      name: '4. runda',
      legs: 2,
      firstLegHome: true,
      opponent: { source: 'custom', id: 'lazio-rzym' },
    },
    {
      name: 'Ćwierćfinał',
      legs: 2,
      firstLegHome: true,
      opponent: { source: 'custom', id: 'besiktas' },
    },
    {
      name: 'Półfinał',
      legs: 2,
      firstLegHome: true,
      opponent: { source: 'custom', id: 'fc-porto' },
    },
    {
      name: 'Finał',
      legs: 1, // FINAŁ — pojedynczy mecz, bez rewanżu
      firstLegHome: true, // TODO: ustaw poprawnie, gdzie faktycznie grano finał (u siebie/na neutralnym stadionie)
      opponent: { source: 'custom', id: 'celtic-fc' },
    },
  ],
});
