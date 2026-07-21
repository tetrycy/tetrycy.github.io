// ============================================================
// GÓRNIK ZABRZE W LIDZE MISTRZÓW 2026/27 — system szwajcarski Z KOSZYKAMI
// (dokładnie jak losowanie UEFA: 4 koszyki po 9 drużyn, każda gra po 2 mecze
// z KAŻDYM koszykiem — w tym własnym — czyli 8 meczów, 4 u siebie/4 na
// wyjeździe). Górnik Zabrze zajmuje swoje stałe miejsce w KOSZYKU 4.
//
// 3 rundy eliminacji: 1. runda ze stałym rywalem (Fenerbahçe), 2. i 3.
// runda — rywal losowany z WĄSKIEJ, 8-zespołowej puli (bez powtórzeń między
// rundami). Potem faza ligowa jw. Top 8 → prosto do 1/8 finału, miejsca
// 9-24 → dwumeczowy baraż (9. z 24., 10. z 23., ...), miejsca 25-36 odpadają.
// Dalej drabinka dwumeczów aż do pojedynczego finału na neutralnym terenie.
// Wymaga: WYZWANIA/druzyny-lm-2526.js oraz klubu "Górnik Zabrze" w sezonie
// "2026/27" (DANE/sezon-2026-27.js).
// ============================================================

window.WYZWANIA = window.WYZWANIA || [];
window.WYZWANIA.push({
  id: 'lm-2526-gornik',
  title: 'Górnik Zabrze w Lidze Mistrzów 2026/27',
  description: 'Przeprowadź Górnik Zabrze przez 3 rundy eliminacji (od Fenerbahçe) i nową Ligę Mistrzów z prawdziwym losowaniem koszykowym: 8 meczów fazy ligowej, baraże, drabinka — aż po finał.',
  club: 'Górnik Zabrze',
  clubSeason: '2026/27',
  type: 'swiss',

  qualifying: [
    { name: 'II runda eliminacji', legs: 2, firstLegHome: true, opponent: { source: 'custom', id: 'lm2-fenerbahce' } },
    {
      name: 'III runda eliminacji', legs: 2, firstLegHome: false,
      opponentPool: [
        { source: 'custom', id: 'lm2-pool-sturmgraz' },
        { source: 'custom', id: 'lm2-pool-hearts' }
      ],
    },
    // Baraż o fazę ligową — jeszcze nieznany, zostaje jak było (do
    // zaktualizowania, gdy będzie wiadomo).
    {
      name: 'Baraż o fazę ligową', legs: 2, firstLegHome: true,
      opponentPool: [
        { source: 'custom', id: 'lm-lyon' },
        { source: 'custom', id: 'lm-bodo' }
      ],
    },
  ],

  // Faza ligowa — 4 koszyki po 9 (Ty zajmujesz swoje stałe miejsce w koszyku 4).
  swiss: {
    matches: 8,
    advanceDirect: 8,
    advancePlayoff: 24,
    pots: [
      [
        { source: 'custom', id: 'lm-psg' },
        { source: 'custom', id: 'lm-bayern' },
        { source: 'custom', id: 'lm-real-madryt' },
        { source: 'custom', id: 'lm-liverpool' },
        { source: 'custom', id: 'lm-inter' },
        { source: 'custom', id: 'lm-man-city' },
        { source: 'custom', id: 'lm-arsenal' },
        { source: 'custom', id: 'lm-barcelona' },
        { source: 'custom', id: 'lm-atletico' },
      ],
      [
        { source: 'custom', id: 'lm-borussia' },
        { source: 'custom', id: 'lm-roma' },
        { source: 'custom', id: 'lm-sporting' },
        { source: 'custom', id: 'lm-aston-villa' },
        { source: 'custom', id: 'lm-porto' },
        { source: 'custom', id: 'lm-man-utd' },
        { source: 'custom', id: 'lm-brugge' },
        { source: 'custom', id: 'lm-betis' },
        { source: 'custom', id: 'lm-psv' },
      ],
      [
        { source: 'custom', id: 'lm-feyenoord' },
        { source: 'custom', id: 'lm-lille' },
        { source: 'custom', id: 'lm-lyon' },
        { source: 'custom', id: 'lm-bodo' },
        { source: 'custom', id: 'lm-napoli' },
        { source: 'custom', id: 'lm-leipzig' },
        { source: 'custom', id: 'lm-villarreal' },
        { source: 'custom', id: 'lm-shakhtar' },
        { source: 'custom', id: 'lm-galatasaray' },
      ],
      [
        { source: 'custom', id: 'lm-crvena' },
        { source: 'custom', id: 'lm-dinamo-zg' },
        { source: 'custom', id: 'lm-celtic' },
        { source: 'custom', id: 'lm-slavia' },
        { source: 'custom', id: 'lm-slovan-ba' },
        { source: 'custom', id: 'lm-stuttgart' },
        { source: 'me' },
        { source: 'custom', id: 'lm-como' },
        { source: 'custom', id: 'lm-lens' },
      ]
    ],
  },
});
