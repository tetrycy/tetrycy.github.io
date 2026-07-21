// ============================================================
// SILNIK MECZOWY (V2) — czysta logika, bez UI.
// Wymaga wczytania RDZEN.JS (rand, clamp, fmt) i KOMENTARZE.JS
// (COMMENTARY_STYLES, MEDIUM_SUBTYPES, HIGH_SUBTYPES) przed tym plikiem.
// Eksponuje: simulateMatchV2Live (jedyny silnik, używany zarówno dla
// meczów gracza, jak i wszystkich spotkań AI-vs-AI),
// simulatePenaltyShootout,
// lineAverages, generalOverall, LINE_OF, tlClass, tlText.
// ============================================================

function weightedPick(roster, weights) {
  if (!roster || !roster.length) return null;
  const pool = [];
  roster.forEach(p => {
    const w = weights[p.pos] != null ? weights[p.pos] : 1;
    for (let i = 0; i < w; i++) pool.push(p);
  });
  return pool.length ? rand(pool) : rand(roster);
}

const SCORER_WEIGHTS = { GK: 0, DEF: 1, MID: 3, FWD: 4 };
const FOUL_WEIGHTS   = { GK: 1, DEF: 3, MID: 3, FWD: 1 };

function pickScorer(roster) { return weightedPick(roster, SCORER_WEIGHTS) || { name: 'Twój zawodnik' }; }

// ============================================================
// PEŁNY SILNIK dla meczów w tle — TEN SAM generator co mecz gracza
// (simulateMatchV2Live), tylko rozegrany od razu, w pętli, bez pokazywania
// na ekranie (nikt tego nie ogląda na żywo). Zwraca dodatkowo pełną
// oś czasu i listę strzelców — do wyświetlenia wyniku i późniejszego
// podejrzenia przebiegu. Wymaga PRAWDZIWYCH składów (roster) obu drużyn.
function simulateMatchFullEngine(teamA, teamB, needsWinner, venue) {
  const venueBonuses = computeVenueBonuses(venue || 'neutral');
  const initialTactics = {
    myHomeBonus: venueBonuses.myBonus,
    oppHomeBonus: venueBonuses.oppBonus,
    myCoachTraits: (typeof getTeamCoachTraits === 'function') ? getTeamCoachTraits(teamA) : [],
    oppCoachTraits: (typeof getTeamCoachTraits === 'function') ? getTeamCoachTraits(teamB) : [],
  };
  const gen = simulateMatchV2Live(teamA.roster, teamB.roster, teamB.label, initialTactics, needsWinner);
  let r = gen.next();
  while (!r.done) r = gen.next();
  const final = r.value;
  let result = final.result;
  let shootout = null;
  const aggOffsetMy = (needsWinner && typeof needsWinner === 'object') ? (needsWinner.myAggOffset || 0) : 0;
  const aggOffsetOpp = (needsWinner && typeof needsWinner === 'object') ? (needsWinner.oppAggOffset || 0) : 0;
  const aggregateStillTied = !!needsWinner && (final.gf + aggOffsetMy) === (final.ga + aggOffsetOpp);

  // Pełna dogrywka jest częścią generatora. Jeśli nie rozstrzygnęła meczu
  // albo dwumeczu, nie wolno przyznać awansu arbitralnie jednej ze stron:
  // pełny silnik rozgrywa również serię rzutów karnych.
  if (aggregateStillTied) {
    shootout = simulatePenaltyShootout(teamA.roster, teamB.roster, teamB.label);
    result = shootout.iWin ? 'W' : 'L';
    final.timeline.push(...shootout.timeline.map(ev => ev.type === 'marker'
      ? ev
      : Object.assign({}, ev, { type: 'penalty', minute: 'K' })));
  }

  const scorersMe = [], scorersOpp = [];
  final.timeline.forEach(ev => {
    if (ev.type !== 'goal' || !ev.scorer) return;
    (ev.team === 'me' ? scorersMe : scorersOpp).push({ player: ev.scorer, minute: ev.minute });
  });
  return {
    result, gf: final.gf, ga: final.ga, timeline: final.timeline,
    scorersMe, scorersOpp, wasExtraTime: final.wasExtraTime,
    wasPenalties: !!shootout,
    penaltyScore: shootout ? { my: shootout.myScore, opp: shootout.oppScore } : null,
  };
}

// ── WSPÓLNY DYSPOZYTOR dla meczów w tle ──────────────────────────
// Każdy mecz AI-vs-AI bez wyjątku przechodzi przez pełny generator.
// teamA/teamB muszą zawierać prawdziwe składy w polu .roster.
// needsWinner: jak w simulateMatchV2Live — false/undefined (remis OK),
// true (pojedynczy mecz pucharowy) albo {myAggOffset, oppAggOffset}.
function resolveOtherMatch(teamA, teamB, needsWinner, venue) {
  if (!teamA || !teamB || !Array.isArray(teamA.roster) || !teamA.roster.length
    || !Array.isArray(teamB.roster) || !teamB.roster.length) {
    throw new Error('Pełny silnik wymaga kompletnych składów obu drużyn.');
  }
  return simulateMatchFullEngine(teamA, teamB, needsWinner, venue || 'neutral');
}

// Krótki, czytelny tekst strzelców do dopisania przy wyniku — "Kowalski 34',
// Nowak 67'" — albo pusty string, jeśli nie padła bramka.
function formatScorersText(scorers) {
  if (!scorers || !scorers.length) return '';
  return scorers.map(s => `${s.player} ${s.minute}'`).join(', ');
}

// Wyklucza zawodników czerwoną kartką z dalszego losowania (strzelców, faulowanych) —
// nie ma ich już na boisku. Zabezpieczenie: jeśli filtr wyczyściłby całą pulę
// (skrajnie mało prawdopodobne), wraca do pełnego rosteru zamiast wywalać się na pustej tablicy.
function activeRoster(roster, teamKey, sentOff) {
  const filtered = roster.filter(p => !sentOff.has(teamKey + ':' + p.name));
  return filtered.length ? filtered : roster;
}
function pickFouler(roster) { return weightedPick(roster, FOUL_WEIGHTS) || { name: 'zawodnik' }; }
function pickGK(roster) { return (roster && roster.find(p => p.pos === 'GK')) || { name: 'Bramkarz' }; }

function tlClass(ev) {
  if (ev.type === 'goal') return ev.team === 'me' ? 'tl-goal-me' : 'tl-goal-opp';
  if (ev.type === 'red') return 'tl-red';
  if (ev.type === 'yellow') return 'tl-yellow';
  if (ev.type === 'penalty') return 'tl-penalty';
  if (ev.type === 'injury') return 'tl-injury';
  if (ev.type === 'marker') return 'tl-marker';
  return 'tl-flavor';
}

function tlText(ev) {
  if (ev.type === 'marker') return ev.text;
  if (ev.text.startsWith('↳')) return ev.text;
  return `${ev.minute}' ${ev.text}`;
}


function simulatePenaltyShootout(myRoster, oppRoster, oppLabel) {
  const myOrder = myRoster.filter(p => p.pos !== 'GK').sort((a, b) => b.overall - a.overall);
  const oppOrder = oppRoster.filter(p => p.pos !== 'GK').sort((a, b) => b.overall - a.overall);
  let myIdx = 0, oppIdx = 0;
  const nextMyKicker = () => myOrder.length ? myOrder[myIdx++ % myOrder.length] : { name: 'Zawodnik' };
  const nextOppKicker = () => oppOrder.length ? oppOrder[oppIdx++ % oppOrder.length] : { name: 'Zawodnik' };

  const timeline = [{ type: 'marker', text: '🥅 SERIA RZUTÓW KARNYCH' }];
  let myScore = 0, oppScore = 0;

  function kick(team) {
    // Skuteczność karnych w serii w prawdziwym futbolu to ok. 75-80% —
    // płaskie 50/50 (jak było wcześniej) było wyraźnie zaniżone.
    const scored = Math.random() < 0.76;
    const kicker = team === 'me' ? nextMyKicker() : nextOppKicker();
    if (scored) { if (team === 'me') myScore++; else oppScore++; }
    const who = team === 'me' ? kicker.name : `${kicker.name} (${oppLabel})`;
    const text = (scored ? `✅ ${who} trafia!` : `❌ ${who} nie trafia...`) + `  [${myScore}:${oppScore}]`;
    timeline.push({ type: scored ? 'goal' : 'flavor', team, text });
  }

  for (let round = 1; round <= 5; round++) { kick('me'); kick('opp'); }
  let extra = 0;
  while (myScore === oppScore && extra < 10) { extra++; kick('me'); kick('opp'); }

  const iWin = myScore === oppScore ? Math.random() < 0.5 : myScore > oppScore;
  return { iWin, timeline, myScore, oppScore };
}

// ============================================================
// SILNIK V2 — "kulka i rurki". Cztery liczby zamiast jednej:
// OBRONA (BR+OB), POMOC, ATAK — każda linia liczona osobno,
// modyfikatory (czerwona/kontuzja/forma) trwałe do końca meczu i celowane w KONKRETNĄ linię.
// ============================================================

const LINE_OF = { GK: 'DEF', DEF: 'DEF', MID: 'MID', FWD: 'FWD' };

// MIEJSCE ROZGRYWANIA MECZU — losowy bonus +2 do +5 do ogólnego overallu,
// rozłożony proporcjonalnie (mniej więcej po równo, z losowym rozdaniem
// reszty) na trzy linie. Używane tylko dla drużyny grającej U SIEBIE —
// na wyjeździe i na neutralnym terenie zwrot to same zera.
function computeHomeAdvantage() {
  const total = 2 + Math.floor(Math.random() * 4); // 2..5
  const lines = ['DEF', 'MID', 'FWD'];
  const base = Math.floor(total / 3);
  const remainder = total - base * 3;
  const bonus = { DEF: base, MID: base, FWD: base };
  const shuffled = lines.slice().sort(() => Math.random() - 0.5);
  for (let i = 0; i < remainder; i++) bonus[shuffled[i]] += 1;
  return bonus;
}

// venue: 'home' | 'away' | 'neutral' — z perspektywy GRACZA.
function computeVenueBonuses(venue) {
  const zero = { DEF: 0, MID: 0, FWD: 0 };
  if (venue === 'home') return { myBonus: computeHomeAdvantage(), oppBonus: zero };
  if (venue === 'away') return { myBonus: zero, oppBonus: computeHomeAdvantage() };
  return { myBonus: zero, oppBonus: zero }; // neutralny teren
}

// Wartość awaryjna wyłącznie dla pustej linii. Nie może wpływać na wynik
// dwóch kompletnych drużyn — siłę meczu wyznaczają różnice między liniami.
const LINE_BASELINE = 75;
function logisticProb(diff, k) { return 1 / (1 + Math.pow(10, -diff / k)); }
function pickInjured(roster) { return roster[Math.floor(Math.random() * roster.length)]; }
function injuryImpact(player, roster) {
  const lineMates = roster.filter(p => LINE_OF[p.pos] === LINE_OF[player.pos]);
  const overalls = (lineMates.length ? lineMates : roster).map(p => p.overall);
  const minO = Math.min(...overalls), maxO = Math.max(...overalls);
  const t = (player.overall - minO) / ((maxO - minO) || 1);
  return Math.round(2 + 4 * t);
}

function lineAverages(roster) {
  const buckets = { DEF: [], MID: [], FWD: [] };
  roster.forEach(p => buckets[LINE_OF[p.pos]].push(p.overall));
  const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : LINE_BASELINE;
  return { DEF: avg(buckets.DEF), MID: avg(buckets.MID), FWD: avg(buckets.FWD) };
}

// ============================================================
// ZMĘCZENIE — wiek zawodnika wpływa na to, jak szybko traci overall
// w trakcie meczu. Cztery pasma wiekowe, każde z własnym tempem
// narastania zmęczenia I własną "krzywą kary" (ile punktów overallu
// to kosztuje przy pełnym zmęczeniu). Do tego szum per-zawodnik,
// żeby nie wszyscy w tym samym wieku męczyli się identycznie.
// ============================================================

const FATIGUE_DEFAULT_AGE = 27; // gdy wiek nieznany (np. własne drużyny z Wyzwań bez birthYear)

function getPlayerAge(player) {
  if (player.birthYear == null || !player.season) return FATIGUE_DEFAULT_AGE;
  const startYear = parseInt(String(player.season).split('/')[0], 10);
  if (isNaN(startYear)) return FATIGUE_DEFAULT_AGE;
  const age = startYear - player.birthYear;
  return (age >= 15 && age <= 45) ? age : FATIGUE_DEFAULT_AGE;
}

// accumRate: jak szybko (względem 100 zdarzeń meczu) rośnie zmęczenie.
// penaltyMax: ile punktów overallu kosztuje PEŁNE (100%) zmęczenie.
function getFatigueBand(age) {
  if (age <= 21) return { accumRate: 0.90, penaltyMax: 1 };  // 18-21: prawie odporni
  if (age <= 29) return { accumRate: 1.00, penaltyMax: 4 };  // 22-29: standardowo
  if (age <= 33) return { accumRate: 1.20, penaltyMax: 7 };  // 30-33: mocniej
  return { accumRate: 1.40, penaltyMax: 10 };                 // 34+: najszybciej
}

// Dolącza każdemu zawodnikowi jego indywidualne parametry zmęczenia (raz na
// mecz) — z szumem ±15%, żeby dwaj 30-latkowie nie męczyli się identycznie.
function prepareFatigueRoster(roster) {
  return roster.map(p => {
    const band = getFatigueBand(getPlayerAge(p));
    const noise = 0.85 + Math.random() * 0.30;
    return Object.assign({}, p, {
      _fatigueAccumRate: band.accumRate * noise,
      _fatiguePenaltyMax: band.penaltyMax,
    });
  });
}

// Średnia kara overallu dla danej linii (DEF/MID/FWD) przy danym indeksie
// zdarzenia (i ~ 1..100, odpowiada progresowi meczu od 0 do ~90 minut).
function fatiguePenaltyForLine(fatigueRoster, line, i) {
  const linePlayers = fatigueRoster.filter(p => LINE_OF[p.pos] === line);
  if (!linePlayers.length) return 0;
  const total = linePlayers.reduce((sum, p) => {
    const pct = Math.min(100, i * p._fatigueAccumRate);
    return sum + (pct / 100) * p._fatiguePenaltyMax;
  }, 0);
  return total / linePlayers.length;
}

// Bieżące zmęczenie JEDNEGO zawodnika w procentach (surowa wartość 0-100,
// używana WEWNĘTRZNIE przez silnik do liczenia kary overallu).
function fatiguePctForPlayer(preparedPlayer, i) {
  return Math.round(Math.min(100, i * preparedPlayer._fatigueAccumRate));
}

// To, co pokazujemy GRACZOWI: "% sił" — zaczyna się od 100 (pełne siły) i spada,
// ale NIGDY nie schodzi poniżej (100 - maksymalna kara wiekowa). Młody zawodnik
// prawie nie zjeżdża (max -1), starszy zjeżdża wyraźniej (max -10).
function fatigueStrengthPctForPlayer(preparedPlayer, i) {
  const fatiguePct = Math.min(100, i * preparedPlayer._fatigueAccumRate);
  const penaltyPoints = (fatiguePct / 100) * preparedPlayer._fatiguePenaltyMax;
  return Math.round(100 - penaltyPoints);
}

function minuteLabelV2(i) {
  if (i <= 45) return `${i}`;
  if (i <= 50) return `45+${i - 45}`;
  if (i <= 95) return `${i - 5}`;
  if (i <= 100) return `90+${i - 95}`;
  // Dogrywka (tylko gdy mecz faktycznie ją rozgrywa — patrz needsWinner
  // w simulateMatchV2Live) — 2×15 minut, każda połówka z własnym doliczonym
  // czasem, kontynuacja TEJ SAMEJ skali "i" co czas regulaminowy.
  if (i <= 115) return `${i - 10}`;
  if (i <= 118) return `105+${i - 115}`;
  if (i <= 133) return `${i - 13}`;
  return `120+${i - 133}`;
}

// Teksty pomocnicze dla nowych podtypów flavor/akcji (na start — do rozbudowy)


// (Usunięto martwą funkcję simulateMatchV2 — nieużywaną nigdzie w grze.
// Wszystkie mecze gracza rozgrywa simulateMatchV2Live poniżej; mecze
// AI-vs-AI w tle rozgrywa uproszczony simulateMatch wyżej.)

function* simulateMatchV2Live(myRoster, oppRoster, oppLabel, initialTactics, needsWinner) {
  let tactics = initialTactics || {};
  // needsWinner: false/undefined = mecz może się skończyć remisem (liga/grupa);
  // true = zwykły pojedynczy mecz pucharowy (agregat = wynik tego meczu);
  // { myAggOffset, oppAggOffset } = drugi mecz dwumeczu — liczy się, czy
  // REMISUJE SIĘ AGREGAT (offset = wynik pierwszego meczu), nie sam ten mecz.
  const etCheck = needsWinner ? (typeof needsWinner === 'object' ? needsWinner : {}) : null;
  const myAggOffset = etCheck ? (etCheck.myAggOffset || 0) : 0;
  const oppAggOffset = etCheck ? (etCheck.oppAggOffset || 0) : 0;
  const ST = getStyle();
  const myBase = lineAverages(myRoster);
  const oppBase = lineAverages(oppRoster);
  // Mecz gracza bierze trenera z state.coach. Mecz AI-vs-AI przekazuje
  // jawnie cechy obu trenerów w initialTactics, żeby nie odziedziczyć
  // przypadkiem trenera gracza i żeby obie strony były traktowane symetrycznie.
  const myCoachTraits = Array.isArray(tactics.myCoachTraits)
    ? tactics.myCoachTraits
    : ((typeof getMyCoachTraits === 'function') ? getMyCoachTraits() : []);
  const oppCoachTraits = Array.isArray(tactics.oppCoachTraits) ? tactics.oppCoachTraits : [];
  if (myCoachTraits.length && typeof applyCoachLineBoosts === 'function') applyCoachLineBoosts(myBase, myCoachTraits);
  if (oppCoachTraits.length && typeof applyCoachLineBoosts === 'function') applyCoachLineBoosts(oppBase, oppCoachTraits);
  const myPenaltyAwardBonus = (myCoachTraits.length && typeof getCoachPenaltyAwardBonus === 'function') ? getCoachPenaltyAwardBonus(myCoachTraits) : 0;
  const oppPenaltyAwardBonus = (oppCoachTraits.length && typeof getCoachPenaltyAwardBonus === 'function') ? getCoachPenaltyAwardBonus(oppCoachTraits) : 0;
  const myOppRedBonus = (myCoachTraits.length && typeof getCoachOppRedBonus === 'function') ? getCoachOppRedBonus(myCoachTraits) : 0;
  const oppOppRedBonus = (oppCoachTraits.length && typeof getCoachOppRedBonus === 'function') ? getCoachOppRedBonus(oppCoachTraits) : 0;
  const myAggressionTrait = (myCoachTraits.length && typeof getCoachAggressionBonus === 'function') ? getCoachAggressionBonus(myCoachTraits) : { pGoalMultOpp: 1, extraRedChance: 0 };
  const oppAggressionTrait = (oppCoachTraits.length && typeof getCoachAggressionBonus === 'function') ? getCoachAggressionBonus(oppCoachTraits) : { pGoalMultOpp: 1, extraRedChance: 0 };
  // Bonus za miejsce rozgrywania meczu (patrz computeVenueBonuses) — "ziarnuje"
  // modyfikatory linii od pierwszej minuty, dokładnie tak jak inne zdarzenia meczowe.
  const myHomeBonus = tactics.myHomeBonus || { DEF: 0, MID: 0, FWD: 0 };
  const oppHomeBonus = tactics.oppHomeBonus || { DEF: 0, MID: 0, FWD: 0 };
  const myMods = { DEF: myHomeBonus.DEF, MID: myHomeBonus.MID, FWD: myHomeBonus.FWD };
  const oppMods = { DEF: oppHomeBonus.DEF, MID: oppHomeBonus.MID, FWD: oppHomeBonus.FWD };
  const myYellow = {}, oppYellow = {};
  const sentOff = new Set(); // 'me:Imię' / 'opp:Imię' — pomijani przy kolejnych losowaniach faulanta
  // Jednorazowe (max raz na mecz, PER DRUŻYNA) zmieniacze overallu — flavor bez
  // konsekwencji fabularnych, ale z realnym wpływem na siłę linii do końca meczu.
  const flavorUsed = {
    injuryMe: false, injuryOpp: false,       // kontuzja — impact zależny od zawodnika (injuryImpact)
    bruiseMe: false, bruiseOpp: false,       // stłuczenie — Overall -1
    crampMe: false, crampOpp: false,         // skurcz łydki — Overall -1
    formaMe: false, formaOpp: false,         // dobra forma dnia — Overall +1
    inspiredMe: false, inspiredOpp: false,   // "gra jak uskrzydlony" — Overall +2
  };
  let chaosUsed = false;              // MUSIMY NA CHAOS — jednorazowo na mecz
  let chaosGuaranteedPending = false; // czy jeszcze nie "wystrzeliła" gwarantowana groźna akcja
  let chaosWindowRemaining = 0;       // ile zdarzeń zostało w oknie 5-minutowym (ekspozycja rywala)
  let opierdolUsed = false;           // OPIERDOL — jednorazowo na mecz, najpóźniej do 65. minuty
  let opierdolBoostRemaining = 0;     // ile zdarzeń zostało w 10-minutowym oknie podbicia
  const OPIERDOL_LATEST_I = 70;       // 65. minuta = i=70 (65+5, bo druga połowa przesunięta o doliczony czas 1. połowy)
  const OPIERDOL_COST_START_I = 86;   // 81. minuta = i=86 — start okna kosztu (ostatnie 10 min + 5 doliczonych = i 86-100)
  let awanturaUsed = false;           // AWANTURA Z TECHNICZNYM — jednorazowo, urywa 2-4 minuty meczu

  // Losuje jednego żywego zawodnika danej drużyny i nakłada na jego linię
  // podaną deltę (dodatnią lub ujemną), pchając na timeline zdarzenie 'flavor'
  // ze stylizowanym tekstem zawierającym "(Overall ±N)" — to właśnie ten
  // fragment tekstu czyta UI (MECZ-UI.js), żeby na żywo zaktualizować pasek siły linii.
  function applyFlavorOverallChange(teamKey, delta, templates, minuteLabel, extraVars) {
    const roster = teamKey === 'me' ? myRoster : oppRoster;
    const mods = teamKey === 'me' ? myMods : oppMods;
    const active = activeRoster(roster, teamKey, sentOff);
    if (!active.length) return null;
    const p = active[Math.floor(Math.random() * active.length)];
    mods[LINE_OF[p.pos]] += delta;
    timeline.push({
      minute: minuteLabel, type: 'flavor', team: teamKey, line: LINE_OF[p.pos],
      text: fmt(rand(templates), Object.assign({ p: p.name, team: oppLabel, impact: Math.abs(delta) }, extraVars || {})),
    });
    return p;
  }

  const myFatigueRoster = prepareFatigueRoster(myRoster);
  const oppFatigueRoster = prepareFatigueRoster(oppRoster);
  let fatigueIntensityMult = 1; // suwak INTENSYWNOŚĆ — aktualizowany co zdarzenie, patrz pętla niżej
  const eff = (base, mods, line, i, fatigueRoster) => {
    const penalty = (i != null && fatigueRoster) ? fatiguePenaltyForLine(fatigueRoster, line, i * fatigueIntensityMult) : 0;
    return base[line] + mods[line] - penalty;
  };
  const pickFoulerLine = (roster, teamKey) => {
    const pool = roster.filter(p => !sentOff.has(teamKey + ':' + p.name));
    return weightedPick(pool.length ? pool : roster, FOUL_WEIGHTS);
  };

  let myGoals = 0, oppGoals = 0;
  const timeline = [];

  const K_MID = 19;
  const BASE_HIGH_SHARE = 0.30;
  const MED_GOAL_BASE = 0.013, HIGH_GOAL_BASE = 0.055;

  function resolvePenalty(meAwarded) {
    const foulRoster = meAwarded ? myRoster : oppRoster;
    const mods = meAwarded ? myMods : oppMods;
    const bestOutfield = (r) => { const o = r.filter(p => p.pos !== 'GK'); const pool = o.length ? o : r; return pool.reduce((b, p) => (!b || p.overall > b.overall) ? p : b, null); };
    const designated = bestOutfield(activeRoster(foulRoster, meAwarded ? 'me' : 'opp', sentOff));
    const fouled = pickScorer(activeRoster(foulRoster, meAwarded ? 'me' : 'opp', sentOff));
    const taker = (fouled.name === designated.name || Math.random() < 0.35) ? fouled : designated;
    return { meAwarded, taker, fouled };
  }

  let matchEnd = 100; // Parkowanie autobusu skraca realnie pozostałą pulę zdarzeń
  let extraTimeExtended = false; // czy pętla została już przedłużona o dogrywkę (raz na mecz)
  for (let i = 1; i <= matchEnd; i++) {
    // Taktyka czytana NA NOWO w każdej iteracji — zmiana w trakcie meczu działa natychmiast.
    const podania = parseInt(tactics.podania, 10) || 0; // -5 (posiadanie) .. +5 (szybkie akcje)
    const agresja = parseInt(tactics.agresja, 10) || 0;  // -5 (lekki) .. +5 (agresywny)
    const busParking = !!tactics.busParking;
    const stoperAtak = !!tactics.stoperAtak;             // Wyślij stopera do ataku
    const mentality = parseInt(tactics.mentality, 10) || 0; // -5 (skrajnie defensywna) .. +5 (skrajnie ofensywna), przesuwa ATK<->OBR
    const intensity = parseInt(tactics.intensity, 10) || 0; // -5 (spokojnie) .. +5 (na pełnych obrotach)
    fatigueIntensityMult = clamp(1 + 0.06 * intensity, 1, 1.3); // czytane przez eff() przy każdym wywołaniu fatiguePenaltyForLine — punkt zero (intensity=0) to stan sprzed tej funkcji, bez opcji zejścia niżej

    // OPIERDOL — jednorazowy trigger: 10 zdarzeń podbicia, ale tylko jeśli użyty do 65. minuty
    // (i <= OPIERDOL_LATEST_I). Po tym terminie sygnał jest ignorowany.
    if (tactics.triggerOpierdol && !opierdolUsed && i <= OPIERDOL_LATEST_I) {
      opierdolUsed = true;
      opierdolBoostRemaining = 10;
    }

    // AWANTURA Z TECHNICZNYM PRZY LINII — jednorazowo: urywa 2-4 minuty meczu (losowo).
    // Brak innych efektów mechanicznych — całkowita blokada dalszych zmian taktycznych
    // pilnowana jest po stronie UI (przyciski/selecty zablokowane po użyciu).
    if (tactics.triggerAwantura && !awanturaUsed) {
      awanturaUsed = true;
      const minutesCut = 2 + Math.floor(Math.random() * 3); // 2, 3 albo 4
      matchEnd = Math.max(i, matchEnd - minutesCut);
    }

    // MUSIMY NA CHAOS — jednorazowy trigger: trwała kara natychmiast (nie da się „przeczekać”),
    // plus gwarancja groźnej akcji w oknie najbliższych 5 zdarzeń.
    if (tactics.triggerChaos && !chaosUsed) {
      chaosUsed = true;
      chaosGuaranteedPending = true;
      chaosWindowRemaining = 5;
      myMods.DEF -= 8;
    }

    const startIdx = timeline.length;
    let zoneThisEvent = 'CENTER'; // domyślnie: flavor podświetla środek boiska
    const min = minuteLabelV2(i);
    // Mentalność defensywna: więcej przestojów w grze, mniej realnych akcji ogółem.
    // Intensywność: dodatnia zmniejsza udział "pustego" flavouru (więcej akcji kosztem
    // przestojów), ujemna — odwrotnie, spokojniejszy, bardziej przestojowy mecz.
    const flavorBaseline = mentality < 0 ? 0.30 : 0.24;
    const flavorShare = clamp(flavorBaseline - 0.015 * Math.max(0, intensity), 0.12, flavorBaseline);
    // W oknie CHAOSU wymuszamy zdarzenie AKCJI (żeby gwarancja miała szansę się zrealizować,
    // zamiast utknąć w serii samych zdarzeń flavor).
    const forceAction = chaosGuaranteedPending && chaosWindowRemaining > 0;
    const r1 = Math.random();

    if (!forceAction && r1 < flavorShare) {
      // ── FLAVOR (24% wszystkich zdarzeń) ──
      // Wagi przekalibrowane pod gęstość 100 zdarzeń/mecz — kontuzje/karne/czerwone
      // muszą być rzadkie w skali PROCENTA zdarzenia, bo tych zdarzeń jest teraz dużo więcej.
      const r2 = Math.random() * 100;
      if (r2 < 8) {
        // Anegdota — losowy zawodnik z boiska (z obu drużyn), czysty flavor bez konsekwencji.
        const myActiveForAnecdote = activeRoster(myRoster, 'me', sentOff);
        const anecdotePool = myActiveForAnecdote.concat(activeRoster(oppRoster, 'opp', sentOff));
        const pIdx = Math.floor(Math.random() * anecdotePool.length);
        const p = anecdotePool[pIdx];
        const anecdoteTeam = pIdx < myActiveForAnecdote.length ? 'me' : 'opp';
        timeline.push({ minute: min, type: 'flavor', team: anecdoteTeam, text: fmt(rand(ST.flavorAnegdota), { p: p.name }) });
      } else if (r2 < 9 && !flavorUsed.injuryOpp) {
        flavorUsed.injuryOpp = true;
        const p = pickInjured(activeRoster(oppRoster, 'opp', sentOff));
        const impact = injuryImpact(p, oppRoster);
        oppMods[LINE_OF[p.pos]] -= impact;
        timeline.push({ minute: min, type: 'injury', team: 'opp', line: LINE_OF[p.pos], text: fmt(rand(ST.injuryOpp), { p: p.name, team: oppLabel, impact }) });
      } else if (r2 < 10 && !flavorUsed.injuryMe) {
        flavorUsed.injuryMe = true;
        const p = pickInjured(activeRoster(myRoster, 'me', sentOff));
        const impact = injuryImpact(p, myRoster);
        myMods[LINE_OF[p.pos]] -= impact;
        timeline.push({ minute: min, type: 'injury', team: 'me', line: LINE_OF[p.pos], player: p.name, text: fmt(rand(ST.injuryMe || ST.injuryOpp), { p: p.name, team: oppLabel, impact }) });
      } else if (r2 < 10.75 && !flavorUsed.formaMe) {
        flavorUsed.formaMe = true;
        applyFlavorOverallChange('me', 1, ST.formaMe, min);
      } else if (r2 < 11.5 && !flavorUsed.formaOpp) {
        flavorUsed.formaOpp = true;
        applyFlavorOverallChange('opp', 1, ST.formaOpp || ST.formaMe, min);
      } else if (r2 < 12 && !flavorUsed.bruiseMe) {
        flavorUsed.bruiseMe = true;
        applyFlavorOverallChange('me', -1, ST.bruiseMe, min);
      } else if (r2 < 12.5 && !flavorUsed.bruiseOpp) {
        flavorUsed.bruiseOpp = true;
        applyFlavorOverallChange('opp', -1, ST.bruiseOpp, min);
      } else if (r2 < 13 && !flavorUsed.crampMe) {
        flavorUsed.crampMe = true;
        applyFlavorOverallChange('me', -1, ST.crampMe, min);
      } else if (r2 < 13.5 && !flavorUsed.crampOpp) {
        flavorUsed.crampOpp = true;
        applyFlavorOverallChange('opp', -1, ST.crampOpp, min);
      } else if (r2 < 14 && !flavorUsed.inspiredMe) {
        flavorUsed.inspiredMe = true;
        applyFlavorOverallChange('me', 2, ST.inspiredMe, min);
      } else if (r2 < 14.5 && !flavorUsed.inspiredOpp) {
        flavorUsed.inspiredOpp = true;
        applyFlavorOverallChange('opp', 2, ST.inspiredOpp, min);
      } else if (r2 < 22.5) {
        const p = pickFoulerLine(myRoster, 'me');
        const c = (myYellow[p.name] || 0) + 1; myYellow[p.name] = c;
        // Odbiór (suwak agresja, ciągły) i/lub KREW NA BUTACH (bloodOnBoots,
        // zawsze aktywna cecha trenera) — dodatkowe, niezależne ryzyko, że ostry
        // wjazd od razu skończy się czerwoną.
        const forcedRed = (agresja > 0 && Math.random() < 0.20 * (agresja / 5))
          || (myAggressionTrait.extraRedChance > 0 && Math.random() < myAggressionTrait.extraRedChance)
          || (oppOppRedBonus > 0 && Math.random() < oppOppRedBonus);
        const avoidedRed = agresja < 0 && c >= 2 && Math.random() < 0.35 * (-agresja / 5);
        if ((c >= 2 || forcedRed) && !avoidedRed) {
          ['DEF','MID','FWD'].forEach(l => { myMods[l] -= 10; }); sentOff.add('me:' + p.name);
          timeline.push({ minute: min, type: 'red', team: 'me', line: LINE_OF[p.pos], allLines: true, player: p.name, text: fmt(rand(ST.secondYellowMe || ST.redMe), { p: p.name }) });
        } else {
          timeline.push({ minute: min, type: 'yellow', team: 'me', player: p.name, text: fmt(rand(ST.yellowMe), { p: p.name }) });
        }
      } else if (r2 < 30.5) {
        const p = pickFoulerLine(oppRoster, 'opp');
        const c = (oppYellow[p.name] || 0) + 1; oppYellow[p.name] = c;
        // PROWOKATOR (provocateur) — niezależna, dodatkowa szansa, że ten sam faul
        // od razu skończy się czerwoną (nie czekając na drugą żółtą).
        const provokedRed = myOppRedBonus > 0 && Math.random() < myOppRedBonus;
        const bloodRed = oppAggressionTrait.extraRedChance > 0 && Math.random() < oppAggressionTrait.extraRedChance;
        if (c >= 2 || provokedRed || bloodRed) {
          ['DEF','MID','FWD'].forEach(l => { oppMods[l] -= 10; }); sentOff.add('opp:' + p.name);
          const provokedTemplate = (provokedRed || bloodRed) && c < 2 ? ST.redOpp : (ST.secondYellowOpp || ST.redOpp);
          timeline.push({ minute: min, type: 'red', team: 'opp', line: LINE_OF[p.pos], allLines: true, player: p.name, text: fmt(rand(provokedTemplate), { p: p.name, team: oppLabel }) });
        } else {
          timeline.push({ minute: min, type: 'yellow', team: 'opp', player: p.name, text: fmt(rand(ST.yellowOpp), { p: p.name, team: oppLabel }) });
        }
      } else if (r2 < 31) {
        // PROWOKATOR (provocateur) — zmniejsza szansę, że to Twój zawodnik zawini
        // (czyli zwiększa szansę czerwonej dla rywala).
        const meAtFault = Math.random() < clamp(0.5 - myOppRedBonus + oppOppRedBonus, 0.05, 0.95);
        const roster = meAtFault ? myRoster : oppRoster;
        const teamKey = meAtFault ? 'me' : 'opp';
        const p = pickFoulerLine(roster, teamKey);
        ['DEF','MID','FWD'].forEach(l => { (meAtFault ? myMods : oppMods)[l] -= 10; });
        sentOff.add(teamKey + ':' + p.name);
        timeline.push({ minute: min, type: 'red', team: teamKey, line: LINE_OF[p.pos], allLines: true, player: p.name, text: fmt(rand(meAtFault ? ST.redMe : ST.redOpp), { p: p.name, team: oppLabel }) });
      } else if (r2 < 34) {
        // LUBIANY PRZEZ SĘDZIÓW (refereeFavorite) — przesuwa czysty 50/50 na Twoją korzyść.
        const meAwarded = Math.random() < clamp(0.5 + myPenaltyAwardBonus - oppPenaltyAwardBonus, 0.05, 0.95);
        const { taker, fouled } = resolvePenalty(meAwarded);
        timeline.push({ minute: min, type: 'penalty', text: fmt(ST.penaltyAward[0], { p: fouled.name }) });
        if (taker.name !== fouled.name) {
          timeline.push({ minute: min, type: 'penalty', text: '↳ ' + fmt(meAwarded ? rand(ST.penaltyTakerMe) : rand(ST.penaltyTakerOpp), { p: taker.name, team: oppLabel }) });
        }
        const outcomeRoll = Math.random();
        if (outcomeRoll < 0.76) {
          if (meAwarded) { myGoals++; timeline.push({ minute: min, type: 'goal', team: 'me', scorer: taker.name, penalty: true, text: '↳ ' + fmt(rand(ST.penaltyScoredMe), { p: taker.name }) }); }
          else { oppGoals++; timeline.push({ minute: min, type: 'goal', team: 'opp', scorer: taker.name, penalty: true, text: '↳ ' + fmt(rand(ST.penaltyScoredOpp), { p: taker.name, team: oppLabel }) }); }
        } else if (outcomeRoll < 0.88) {
          timeline.push({ minute: min, type: 'penalty', team: meAwarded ? 'me' : 'opp', player: taker.name, outcome: 'missed', text: '↳ ' + fmt(meAwarded ? rand(ST.penaltyMissedMe) : rand(ST.penaltyMissedOpp), { p: taker.name, team: oppLabel }) });
        } else {
          timeline.push({ minute: min, type: 'penalty', team: meAwarded ? 'me' : 'opp', player: taker.name, outcome: 'saved', text: '↳ ' + fmt(meAwarded ? rand(ST.penaltySavedMe) : rand(ST.penaltySavedOpp), { p: taker.name, team: oppLabel }) });
        }
      } else {
        timeline.push({ minute: min, type: 'flavor', text: rand(ST.flavor) });
      }
    } else {
      // ── AKCJA (76% wszystkich zdarzeń) ──
      let myTurn;
      let highShare, pGoal;
      if (busParking) {
        // Parkowanie autobusu: zero akcji ofensywnych z Twojej strony — piłka ZAWSZE u rywala,
        // a Ty, nie broniąc się zorganizowanie (tylko marnując czas), oddajesz mu premię.
        myTurn = false;
        const defendingDef = eff(myBase, myMods, 'DEF', i, myFatigueRoster);
        highShare = clamp(BASE_HIGH_SHARE + 0.10, 0.10, 0.60);
        const isHighThreatBP = Math.random() < highShare;
        const atkOvrBP = eff(oppBase, oppMods, 'FWD', i, oppFatigueRoster);
        const attackDiffBP = atkOvrBP - defendingDef;
        const baseGoalBP = isHighThreatBP ? HIGH_GOAL_BASE : MED_GOAL_BASE;
        pGoal = clamp((baseGoalBP + attackDiffBP * 0.0015) * 1.3, 0.005, 0.30);
        const subtypeBP = rand(isHighThreatBP ? HIGH_SUBTYPES : MEDIUM_SUBTYPES);
        zoneThisEvent = (isHighThreatBP || subtypeBP.label === 'rzut rożny') ? 'GOAL_ME' : 'BOX_ME';
        if (subtypeBP.label !== 'posiadanie' && subtypeBP.label !== 'akcja kombinacyjna') {
          const styledIntroBP = ST.subtypeIntro && ST.subtypeIntro[subtypeBP.label] && ST.subtypeIntro[subtypeBP.label].opp;
          const introTextBP = styledIntroBP && styledIntroBP.length
            ? fmt(rand(styledIntroBP), { team: oppLabel })
            : `${oppLabel}: ${subtypeBP.label}.`;
          timeline.push({ minute: min, type: 'flavor', team: 'opp', subtype: subtypeBP.label, subtypeCategory: subtypeBP.category, text: introTextBP });
        }
        if (Math.random() < pGoal) {
          const scorer = pickScorer(activeRoster(oppRoster, 'opp', sentOff));
          oppGoals++; timeline.push({ minute: min, type: 'goal', team: 'opp', scorer: scorer.name, text: fmt(rand(ST.goalAgainst), { p: scorer.name, team: oppLabel }) });
        } else {
          const shooter = pickScorer(activeRoster(oppRoster, 'opp', sentOff));
          if (Math.random() < 0.55) {
            const gk = pickGK(activeRoster(myRoster, 'me', sentOff));
            timeline.push({ minute: min, type: 'flavor', team: 'opp', text: fmt(rand(ST.gkSaveOpp), { gk: gk.name, p: shooter.name, team: oppLabel }) });
          } else {
            timeline.push({ minute: min, type: 'flavor', team: 'opp', text: fmt(rand(ST.missWideOpp), { p: shooter.name, team: oppLabel }) });
          }
        }
        // czas leci szybciej — jedno zdarzenie "zjada" dwie minuty z puli
        matchEnd = Math.max(i, matchEnd - 1);
      } else {
      const opierdolCostActive = opierdolUsed && i >= OPIERDOL_COST_START_I;
      const opierdolBoostActive = opierdolBoostRemaining > 0;
      let midDiff = eff(myBase, myMods, 'MID', i, myFatigueRoster) - eff(oppBase, oppMods, 'MID', i, oppFatigueRoster);
      if (podania < 0) midDiff += -podania;      // Posiadanie piłki: częściej masz piłkę (skala do 5 przy skrajnym ustawieniu)
      if (podania > 0) midDiff -= 1.6 * podania; // Szybkie akcje: rezygnujesz z posiadania na rzecz kierunkowej gry (skala do 8)
      if (chaosWindowRemaining > 0) midDiff += 12; // MUSIMY NA CHAOS: przez okno ekspozycji łatwiej rywalowi, ale gwarancja to zaraz odwraca
      if (opierdolBoostActive) midDiff += 8;   // OPIERDOL: podbicie w oknie 10 zdarzeń
      if (opierdolCostActive) midDiff -= 10;   // OPIERDOL: zmęczenie w końcówce — kara nieco mocniejsza niż nagroda
      let pMyBall = clamp(logisticProb(midDiff, K_MID), 0.05, 0.95);
      let myTurn = Math.random() < pMyBall;
      if (chaosGuaranteedPending) { myTurn = true; } // gwarancja: ta akcja jest Twoja

      const defendingDef = (myTurn
        ? eff(oppBase, oppMods, 'DEF', i, oppFatigueRoster)
        : eff(myBase, myMods, 'DEF', i, myFatigueRoster) - mentality // mentalność: dodatnia (ATK) osłabia Twoją obronę, gdy się bronisz
      ) - (!myTurn && stoperAtak ? 10 : 0);
      let highShare = BASE_HIGH_SHARE;
      if (podania < 0) { highShare += (myTurn ? -0.08 : 0.08) * (-podania / 5); } // Posiadanie: kosztem jakości Twojej, premia dla kontr rywala
      if (podania > 0 && myTurn) highShare += 0.08 * (podania / 5);              // Szybkie akcje: rzadziej masz piłkę, ale groźniej gdy już ją masz
      if (chaosWindowRemaining > 0 && !myTurn) highShare += 0.15;          // MUSIMY NA CHAOS: rywal groźniejszy w oknie ekspozycji
      if (myTurn) {
        if (opierdolBoostActive) highShare += 0.10;   // OPIERDOL: +10pp w oknie podbicia
        if (opierdolCostActive) highShare -= 0.13;    // OPIERDOL: -13pp w zmęczeniu — kara nieco mocniejsza
      }
      highShare = clamp(highShare, 0.05, 0.60);
      let isHighThreat = Math.random() < highShare;
      if (chaosGuaranteedPending) { isHighThreat = true; chaosGuaranteedPending = false; } // gwarancja zrealizowana

      const atkOvr = (myTurn ? eff(myBase, myMods, 'FWD', i, myFatigueRoster) + mentality : eff(oppBase, oppMods, 'FWD', i, oppFatigueRoster)) + (myTurn && stoperAtak ? 5 : 0);
      const attackDiff = atkOvr - defendingDef;
      const baseGoal = isHighThreat ? HIGH_GOAL_BASE : MED_GOAL_BASE;
      let pGoal = clamp(baseGoal + attackDiff * 0.0015, 0.005, 0.20);
      if (agresja > 0 && !myTurn) pGoal *= (1 - 0.30 * (agresja / 5)); // Agresywny odbiór: tniesz skuteczność rywala, gdy to jego akcja
      if (!myTurn && myAggressionTrait.pGoalMultOpp !== 1) pGoal *= myAggressionTrait.pGoalMultOpp; // KREW NA BUTACH: zawsze aktywne, sumuje się z Agresywnym odbiorem
      if (myTurn && oppAggressionTrait.pGoalMultOpp !== 1) pGoal *= oppAggressionTrait.pGoalMultOpp;
      if (agresja < 0 && !myTurn) pGoal *= (1 + 0.08 * (-agresja / 5)); // Lekki odbiór: odrobinę łatwiejsza gra rywala, w zamian za mniejsze ryzyko kartek
      if (chaosWindowRemaining > 0 && !myTurn) pGoal *= 1.25; // MUSIMY NA CHAOS: rywal skuteczniejszy w oknie ekspozycji
      if (myTurn && opierdolBoostActive) pGoal *= 1.15;  // OPIERDOL: +15% skuteczności w podbiciu
      if (myTurn && opierdolCostActive) pGoal *= 0.75;   // OPIERDOL: -25% skuteczności w zmęczeniu


      const subtype = rand(isHighThreat ? HIGH_SUBTYPES : MEDIUM_SUBTYPES);
      // TRAITS trenerskie — ekspert konkretnego typu akcji (subtypeBoost) albo
      // całej kategorii (categoryBoost) podbija skuteczność TYLKO Twoich akcji.
      if (myTurn && myCoachTraits.length && typeof applyCoachSubtypeBoost === 'function') {
        pGoal = clamp(applyCoachSubtypeBoost(pGoal, subtype, myCoachTraits), 0.005, 0.40);
      }
      if (!myTurn && oppCoachTraits.length && typeof applyCoachSubtypeBoost === 'function') {
        pGoal = clamp(applyCoachSubtypeBoost(pGoal, subtype, oppCoachTraits), 0.005, 0.40);
      }
      // TRAITS zawodników — np. specjalista strzałów z dystansu (patrz
      // PLAYER-TRAITS.js). Sprawdzane na żywej, aktywnej jedenastce (nie
      // całym składzie) — kontuzjowany/zmieniony zawodnik już nie liczy się.
      if (myTurn && subtype.label === 'strzał z daleka' && typeof teamHasPlayerTrait === 'function'
        && teamHasPlayerTrait(activeRoster(myRoster, 'me', sentOff), 'longShots')) {
        pGoal = clamp(pGoal * 1.35, 0.005, 0.40);
      }
      if (!myTurn && subtype.label === 'strzał z daleka' && typeof teamHasPlayerTrait === 'function'
        && teamHasPlayerTrait(activeRoster(oppRoster, 'opp', sentOff), 'longShots')) {
        pGoal = clamp(pGoal * 1.35, 0.005, 0.40);
      }
      zoneThisEvent = (isHighThreat || subtype.label === 'rzut rożny') ? (myTurn ? 'GOAL_OPP' : 'GOAL_ME') : (myTurn ? 'BOX_OPP' : 'BOX_ME');
      if (subtype.label !== 'posiadanie' && subtype.label !== 'akcja kombinacyjna') {
        const sideKey = myTurn ? 'me' : 'opp';
        const styledIntro = ST.subtypeIntro && ST.subtypeIntro[subtype.label] && ST.subtypeIntro[subtype.label][sideKey];
        const introText = styledIntro && styledIntro.length
          ? fmt(rand(styledIntro), { team: oppLabel })
          : `${myTurn ? 'Twoja drużyna' : oppLabel}: ${subtype.label}.`;
        timeline.push({ minute: min, type: 'flavor', team: sideKey, subtype: subtype.label, subtypeCategory: subtype.category, text: introText });
      }

      if (Math.random() < pGoal) {
        const scorer = pickScorer(activeRoster(myTurn ? myRoster : oppRoster, myTurn ? 'me' : 'opp', sentOff));
        if (myTurn) { myGoals++; timeline.push({ minute: min, type: 'goal', team: 'me', scorer: scorer.name, text: fmt(rand(ST.goalFor), { p: scorer.name }) }); }
        else { oppGoals++; timeline.push({ minute: min, type: 'goal', team: 'opp', scorer: scorer.name, text: fmt(rand(ST.goalAgainst), { p: scorer.name, team: oppLabel }) }); }
      } else {
        const shooter = pickScorer(activeRoster(myTurn ? myRoster : oppRoster, myTurn ? 'me' : 'opp', sentOff));
        if (Math.random() < 0.55) {
          const gk = pickGK(activeRoster(myTurn ? oppRoster : myRoster, myTurn ? 'opp' : 'me', sentOff));
          timeline.push({ minute: min, type: 'flavor', team: myTurn ? 'me' : 'opp', text: fmt(myTurn ? rand(ST.gkSaveMe) : rand(ST.gkSaveOpp), { gk: gk.name, p: shooter.name, team: oppLabel }) });
        } else {
          timeline.push({ minute: min, type: 'flavor', team: myTurn ? 'me' : 'opp', text: fmt(myTurn ? rand(ST.missWideMe) : rand(ST.missWideOpp), { p: shooter.name, team: oppLabel }) });
        }
      }
      } // koniec gałęzi "nie parkujemy autobusu"
    }

    if (i === 50) timeline.push({ minute: 'HT', type: 'marker', text: `⏱ PRZERWA — ${formatScoreText(myGoals, oppGoals)}` });
    if (extraTimeExtended && i === matchEnd - 15) timeline.push({ minute: 'DOGR-HT', type: 'marker', text: `⏱ PRZERWA W DOGRYWCE — ${formatScoreText(myGoals, oppGoals)}` });

    // KONIEC "regulaminowego" odcinka pętli — jeśli potrzebny jest zwycięzca
    // (mecz pucharowy, needsWinner) i wciąż remis, NIE KOŃCZYMY pętli — tylko
    // ją PRZEDŁUŻAMY o dogrywkę (2×15 minut, i tak "za darmo" ta sama skala
    // "i" co reszta meczu). To NIE jest osobne wywołanie silnika — to ten sam
    // zamknięty stan (zmęczenie, kartki, kontuzje, taktyka) kontynuowany dalej,
    // więc dogrywka ma pełny, żywy komentarz zamiast cichego rzutu kostką.
    if (etCheck && !extraTimeExtended && i === matchEnd && (myGoals + myAggOffset) === (oppGoals + oppAggOffset)) {
      extraTimeExtended = true;
      matchEnd += 33; // ~30 minut dogrywki + doliczony czas obu połówek, w tej samej skali co 100 = 90 minut + doliczony
      const aggNote = (myAggOffset || oppAggOffset) ? ` (agregat ${myGoals + myAggOffset}:${oppGoals + oppAggOffset})` : '';
      timeline.push({ minute: 'DOGR', type: 'marker', text: `⏱ KONIEC CZASU REGULAMINOWEGO — remis${aggNote}! Zaczyna się DOGRYWKA (2×15 minut).` });
    }

    if (chaosWindowRemaining > 0) chaosWindowRemaining--;
    if (opierdolBoostRemaining > 0) opierdolBoostRemaining--;
    timeline.slice(startIdx).forEach(ev => { ev.zone = zoneThisEvent; });
    const fatigueMy = myFatigueRoster.map(p => ({ name: p.name, pct: fatigueStrengthPctForPlayer(p, i * fatigueIntensityMult) }));
    const fatigueOpp = oppFatigueRoster.map(p => ({ name: p.name, pct: fatigueStrengthPctForPlayer(p, i * fatigueIntensityMult) }));
    const received = yield { minute: min, i, matchEnd, myGoals, oppGoals, newEvents: timeline.slice(startIdx), done: false, fatigueMy, fatigueOpp };
    if (received !== undefined) tactics = received;
  }

  timeline.push({ minute: 'FT', type: 'marker', text: `⏱ KONIEC MECZU — ${formatScoreText(myGoals, oppGoals)}` });
  const result = myGoals > oppGoals ? 'W' : myGoals < oppGoals ? 'L' : 'D';
  const summaryPool = result === 'W' ? ST.win : result === 'D' ? ST.draw : ST.loss;
  const ftStartIdx = timeline.length - 1;
  if (summaryPool && summaryPool.length) timeline.push({ minute: 'FT', type: 'flavor', text: rand(summaryPool) });
  const finalFatigueMy = myFatigueRoster.map(p => ({ name: p.name, pct: fatigueStrengthPctForPlayer(p, matchEnd * fatigueIntensityMult) }));
  const finalFatigueOpp = oppFatigueRoster.map(p => ({ name: p.name, pct: fatigueStrengthPctForPlayer(p, matchEnd * fatigueIntensityMult) }));
  yield { minute: 'FT', i: matchEnd + 1, matchEnd, myGoals, oppGoals, newEvents: timeline.slice(ftStartIdx), done: true, fatigueMy: finalFatigueMy, fatigueOpp: finalFatigueOpp };
  return { result, gf: myGoals, ga: oppGoals, timeline, myBase, myMods, oppBase, oppMods, wasExtraTime: extraTimeExtended };
}

function generalOverall(lines) {
  // ważona średnia zgodna ze składem: OBRONA to 5 graczy (BR+4OB), POMOC 4, ATAK 2 — suma 11
  return (lines.DEF * 5 + lines.MID * 4 + lines.FWD * 2) / 11;
}
