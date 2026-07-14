// ============================================================
// RDZEN.JS — wspólne funkcje pomocnicze i globalny stan gry.
// Ładowany najwcześniej (zaraz po danych) — wszystko inne z tego korzysta.
// ============================================================


// ── STATE ──────────────────────────────────────────────────

let state = {
  squad: {},
  slotIndex: 0,
  rerolls: 2,
  currentTeam: null,
  usedTeams: new Set(),
  bracket: [],
  roundIdx: 0,
  myOverall: 0,
  speed: 'extreme',
  commentaryStyle: 'waldemar',
  tournamentPhase: 'knockout',
  mundial: null,
  mundialVariant: 'champions',
  fogOfWar: false,        // MGŁA WOJNY — ustawiane w USTAWIENIACH DRAFTU
  fogOfWarApplied: false, // żeby nie losować ponownie przy każdym powrocie do ekranu wyniku
};

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  state.currentScreenId = id;
  if (id === 'screen-validator') runValidator();
  if (id === 'screen-title') state.pendingMundial26AfterDraft = false;
}

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function ovrClass(v) {
  if (v >= 88) return 'elite';
  if (v >= 80) return 'great';
  if (v >= 72) return 'good';
  return 'avg';
}

// WAŻNE: liczy DOKŁADNIE tak samo jak silnik w trakcie meczu (lineAverages
// w silnik.js) — średnia z trzech LINII (OBR/POM/ATK), nie płaska średnia
// z 11 zawodników. To rozmyślne: bramkarz jest liczony do linii OBR razem
// z obrońcami, więc formacja z mocnym bramkarzem/słabymi obrońcami inaczej
// wypada w jednym, a inaczej w drugim wzorze — i właśnie to dawało dwie
// różne liczby OVR (przed meczem / w trakcie meczu) na tej samej drużynie.
// Wywoływane dopiero w trakcie gry (nigdy przy starcie skryptu), więc brak
// problemu z tym, że lineAverages/LINE_OF żyją w silnik.js, wczytywanym PO
// tym pliku.
function calcTeamOverall(squad) {
  const players = Object.values(squad);
  if (!players.length) return 0;
  const lines = lineAverages(players); // {DEF, MID, FWD} — z silnik.js
  return Math.round((lines.DEF + lines.MID + lines.FWD) / 3);
}

window.onload = function() {
  const n = TEAMS_DATA.length;
  const p = TEAMS_DATA.reduce((a,t) => a + t.players.length, 0);
  document.getElementById('title-db-info').textContent = `Baza: ${n} drużyn · ${p} zawodników`;
};

function getStyle() {
  return COMMENTARY_STYLES[state.commentaryStyle] || COMMENTARY_STYLES.waldemar;
}

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

function fmt(tpl, vars) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] != null ? vars[k] : '');
}

function teamToBracketObj(t) {
  const st = t.players.filter(p => p.starting);
  const usePool = st.length >= 11 ? st : t.players;
  // Ten sam wzór co calcTeamOverall/lineAverages — patrz komentarz tam.
  const ovr = calcTeamOverall(usePool.map(p => ({ pos: p.position, overall: p.overall })));
  const roster = usePool.map(p => ({ name: p.name, pos: p.position, overall: p.overall, birthYear: p.birthYear, season: t.season }));
  const reserves = t.players.filter(p => !p.starting).sort((a, b) => b.overall - a.overall).slice(0, 5)
    .map(p => ({ name: p.name, pos: p.position, overall: p.overall, birthYear: p.birthYear, season: t.season }));
  return { label: `${t.club} ${t.season}`, club: t.club, overall: ovr, isPlayer: false, roster, reserves };
}

function roundNameForCount(matchCount) {
  if (matchCount >= 8) return '1/8 FINAŁU';
  if (matchCount === 4) return 'ĆWIERĆFINAŁ';
  if (matchCount === 2) return 'PÓŁFINAŁ';
  if (matchCount === 1) return 'FINAŁ';
  return 'MECZ';
}

// (simulateMatch — uproszczona symulacja meczów w tle — przeniesiona do silnik.js,
// jako część logiki decydującej o wyniku/przebiegu meczu)


function formatScoreText(myGoals, oppGoals) {
  return state.isAwayMatch ? `${oppGoals} : ${myGoals}` : `${myGoals} : ${oppGoals}`;
}
