// ============================================================
// LOSOWANIE.JS — "show" losowania fazy ligowej dla wyzwań typu 'swiss'
// (system koszykowy, jak prawdziwe losowanie UEFA). Wydzielone z
// wyzwania.js świadomie — to samodzielny, reużywalny "spektakl", który
// może się przydać przy innych rozgrywkach koszykowych w przyszłości,
// nie tylko przy Lidze Mistrzów.
//
// KOLEJNOŚĆ UJAWNIANIA: od KOSZYKA 4 w górę do KOSZYKA 1 — najpierw
// najsłabsi/najbliżsi Twojemu poziomowi rywale, na końcu największe,
// najbardziej ekscytujące starcie. To świadoma decyzja (nie od
// najlepszych w dół) — buduje napięcie tak, jak prawdziwy show losowania.
//
// WAŻNE O KOLEJNOŚCI WCZYTYWANIA: musi być PO wyzwania.js (korzysta z
// resolveOpponentTeam, swissMyLeagueLabel, initSwissLeague, goToChallengeRound,
// renderSeasonTableInto, sortedSeasonTable — wszystkie tam zdefiniowane).
// ============================================================

// Kolejność, w jakiej gracz POZNAJE swoich rywali — koszyk 4 (własny,
// najsłabszy) w górę do koszyka 1 (najmocniejszy) NA KOŃCU, dla
// dramaturgii. To jedyna różnica względem "naturalnej" kolejności
// koszyków 1→4 używanej przy budowie samej fazy ligowej (patrz
// initSwissLeague w wyzwania.js) — TA funkcja dotyczy wyłącznie
// KOLEJNOŚCI POKAZYWANIA graczowi, nie struktury rozgrywek.
function computeMyDrawOrder(def) {
  const ch = state.challenge;
  const myLabel = swissMyLeagueLabel();
  const myFixtures = ch.swissRounds.flat().filter(f => f.home.label === myLabel || f.away.label === myLabel);
  return ch.swissPots.slice().reverse().flatMap(pot => myFixtures.filter(f => {
    const oppLabel = f.home.label === myLabel ? f.away.label : f.home.label;
    return pot.includes(oppLabel);
  }));
}

// ── EKRAN LOSOWANIA (interaktywny, klik po kliku) ────────────
// Po awansie z eliminacji NIE wchodzimy od razu w mecze fazy ligowej —
// najpierw pokazujemy 4 koszyki i pozwalamy losować rywali jednego po
// drugim ("🎲 LOSUJ RYWALA"), koszyk po koszyku (4→1), żeby było czuć
// dramaturgię losowania — zamiast cichego, gotowego już terminarza.
function goToSwissDrawScreen(def) {
  const ch = state.challenge;
  if (!ch.swissRounds) { if (!initSwissLeague(def)) return; }
  if (!ch.swissMyDrawOrder) { ch.swissMyDrawOrder = computeMyDrawOrder(def); ch.drawRevealCount = 0; }

  document.getElementById('challenge-title').textContent = def.title;
  document.getElementById('challenge-round-label').textContent = '🎟 Losowanie fazy ligowej';
  document.getElementById('challenge-opponent-preview').textContent = '';
  document.getElementById('challenge-agg-info').textContent = '';
  document.getElementById('challenge-group-table').innerHTML = '';
  document.getElementById('btn-toggle-swiss-draw').style.display = 'none'; // to samo już widać niżej na tym ekranie

  renderSwissDrawScreen();

  const allDrawn = ch.drawRevealCount >= ch.swissMyDrawOrder.length;
  const playBtn = document.getElementById('btn-play-challenge-match');
  playBtn.disabled = false;
  playBtn.textContent = allDrawn ? '▶ ROZPOCZNIJ FAZĘ LIGOWĄ' : '🎲 LOSUJ RYWALA';
  playBtn.onclick = allDrawn
    ? () => { ch.phase = 'swiss'; goToChallengeRound(); }
    : () => drawNextSwissOpponent();
  showScreen('screen-challenge');
}

// Renderuje 4 koszyki (wszyscy członkowie, jako "chipy" drużyn) + listę
// już wylosowanych rywali (karty z kierunkiem meczu), z krótkim "podbiciem"
// (animacja CSS) przy właśnie odsłoniętym, dla dramaturgii.
function renderSwissDrawScreen(justRevealedIdx) {
  const ch = state.challenge;
  const el = document.getElementById('challenge-draw-reveal');
  el.style.display = 'block';
  const myLabel = swissMyLeagueLabel();

  const potsHtml = ch.swissPots.map((pot, i) => {
    const chipsHtml = pot.map(label => {
      const isMe = label === myLabel;
      return `<span class="draw-chip${isMe ? ' draw-chip-mine' : ''}">${label}${isMe ? ' (Ty)' : ''}</span>`;
    }).join('');
    return `<div class="draw-pot-card">
      <div class="draw-pot-header">KOSZYK ${i + 1}</div>
      <div class="draw-pot-chips">${chipsHtml}</div>
    </div>`;
  }).join('');

  const revealed = ch.swissMyDrawOrder.slice(0, ch.drawRevealCount).map((f, idx) => {
    const iAmHome = f.home.label === myLabel;
    const oppLabel = iAmHome ? f.away.label : f.home.label;
    const isNew = idx === ch.drawRevealCount - 1 && justRevealedIdx === idx;
    return `<div class="draw-reveal-row${isNew ? ' draw-reveal-new' : ''}">
      <span class="draw-reveal-num">${idx + 1}.</span>
      <span class="draw-reveal-opp">${oppLabel}</span>
      <span class="draw-reveal-venue">${iAmHome ? '🏠 u siebie' : '✈️ wyjazd'}</span>
    </div>`;
  }).join('') || '<div style="color:var(--gray);padding:6px 0;">— jeszcze nikogo nie wylosowano —</div>';

  el.innerHTML = `
    <div class="panel-title" style="font-size:14px;">🎟 KOSZYKI</div>
    <div class="draw-pots-grid">${potsHtml}</div>
    <div class="panel-title" style="font-size:14px;margin-top:14px;">TWOI RYWALE (${ch.drawRevealCount}/${ch.swissMyDrawOrder.length})</div>
    <div class="draw-reveal-list">${revealed}</div>`;
}

// Losuje (odsłania) kolejnego rywala z ustalonej wcześniej kolejności —
// z krótkim opóźnieniem "Losowanie..." i migającym efektem dla napięcia.
function drawNextSwissOpponent() {
  const ch = state.challenge;
  const def = WYZWANIA.find(c => c.id === ch.defId);
  const playBtn = document.getElementById('btn-play-challenge-match');
  playBtn.disabled = true;
  playBtn.classList.add('draw-shuffling');
  playBtn.textContent = '🎲 Losowanie...';
  setTimeout(() => {
    ch.drawRevealCount++;
    playBtn.classList.remove('draw-shuffling');
    renderSwissDrawScreen(ch.drawRevealCount - 1);
    const allDrawn = ch.drawRevealCount >= ch.swissMyDrawOrder.length;
    playBtn.disabled = false;
    playBtn.textContent = allDrawn ? '▶ ROZPOCZNIJ FAZĘ LIGOWĄ' : '🎲 LOSUJ RYWALA';
    playBtn.onclick = allDrawn
      ? () => { ch.phase = 'swiss'; goToChallengeRound(); }
      : () => drawNextSwissOpponent();
  }, 550);
}

// Renderuje panel "Twoje losowanie" — z którymi dwoma zespołami z każdego
// koszyka grasz (i który mecz u siebie / na wyjeździe). Widoczny przez całą
// fazę ligową pod przyciskiem "🎟 Zobacz losowanie".
function renderSwissDrawReveal(def) {
  const ch = state.challenge;
  const el = document.getElementById('challenge-draw-reveal');
  if (!el) return;
  if (!ch.swissPots) { el.style.display = 'none'; return; }
  const myLabel = swissMyLeagueLabel();
  const myFixtures = ch.swissRounds.flat().filter(f => f.home.label === myLabel || f.away.label === myLabel);
  const rows = ch.swissPots.map((pot, i) => {
    const oppsInPot = myFixtures
      .filter(f => {
        const oppLabel = f.home.label === myLabel ? f.away.label : f.home.label;
        return pot.includes(oppLabel);
      })
      .map(f => {
        const iAmHome = f.home.label === myLabel;
        const oppLabel = iAmHome ? f.away.label : f.home.label;
        return `${oppLabel} (${iAmHome ? 'u siebie' : 'wyjazd'})`;
      });
    return `<div style="margin-bottom:4px;"><b>Koszyk ${i + 1}:</b> ${oppsInPot.join(' • ') || '—'}</div>`;
  }).join('');
  el.innerHTML = `<div class="panel-title" style="font-size:14px;">🎟 TWOJE LOSOWANIE — FAZA LIGOWA</div>${rows}`;
}

function toggleSwissDrawReveal() {
  const el = document.getElementById('challenge-draw-reveal');
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}
