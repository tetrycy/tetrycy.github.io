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
  settings: {
    // Zachowane dla zgodności ze starszymi zapisami. Od tej wersji wszystkie
    // mecze bez wyjątku rozgrywa pełny silnik; wartość nie jest przełączalna.
    otherMatchesEngine: 'full',
  },
};

// Pełne timeline'y są największą częścią zapisu. Wyniki i strzelcy zostają
// bezterminowo, natomiast możliwość obejrzenia całego przebiegu zachowujemy
// tylko dla ostatnich spotkań AI-vs-AI.
const COMPUTER_MATCH_REPLAY_LIMIT = 12;

function markComputerMatchReplay(target, timeline) {
  if (!target || !Array.isArray(timeline)) return target;
  state.computerReplaySeq = (state.computerReplaySeq || 0) + 1;
  target._computerReplaySeq = state.computerReplaySeq;
  target.timeline = timeline;
  delete target.replayExpired;
  return target;
}

function pruneComputerMatchReplays() {
  const found = [];
  const seen = new WeakSet();
  function visit(value) {
    if (!value || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value);
    if (value._computerReplaySeq && Array.isArray(value.timeline)) found.push(value);
    Object.keys(value).forEach(key => {
      if (key !== 'timeline' && key !== 'liveGen') visit(value[key]);
    });
  }
  visit(state);
  found.sort((a, b) => b._computerReplaySeq - a._computerReplaySeq);
  found.slice(COMPUTER_MATCH_REPLAY_LIMIT).forEach(entry => {
    entry.timeline = null;
    entry.replayExpired = true;
  });
}

// Starsze zapisy nie miały znacznika _computerReplaySeq. Przy wczytaniu
// rozpoznajemy rekordy z obiema stronami meczu i oznaczamy tylko te, w
// których nie występowała drużyna gracza, po czym stosujemy ten sam limit.
function migrateAndPruneComputerMatchReplays() {
  const playerLabels = new Set();
  const seenForLabels = new WeakSet();
  function collectPlayerLabels(value) {
    if (!value || typeof value !== 'object' || seenForLabels.has(value)) return;
    seenForLabels.add(value);
    if (value.isPlayer && value.label) playerLabels.add(value.label);
    Object.keys(value).forEach(key => {
      if (key !== 'timeline' && key !== 'liveGen') collectPlayerLabels(value[key]);
    });
  }
  collectPlayerLabels(state);

  const candidates = [];
  const seen = new WeakSet();
  function scan(value) {
    if (!value || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value);
    const sideA = value.home || value.teamA;
    const sideB = value.away || value.teamB;
    if (Array.isArray(value.timeline) && !value._computerReplaySeq && sideA && sideB) {
      const sideIsPlayer = side => !!(side && typeof side === 'object' && side.isPlayer)
        || (typeof side === 'string' && playerLabels.has(side));
      if (!value.isPlayerMatch && !sideIsPlayer(sideA) && !sideIsPlayer(sideB)) candidates.push(value);
    }
    Object.keys(value).forEach(key => {
      if (key !== 'timeline' && key !== 'liveGen') scan(value[key]);
    });
  }
  scan(state);
  candidates.forEach(entry => markComputerMatchReplay(entry, entry.timeline));
  pruneComputerMatchReplays();
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  state.currentScreenId = id;
  if (id === 'screen-validator') runValidator();
}

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const MAX_OVR = 120;

function ovrClass(v) {
  if (v >= 110) return 'legend';
  if (v >= 100) return 'superstar';
  if (v >= 90) return 'elite';
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
  const coach = Array.isArray(t.coaches) && t.coaches.length ? t.coaches[t.coaches.length - 1] : null;
  return { label: `${t.club} ${t.season}`, club: t.club, overall: ovr, isPlayer: false, roster, reserves, coach };
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
