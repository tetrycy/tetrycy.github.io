// ============================================================
// RYWALE GÓRNIKA ZABRZE W PUCHARZE ZDOBYWCÓW PUCHARÓW 1969/70.
// Składy uzupełnione nazwiskami podanymi w rozmowie.
//
// WAŻNE:
// OVR drużyny custom jest liczony przez silnik jako średnia zawodników
// starting: true. Dlatego każda pierwsza jedenastka ma sumę overalla
// dokładnie równą: planowany OVR × 11.
// - Olympiakos: 869 / 11 = 79
// - Glasgow Rangers: 957 / 11 = 87
// - Lewski Sofia: 836 / 11 = 76
// - AS Roma: 1067 / 11 = 97
// - Manchester City: 1045 / 11 = 95
// ============================================================

window.WYZWANIA_TEAMS_DATA = window.WYZWANIA_TEAMS_DATA || [];
window.WYZWANIA_TEAMS_DATA.push(
  {
    id: 'olympiakos-6970',
    club: 'Olympiakos',
    context: 'Górnik Zabrze w PZP 1969/70 — 1/16 finału',
    coach: 'Stjepan Bobek',
    // Suma starting XI: 869 / 11 = 79.00 → OVR 79
    players: [
      { name: 'Vangelis Liadelis', position: 'GK',  overall: 79, starting: true },

      { name: 'Vasilios Siokos',   position: 'DEF', overall: 78, starting: true },
      { name: 'Grigoris Aganian',  position: 'DEF', overall: 78, starting: true },
      { name: 'Orestis Pavlidis',  position: 'DEF', overall: 79, starting: true },
      { name: 'Giannis Gaitatzis', position: 'DEF', overall: 78, starting: true },

      { name: 'Pavlos Vasiliou',   position: 'MID', overall: 79, starting: true },
      { name: 'Mimis Plessas',     position: 'MID', overall: 77, starting: true },

      { name: 'Dimitrios Muller',  position: 'FWD', overall: 79, starting: true },
      { name: 'Vasilios Botinos',  position: 'FWD', overall: 80, starting: true },
      { name: 'Nikolaos Gioutsos', position: 'FWD', overall: 81, starting: true },
      { name: 'Georgios Sideris',  position: 'FWD', overall: 81, starting: true },
    ],
  },
  {
    id: 'glasgow-rangers-6970',
    club: 'Glasgow Rangers',
    context: 'Górnik Zabrze w PZP 1969/70 — 1/8 finału',
    coach: 'David White',
    // Suma starting XI: 957 / 11 = 87.00 → OVR 87
    players: [
      { name: 'Gerhard Neef',      position: 'GK',  overall: 86, starting: true },

      { name: 'Ronnie McKinnon',   position: 'DEF', overall: 87, starting: true },
      { name: 'John Greig',        position: 'DEF', overall: 90, starting: true },
      { name: 'Kai Johansen',      position: 'DEF', overall: 86, starting: true },

      { name: 'Andy Penman',       position: 'MID', overall: 85, starting: true },
      { name: 'Örjan Persson',     position: 'MID', overall: 86, starting: true },
      { name: 'Jim Baxter',        position: 'MID', overall: 91, starting: true },
      { name: 'Willie Johnston',   position: 'MID', overall: 87, starting: true },

      { name: 'Colin Stein',       position: 'FWD', overall: 88, starting: true },
      { name: 'Brian Heron',       position: 'FWD', overall: 84, starting: true },
      { name: 'Willie Henderson',  position: 'FWD', overall: 87, starting: true },
    ],
  },
  {
    id: 'lewski-sofia-6970',
    club: 'Lewski Sofia',
    context: 'Górnik Zabrze w PZP 1969/70 — 1/4 finału',
    coach: 'Krastyo Chakarov',
    // Suma starting XI: 836 / 11 = 76.00 → OVR 76
    players: [
      { name: 'Georgi Kamenski',    position: 'GK',  overall: 75, starting: true },

      { name: 'Kiril Ivkov',        position: 'DEF', overall: 77, starting: true },
      { name: 'Dobromir Zhechev',   position: 'DEF', overall: 77, starting: true },
      { name: 'Stefan Aladzhov',    position: 'DEF', overall: 75, starting: true },
      { name: 'Milko Gaydarski',    position: 'DEF', overall: 75, starting: true },
      { name: 'Stoichko Peshev',    position: 'DEF', overall: 74, starting: true },

      { name: 'Ivan Stoyanov',      position: 'MID', overall: 75, starting: true },
      { name: 'Yanko Kirilov',      position: 'MID', overall: 75, starting: true },

      { name: 'Petar Kirilov',      position: 'FWD', overall: 75, starting: true },
      { name: 'Tsvetan Veselinov',  position: 'FWD', overall: 76, starting: true },
      { name: 'Georgi Asparuhov',   position: 'FWD', overall: 82, starting: true },
    ],
  },
  {
    id: 'as-roma-6970',
    club: 'AS Roma',
    context: 'Górnik Zabrze w PZP 1969/70 — półfinał',
    coach: '',
    // Suma starting XI: 1067 / 11 = 97.00 → OVR 97
    players: [
      { name: 'Ginulfi',    position: 'GK',  overall: 95, starting: true },

      { name: 'Scaratti',   position: 'DEF', overall: 95, starting: true },
      { name: 'Bet',        position: 'DEF', overall: 97, starting: true },
      { name: 'Spinosi',    position: 'DEF', overall: 99, starting: true },
      { name: 'Salvori',    position: 'DEF', overall: 95, starting: true },

      { name: 'Santarini',  position: 'MID', overall: 97, starting: true },
      { name: 'Petrelli',   position: 'MID', overall: 95, starting: true },
      { name: 'Capello',    position: 'MID', overall: 99, starting: true },

      { name: 'Cappellini', position: 'FWD', overall: 97, starting: true },
      { name: 'Peiró',      position: 'FWD', overall: 99, starting: true },
      { name: 'Landini',    position: 'FWD', overall: 99, starting: true },

      { name: 'Benites',    position: 'DEF', overall: 84, starting: false },
      { name: 'Larossa',    position: 'FWD', overall: 84, starting: false },
    ],
  },
  {
    id: 'manchester-city-6970',
    club: 'Manchester City',
    context: 'Górnik Zabrze w PZP 1969/70 — finał',
    coach: 'Joe Mercer',
    // Suma starting XI: 1045 / 11 = 95.00 → OVR 95
    players: [
      { name: 'Joe Corrigan', position: 'GK',  overall: 93, starting: true },

      { name: 'Tony Book',    position: 'DEF', overall: 95, starting: true },
      { name: 'Tommy Booth',  position: 'DEF', overall: 93, starting: true },
      { name: 'George Heslop',position: 'DEF', overall: 92, starting: true },
      { name: 'Glyn Pardoe',  position: 'DEF', overall: 94, starting: true },
      { name: 'Mike Doyle',   position: 'DEF', overall: 94, starting: true },

      { name: 'Alan Oakes',   position: 'MID', overall: 95, starting: true },
      { name: 'Tony Towers',  position: 'MID', overall: 94, starting: true },
      { name: 'Colin Bell',   position: 'MID', overall: 99, starting: true },

      { name: 'Francis Lee',  position: 'FWD', overall: 98, starting: true },
      { name: 'Neil Young',   position: 'FWD', overall: 98, starting: true },

      { name: 'Ian Bowyer',   position: 'MID', overall: 86, starting: false },
    ],
  }
);
