// ============================================================
// RYWALE WIDZEWA ŁÓDŹ W LIDZE MISTRZÓW 1996/97 — szablony do wypełnienia.
// Wszystkie nazwiska i overalle to placeholdery — podmień na prawdziwe dane.
// ============================================================

function makeTemplateSquad_widzewCL9697(prefix, baseOverall) {
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
    id: 'brondby',
    club: 'Brøndby IF',
    context: 'Widzew Łódź w LM 1996/97 — runda kwalifikacyjna',
    players: makeTemplateSquad_widzewCL9697('Brøndby', 80),
  },
  {
    id: 'borussia-dortmund',
    club: 'Borussia Dortmund',
    context: 'Widzew Łódź w LM 1996/97 — faza grupowa / finał (ścieżka zwycięzcy grupy)',
    players: makeTemplateSquad_widzewCL9697('Dortmund', 96),
  },
  {
    id: 'atletico-madryt',
    club: 'Atlético Madryt',
    context: 'Widzew Łódź w LM 1996/97 — faza grupowa',
    players: makeTemplateSquad_widzewCL9697('Atlético', 92),
  },
  {
    id: 'steaua-bukareszt',
    club: 'Steaua Bukareszt',
    context: 'Widzew Łódź w LM 1996/97 — faza grupowa',
    players: makeTemplateSquad_widzewCL9697('Steaua', 78),
  },
  {
    id: 'auxerre',
    club: 'AJ Auxerre',
    context: 'Widzew Łódź w LM 1996/97 — ćwierćfinał (ścieżka 2. miejsca w grupie)',
    players: makeTemplateSquad_widzewCL9697('Auxerre', 85),
  },
  {
    id: 'manchester-united',
    club: 'Manchester United',
    context: 'Widzew Łódź w LM 1996/97 — półfinał (ścieżka 2. miejsca w grupie)',
    players: makeTemplateSquad_widzewCL9697('Man Utd', 94),
  },
  {
    id: 'juventus',
    club: 'Juventus',
    context: 'Widzew Łódź w LM 1996/97 — finał (ścieżka 2. miejsca) / półfinał (ścieżka zwycięzcy grupy)',
    players: makeTemplateSquad_widzewCL9697('Juventus', 95),
  },
  {
    id: 'ajax',
    club: 'Ajax Amsterdam',
    context: 'Widzew Łódź w LM 1996/97 — ćwierćfinał (ścieżka zwycięzcy grupy)',
    players: makeTemplateSquad_widzewCL9697('Ajax', 92),
  }
);
