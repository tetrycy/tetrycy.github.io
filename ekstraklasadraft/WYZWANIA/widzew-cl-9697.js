// ============================================================
// WIDZEW ŁÓDŹ W LIDZE MISTRZÓW 1996/97
// Kwalifikacje (mecz+rewanż z Brøndby) → faza grupowa (mecz+rewanż
// z 3 rywalami) → ROZWIDLENIE ścieżki w zależności od miejsca w grupie:
//   1. miejsce (wygrana grupy)  → ćwierćfinał Ajax, półfinał Juventus, finał Dortmund
//   2. miejsce                 → ćwierćfinał Auxerre, półfinał Man Utd, finał Juventus
// 3./4. miejsce w grupie = koniec przygody (odpadasz na fazie grupowej).
// ============================================================

window.WYZWANIA = window.WYZWANIA || [];
window.WYZWANIA.push({
  id: 'widzew-cl-9697',
  title: 'Widzew Łódź w Lidze Mistrzów 1996/97',
  description: 'Kwalifikacje, grupa z Borussią Dortmund, Atlético Madryt i Steauą Bukareszt, a potem — zależnie od miejsca w grupie — inna droga do finału.',
  type: 'group-knockout',
  club: 'Widzew Łódź',
  clubSeason: '1996/97',

  // UWAGA: firstLegHome domyślnie true (pierwszy mecz u siebie) — sprawdź i popraw,
  // jeśli w rzeczywistości było inaczej.
  qualifying: {
    name: 'Runda kwalifikacyjna',
    legs: 2,
    firstLegHome: true,
    opponent: { source: 'custom', id: 'brondby' },
  },

  group: {
    // Mecz + rewanż z każdym z trzech rywali (6 meczów łącznie), z tabelą grupową.
    opponents: [
      { source: 'custom', id: 'borussia-dortmund' },
      { source: 'custom', id: 'atletico-madryt' },
      { source: 'custom', id: 'steaua-bukareszt' },
    ],
  },

  knockoutPaths: {
    // Ścieżka, jeśli Widzew WYGRA grupę (1. miejsce).
    winner: [
      {
        name: 'Ćwierćfinał',
        legs: 2,
        firstLegHome: true,
        opponent: { source: 'custom', id: 'ajax' },
      },
      {
        name: 'Półfinał',
        legs: 2,
        firstLegHome: true,
        opponent: { source: 'custom', id: 'juventus' },
      },
      {
        name: 'Finał',
        legs: 1, // TODO: sprawdź, czy finał LM 96/97 był pojedynczym meczem na neutralnym stadionie
        firstLegHome: true, // TODO: popraw, jeśli finał był na neutralnym terenie (dodaj neutral: true)
        opponent: { source: 'custom', id: 'borussia-dortmund' },
      },
    ],
    // Ścieżka, jeśli Widzew zajmie 2. miejsce w grupie.
    runnerUp: [
      {
        name: 'Ćwierćfinał',
        legs: 2,
        firstLegHome: true,
        opponent: { source: 'custom', id: 'auxerre' },
      },
      {
        name: 'Półfinał',
        legs: 2,
        firstLegHome: true,
        opponent: { source: 'custom', id: 'manchester-united' },
      },
      {
        name: 'Finał',
        legs: 1, // TODO: jw.
        firstLegHome: true, // TODO: jw.
        opponent: { source: 'custom', id: 'juventus' },
      },
    ],
  },
});
