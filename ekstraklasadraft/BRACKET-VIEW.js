// ============================================================
// BRACKET-VIEW.JS (v3) — drabinka jako ROZWIJANE SEKCJE (<details> na
// rundę), z meczami w zwykłej, pionowej liście wewnątrz.
//
// Dlaczego trzecia wersja: v1 (ręczna matematyka pikseli) i v2 (zagnieżdżony
// flexbox z liniami łączącymi) obie miały realne problemy z wyświetlaniem,
// mimo że logika/dane za każdym razem były poprawne (zweryfikowane testami).
// Zamiast kolejnej próby z połączonymi liniami - świadomie WRACAM do
// najprostszego możliwego układu: zwykły, pionowy spis, bez żadnego
// niestandardowego pozycjonowania (flexbox/absolute), więc nie ma czego
// źle policzyć. Każda runda to osobny <details> - można ją zwinąć/rozwinąć,
// więc widać dokładnie tyle, ile się chce, bez przewijania hen daleko.
// ============================================================

function bandLabelFor(node) {
  if (node.size === 1) return `${node.rankStart}. MIEJSCE`;
  if (node.rankStart === 1 && node.size === 2) return 'FINAŁ';
  if (node.size === 2) return `MECZ O ${node.rankStart}. MIEJSCE`;
  return `O MIEJSCA ${node.rankStart}-${node.rankEnd}`;
}

function bracketMatchRowHtml(m) {
  const aLabel = m.teamA ? m.teamA.label : '?';
  const bLabel = m.teamB ? m.teamB.label : '?';
  const isMine = (m.teamA && m.teamA.isPlayer) || (m.teamB && m.teamB.isPlayer);
  const aWon = m.winner && m.winner === m.teamA;
  const bWon = m.winner && m.winner === m.teamB;
  let clickAttr = '';
  if (m.timeline) {
    const idx = window.__replayCache.length;
    window.__replayCache.push({ timeline: m.timeline, labelA: aLabel, labelB: bLabel, scoreText: m.scoreText || '' });
    clickAttr = ` onclick="showCachedReplay(${idx})" style="cursor:pointer;"`;
  }
  const scoreText = m.winner ? (m.scoreText || '') : (m.teamA && m.teamB ? 'w trakcie' : '');
  return `<div class="bracket-row${isMine ? ' bracket-row-mine' : ''}"${clickAttr}>
    <span class="bracket-row-team${aWon ? ' bracket-winner' : ''}">${aLabel}</span>
    <span class="bracket-row-score">${scoreText}</span>
    <span class="bracket-row-team${bWon ? ' bracket-winner' : ''}">${bLabel}</span>
  </div>`;
}

// ── ADAPTER 1: klasyczna drabinka (tablica rund) ────────────
function buildNestedBracketFromClassic(rounds, roundNames) {
  if (!rounds || !rounds.length) return '';
  return rounds.map((round, idx) => {
    const label = roundNames[idx] || `Runda ${idx + 1}`;
    const rows = round.map(bracketMatchRowHtml).join('');
    const isOpen = idx === rounds.length - 1 || round.some(m => !m.winner);
    return `<details class="bracket-round-details"${isOpen ? ' open' : ''}><summary>${label}</summary>${rows}</details>`;
  }).join('');
}

// ── ADAPTER 2: "główna ścieżka do mistrza" z drzewa pełnej klasyfikacji
// (rankBands) — schodzimy tylko w .upper, ignorując gałęzie w dół.
function buildRoundsFromMainPath(root) {
  const rounds = [];
  let node = root;
  while (node && node.size > 1 && node.matches) {
    rounds.push({ matches: node.matches, label: bandLabelFor(node) });
    node = node.upper;
  }
  return rounds;
}

function buildNestedBracketFromMainPath(root) {
  const rounds = buildRoundsFromMainPath(root);
  if (!rounds.length) return '';
  return rounds.map((round, idx) => {
    const rows = round.matches.map(bracketMatchRowHtml).join('');
    const isOpen = idx === rounds.length - 1 || round.matches.some(m => !m.winner);
    return `<details class="bracket-round-details"${isOpen ? ' open' : ''}><summary>${round.label}</summary>${rows}</details>`;
  }).join('');
}

// ── RENDERER — wspólny ────────────────────────────────────
function renderBracketDiagram(containerId, nestedHtml) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = nestedHtml
    ? `<div class="bracket-scroll">${nestedHtml}</div>`
    : '<div style="color:var(--gray);padding:8px;">Drabinka jeszcze nie istnieje.</div>';
}
