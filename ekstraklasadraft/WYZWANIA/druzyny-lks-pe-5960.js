// ============================================================
// RYWALE ŁKS ŁÓDŹ W PUCHARZE EUROPY 1959/60.
// Dane składów uzupełnione na podstawie list podanych w rozmowie.
//
// WAŻNE:
// OVR drużyny custom jest liczony przez silnik jako średnia zawodników
// starting: true. Dlatego pierwsze jedenastki są ustawione tak, żeby
// dokładnie dawały ustalony poziom drużyny:
// - Jeunesse Esch: 72
// - Real Madryt: 99
// - FC Barcelona: 95
// - Eintracht Frankfurt: 87
// ============================================================

window.WYZWANIA_TEAMS_DATA = window.WYZWANIA_TEAMS_DATA || [];
window.WYZWANIA_TEAMS_DATA.push(
  {
    id: 'jeunesse-esch-5960',
    club: 'Jeunesse Esch',
    context: 'ŁKS Łódź w Pucharze Europy 1959/60 — pierwszy rywal',
    coach: 'George Berry',
    // Suma starting XI: 792 / 11 = 72.00 → OVR 72
    players: [
      { name: 'Steffen',  position: 'GK',  overall: 72, starting: true },
      { name: 'Denis',    position: 'DEF', overall: 71, starting: true },
      { name: 'Mond',     position: 'DEF', overall: 71, starting: true },
      { name: 'Ruffini',  position: 'DEF', overall: 72, starting: true },
      { name: 'Pascucci', position: 'DEF', overall: 73, starting: true },
      { name: 'Heinen',   position: 'MID', overall: 72, starting: true },
      { name: 'Meurisse', position: 'MID', overall: 72, starting: true },
      { name: 'May',      position: 'MID', overall: 72, starting: true },
      { name: 'Jann',     position: 'FWD', overall: 72, starting: true },
      { name: 'Theis',    position: 'FWD', overall: 73, starting: true },
      { name: 'Schaack',  position: 'FWD', overall: 72, starting: true },
    ],
  },
  {
    id: 'real-madryt-5960',
    club: 'Real Madryt',
    context: 'ŁKS Łódź w Pucharze Europy 1959/60 — drugi rywal',
    coach: 'Miguel Muñoz',
    // Suma starting XI: 1089 / 11 = 99.00 → OVR 99
    players: [
      { name: 'Rogelio Domínguez',  position: 'GK',  overall: 99, starting: true },
      { name: 'Marquitos',          position: 'DEF', overall: 99, starting: true },
      { name: 'Pachín',             position: 'DEF', overall: 99, starting: true },
      { name: 'José Santamaría',    position: 'DEF', overall: 99, starting: true },
      { name: 'José María Vidal',   position: 'MID', overall: 99, starting: true },
      { name: 'José María Zárraga', position: 'MID', overall: 99, starting: true },
      { name: 'Canário',            position: 'FWD', overall: 99, starting: true },
      { name: 'Luis del Sol',       position: 'MID', overall: 99, starting: true },
      { name: 'Alfredo Di Stéfano', position: 'FWD', overall: 99, starting: true },
      { name: 'Ferenc Puskás',      position: 'FWD', overall: 99, starting: true },
      { name: 'Paco Gento',         position: 'FWD', overall: 99, starting: true },
    ],
  },
  {
    id: 'fc-barcelona-5960',
    club: 'FC Barcelona',
    context: 'ŁKS Łódź w Pucharze Europy 1959/60 — trzeci rywal',
    coach: 'Helenio Herrera',
    // Suma starting XI: 1045 / 11 = 95.00 → OVR 95
    players: [
      { name: 'Antoni Ramallets', position: 'GK',  overall: 95, starting: true },
      { name: 'Flotats',          position: 'DEF', overall: 94, starting: true },
      { name: 'Rodri',            position: 'DEF', overall: 95, starting: true },
      { name: 'Gracia',           position: 'DEF', overall: 94, starting: true },
      { name: 'Joan Segarra',     position: 'DEF', overall: 96, starting: true },
      { name: 'Gensana',          position: 'MID', overall: 95, starting: true },
      { name: 'Coll',             position: 'FWD', overall: 94, starting: true },
      { name: 'Sándor Kocsis',    position: 'FWD', overall: 96, starting: true },
      { name: 'Martínez',         position: 'FWD', overall: 94, starting: true },
      { name: 'Luis Suárez',      position: 'MID', overall: 97, starting: true },
      { name: 'Villaverde',       position: 'FWD', overall: 95, starting: true },
    ],
  },
  {
    id: 'eintracht-frankfurt-5960',
    club: 'Eintracht Frankfurt',
    context: 'ŁKS Łódź w Pucharze Europy 1959/60 — finał',
    coach: 'Paul Oßwald',
    // Suma starting XI: 957 / 11 = 87.00 → OVR 87
    players: [
      { name: 'Egon Loy',               position: 'GK',  overall: 87, starting: true },
      { name: 'Friedel Lutz',           position: 'DEF', overall: 86, starting: true },
      { name: 'Hermann Höfer',          position: 'DEF', overall: 86, starting: true },
      { name: 'Hans-Walter Eigenbrodt', position: 'DEF', overall: 87, starting: true },
      { name: 'Hans Weilbächer',        position: 'MID', overall: 88, starting: true },
      { name: 'Dieter Stinka',          position: 'MID', overall: 87, starting: true },
      { name: 'Richard Kress',          position: 'FWD', overall: 87, starting: true },
      { name: 'Dieter Lindner',         position: 'MID', overall: 87, starting: true },
      { name: 'Erwin Stein',            position: 'FWD', overall: 88, starting: true },
      { name: 'Alfred Pfaff',           position: 'FWD', overall: 89, starting: true },
      { name: 'Erich Meier',            position: 'FWD', overall: 85, starting: true },
    ],
  }
);
