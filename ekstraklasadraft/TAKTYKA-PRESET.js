// ============================================================
// TAKTYKA-PRESET.JS — ustawienie STARTOWE suwaków taktycznych, wybierane
// raz w "ZARZĄDZAJ ZESPOŁEM" → TAKTYKA, stosowane automatycznie na
// początku KAŻDEGO kolejnego meczu (resetMatchScreen w MECZ-UI.js woła
// applyTacticsPreset()). W trakcie samego meczu suwaki nadal działają
// dokładnie tak jak dotąd — to tylko punkt startowy, nie ograniczenie.
// ============================================================

const TACTIC_PRESET_DEFAULT = { mentality: 0, podania: 0, agresja: 0, intensity: 0, busParking: false, stoperAtak: false };

function ensureTacticsPreset() {
  if (!state.tacticsPreset) state.tacticsPreset = { ...TACTIC_PRESET_DEFAULT };
}

// Wypełnia suwaki w zakładce TAKTYKA aktualnym presetem — wołane przy
// wejściu w tę zakładkę.
function renderTacticsPresetTab() {
  ensureTacticsPreset();
  const p = state.tacticsPreset;
  document.getElementById('preset-mentality-slider').value = p.mentality;
  document.getElementById('preset-podania-slider').value = p.podania;
  document.getElementById('preset-agresja-slider').value = p.agresja;
  document.getElementById('preset-intensity-slider').value = p.intensity;
  document.getElementById('preset-tg-busparking').classList.toggle('active', !!p.busParking);
  document.getElementById('preset-tg-stoper-atak').classList.toggle('active', !!p.stoperAtak);
  updatePresetMentalityLabel();
}

function updatePresetMentalityLabel() {
  const v = parseInt(document.getElementById('preset-mentality-slider').value, 10) || 0;
  const label = document.getElementById('preset-mentality-slider-label');
  const name = v === 0 ? 'NEUTRALNA' : v > 0 ? 'OFENSYWNA' : 'DEFENSYWNA';
  label.textContent = v === 0 ? 'NEUTRALNA (0)' : `${name} (+${Math.abs(v)})`;
}

// Wołane przy KAŻDEJ zmianie któregokolwiek suwaka presetu — zapisuje od
// razu do state.tacticsPreset (nie ma osobnego przycisku "zapisz").
function onPresetTacticChange() {
  ensureTacticsPreset();
  state.tacticsPreset.mentality = parseInt(document.getElementById('preset-mentality-slider').value, 10) || 0;
  state.tacticsPreset.podania = parseInt(document.getElementById('preset-podania-slider').value, 10) || 0;
  state.tacticsPreset.agresja = parseInt(document.getElementById('preset-agresja-slider').value, 10) || 0;
  state.tacticsPreset.intensity = parseInt(document.getElementById('preset-intensity-slider').value, 10) || 0;
  updatePresetMentalityLabel();
}

function togglePresetTactic(id) {
  ensureTacticsPreset();
  const el = document.getElementById(id);
  el.classList.toggle('active');
  const active = el.classList.contains('active');
  if (id === 'preset-tg-busparking') state.tacticsPreset.busParking = active;
  if (id === 'preset-tg-stoper-atak') state.tacticsPreset.stoperAtak = active;
}

// Stosuje zapisany preset NA POCZĄTKU meczu — wołane z resetMatchScreen()
// w MECZ-UI.js, zanim gracz zacznie cokolwiek klikać. Ustawia te same
// suwaki/przełączniki, których używa mecz na żywo (readTactics() czyta
// je z DOM-u dokładnie tak jak dotąd — ta funkcja tylko wypełnia je z
// góry, zamiast zostawiać wartości z poprzedniego meczu).
function applyTacticsPreset() {
  ensureTacticsPreset();
  const p = state.tacticsPreset;
  const mentalitySlider = document.getElementById('mentality-slider');
  const podaniaSlider = document.getElementById('podania-slider');
  const agresjaSlider = document.getElementById('agresja-slider');
  const intensitySlider = document.getElementById('intensity-slider');
  if (mentalitySlider) { mentalitySlider.value = p.mentality; if (typeof onMentalityChange === 'function') onMentalityChange(p.mentality); }
  if (podaniaSlider) podaniaSlider.value = p.podania;
  if (agresjaSlider) agresjaSlider.value = p.agresja;
  if (intensitySlider) intensitySlider.value = p.intensity;
  const busBtn = document.getElementById('tg-busparking');
  const stoperBtn = document.getElementById('tg-stoper-atak');
  if (busBtn) busBtn.classList.toggle('active', !!p.busParking);
  if (stoperBtn) stoperBtn.classList.toggle('active', !!p.stoperAtak);
}
