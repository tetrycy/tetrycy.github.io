// ============================================================
// SQUAD-HUB.JS — organizacja ekranu "ZARZĄDZAJ ZESPOŁEM" w zakładki:
// PRZEGLĄD (boisko, jak tuż po drafcie, klikalne profile), TRENING,
// SKŁAD NA MECZ (istniejąca logika z ZESPOL.js, bez zmian), FORMACJE
// (FORMACJE.js), TAKTYKA (TAKTYKA-PRESET.js).
//
// WAŻNE O KOLEJNOŚCI WCZYTYWANIA: musi być PO ZESPOL.js (korzysta z
// renderManageSquad/ensureStartingXI itd.), PO PROFILE.js (klikalne
// profile), PO TRENING.js (trainingSelectHtml/setPlayerTrainingLevel).
// ============================================================

const SQUAD_TABS = ['overview', 'training', 'lineup', 'formation', 'tactics'];

function switchSquadTab(tab) {
  state.squadActiveTab = tab;
  SQUAD_TABS.forEach(t => {
    const content = document.getElementById('squad-tab-' + t);
    if (content) content.style.display = (t === tab) ? 'block' : 'none';
    const btn = document.querySelector(`#squad-tab-bar [data-tab="${t}"]`);
    if (btn) btn.classList.toggle('btn-gold', t === tab);
  });
  if (tab === 'overview') renderSquadOverviewTab();
  if (tab === 'training') renderSquadTrainingTab();
  if (tab === 'lineup') renderManageSquad();
  if (tab === 'formation' && typeof renderFormationPicker === 'function') renderFormationPicker();
  if (tab === 'tactics' && typeof renderTacticsPresetTab === 'function') renderTacticsPresetTab();
}

// ── PRZEGLĄD — dokładnie ten sam wizualny styl co boisko z draftu
// (mini-pitch + ławka), tylko klikalne: zawodnik/trener → profil. ──
// Wspólne rysowanie boiska z kulkami zawodników wg podanego układu (x/y) —
// używane zarówno w PRZEGLĄD (klikalne, otwierają profil), jak i w
// podglądzie FORMACJI (tylko wizualne, bez klikania).
function renderPitchDots(containerId, layout, clickable) {
  const pitch = document.getElementById(containerId);
  if (!pitch) return;
  pitch.innerHTML = '';
  SLOTS.forEach(slot => {
    const player = state.squad[slot.id];
    const pos = layout && layout[slot.id] ? layout[slot.id] : slot;
    const div = document.createElement('div');
    div.className = 'pitch-player';
    div.style.left = pos.x + '%';
    div.style.top = pos.y + '%';
    div.style.cursor = (clickable && player) ? 'pointer' : 'default';
    const dotClass = player ? 'filled' : 'empty';
    const dotLabel = player ? (player.overall >= 88 ? '★' : '') : '';
    div.innerHTML = `
      <div class="pitch-dot ${dotClass}">${dotLabel}</div>
      <div class="pitch-name">${player ? player.name.split(' ').slice(-1)[0] : ''}</div>
    `;
    if (clickable && player) div.addEventListener('click', () => openPlayerProfile(slot.id));
    pitch.appendChild(div);
  });
}

function renderSquadOverviewTab() {
  const layout = (typeof getFormationLayout === 'function') ? getFormationLayout() : null;
  renderPitchDots('squad-overview-pitch', layout, true);

  const bench = document.getElementById('squad-overview-bench');
  bench.innerHTML = '';
  RESERVE_SLOTS.map(s => s.id).forEach(id => {
    const player = state.squad[id];
    const wrap = document.createElement('div');
    wrap.className = 'bench-dot-wrap';
    wrap.style.cursor = player ? 'pointer' : 'default';
    const dotClass = player ? 'filled' : 'empty';
    wrap.innerHTML = `
      <div class="bench-dot ${dotClass}"></div>
      <div class="bench-name">${player ? player.name : '—'}</div>
    `;
    if (player) wrap.addEventListener('click', () => openPlayerProfile(id));
    bench.appendChild(wrap);
  });
  const coachWrap = document.createElement('div');
  coachWrap.className = 'bench-dot-wrap';
  coachWrap.style.cursor = 'pointer';
  coachWrap.innerHTML = `
    <div class="bench-dot coach filled">T</div>
    <div class="bench-name">${state.coach ? state.coach.name : '?'}</div>
  `;
  coachWrap.addEventListener('click', () => openCoachProfile());
  bench.appendChild(coachWrap);
}

// ── TRENING — cała kadra (jedenastka + ławka + poza składem), tylko
// nazwisko/pozycja + selektor treningu — bez reszty (zamiany itd.). ──
function renderSquadTrainingTab() {
  const el = document.getElementById('squad-training-list');
  const allIds = [...state.startingXI, ...state.benchIds, ...Object.keys(state.squad)]
    .filter((id, i, arr) => state.squad[id] && arr.indexOf(id) === i);
  el.innerHTML = '';
  allIds.forEach(id => {
    const p = state.squad[id];
    const row = document.createElement('div');
    row.className = 'lineup-row';
    row.innerHTML = `
      <span class="lineup-pos">${POS_PL[p.pos] || p.pos}</span>
      <span class="lineup-name" style="cursor:pointer;text-decoration:underline;">${p.name}</span>
      <span class="lineup-ovr c-${ovrClass(p.overall)}">${p.overall}</span>
      ${trainingSelectHtml(id)}
    `;
    row.querySelector('.lineup-name').addEventListener('click', () => openPlayerProfile(id));
    const trainingSel = row.querySelector('.training-select');
    if (trainingSel) trainingSel.addEventListener('change', e => setPlayerTrainingLevel(id, e.target.value));
    el.appendChild(row);
  });
}
