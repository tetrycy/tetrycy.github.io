// ============================================================
// PROFILE.JS — profil zawodnika i profil trenera (jak w FM/CM).
//
// Wydzielone do osobnego pliku, bo to jest jawnie pomyślane jako
// ARCHITEKTURA POD PRZYSZŁĄ ROZBUDOWĘ — na razie pokazuje tylko
// podstawowe pola (nazwisko, overall, pozycja, wiek, klub u zawodnika;
// nazwisko i cechy u trenera), ale kolejne pola (występy, gole, historia,
// statystyki trenerskie itd.) mają tu naturalne miejsce, bez szukania
// ich w ZESPOL.js/TRAITS.js.
//
// WAŻNE O KOLEJNOŚCI WCZYTYWANIA: ten plik musi być wczytany PO TRAITS.js
// (korzysta z getMyCoachTraits()) i PO DRAFT.js (korzysta z POS_PL).
// ============================================================

// ── PROFIL ZAWODNIKA ────────────────────────────────────────
function openPlayerProfile(slotId) {
  const p = state.squad[slotId];
  if (!p) return;
  state.playerProfileReturnScreen = state.currentScreenId || 'screen-manage-squad';
  document.getElementById('player-profile-name').textContent = p.name;
  document.getElementById('player-profile-ovr-badge').textContent = `OVR ${p.overall}`;
  const fields = [
    ['Pozycja', POS_PL[p.pos] || p.pos],
    ['Wiek', `${getPlayerAge(p)} lat`],
    ['Klub', p.club || '—'],
  ];
  const traits = (p.traits || []).map(k => (typeof playerTraitLabel === 'function' ? playerTraitLabel(k) : k));
  if (traits.length) fields.push(['Cechy', traits.join(', ')]);
  document.getElementById('player-profile-fields').innerHTML = fields
    .map(([label, value]) => `<div><b style="color:var(--fg);">${label}:</b> ${value}</div>`)
    .join('');
  showScreen('screen-player-profile');
}

function returnFromPlayerProfile() {
  showScreen(state.playerProfileReturnScreen || 'screen-manage-squad');
}

// ── PROFIL TRENERA ──────────────────────────────────────────
// Czytelny, polski opis pojedynczej (już rozwiniętej) cechy trenerskiej —
// żeby "traits" nie były surowymi kodami w oczach gracza.
function traitDisplayLabel(t) {
  const CATEGORY_PL = { possession: 'grę pozycyjną', sfg: 'stałe fragmenty gry', ind: 'grę indywidualną', counter: 'kontratak' };
  const LINE_PL = { DEF: 'obrony', MID: 'pomocy', FWD: 'ataku' };
  switch (t.type) {
    case 'categoryBoost': return `Specjalista od: ${CATEGORY_PL[t.category] || t.category}`;
    case 'subtypeBoost': return `Specjalista od: ${t.label}`;
    case 'refereeFavorite': return 'Ulubieniec sędziów (rzadsze kartki dla nas)';
    case 'provocateur': return 'Prowokator (częstsze czerwone kartki rywali)';
    case 'bloodOnBoots': return 'Twardziel (osłabia rywali, ale ryzykuje czerwone kartki)';
    case 'replayMatch': return 'Może raz na mecz zażądać powtórki';
    case 'lineBoost': return `${t.amount >= 0 ? '+' : ''}${t.amount} do linii ${LINE_PL[t.line] || t.line}`;
    default: return 'Nieznana cecha';
  }
}

function openCoachProfile() {
  state.coachProfileReturnScreen = state.currentScreenId || 'screen-manage-squad';
  document.getElementById('coach-profile-name').textContent = (state.coach && state.coach.name) || 'Nieznany Trener';
  const traits = getMyCoachTraits();
  const el = document.getElementById('coach-profile-traits');
  el.innerHTML = traits.length
    ? traits.map(t => `<div>• ${traitDisplayLabel(t)}</div>`).join('')
    : '<div style="color:var(--gray);">Ten trener nie ma żadnych szczególnych specjalności.</div>';
  showScreen('screen-coach-profile');
}

function returnFromCoachProfile() {
  showScreen(state.coachProfileReturnScreen || 'screen-manage-squad');
}
