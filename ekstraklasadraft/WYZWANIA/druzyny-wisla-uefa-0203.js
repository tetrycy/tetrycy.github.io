// ============================================================
// WYZWANIA-DRUZYNY.JS — własne, ręcznie wpisane drużyny używane
// WYŁĄCZNIE w trybie WYZWANIA. NIE są częścią draftu ani żadnego
// innego trybu gry — nie da się ich wylosować ani wybrać poza
// konkretnym wyzwaniem, które się do nich odwołuje.
//
// KSZTAŁT ZAWODNIKA (identyczny jak w data.js):
//   { name: '...', position: 'GK'|'DEF'|'MID'|'FWD', overall: liczba, starting: true/false }
//   (apps/goals opcjonalne — nieużywane w meczu, tylko dla klimatu, jeśli chcesz)
//
// Każda drużyna potrzebuje MINIMUM: 1 GK + 4 DEF + 4 MID + 2 FWD ze
// starting:true (11 razem), żeby skład ułożył się poprawnie na
// Twoich 11 slotach. Możesz dopisać więcej (rezerwowi) — kształt
// jest identyczny jak w prawdziwej bazie, gdzie drużyny mają po
// 15-20 zawodników.
//
// PONIŻEJ: szablony dla ośmiu rywali Wisły Kraków w Pucharze UEFA
// 2002/03. Wszystkie nazwiska i overalle to placeholdery —
// podmień je na prawdziwe dane. Overalle są na razie z grubsza
// rosnące rundami (kwalifikacje słabsze, finał najmocniejszy) —
// tylko orientacyjnie, popraw wg własnej wiedzy.
// ============================================================

function makeTemplateSquad_wislaUefa0203(prefix, baseOverall) {
  return [
    { name: `${prefix} — Bramkarz 1`, position: 'GK', overall: baseOverall, starting: true },
    { name: `${prefix} — Bramkarz 2`, position: 'GK', overall: baseOverall - 8, starting: false },
    { name: `${prefix} — Obrońca 1`, position: 'DEF', overall: baseOverall, starting: true },
    { name: `${prefix} — Obrońca 2`, position: 'DEF', overall: baseOverall, starting: true },
    { name: `${prefix} — Obrońca 3`, position: 'DEF', overall: baseOverall - 1, starting: true },
    { name: `${prefix} — Obrońca 4`, position: 'DEF', overall: baseOverall - 1, starting: true },
    { name: `${prefix} — Obrońca 5 (rezerwa)`, position: 'DEF', overall: baseOverall - 7, starting: false },
    { name: `${prefix} — Pomocnik 1`, position: 'MID', overall: baseOverall + 1, starting: true },
    { name: `${prefix} — Pomocnik 2`, position: 'MID', overall: baseOverall, starting: true },
    { name: `${prefix} — Pomocnik 3`, position: 'MID', overall: baseOverall, starting: true },
    { name: `${prefix} — Pomocnik 4`, position: 'MID', overall: baseOverall - 2, starting: true },
    { name: `${prefix} — Pomocnik 5 (rezerwa)`, position: 'MID', overall: baseOverall - 6, starting: false },
    { name: `${prefix} — Napastnik 1`, position: 'FWD', overall: baseOverall + 2, starting: true },
    { name: `${prefix} — Napastnik 2`, position: 'FWD', overall: baseOverall, starting: true },
    { name: `${prefix} — Napastnik 3 (rezerwa)`, position: 'FWD', overall: baseOverall - 6, starting: false },
  ];
}

window.WYZWANIA_TEAMS_DATA = window.WYZWANIA_TEAMS_DATA || [];
window.WYZWANIA_TEAMS_DATA.push(
  {
    id: 'glentoran-fc',
    club: 'Glentoran FC',
    context: 'Wisła Kraków w Pucharze UEFA 2002/03 — runda kwalifikacyjna',
    players: makeTemplateSquad_wislaUefa0203('Glentoran', 65),
  },
  {
    id: 'nk-primorje',
    club: 'NK Primorje',
    context: 'Wisła Kraków w Pucharze UEFA 2002/03 — 1. runda',
    players: makeTemplateSquad_wislaUefa0203('Primorje', 68),
  },
  {
    id: 'ac-parma',
    club: 'AC Parma',
    context: 'Wisła Kraków w Pucharze UEFA 2002/03 — 2. runda',
    players: makeTemplateSquad_wislaUefa0203('Parma', 90),
  },
  {
    id: 'schalke-04',
    club: 'Schalke 04 Gelsenkirchen',
    context: 'Wisła Kraków w Pucharze UEFA 2002/03 — 3. runda',
    players: makeTemplateSquad_wislaUefa0203('Schalke', 88),
  },
  {
    id: 'lazio-rzym',
    club: 'Lazio Rzym',
    context: 'Wisła Kraków w Pucharze UEFA 2002/03 — 4. runda',
    players: makeTemplateSquad_wislaUefa0203('Lazio', 92),
  },
  {
    id: 'besiktas',
    club: 'Beşiktaş',
    context: 'Wisła Kraków w Pucharze UEFA 2002/03 — ćwierćfinał',
    players: makeTemplateSquad_wislaUefa0203('Beşiktaş', 86),
  },
  {
    id: 'fc-porto',
    club: 'FC Porto',
    context: 'Wisła Kraków w Pucharze UEFA 2002/03 — półfinał',
    players: makeTemplateSquad_wislaUefa0203('Porto', 95),
  },
  {
    id: 'celtic-fc',
    club: 'Celtic FC',
    context: 'Wisła Kraków w Pucharze UEFA 2002/03 — finał',
    players: makeTemplateSquad_wislaUefa0203('Celtic', 87),
  }
);
