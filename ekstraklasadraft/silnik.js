// ============================================================
// SILNIK MECZOWY (V2) — czysta logika, bez UI.
// Wymaga wczytania KOMENTARZE.JS przed tym plikiem (COMMENTARY_STYLES,
// MEDIUM_SUBTYPES, HIGH_SUBTYPES).
// Eksponuje: simulateMatchV2, simulateMatchV2Live (generator, do gry na
// żywo z pauzowalną taktyką), simulatePenaltyShootout, lineAverages,
// generalOverall, LINE_OF, tlClass, tlText.
// ============================================================

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

function fmt(tpl, vars) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] != null ? vars[k] : '');
}
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
    const scored = Math.random() < 0.5;
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
const LINE_BASELINE = 75; // punkt odniesienia dla modyfikatorów opartych o linie (środek realnej skali 60-87)
function logisticProb(diff, k) { return 1 / (1 + Math.pow(10, -diff / k)); }
function pickInjured(roster) { return roster[Math.floor(Math.random() * roster.length)]; }
function injuryImpact(player, roster) {
  const overalls = roster.map(p => p.overall);
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

function minuteLabelV2(i) {
  if (i <= 45) return `${i}`;
  if (i <= 50) return `45+${i - 45}`;
  if (i <= 95) return `${i - 5}`;
  return `90+${i - 95}`;
}

// Teksty pomocnicze dla nowych podtypów flavor/akcji (na start — do rozbudowy)


function simulateMatchV2(myRoster, oppRoster, oppLabel, tactics) {
  tactics = tactics || {};
  const aggressiveTackling = !!tactics.aggressiveTackling;   // Agresywny odbiór
  const lightTackling = !!tactics.lightTackling;              // Lekki odbiór
  const possessionFocus = !!tactics.possessionFocus;          // Posiadanie piłki
  const directPlay = !!tactics.directPlay;                    // Szybkie akcje
  const busParking = !!tactics.busParking;                    // Parkowanie autobusu
  const mentality = tactics.mentality || 'NEUTRAL';           // 'DEF' | 'NEUTRAL' | 'OFF'

  const ST = getStyle();
  const myBase = lineAverages(myRoster);
  const oppBase = lineAverages(oppRoster);
  const myMods = { DEF: 0, MID: 0, FWD: 0 };
  const oppMods = { DEF: 0, MID: 0, FWD: 0 };
  const myYellow = {}, oppYellow = {};
  const sentOff = new Set(); // 'me:Imię' / 'opp:Imię' — pomijani przy kolejnych losowaniach faulanta
  let formaUsed = false; // "wyjątkowa forma" — tylko raz na cały mecz

  const eff = (base, mods, line) => base[line] + mods[line];
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
    const designated = bestOutfield(foulRoster);
    const fouled = pickScorer(foulRoster);
    const taker = (fouled.name === designated.name || Math.random() < 0.35) ? fouled : designated;
    return { meAwarded, taker, fouled };
  }

  let matchEnd = 100; // Parkowanie autobusu skraca realnie pozostałą pulę zdarzeń
  for (let i = 1; i <= matchEnd; i++) {
    const min = minuteLabelV2(i);
    // Mentalność defensywna: więcej przestojów w grze, mniej realnych akcji ogółem.
    const flavorShare = mentality === 'DEF' ? 0.30 : 0.24;
    const r1 = Math.random();

    if (r1 < flavorShare) {
      // ── FLAVOR (24% wszystkich zdarzeń) ──
      // Wagi przekalibrowane pod gęstość 100 zdarzeń/mecz — kontuzje/karne/czerwone
      // muszą być rzadkie w skali PROCENTA zdarzenia, bo tych zdarzeń jest teraz dużo więcej.
      const r2 = Math.random() * 100;
      if (r2 < 8) {
        // Anegdota — losowy zawodnik z boiska (z obu drużyn), czysty flavor bez konsekwencji.
        const anecdotePool = myRoster.concat(oppRoster);
        const p = anecdotePool[Math.floor(Math.random() * anecdotePool.length)];
        timeline.push({ minute: min, type: 'flavor', text: fmt(rand(ST.flavorAnegdota), { p: p.name }) });
      } else if (r2 < 10) {
        const p = pickInjured(oppRoster);
        const impact = injuryImpact(p, oppRoster);
        oppMods[LINE_OF[p.pos]] -= impact;
        timeline.push({ minute: min, type: 'injury', team: 'opp', line: LINE_OF[p.pos], text: fmt(rand(ST.injuryOpp), { p: p.name, team: oppLabel, impact }) });
      } else if (r2 < 11.5 && !formaUsed) {
        formaUsed = true;
        const p = myRoster[Math.floor(Math.random() * myRoster.length)];
        myMods[LINE_OF[p.pos]] += 1;
        timeline.push({ minute: min, type: 'flavor', team: 'me', line: LINE_OF[p.pos], text: fmt(rand(ST.formaMe), { p: p.name }) });
      } else if (r2 < 19.5) {
        const p = pickFoulerLine(myRoster, 'me');
        const c = (myYellow[p.name] || 0) + 1; myYellow[p.name] = c;
        // Agresywny odbiór: dodatkowe, niezależne ryzyko, że ostry wjazd od razu skończy się czerwoną.
        const forcedRed = aggressiveTackling && Math.random() < 0.20;
        const avoidedRed = lightTackling && c >= 2 && Math.random() < 0.35;
        if ((c >= 2 || forcedRed) && !avoidedRed) {
          myMods[LINE_OF[p.pos]] -= 10; sentOff.add('me:' + p.name);
          timeline.push({ minute: min, type: 'red', team: 'me', line: LINE_OF[p.pos], text: fmt(rand(ST.secondYellowMe || ST.redMe), { p: p.name }) });
        } else {
          timeline.push({ minute: min, type: 'yellow', text: fmt(rand(ST.yellowMe), { p: p.name }) });
        }
      } else if (r2 < 27.5) {
        const p = pickFoulerLine(oppRoster, 'opp');
        const c = (oppYellow[p.name] || 0) + 1; oppYellow[p.name] = c;
        if (c >= 2) {
          oppMods[LINE_OF[p.pos]] -= 10; sentOff.add('opp:' + p.name);
          timeline.push({ minute: min, type: 'red', team: 'opp', line: LINE_OF[p.pos], text: fmt(rand(ST.secondYellowOpp || ST.redOpp), { p: p.name, team: oppLabel }) });
        } else {
          timeline.push({ minute: min, type: 'yellow', text: fmt(rand(ST.yellowOpp), { p: p.name, team: oppLabel }) });
        }
      } else if (r2 < 28) {
        const meAtFault = Math.random() < 0.5;
        const roster = meAtFault ? myRoster : oppRoster;
        const teamKey = meAtFault ? 'me' : 'opp';
        const p = pickFoulerLine(roster, teamKey);
        (meAtFault ? myMods : oppMods)[LINE_OF[p.pos]] -= 10;
        sentOff.add(teamKey + ':' + p.name);
        timeline.push({ minute: min, type: 'red', team: teamKey, line: LINE_OF[p.pos], text: fmt(rand(meAtFault ? ST.redMe : ST.redOpp), { p: p.name, team: oppLabel }) });
      } else if (r2 < 31) {
        const meAwarded = Math.random() < 0.5; // czysty 50/50, zero czynników
        const { taker, fouled } = resolvePenalty(meAwarded);
        timeline.push({ minute: min, type: 'penalty', text: fmt(ST.penaltyAward[0], { p: fouled.name }) });
        if (taker.name !== fouled.name) {
          timeline.push({ minute: min, type: 'flavor', text: '↳ ' + fmt(meAwarded ? rand(ST.penaltyTakerMe) : rand(ST.penaltyTakerOpp), { p: taker.name, team: oppLabel }) });
        }
        const outcomeRoll = Math.random();
        if (outcomeRoll < 0.76) {
          if (meAwarded) { myGoals++; timeline.push({ minute: min, type: 'goal', team: 'me', text: '↳ ' + fmt(rand(ST.penaltyScoredMe), { p: taker.name }) }); }
          else { oppGoals++; timeline.push({ minute: min, type: 'goal', team: 'opp', text: '↳ ' + fmt(rand(ST.penaltyScoredOpp), { p: taker.name, team: oppLabel }) }); }
        } else if (outcomeRoll < 0.88) {
          timeline.push({ minute: min, type: 'flavor', text: '↳ ' + fmt(meAwarded ? rand(ST.penaltyMissedMe) : rand(ST.penaltyMissedOpp), { p: taker.name, team: oppLabel }) });
        } else {
          timeline.push({ minute: min, type: 'flavor', text: '↳ ' + fmt(meAwarded ? rand(ST.penaltySavedMe) : rand(ST.penaltySavedOpp), { p: taker.name, team: oppLabel }) });
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
        const defendingDef = eff(myBase, myMods, 'DEF');
        highShare = clamp(BASE_HIGH_SHARE - (defendingDef - LINE_BASELINE) * 0.01 + 0.10, 0.10, 0.60);
        const isHighThreatBP = Math.random() < highShare;
        const atkOvrBP = eff(oppBase, oppMods, 'FWD');
        const baseGoalBP = isHighThreatBP ? HIGH_GOAL_BASE : MED_GOAL_BASE;
        pGoal = clamp((baseGoalBP + (atkOvrBP - LINE_BASELINE) * 0.0015) * 1.3, 0.005, 0.30);
        const subtypeBP = rand(isHighThreatBP ? HIGH_SUBTYPES : MEDIUM_SUBTYPES);
        if (subtypeBP !== 'atak pozycyjny') {
          const styledIntroBP = ST.subtypeIntro && ST.subtypeIntro[subtypeBP] && ST.subtypeIntro[subtypeBP].opp;
          const introTextBP = styledIntroBP && styledIntroBP.length
            ? fmt(rand(styledIntroBP), { team: oppLabel })
            : `${oppLabel}: ${subtypeBP}.`;
          timeline.push({ minute: min, type: 'flavor', text: introTextBP });
        }
        if (Math.random() < pGoal) {
          const scorer = pickScorer(oppRoster);
          oppGoals++; timeline.push({ minute: min, type: 'goal', team: 'opp', text: fmt(rand(ST.goalAgainst), { p: scorer.name, team: oppLabel }) });
        } else {
          const shooter = pickScorer(oppRoster);
          if (Math.random() < 0.55) {
            const gk = pickGK(myRoster);
            timeline.push({ minute: min, type: 'flavor', text: fmt(rand(ST.gkSaveOpp), { gk: gk.name, p: shooter.name, team: oppLabel }) });
          } else {
            timeline.push({ minute: min, type: 'flavor', text: fmt(rand(ST.missWideOpp), { p: shooter.name, team: oppLabel }) });
          }
        }
        // czas leci szybciej — jedno zdarzenie "zjada" dwie minuty z puli
        matchEnd = Math.max(i, matchEnd - 1);
      } else {
      let midDiff = eff(myBase, myMods, 'MID') - eff(oppBase, oppMods, 'MID');
      if (possessionFocus) midDiff += 5;   // Posiadanie piłki: częściej masz piłkę (znerfowane)
      if (directPlay) midDiff -= 8;        // Szybkie akcje: rezygnujesz z posiadania na rzecz kierunkowej gry
      if (mentality === 'DEF') midDiff -= 5; // Defensywnie: rzadziej to Twoja akcja (nie prasujesz wysoko)
      const pMyBall = clamp(logisticProb(midDiff, K_MID), 0.05, 0.95);
      const myTurn = Math.random() < pMyBall;

      const defendingDef = myTurn ? eff(oppBase, oppMods, 'DEF') : eff(myBase, myMods, 'DEF');
      let highShare = clamp(BASE_HIGH_SHARE - (defendingDef - LINE_BASELINE) * 0.01, 0.10, 0.45);
      if (mentality === 'OFF') highShare += 0.08;                          // Ofensywnie: groźniej dla obu stron
      if (mentality === 'DEF' && myTurn) highShare -= 0.08;                // ...Twoja akcja, gdy już jest, mniej jakościowa
      if (possessionFocus) { highShare += myTurn ? -0.08 : 0.08; }         // ...kosztem jakości Twojej i większą premią dla kontr rywala
      if (directPlay && myTurn) highShare += 0.08;                        // Szybkie akcje: rzadziej masz piłkę, ale groźniej gdy już ją masz
      highShare = clamp(highShare, 0.05, 0.60);
      const isHighThreat = Math.random() < highShare;

      const atkOvr = myTurn ? eff(myBase, myMods, 'FWD') : eff(oppBase, oppMods, 'FWD');
      const baseGoal = isHighThreat ? HIGH_GOAL_BASE : MED_GOAL_BASE;
      let pGoal = clamp(baseGoal + (atkOvr - LINE_BASELINE) * 0.0015, 0.005, 0.20);
      if (aggressiveTackling && !myTurn) pGoal *= 0.70; // Agresywny odbiór: tniesz skuteczność rywala, gdy to jego akcja
      if (lightTackling && !myTurn) pGoal *= 1.08; // Lekki odbiór: odrobinę łatwiejsza gra rywala, w zamian za mniejsze ryzyko kartek

      const subtype = rand(isHighThreat ? HIGH_SUBTYPES : MEDIUM_SUBTYPES);
      if (subtype !== 'atak pozycyjny') {
        const sideKey = myTurn ? 'me' : 'opp';
        const styledIntro = ST.subtypeIntro && ST.subtypeIntro[subtype] && ST.subtypeIntro[subtype][sideKey];
        const introText = styledIntro && styledIntro.length
          ? fmt(rand(styledIntro), { team: oppLabel })
          : `${myTurn ? 'Twoja drużyna' : oppLabel}: ${subtype}.`;
        timeline.push({ minute: min, type: 'flavor', text: introText });
      }

      if (Math.random() < pGoal) {
        const scorer = pickScorer(myTurn ? myRoster : oppRoster);
        if (myTurn) { myGoals++; timeline.push({ minute: min, type: 'goal', team: 'me', text: fmt(rand(ST.goalFor), { p: scorer.name }) }); }
        else { oppGoals++; timeline.push({ minute: min, type: 'goal', team: 'opp', text: fmt(rand(ST.goalAgainst), { p: scorer.name, team: oppLabel }) }); }
      } else {
        const shooter = pickScorer(myTurn ? myRoster : oppRoster);
        if (Math.random() < 0.55) {
          const gk = pickGK(myTurn ? oppRoster : myRoster);
          timeline.push({ minute: min, type: 'flavor', text: fmt(myTurn ? rand(ST.gkSaveMe) : rand(ST.gkSaveOpp), { gk: gk.name, p: shooter.name, team: oppLabel }) });
        } else {
          timeline.push({ minute: min, type: 'flavor', text: fmt(myTurn ? rand(ST.missWideMe) : rand(ST.missWideOpp), { p: shooter.name, team: oppLabel }) });
        }
      }
      } // koniec gałęzi "nie parkujemy autobusu"
    }

    if (i === 50) timeline.push({ minute: 'HT', type: 'marker', text: `⏱ PRZERWA — ${myGoals} : ${oppGoals}` });
  }

  timeline.push({ minute: 'FT', type: 'marker', text: `⏱ KONIEC MECZU — ${myGoals} : ${oppGoals}` });
  const result = myGoals > oppGoals ? 'W' : myGoals < oppGoals ? 'L' : 'D';
  const summaryPool = result === 'W' ? ST.win : result === 'D' ? ST.draw : ST.loss;
  if (summaryPool && summaryPool.length) timeline.push({ minute: 'FT', type: 'flavor', text: rand(summaryPool) });
  return { result, gf: myGoals, ga: oppGoals, timeline, myBase, myMods, oppBase, oppMods };
}

function* simulateMatchV2Live(myRoster, oppRoster, oppLabel, initialTactics) {
  let tactics = initialTactics || {};
  const ST = getStyle();
  const myBase = lineAverages(myRoster);
  const oppBase = lineAverages(oppRoster);
  const myMods = { DEF: 0, MID: 0, FWD: 0 };
  const oppMods = { DEF: 0, MID: 0, FWD: 0 };
  const myYellow = {}, oppYellow = {};
  const sentOff = new Set(); // 'me:Imię' / 'opp:Imię' — pomijani przy kolejnych losowaniach faulanta
  let formaUsed = false; // "wyjątkowa forma" — tylko raz na cały mecz
  let chaosUsed = false;              // MUSIMY NA CHAOS — jednorazowo na mecz
  let chaosGuaranteedPending = false; // czy jeszcze nie "wystrzeliła" gwarantowana groźna akcja
  let chaosWindowRemaining = 0;       // ile zdarzeń zostało w oknie 5-minutowym (ekspozycja rywala)
  let opierdolUsed = false;           // OPIERDOL — jednorazowo na mecz, najpóźniej do 65. minuty
  let opierdolBoostRemaining = 0;     // ile zdarzeń zostało w 10-minutowym oknie podbicia
  const OPIERDOL_LATEST_I = 70;       // 65. minuta = i=70 (65+5, bo druga połowa przesunięta o doliczony czas 1. połowy)
  const OPIERDOL_COST_START_I = 86;   // 81. minuta = i=86 — start okna kosztu (ostatnie 10 min + 5 doliczonych = i 86-100)
  let awanturaUsed = false;           // AWANTURA Z TECHNICZNYM — jednorazowo, urywa 2-4 minuty meczu

  const eff = (base, mods, line) => base[line] + mods[line];
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
    const designated = bestOutfield(foulRoster);
    const fouled = pickScorer(foulRoster);
    const taker = (fouled.name === designated.name || Math.random() < 0.35) ? fouled : designated;
    return { meAwarded, taker, fouled };
  }

  let matchEnd = 100; // Parkowanie autobusu skraca realnie pozostałą pulę zdarzeń
  for (let i = 1; i <= matchEnd; i++) {
    // Taktyka czytana NA NOWO w każdej iteracji — zmiana w trakcie meczu działa natychmiast.
    const aggressiveTackling = !!tactics.aggressiveTackling;
    const lightTackling = !!tactics.lightTackling;
    const possessionFocus = !!tactics.possessionFocus;
    const directPlay = !!tactics.directPlay;
    const busParking = !!tactics.busParking;
    const stoperAtak = !!tactics.stoperAtak;             // Wyślij stopera do ataku
    const mentality = tactics.mentality || 'NEUTRAL';

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
    const flavorShare = mentality === 'DEF' ? 0.30 : 0.24;
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
        const anecdotePool = myRoster.concat(oppRoster);
        const p = anecdotePool[Math.floor(Math.random() * anecdotePool.length)];
        timeline.push({ minute: min, type: 'flavor', text: fmt(rand(ST.flavorAnegdota), { p: p.name }) });
      } else if (r2 < 10) {
        const p = pickInjured(oppRoster);
        const impact = injuryImpact(p, oppRoster);
        oppMods[LINE_OF[p.pos]] -= impact;
        timeline.push({ minute: min, type: 'injury', team: 'opp', line: LINE_OF[p.pos], text: fmt(rand(ST.injuryOpp), { p: p.name, team: oppLabel, impact }) });
      } else if (r2 < 11.5 && !formaUsed) {
        formaUsed = true;
        const p = myRoster[Math.floor(Math.random() * myRoster.length)];
        myMods[LINE_OF[p.pos]] += 1;
        timeline.push({ minute: min, type: 'flavor', team: 'me', line: LINE_OF[p.pos], text: fmt(rand(ST.formaMe), { p: p.name }) });
      } else if (r2 < 19.5) {
        const p = pickFoulerLine(myRoster, 'me');
        const c = (myYellow[p.name] || 0) + 1; myYellow[p.name] = c;
        // Agresywny odbiór: dodatkowe, niezależne ryzyko, że ostry wjazd od razu skończy się czerwoną.
        const forcedRed = aggressiveTackling && Math.random() < 0.20;
        const avoidedRed = lightTackling && c >= 2 && Math.random() < 0.35;
        if ((c >= 2 || forcedRed) && !avoidedRed) {
          myMods[LINE_OF[p.pos]] -= 10; sentOff.add('me:' + p.name);
          timeline.push({ minute: min, type: 'red', team: 'me', line: LINE_OF[p.pos], text: fmt(rand(ST.secondYellowMe || ST.redMe), { p: p.name }) });
        } else {
          timeline.push({ minute: min, type: 'yellow', text: fmt(rand(ST.yellowMe), { p: p.name }) });
        }
      } else if (r2 < 27.5) {
        const p = pickFoulerLine(oppRoster, 'opp');
        const c = (oppYellow[p.name] || 0) + 1; oppYellow[p.name] = c;
        if (c >= 2) {
          oppMods[LINE_OF[p.pos]] -= 10; sentOff.add('opp:' + p.name);
          timeline.push({ minute: min, type: 'red', team: 'opp', line: LINE_OF[p.pos], text: fmt(rand(ST.secondYellowOpp || ST.redOpp), { p: p.name, team: oppLabel }) });
        } else {
          timeline.push({ minute: min, type: 'yellow', text: fmt(rand(ST.yellowOpp), { p: p.name, team: oppLabel }) });
        }
      } else if (r2 < 28) {
        const meAtFault = Math.random() < 0.5;
        const roster = meAtFault ? myRoster : oppRoster;
        const teamKey = meAtFault ? 'me' : 'opp';
        const p = pickFoulerLine(roster, teamKey);
        (meAtFault ? myMods : oppMods)[LINE_OF[p.pos]] -= 10;
        sentOff.add(teamKey + ':' + p.name);
        timeline.push({ minute: min, type: 'red', team: teamKey, line: LINE_OF[p.pos], text: fmt(rand(meAtFault ? ST.redMe : ST.redOpp), { p: p.name, team: oppLabel }) });
      } else if (r2 < 31) {
        const meAwarded = Math.random() < 0.5; // czysty 50/50, zero czynników
        const { taker, fouled } = resolvePenalty(meAwarded);
        timeline.push({ minute: min, type: 'penalty', text: fmt(ST.penaltyAward[0], { p: fouled.name }) });
        if (taker.name !== fouled.name) {
          timeline.push({ minute: min, type: 'flavor', text: '↳ ' + fmt(meAwarded ? rand(ST.penaltyTakerMe) : rand(ST.penaltyTakerOpp), { p: taker.name, team: oppLabel }) });
        }
        const outcomeRoll = Math.random();
        if (outcomeRoll < 0.76) {
          if (meAwarded) { myGoals++; timeline.push({ minute: min, type: 'goal', team: 'me', text: '↳ ' + fmt(rand(ST.penaltyScoredMe), { p: taker.name }) }); }
          else { oppGoals++; timeline.push({ minute: min, type: 'goal', team: 'opp', text: '↳ ' + fmt(rand(ST.penaltyScoredOpp), { p: taker.name, team: oppLabel }) }); }
        } else if (outcomeRoll < 0.88) {
          timeline.push({ minute: min, type: 'flavor', text: '↳ ' + fmt(meAwarded ? rand(ST.penaltyMissedMe) : rand(ST.penaltyMissedOpp), { p: taker.name, team: oppLabel }) });
        } else {
          timeline.push({ minute: min, type: 'flavor', text: '↳ ' + fmt(meAwarded ? rand(ST.penaltySavedMe) : rand(ST.penaltySavedOpp), { p: taker.name, team: oppLabel }) });
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
        const defendingDef = eff(myBase, myMods, 'DEF');
        highShare = clamp(BASE_HIGH_SHARE - (defendingDef - LINE_BASELINE) * 0.01 + 0.10, 0.10, 0.60);
        const isHighThreatBP = Math.random() < highShare;
        const atkOvrBP = eff(oppBase, oppMods, 'FWD');
        const baseGoalBP = isHighThreatBP ? HIGH_GOAL_BASE : MED_GOAL_BASE;
        pGoal = clamp((baseGoalBP + (atkOvrBP - LINE_BASELINE) * 0.0015) * 1.3, 0.005, 0.30);
        const subtypeBP = rand(isHighThreatBP ? HIGH_SUBTYPES : MEDIUM_SUBTYPES);
        zoneThisEvent = (isHighThreatBP || subtypeBP === 'rzut rożny') ? 'GOAL_ME' : 'BOX_ME';
        if (subtypeBP !== 'atak pozycyjny') {
          const styledIntroBP = ST.subtypeIntro && ST.subtypeIntro[subtypeBP] && ST.subtypeIntro[subtypeBP].opp;
          const introTextBP = styledIntroBP && styledIntroBP.length
            ? fmt(rand(styledIntroBP), { team: oppLabel })
            : `${oppLabel}: ${subtypeBP}.`;
          timeline.push({ minute: min, type: 'flavor', text: introTextBP });
        }
        if (Math.random() < pGoal) {
          const scorer = pickScorer(oppRoster);
          oppGoals++; timeline.push({ minute: min, type: 'goal', team: 'opp', text: fmt(rand(ST.goalAgainst), { p: scorer.name, team: oppLabel }) });
        } else {
          const shooter = pickScorer(oppRoster);
          if (Math.random() < 0.55) {
            const gk = pickGK(myRoster);
            timeline.push({ minute: min, type: 'flavor', text: fmt(rand(ST.gkSaveOpp), { gk: gk.name, p: shooter.name, team: oppLabel }) });
          } else {
            timeline.push({ minute: min, type: 'flavor', text: fmt(rand(ST.missWideOpp), { p: shooter.name, team: oppLabel }) });
          }
        }
        // czas leci szybciej — jedno zdarzenie "zjada" dwie minuty z puli
        matchEnd = Math.max(i, matchEnd - 1);
      } else {
      const opierdolCostActive = opierdolUsed && i >= OPIERDOL_COST_START_I;
      const opierdolBoostActive = opierdolBoostRemaining > 0;
      let midDiff = eff(myBase, myMods, 'MID') - eff(oppBase, oppMods, 'MID');
      if (possessionFocus) midDiff += 5;   // Posiadanie piłki: częściej masz piłkę (znerfowane)
      if (directPlay) midDiff -= 8;        // Szybkie akcje: rezygnujesz z posiadania na rzecz kierunkowej gry
      if (mentality === 'DEF') midDiff -= 5; // Defensywnie: rzadziej to Twoja akcja (nie prasujesz wysoko)
      if (chaosWindowRemaining > 0) midDiff += 12; // MUSIMY NA CHAOS: przez okno ekspozycji łatwiej rywalowi, ale gwarancja to zaraz odwraca
      if (opierdolBoostActive) midDiff += 8;   // OPIERDOL: podbicie w oknie 10 zdarzeń
      if (opierdolCostActive) midDiff -= 10;   // OPIERDOL: zmęczenie w końcówce — kara nieco mocniejsza niż nagroda
      let pMyBall = clamp(logisticProb(midDiff, K_MID), 0.05, 0.95);
      let myTurn = Math.random() < pMyBall;
      if (chaosGuaranteedPending) { myTurn = true; } // gwarancja: ta akcja jest Twoja

      const defendingDef = (myTurn ? eff(oppBase, oppMods, 'DEF') : eff(myBase, myMods, 'DEF')) - (!myTurn && stoperAtak ? 10 : 0);
      let highShare = clamp(BASE_HIGH_SHARE - (defendingDef - LINE_BASELINE) * 0.01, 0.10, 0.45);
      if (mentality === 'OFF') highShare += 0.08;                          // Ofensywnie: groźniej dla obu stron
      if (mentality === 'DEF' && myTurn) highShare -= 0.08;                // ...Twoja akcja, gdy już jest, mniej jakościowa
      if (possessionFocus) { highShare += myTurn ? -0.08 : 0.08; }         // ...kosztem jakości Twojej i większą premią dla kontr rywala
      if (directPlay && myTurn) highShare += 0.08;                        // Szybkie akcje: rzadziej masz piłkę, ale groźniej gdy już ją masz
      if (chaosWindowRemaining > 0 && !myTurn) highShare += 0.15;          // MUSIMY NA CHAOS: rywal groźniejszy w oknie ekspozycji
      if (myTurn) {
        if (opierdolBoostActive) highShare += 0.10;   // OPIERDOL: +10pp w oknie podbicia
        if (opierdolCostActive) highShare -= 0.13;    // OPIERDOL: -13pp w zmęczeniu — kara nieco mocniejsza
      }
      highShare = clamp(highShare, 0.05, 0.60);
      let isHighThreat = Math.random() < highShare;
      if (chaosGuaranteedPending) { isHighThreat = true; chaosGuaranteedPending = false; } // gwarancja zrealizowana

      const atkOvr = (myTurn ? eff(myBase, myMods, 'FWD') : eff(oppBase, oppMods, 'FWD')) + (myTurn && stoperAtak ? 5 : 0);
      const baseGoal = isHighThreat ? HIGH_GOAL_BASE : MED_GOAL_BASE;
      let pGoal = clamp(baseGoal + (atkOvr - LINE_BASELINE) * 0.0015, 0.005, 0.20);
      if (aggressiveTackling && !myTurn) pGoal *= 0.70; // Agresywny odbiór: tniesz skuteczność rywala, gdy to jego akcja
      if (lightTackling && !myTurn) pGoal *= 1.08; // Lekki odbiór: odrobinę łatwiejsza gra rywala, w zamian za mniejsze ryzyko kartek
      if (chaosWindowRemaining > 0 && !myTurn) pGoal *= 1.25; // MUSIMY NA CHAOS: rywal skuteczniejszy w oknie ekspozycji
      if (myTurn && opierdolBoostActive) pGoal *= 1.15;  // OPIERDOL: +15% skuteczności w podbiciu
      if (myTurn && opierdolCostActive) pGoal *= 0.75;   // OPIERDOL: -25% skuteczności w zmęczeniu


      const subtype = rand(isHighThreat ? HIGH_SUBTYPES : MEDIUM_SUBTYPES);
      zoneThisEvent = (isHighThreat || subtype === 'rzut rożny') ? (myTurn ? 'GOAL_OPP' : 'GOAL_ME') : (myTurn ? 'BOX_OPP' : 'BOX_ME');
      if (subtype !== 'atak pozycyjny') {
        const sideKey = myTurn ? 'me' : 'opp';
        const styledIntro = ST.subtypeIntro && ST.subtypeIntro[subtype] && ST.subtypeIntro[subtype][sideKey];
        const introText = styledIntro && styledIntro.length
          ? fmt(rand(styledIntro), { team: oppLabel })
          : `${myTurn ? 'Twoja drużyna' : oppLabel}: ${subtype}.`;
        timeline.push({ minute: min, type: 'flavor', text: introText });
      }

      if (Math.random() < pGoal) {
        const scorer = pickScorer(myTurn ? myRoster : oppRoster);
        if (myTurn) { myGoals++; timeline.push({ minute: min, type: 'goal', team: 'me', text: fmt(rand(ST.goalFor), { p: scorer.name }) }); }
        else { oppGoals++; timeline.push({ minute: min, type: 'goal', team: 'opp', text: fmt(rand(ST.goalAgainst), { p: scorer.name, team: oppLabel }) }); }
      } else {
        const shooter = pickScorer(myTurn ? myRoster : oppRoster);
        if (Math.random() < 0.55) {
          const gk = pickGK(myTurn ? oppRoster : myRoster);
          timeline.push({ minute: min, type: 'flavor', text: fmt(myTurn ? rand(ST.gkSaveMe) : rand(ST.gkSaveOpp), { gk: gk.name, p: shooter.name, team: oppLabel }) });
        } else {
          timeline.push({ minute: min, type: 'flavor', text: fmt(myTurn ? rand(ST.missWideMe) : rand(ST.missWideOpp), { p: shooter.name, team: oppLabel }) });
        }
      }
      } // koniec gałęzi "nie parkujemy autobusu"
    }

    if (i === 50) timeline.push({ minute: 'HT', type: 'marker', text: `⏱ PRZERWA — ${myGoals} : ${oppGoals}` });

    if (chaosWindowRemaining > 0) chaosWindowRemaining--;
    if (opierdolBoostRemaining > 0) opierdolBoostRemaining--;
    timeline.slice(startIdx).forEach(ev => { ev.zone = zoneThisEvent; });
    const received = yield { minute: min, i, matchEnd, myGoals, oppGoals, newEvents: timeline.slice(startIdx), done: false };
    if (received !== undefined) tactics = received;
  }

  timeline.push({ minute: 'FT', type: 'marker', text: `⏱ KONIEC MECZU — ${myGoals} : ${oppGoals}` });
  const result = myGoals > oppGoals ? 'W' : myGoals < oppGoals ? 'L' : 'D';
  const summaryPool = result === 'W' ? ST.win : result === 'D' ? ST.draw : ST.loss;
  const ftStartIdx = timeline.length - 1;
  if (summaryPool && summaryPool.length) timeline.push({ minute: 'FT', type: 'flavor', text: rand(summaryPool) });
  yield { minute: 'FT', i: matchEnd + 1, matchEnd, myGoals, oppGoals, newEvents: timeline.slice(ftStartIdx), done: true };
  return { result, gf: myGoals, ga: oppGoals, timeline, myBase, myMods, oppBase, oppMods };
}

function generalOverall(lines) {
  // ważona średnia zgodna ze składem: OBRONA to 5 graczy (BR+4OB), POMOC 4, ATAK 2 — suma 11
  return (lines.DEF * 5 + lines.MID * 4 + lines.FWD * 2) / 11;
}
