// ============================================================
// KLUBY-KOLORY.JS — barwy klubowe, używane do kolorowania nazw
// drużyn i neutralnych/fabularnych linijek komentarza.
//
// Każdy klub ma DWA komplety barw:
//   home — barwy podstawowe (zawsze używane, chyba że kolizja)
//   away — osobny, wyraźnie inny komplet, używany TYLKO gdy barwy
//          'home' obu drużyn w meczu są zbyt podobne (wykrywane
//          automatycznie przez silnik, patrz getClubKitColors()).
//
// Format: kod HEX, np. '#C8102E'. Jeśli nie znasz jeszcze barw,
// zostaw null — silnik potraktuje to bezpiecznie jako 'brak kolizji'.
// ============================================================

window.CLUB_COLORS = window.CLUB_COLORS || {};

window.CLUB_COLORS["Amica Wronki"] = {
  home: { primary: "#9B5DE5", secondary: "#FFFFFF" },
  away: { primary: "#E63946", secondary: "#000000" },
};
window.CLUB_COLORS["Arka Gdynia"] = {
  home: { primary: "#FDE100", secondary: "#0057B8" },
  away: { primary: "#0057B8", secondary: "#FDE100" },
};
window.CLUB_COLORS["Cracovia Kraków"] = {
  home: { primary: "#FFFFFF", secondary: "#C8102E" },
  away: { primary: "#000000", secondary: "#C8102E" },
};
window.CLUB_COLORS["GKS Bełchatów"] = {
  home: { primary: "#008751", secondary: "#FDE100" },
  away: { primary: "#FFFFFF", secondary: "#000000" },
};
window.CLUB_COLORS["GKS Katowice"] = {
  home: { primary: "#FDE100", secondary: "#008751" },
  away: { primary: "#000000", secondary: "#FDE100" },
};
window.CLUB_COLORS["Groclin Grodzisk Wielkopolski"] = {
  home: { primary: "#008751", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#008751" },
};
window.CLUB_COLORS["Groclin Grodzisk Wlkp."] = {
  home: { primary: "#008751", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#008751" },
};
window.CLUB_COLORS["Górnik Polkowice"] = {
  home: { primary: "#BC6C25", secondary: "#000000" },
  away: { primary: "#E63946", secondary: "#FFFFFF" },
};
window.CLUB_COLORS["Górnik Wałbrzych"] = {
  home: { primary: "#00BBF9", secondary: "#FFFFFF" },
  away: { primary: "#0057B8", secondary: "#FFFFFF" },
};
window.CLUB_COLORS["Górnik Zabrze"] = {
  home: { primary: "#0057B8", secondary: "#C8102E" },
  away: { primary: "#FFFFFF", secondary: "#000000" },
};
window.CLUB_COLORS["Górnik Łęczna"] = {
  home: { primary: "#283618", secondary: "#000000" },
  away: { primary: "#FEE440", secondary: "#008751" },
};
window.CLUB_COLORS["Hutnik Kraków"] = {
  home: { primary: "#457B9D", secondary: "#FFFFFF" },
  away: { primary: "#023047", secondary: "#FFFFFF" },
};
window.CLUB_COLORS["Igloopol Dębica"] = {
  home: { primary: "#FFFFFF", secondary: "#0057B8" },
  away: { primary: "#00BBF9", secondary: "#C8102E" },
};
window.CLUB_COLORS["Jagiellonia Białystok"] = {
  home: { primary: "#B8860B", secondary: "#C8102E" },
  away: { primary: "#000000", secondary: "#C8102E" },
};
window.CLUB_COLORS["KSZO Ostrowiec Świętokrzyski"] = {
  home: { primary: "#F4A261", secondary: "#000000" },
  away: { primary: "#DDA15E", secondary: "#FFFFFF" },
};
window.CLUB_COLORS["Korona Kielce"] = {
  home: { primary: "#FFD700", secondary: "#C8102E" },
  away: { primary: "#C8102E", secondary: "#FFD700" },
};
window.CLUB_COLORS["Lech Poznań"] = {
  home: { primary: "#003399", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#003399" },
};
window.CLUB_COLORS["Lechia Gdańsk"] = {
  home: { primary: "#008751", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#008751" },
};
window.CLUB_COLORS["Legia Warszawa"] = {
  home: { primary: "#4A7729", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#4A7729" },
};
window.CLUB_COLORS["Miedź Legnica"] = {
  home: { primary: "#008751", secondary: "#0057B8" },
  away: { primary: "#C8102E", secondary: "#008751" },
};
window.CLUB_COLORS["Motor Lublin"] = {
  home: { primary: "#0057B8", secondary: "#C8102E" },
  away: { primary: "#FDE100", secondary: "#0057B8" },
};
window.CLUB_COLORS["Odra Wodzisław"] = {
  home: { primary: "#00BBF9", secondary: "#C8102E" },
  away: { primary: "#FDE100", secondary: "#0057B8" },
};
window.CLUB_COLORS["Olimpia Poznań"] = {
  home: { primary: "#FEE440", secondary: "#000000" },
  away: { primary: "#A8DADC", secondary: "#FFFFFF" },
};
window.CLUB_COLORS["Orlen Płock"] = {
  home: { primary: "#C8102E", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#C8102E" },
};
window.CLUB_COLORS["Petrochemia Płock"] = {
  home: { primary: "#0057B8", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#0057B8" },
};
window.CLUB_COLORS["Piast Gliwice"] = {
  home: { primary: "#002F87", secondary: "#8B0000" },
  away: { primary: "#C8102E", secondary: "#0057B8" },
};
window.CLUB_COLORS["Podbeskidzie Bielsko-Biała"] = {
  home: { primary: "#00BBF9", secondary: "#FFFFFF" },
  away: { primary: "#C8102E", secondary: "#0057B8" },
};
window.CLUB_COLORS["Pogoń Szczecin"] = {
  home: { primary: "#1D3557", secondary: "#8E1F2F" },
  away: { primary: "#8E1F2F", secondary: "#1D3557" },
};
window.CLUB_COLORS["Polonia Bytom"] = {
  home: { primary: "#0057B8", secondary: "#C8102E" },
  away: { primary: "#C8102E", secondary: "#0057B8" },
};
window.CLUB_COLORS["Polonia Warszawa"] = {
  home: { primary: "#000000", secondary: "#FFFFFF" },
  away: { primary: "#C8102E", secondary: "#000000" },
};
window.CLUB_COLORS["Puszcza Niepołomice"] = {
  home: { primary: "#0057B8", secondary: "#008751" },
  away: { primary: "#C8102E", secondary: "#FFFFFF" },
};
window.CLUB_COLORS["RKS Radomsko"] = {
  home: { primary: "#0057B8", secondary: "#FDE100" },
  away: { primary: "#FDE100", secondary: "#0057B8" },
};
window.CLUB_COLORS["Radomiak Radom"] = {
  home: { primary: "#008751", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#008751" },
};
window.CLUB_COLORS["Raków Częstochowa"] = {
  home: { primary: "#C8102E", secondary: "#0057B8" },
  away: { primary: "#0057B8", secondary: "#C8102E" },
};
window.CLUB_COLORS["Ruch Chorzów"] = {
  home: { primary: "#0057B8", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#0057B8" },
};
window.CLUB_COLORS["Ruch Radzionków"] = {
  home: { primary: "#FDE100", secondary: "#000000" },
  away: { primary: "#000000", secondary: "#FDE100" },
};
window.CLUB_COLORS["Sandecja Nowy Sącz"] = {
  home: { primary: "#FFFFFF", secondary: "#000000" },
  away: { primary: "#000000", secondary: "#FFFFFF" },
};
window.CLUB_COLORS["Siarka Tarnobrzeg"] = {
  home: { primary: "#FDE100", secondary: "#000000" },
  away: { primary: "#000000", secondary: "#FDE100" },
};
window.CLUB_COLORS["Sokół Pniewy"] = {
  home: { primary: "#0057B8", secondary: "#C8102E" },
  away: { primary: "#FB8500", secondary: "#FFFFFF" },
};
window.CLUB_COLORS["Sokół Tychy"] = {
  home: { primary: "#1D3557", secondary: "#000000" },
  away: { primary: "#A8DADC", secondary: "#FFFFFF" },
};
window.CLUB_COLORS["Stal Mielec"] = {
  home: { primary: "#457B9D", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#00BBF9" },
};
window.CLUB_COLORS["Stal Stalowa Wola"] = {
  home: { primary: "#008751", secondary: "#000000" },
  away: { primary: "#000000", secondary: "#008751" },
};
window.CLUB_COLORS["Stomil Olsztyn"] = {
  home: { primary: "#8ECAE6", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#8ECAE6" },
};
window.CLUB_COLORS["Szczakowianka Jaworzno"] = {
  home: { primary: "#C8102E", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#C8102E" },
};
window.CLUB_COLORS["Szombierki Bytom"] = {
  home: { primary: "#008751", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#008751" },
};
window.CLUB_COLORS["Termalica Bruk-Bet Nieciecza"] = {
  home: { primary: "#FB8500", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#FB8500" },
};
window.CLUB_COLORS["Warta Poznań"] = {
  home: { primary: "#008751", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#008751" },
};
window.CLUB_COLORS["Widzew Łódź"] = {
  home: { primary: "#C8102E", secondary: "#FFFFFF" },
  away: { primary: "#FFD700", secondary: "#000000" },
};
window.CLUB_COLORS["Wisła Kraków"] = {
  home: { primary: "#8B0000", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#8B0000" },
};
window.CLUB_COLORS["Wisła Płock"] = {
  home: { primary: "#0057B8", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#00BBF9" },
};
window.CLUB_COLORS["Zagłębie Lubin"] = {
  home: { primary: "#FB8500", secondary: "#FFFFFF" },
  away: { primary: "#000000", secondary: "#FB8500" },
};
window.CLUB_COLORS["Zagłębie Sosnowiec"] = {
  home: { primary: "#283618", secondary: "#C8102E" },
  away: { primary: "#C8102E", secondary: "#008751" },
};
window.CLUB_COLORS["Zawisza Bydgoszcz"] = {
  home: { primary: "#1D3557", secondary: "#C8102E" },
  away: { primary: "#1D3557", secondary: "#FFFFFF" },
};
window.CLUB_COLORS["ŁKS Łódź"] = {
  home: { primary: "#FFFFFF", secondary: "#C8102E" },
  away: { primary: "#E63946", secondary: "#FFFFFF" },
};
window.CLUB_COLORS["Śląsk Wrocław"] = {
  home: { primary: "#008751", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#008751" },
};
window.CLUB_COLORS["Świt Nowy Dwór Mazowiecki"] = {
  home: { primary: "#FFFFFF", secondary: "#606C38" },
  away: { primary: "#606C38", secondary: "#FFFFFF" },
};

// ---- Rywale zagraniczni z trybu WYZWANIA ----
window.CLUB_COLORS["AC Parma"] = {
  home: { primary: "#457B9D", secondary: "#000000" },
  away: { primary: "#8AB17D", secondary: "#FFFFFF" },
};
window.CLUB_COLORS["AJ Auxerre"] = {
  home: { primary: "#F1FAEE", secondary: "#FFFFFF" },
  away: { primary: "#BC6C25", secondary: "#FFFFFF" },
};
window.CLUB_COLORS["AS Roma"] = {
  home: { primary: "#8E1F2F", secondary: "#FFD700" },
  away: { primary: "#FFD700", secondary: "#8E1F2F" },
};
window.CLUB_COLORS["Ajax Amsterdam"] = {
  home: { primary: "#D2122E", secondary: "#FFFFFF" },
  away: { primary: "#000000", secondary: "#FFFFFF" },
};
window.CLUB_COLORS["Atlético Madryt"] = {
  home: { primary: "#CB3524", secondary: "#FFFFFF" },
  away: { primary: "#003399", secondary: "#FFFFFF" },
};
window.CLUB_COLORS["Beşiktaş"] = {
  home: { primary: "#000000", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#000000" },
};
window.CLUB_COLORS["Borussia Dortmund"] = {
  home: { primary: "#FDE100", secondary: "#000000" },
  away: { primary: "#000000", secondary: "#FDE100" },
};
window.CLUB_COLORS["Brøndby IF"] = {
  home: { primary: "#A8DADC", secondary: "#000000" },
  away: { primary: "#A8DADC", secondary: "#FFFFFF" },
};
window.CLUB_COLORS["Celtic FC"] = {
  home: { primary: "#008751", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#008751" },
};
window.CLUB_COLORS["FC Porto"] = {
  home: { primary: "#0033A0", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#0033A0" },
};
window.CLUB_COLORS["Glasgow Rangers"] = {
  home: { primary: "#003399", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#003399" },
};
window.CLUB_COLORS["Glentoran FC"] = {
  home: { primary: "#1D3557", secondary: "#000000" },
  away: { primary: "#DDA15E", secondary: "#FFFFFF" },
};
window.CLUB_COLORS["Juventus"] = {
  home: { primary: "#000000", secondary: "#FFFFFF" },
  away: { primary: "#FFD700", secondary: "#1D3557" },
};
window.CLUB_COLORS["Lazio Rzym"] = {
  home: { primary: "#87CEEB", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#87CEEB" },
};
window.CLUB_COLORS["Lewski Sofia"] = {
  home: { primary: "#264653", secondary: "#000000" },
  away: { primary: "#2A9D8F", secondary: "#FFFFFF" },
};
window.CLUB_COLORS["Manchester City"] = {
  home: { primary: "#00BBF9", secondary: "#FFFFFF" },
  away: { primary: "#1C2C5B", secondary: "#FFFFFF" },
};
window.CLUB_COLORS["Manchester United"] = {
  home: { primary: "#DA291C", secondary: "#FFFFFF" },
  away: { primary: "#000000", secondary: "#FFFFFF" },
};
window.CLUB_COLORS["NK Primorje"] = {
  home: { primary: "#00BBF9", secondary: "#000000" },
  away: { primary: "#023047", secondary: "#000000" },
};
window.CLUB_COLORS["Olympiakos"] = {
  home: { primary: "#D2122E", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#D2122E" },
};
window.CLUB_COLORS["Schalke 04 Gelsenkirchen"] = {
  home: { primary: "#004C9B", secondary: "#FFFFFF" },
  away: { primary: "#FFFFFF", secondary: "#004C9B" },
};
window.CLUB_COLORS["Steaua Bukareszt"] = {
  home: { primary: "#219EBC", secondary: "#000000" },
  away: { primary: "#457B9D", secondary: "#FFFFFF" },
};

// ============================================================
// SILNIK BARW — wykrywanie kolizji i wybór właściwego kompletu.
// ============================================================

function hexToRgb(hex) {
  if (!hex) return null;
  const h = hex.replace('#', '');
  if (h.length !== 6) return null;
  return { r: parseInt(h.substr(0, 2), 16), g: parseInt(h.substr(2, 2), 16), b: parseInt(h.substr(4, 2), 16) };
}

function colorDistance(hex1, hex2) {
  const c1 = hexToRgb(hex1), c2 = hexToRgb(hex2);
  if (!c1 || !c2) return 999; // brak danych o którymś kolorze — traktujemy jako "bezpiecznie różne"
  return Math.sqrt((c1.r - c2.r) ** 2 + (c1.g - c2.g) ** 2 + (c1.b - c2.b) ** 2);
}

const CLUB_COLOR_COLLISION_THRESHOLD = 100; // poniżej tej odległości barwy uznajemy za "zbyt podobne"

// Zwraca { my: {primary, secondary}, opp: {primary, secondary} } — właściwy
// komplet do użycia w TYM konkretnym meczu, z automatycznie rozwiązaną kolizją
// (jeśli barwy 'home' obu drużyn są zbyt podobne, rywal przechodzi na 'away').
function getClubKitColors(myClub, oppClub) {
  const fallback = { primary: null, secondary: null };
  const myData = window.CLUB_COLORS[myClub];
  const oppData = window.CLUB_COLORS[oppClub];
  const myHome = (myData && myData.home) || fallback;
  const oppHome = (oppData && oppData.home) || fallback;

  const dist = colorDistance(myHome.primary, oppHome.primary);
  if (dist < CLUB_COLOR_COLLISION_THRESHOLD) {
    const oppAway = (oppData && oppData.away) || fallback;
    return { my: myHome, opp: oppAway };
  }
  return { my: myHome, opp: oppHome };
}
