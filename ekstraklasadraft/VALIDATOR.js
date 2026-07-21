// ============================================================
// VALIDATOR.JS — walidator integralności bazy danych.
// ============================================================


function runValidator() {
  const VALID_POS = ['GK','DEF','MID','FWD'];
  const lines = [];
  let errors = 0, warnings = 0;

  lines.push(`<span style="color:var(--accent)">Sprawdzam ${TEAMS_DATA.length} sezonów...</span><br>`);

  TEAMS_DATA.forEach(team => {
    const tag = `${team.club} ${team.season}`;
    const starters = team.players.filter(p => p.starting);
    const counts = { GK:0, DEF:0, MID:0, FWD:0 };
    let localErr = 0;

    team.players.forEach(p => {
      if (!VALID_POS.includes(p.position)) {
        lines.push(`<span class="val-err">✗ ${tag} — ${p.name}: nieznana pozycja "${p.position}"</span>`);
        errors++; localErr++;
      }
      if (!p.name) { lines.push(`<span class="val-err">✗ ${tag} — zawodnik bez nazwiska</span>`); errors++; localErr++; }
      if (isNaN(p.overall) || p.overall < 1 || p.overall > 99) {
        lines.push(`<span class="val-err">✗ ${tag} — ${p.name}: overall poza zakresem (${p.overall})</span>`);
        errors++; localErr++;
      }
    });

    starters.forEach(p => { if (counts[p.position] !== undefined) counts[p.position]++; });

    if (counts.GK  !== 1) { lines.push(`<span class="val-err">✗ ${tag} — bramkarzy w składzie: ${counts.GK} (wymagany 1)</span>`); errors++; localErr++; }
    if (counts.DEF !== 4) { lines.push(`<span class="val-warn">⚠ ${tag} — obrońców w składzie: ${counts.DEF} (wymaganych 4)</span>`); warnings++; }
    if (counts.MID !== 4) { lines.push(`<span class="val-warn">⚠ ${tag} — pomocników w składzie: ${counts.MID} (wymaganych 4)</span>`); warnings++; }
    if (counts.FWD !== 2) { lines.push(`<span class="val-warn">⚠ ${tag} — napastników w składzie: ${counts.FWD} (wymaganych 2)</span>`); warnings++; }

    if (localErr === 0) {
      lines.push(`<span class="val-ok">✓ ${tag} (${starters.length} start + ${team.players.length - starters.length} rez.)</span>`);
    }
  });

  lines.push(`<br><strong>
    ${errors === 0 ? '<span class="val-ok">BRAK BŁĘDÓW</span>' : `<span class="val-err">${errors} BŁĘDÓW</span>`}
    · ${warnings > 0 ? `<span class="val-warn">${warnings} ostrzeżeń</span>` : '0 ostrzeżeń'}
  </strong>`);

  document.getElementById('validator-output').innerHTML = lines.join('<br>');
}
