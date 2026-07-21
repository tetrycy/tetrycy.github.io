// ============================================================
// FORMACJE.JS — wybór formacji, wpływa na układ na boisku w zakładce
// PRZEGLĄD ekranu "ZARZĄDZAJ ZESPOŁEM".
//
// WAŻNE OGRANICZENIE (świadome, nie przeoczenie): draft ZAWSZE daje
// dokładnie 1 GK + 4 DEF + 4 MID + 2 FWD w jedenastce (i 1+2+2+1 na
// ławce) — to fundament całego systemu draftu i silnika (lineAverages,
// kontuzje, zmiany itd.). Prawdziwa "3-5-2" czy "4-3-3" (inna LICZBA
// obrońców/pomocników/napastników) wymagałaby przebudowy tego fundamentu
// od podstaw — to osobna, duża rozmowa, nie coś do zrobienia przy okazji.
//
// Na razie FORMACJE to warianty WIZUALNEGO ukształtowania tych samych
// 4 DEF / 4 MID / 2 FWD na boisku (klasyczne 4-4-2, diament pomocy,
// szerokie skrzydła) — żeby przegląd składu wyglądał różnorodnie i dawał
// poczucie kontroli nad ustawieniem, uczciwie bez udawania czegoś, czym
// to jeszcze nie jest.
// ============================================================

const FORMATIONS = {
  'klasyczna': {
    label: '4-4-2 Klasyczna',
    coords: {
      DEF_1: { x: 15, y: 72 }, DEF_2: { x: 38, y: 72 }, DEF_3: { x: 62, y: 72 }, DEF_4: { x: 85, y: 72 },
      MID_1: { x: 15, y: 50 }, MID_2: { x: 38, y: 50 }, MID_3: { x: 62, y: 50 }, MID_4: { x: 85, y: 50 },
      FWD_1: { x: 35, y: 22 }, FWD_2: { x: 65, y: 22 },
    },
  },
  'diament': {
    label: '4-4-2 Diament pomocy',
    coords: {
      DEF_1: { x: 15, y: 74 }, DEF_2: { x: 38, y: 76 }, DEF_3: { x: 62, y: 76 }, DEF_4: { x: 85, y: 74 },
      MID_1: { x: 50, y: 62 }, MID_2: { x: 22, y: 48 }, MID_3: { x: 78, y: 48 }, MID_4: { x: 50, y: 34 },
      FWD_1: { x: 35, y: 18 }, FWD_2: { x: 65, y: 18 },
    },
  },
  'szerokie': {
    label: '4-4-2 Szerokie skrzydła',
    coords: {
      DEF_1: { x: 12, y: 70 }, DEF_2: { x: 38, y: 74 }, DEF_3: { x: 62, y: 74 }, DEF_4: { x: 88, y: 70 },
      MID_1: { x: 6,  y: 46 }, MID_2: { x: 38, y: 52 }, MID_3: { x: 62, y: 52 }, MID_4: { x: 94, y: 46 },
      FWD_1: { x: 38, y: 20 }, FWD_2: { x: 62, y: 20 },
    },
  },
};

// Zwraca pełny układ (GK i FWD z SLOTS bez zmian — formacja dotyczy
// głównie linii obrony/pomocy) dla aktualnie wybranej formacji.
function getFormationLayout() {
  const key = state.formation || 'klasyczna';
  const coords = (FORMATIONS[key] || FORMATIONS.klasyczna).coords;
  const layout = {};
  SLOTS.forEach(slot => { layout[slot.id] = coords[slot.id] || { x: slot.x, y: slot.y }; });
  return layout;
}

function selectFormation(key) {
  state.formation = key;
  renderFormationPicker();
  if (state.currentScreenId === 'screen-manage-squad' && state.squadActiveTab === 'overview') renderSquadOverviewTab();
}

function renderFormationPicker() {
  const el = document.getElementById('formation-picker');
  if (!el) return;
  const current = state.formation || 'klasyczna';
  el.innerHTML = Object.keys(FORMATIONS).map(key =>
    `<button class="btn btn-sm${key === current ? ' btn-gold' : ''}" onclick="selectFormation('${key}')">${FORMATIONS[key].label}</button>`
  ).join('');
  if (typeof renderPitchDots === 'function') renderPitchDots('formation-preview-pitch', getFormationLayout(), false);
}
