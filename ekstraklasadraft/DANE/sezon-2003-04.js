// ============================================================
// SEZON 2003/04 — 14 klubów
// Część bazy TEAMS_DATA — każdy sezon w osobnym pliku.
// ============================================================

window.TEAMS_DATA = window.TEAMS_DATA || [];
window.TEAMS_DATA.push(
{
    club: "Wisła Kraków",
    season: "2003/04",
    "coaches": [{ "name": "Henryk Kasperczak" }],
    players: [
      { name: "Majdan",       position: "GK",  overall: 78, apps: 13, goals: 0,  starting: true, "birthYear": 1972  },
      { name: "Piekutowski",  position: "GK",  overall: 66, apps: 13, goals: 0,  starting: false, "birthYear": 1974 },
      { name: "Wróbel M.",    position: "GK",  overall: 63, apps: 0,  goals: 0,  starting: false, "birthYear": 1980 },

      { name: "Baszczyński",  position: "DEF", overall: 87, apps: 24, goals: 1,  starting: true, "birthYear": 1977  },
      { name: "Głowacki",     position: "DEF", overall: 85, apps: 14, goals: 0,  starting: true, "birthYear": 1979  },
      { name: "Stolarczyk",   position: "DEF", overall: 76, apps: 20, goals: 5,  starting: true, "birthYear": 1972  },
      { name: "Jop",          position: "DEF", overall: 74, apps: 16, goals: 2,  starting: false, "birthYear": 1978  },
      { name: "Kłos",         position: "DEF", overall: 84, apps: 13, goals: 1,  starting: true, "birthYear": 1973 },
      { name: "Paszulewicz",  position: "DEF", overall: 68, apps: 8,  goals: 0,  starting: false, "birthYear": 1977 },
      { name: "Mijailović",   position: "DEF", overall: 65, apps: 8,  goals: 1,  starting: false, "birthYear": 1982 },

      { name: "Szymkowiak",   position: "MID", overall: 92, apps: 24, goals: 5,  starting: true, "birthYear": 1976  },
      { name: "Cantoro",      position: "MID", overall: 86, apps: 15, goals: 3,  starting: true, "birthYear": 1976  },
      { name: "Strąk",        position: "MID", overall: 70, apps: 14, goals: 0,  starting: true, "birthYear": 1983  },
      { name: "P. Brożek",    position: "MID", overall: 68, apps: 18, goals: 3,  starting: true, "birthYear": 1983  },
      { name: "Uche",         position: "MID", overall: 84, apps: 12, goals: 4,  starting: false, "birthYear": 1982 },
      { name: "Kukiełka",     position: "MID", overall: 66, apps: 6,  goals: 0,  starting: false, "birthYear": 1976 },
      { name: "Brasilia",     position: "MID", overall: 72, apps: 12, goals: 2,  starting: false, "birthYear": 1977 },

      { name: "Żurawski",     position: "FWD", overall: 95, apps: 26, goals: 20, starting: true, "birthYear": 1976  },
      { name: "Frankowski",   position: "FWD", overall: 82, apps: 22, goals: 15, starting: true, "birthYear": 1974  },
      { name: "Gorawski",     position: "FWD", overall: 79, apps: 20, goals: 4,  starting: false, "birthYear": 1979 },
      { name: "Dubicki",      position: "FWD", overall: 75, apps: 11, goals: 3,  starting: false, "birthYear": 1975 },
    ]
  },
{
    club: "Legia Warszawa",
    season: "2003/04",
    "coaches": [{ "name": "Dariusz Kubicki" }],
    players: [
      { name: "Boruc",        position: "GK",  overall: 90, apps: 26, goals: 0,  starting: true, "birthYear": 1980  },
      { name: "Krzyształowicz",position:"GK",  overall: 65, apps: 0,  goals: 0,  starting: false, "birthYear": 1970 },

      { name: "Jóźwiak",      position: "DEF", overall: 75, apps: 24, goals: 1,  starting: true, "birthYear": 1967  },
      { name: "Zieliński",    position: "DEF", overall: 83, apps: 22, goals: 0,  starting: true, "birthYear": 1967  },
      { name: "Kiełbowicz",   position: "DEF", overall: 81, apps: 22, goals: 1,  starting: true, "birthYear": 1976  },
      { name: "Dudek",        position: "DEF", overall: 69, apps: 18, goals: 1,  starting: false, "birthYear": 1975  },
      { name: "Jarzębowski",  position: "DEF", overall: 66, apps: 17, goals: 1,  starting: false, "birthYear": 1978 },
      { name: "Szala",        position: "DEF", overall: 65, apps: 20, goals: 0,  starting: false, "birthYear": 1976 },
      { name: "Choto",        position: "DEF", overall: 84, apps: 22, goals: 0,  starting: true, "birthYear": 1981 },

      { name: "Surma",        position: "MID", overall: 78, apps: 24, goals: 4,  starting: true, "birthYear": 1977  },
      { name: "Vuković",      position: "MID", overall: 84, apps: 24, goals: 2,  starting: true, "birthYear": 1979  },
      { name: "Magiera",      position: "MID", overall: 84, apps: 24, goals: 4,  starting: true, "birthYear": 1977  },
      { name: "Sokołowski T.",position: "MID", overall: 70, apps: 22, goals: 0,  starting: true, "birthYear": 1977  },
      { name: "Sokołowski T2",position: "MID", overall: 68, apps: 20, goals: 4,  starting: false, "birthYear": 1977 },
      { name: "Wróblewski",   position: "MID", overall: 64, apps: 16, goals: 0,  starting: false, "birthYear": 1980 },

      { name: "Saganowski",   position: "FWD", overall: 89, apps: 24, goals: 17, starting: true, "birthYear": 1978  },
      { name: "Włodarczyk",   position: "FWD", overall: 86, apps: 12, goals: 10, starting: true, "birthYear": 1977  },
      { name: "Svitlica",     position: "FWD", overall: 82, apps: 13, goals: 9,  starting: false, "birthYear": 1976 },
      { name: "Garcia",       position: "FWD", overall: 62, apps: 12, goals: 0,  starting: false, "birthYear": 1980 },
    ]
  },
{
    club: "Amica Wronki",
    season: "2003/04",
    "coaches": [{ "name": "Stefan Majewski" }],
    players: [
      { name: "Szamotulski",  position: "GK",  overall: 73, apps: 19, goals: 0,  starting: true, "birthYear": 1976  },
      { name: "Mielcarz",     position: "GK",  overall: 63, apps: 6,  goals: 0,  starting: false, "birthYear": 1980 },

      { name: "Skrzypek",     position: "DEF", overall: 72, apps: 24, goals: 0,  starting: true, "birthYear": 1971  },
      { name: "Bieniuk",      position: "DEF", overall: 71, apps: 15, goals: 2,  starting: true, "birthYear": 1979  },
      { name: "Dudka",        position: "DEF", overall: 69, apps: 23, goals: 0,  starting: true, "birthYear": 1983  },
      { name: "Kucharski D.", position: "DEF", overall: 66, apps: 18, goals: 1,  starting: true, "birthYear": 1984  },
      { name: "Jikia",        position: "DEF", overall: 68, apps: 19, goals: 1,  starting: false, "birthYear": 1975 },
      { name: "Wojtkowiak",   position: "DEF", overall: 62, apps: 8,  goals: 0,  starting: false, "birthYear": 1984 },

      { name: "Zieńczuk",     position: "MID", overall: 88, apps: 26, goals: 8,  starting: true, "birthYear": 1978  },
      { name: "Bąk A.",       position: "MID", overall: 75, apps: 22, goals: 5,  starting: true, "birthYear": 1974  },
      { name: "Djoković",     position: "MID", overall: 72, apps: 22, goals: 0,  starting: true, "birthYear": 1976  },
      { name: "Bartczak",     position: "MID", overall: 68, apps: 17, goals: 1,  starting: true, "birthYear": 1979  },
      { name: "Burkhardt",    position: "MID", overall: 65, apps: 21, goals: 2,  starting: false, "birthYear": 1983 },
      { name: "K. Kowalczyk", position: "MID", overall: 64, apps: 16, goals: 0,  starting: false, "birthYear": 1979 },
      { name: "Grzybowski",   position: "MID", overall: 63, apps: 11, goals: 1,  starting: false, "birthYear": 1976 },

      { name: "Kryszałowicz", position: "FWD", overall: 89, apps: 19, goals: 11, starting: true, "birthYear": 1974  },
      { name: "Dembiński",    position: "FWD", overall: 79, apps: 25, goals: 8,  starting: true, "birthYear": 1969  },
      { name: "Sobociński",   position: "FWD", overall: 68, apps: 23, goals: 2,  starting: false, "birthYear": 1974 },
      { name: "Dawidowski",   position: "FWD", overall: 70, apps: 14, goals: 2,  starting: false, "birthYear": 1978 },
    ]
  },
{
    club: "Groclin Grodzisk Wielkopolski",
    season: "2003/04",
    "coaches": [{ "name": "Dusan Radolsky" }],
    players: [
      { name: "Liberda",      position: "GK",  overall: 83, apps: 26, goals: 0,  starting: true, "birthYear": 1976  },
      { name: "Przyrowski",   position: "GK",  overall: 62, apps: 1,  goals: 0,  starting: false, "birthYear": 1981 },

      { name: "Krizanac",     position: "DEF", overall: 92, apps: 23, goals: 0,  starting: true, "birthYear": 1979  },
      { name: "Mynar",        position: "DEF", overall: 87, apps: 25, goals: 1,  starting: true, "birthYear": 1974  },
      { name: "Pawlak",       position: "DEF", overall: 70, apps: 12, goals: 1,  starting: true, "birthYear": 1972  },
      { name: "Kozioł",       position: "DEF", overall: 69, apps: 16, goals: 0,  starting: true, "birthYear": 1976  },
      { name: "Sablik",       position: "DEF", overall: 67, apps: 9,  goals: 2,  starting: false, "birthYear": 1974 },
      { name: "Górski R.",    position: "DEF", overall: 65, apps: 7,  goals: 1,  starting: false, "birthYear": 1974 },

      { name: "Zając M.",     position: "MID", overall: 84, apps: 23, goals: 5,  starting: true, "birthYear": 1975  },
      { name: "Mila",         position: "MID", overall: 90, apps: 25, goals: 8,  starting: true, "birthYear": 1982  },
      { name: "Sobolewski",   position: "MID", overall: 82, apps: 16, goals: 4,  starting: true, "birthYear": 1976  },
      { name: "Sedlacek",     position: "MID", overall: 79, apps: 21, goals: 1,  starting: true, "birthYear": 1978  },
      { name: "Piechniak",    position: "MID", overall: 68, apps: 12, goals: 1,  starting: false, "birthYear": 1977 },
      { name: "Rocki",        position: "MID", overall: 66, apps: 17, goals: 1,  starting: false, "birthYear": 1974 },
      { name: "Wieszczycki",  position: "MID", overall: 65, apps: 14, goals: 3,  starting: false, "birthYear": 1971 },

      { name: "Rasiak",       position: "FWD", overall: 89, apps: 18, goals: 10, starting: true, "birthYear": 1979  },
      { name: "Sikora",       position: "FWD", overall: 80, apps: 12, goals: 6,  starting: true, "birthYear": 1980  },
      { name: "Moskała",      position: "FWD", overall: 68, apps: 16, goals: 2,  starting: false, "birthYear": 1977 },
      { name: "Ślusarski",    position: "FWD", overall: 70, apps: 12, goals: 3,  starting: false, "birthYear": 1981 },
    ]
  },
{
    club: "Wisła Płock",
    season: "2003/04",
    "coaches": [{ "name": "Mirosław Jabłoński" }],
    players: [
      { name: "Kapsa",        position: "GK",  overall: 68, apps: 14, goals: 0,  starting: true, "birthYear": 1982  },
      { name: "Wierzchowski", position: "GK",  overall: 70, apps: 13, goals: 0,  starting: false, "birthYear": 1977 },

      { name: "Romuzga",      position: "DEF", overall: 73, apps: 25, goals: 2,  starting: true, "birthYear": 1971  },
      { name: "Wasilewski",   position: "DEF", overall: 82, apps: 21, goals: 1,  starting: true, "birthYear": 1980  },
      { name: "Jurkowski",    position: "DEF", overall: 79, apps: 20, goals: 0,  starting: true, "birthYear": 1974  },
      { name: "Janus",        position: "DEF", overall: 68, apps: 24, goals: 1,  starting: true, "birthYear": 1973  },
      { name: "Branfilov",    position: "DEF", overall: 65, apps: 16, goals: 1,  starting: false, "birthYear": 1977 },
      { name: "Kazimierczak", position: "DEF", overall: 63, apps: 10, goals: 0,  starting: false, "birthYear": 1981 },

      { name: "Kobylański",   position: "MID", overall: 72, apps: 23, goals: 3,  starting: true, "birthYear": 1970  },
      { name: "Gęsior",       position: "MID", overall: 80, apps: 23, goals: 6,  starting: true, "birthYear": 1969  },
      { name: "Terlecki",     position: "MID", overall: 68, apps: 17, goals: 1,  starting: true, "birthYear": 1977  },
      { name: "Peszko",       position: "MID", overall: 76, apps: 20, goals: 1,  starting: true, "birthYear": 1985  },
      { name: "Jakubowski",   position: "MID", overall: 65, apps: 12, goals: 0,  starting: false, "birthYear": 1977 },
      { name: "Vileniskis",   position: "MID", overall: 63, apps: 6,  goals: 1,  starting: false, "birthYear": 1976 },

      { name: "Jeleń",        position: "FWD", overall: 92, apps: 26, goals: 18, starting: true, "birthYear": 1981  },
      { name: "Geworgian",    position: "FWD", overall: 77, apps: 21, goals: 4,  starting: true, "birthYear": 1981  },
      { name: "Ząbecki",      position: "FWD", overall: 62, apps: 9,  goals: 1,  starting: false, "birthYear": 1984 },
      { name: "Matusiak R.",  position: "FWD", overall: 61, apps: 14, goals: 0,  starting: false, "birthYear": 1982 },
    ]
  },
{
    club: "Lech Poznań",
    season: "2003/04",
    "coaches": [{ "name": "Bohumil Panik" }, { "name": "Czesław Michniewicz" }],
    players: [
      { name: "Piątek",       position: "GK",  overall: 68, apps: 24, goals: 0,  starting: true, "birthYear": 1979  },
      { name: "Kotorowski",   position: "GK",  overall: 65, apps: 1,  goals: 0,  starting: false, "birthYear": 1976 },

      { name: "Bosacki",      position: "DEF", overall: 79, apps: 24, goals: 1,  starting: true, "birthYear": 1975  },
      { name: "Kryger",       position: "DEF", overall: 72, apps: 19, goals: 0,  starting: true, "birthYear": 1968  },
      { name: "Lasocki",      position: "DEF", overall: 68, apps: 20, goals: 2,  starting: true, "birthYear": 1975  },
      { name: "Mowlik",       position: "DEF", overall: 65, apps: 14, goals: 0,  starting: true, "birthYear": 1981  },
      { name: "Wójcik",       position: "DEF", overall: 63, apps: 14, goals: 1,  starting: false, "birthYear": 1971 },
      { name: "Kaliszan",     position: "DEF", overall: 67, apps: 6,  goals: 1,  starting: false, "birthYear": 1972 },

      { name: "Świerczewski", position: "MID", overall: 76, apps: 19, goals: 0,  starting: true, "birthYear": 1972  },
      { name: "Scherfchen",   position: "MID", overall: 70, apps: 22, goals: 0,  starting: true, "birthYear": 1979  },
      { name: "Grzelak",      position: "MID", overall: 68, apps: 26, goals: 0,  starting: true, "birthYear": 1982  },
      { name: "Kaczorowski",  position: "MID", overall: 77, apps: 21, goals: 1,  starting: true, "birthYear": 1974  },
      { name: "Madej Ł.",     position: "MID", overall: 76, apps: 24, goals: 3,  starting: false, "birthYear": 1982 },
      { name: "Goliński",     position: "MID", overall: 77, apps: 13, goals: 3,  starting: false, "birthYear": 1981 },
      { name: "Piskuła",      position: "MID", overall: 65, apps: 19, goals: 1,  starting: false, "birthYear": 1973 },

      { name: "Reiss",        position: "FWD", overall: 84, apps: 26, goals: 13, starting: true, "birthYear": 1972  },
      { name: "Zakrzewski",   position: "FWD", overall: 78, apps: 23, goals: 6,  starting: true, "birthYear": 1981  },
      { name: "Nawrocik",     position: "FWD", overall: 76, apps: 14, goals: 4,  starting: false, "birthYear": 1980 },
      { name: "Ślusarski",    position: "FWD", overall: 68, apps: 11, goals: 2,  starting: false, "birthYear": 1981 },
    ]
  },
{
    club: "Górnik Zabrze",
    season: "2003/04",
    "coaches": [{ "name": "Waldemar Fornalik" }, { "name": "Werner Licka" }],
    players: [
      { name: "Lech P.",      position: "GK",  overall: 81, apps: 24, goals: 0,  starting: true, "birthYear": 1968  },
      { name: "Laskowski",    position: "GK",  overall: 62, apps: 3,  goals: 0,  starting: false, "birthYear": 1984 },

      { name: "Karwan M.",    position: "DEF", overall: 70, apps: 23, goals: 1,  starting: true, "birthYear": 1979  },
      { name: "Jakosz",       position: "DEF", overall: 68, apps: 22, goals: 1,  starting: true, "birthYear": 1979  },
      { name: "Radler",       position: "DEF", overall: 76, apps: 20, goals: 0,  starting: true, "birthYear": 1982  },
      { name: "Felipe",       position: "DEF", overall: 65, apps: 18, goals: 1,  starting: true, "birthYear": 1985  },
      { name: "Moskal",       position: "DEF", overall: 70, apps: 15, goals: 0,  starting: false, "birthYear": 1967 },
      { name: "Wojciechowski",position: "DEF", overall: 62, apps: 9,  goals: 0,  starting: false, "birthYear": 1984 },

      { name: "Probierz",     position: "MID", overall: 73, apps: 22, goals: 0,  starting: true, "birthYear": 1972  },
      { name: "Popiela",      position: "MID", overall: 70, apps: 23, goals: 3,  starting: true, "birthYear": 1974  },
      { name: "Kompała",      position: "MID", overall: 84, apps: 28, goals: 7,  starting: true, "birthYear": 1979  },
      { name: "Bukalski",     position: "MID", overall: 67, apps: 22, goals: 3,  starting: true, "birthYear": 1970  },
      { name: "Niżnik",       position: "MID", overall: 65, apps: 15, goals: 1,  starting: false, "birthYear": 1974 },
      { name: "Joao Paulo",   position: "MID", overall: 63, apps: 10, goals: 2,  starting: false, "birthYear": 1983 },

      { name: "Chałbiński",   position: "FWD", overall: 70, apps: 12, goals: 3,  starting: true, "birthYear": 1976  },
      { name: "Makriev",      position: "FWD", overall: 66, apps: 22, goals: 2,  starting: true, "birthYear": 1984  },
      { name: "Buśkiewicz",   position: "FWD", overall: 65, apps: 15, goals: 2,  starting: false, "birthYear": 1983 },
      { name: "Sladojević",   position: "FWD", overall: 62, apps: 9,  goals: 2,  starting: false, "birthYear": 1984 },
    ]
  },
{
    club: "Górnik Łęczna",
    season: "2003/04",
    "coaches": [{ "name": "Jacek Zieliński" }],
    players: [
      { name: "Mioduszewski", position: "GK",  overall: 68, apps: 22, goals: 0,  starting: true, "birthYear": 1973  },
      { name: "Rachowski",    position: "GK",  overall: 62, apps: 5,  goals: 0,  starting: false, "birthYear": 1977 },

      { name: "Kościuk",      position: "DEF", overall: 70, apps: 15, goals: 0,  starting: true, "birthYear": 1974  },
      { name: "Bożyk",        position: "DEF", overall: 67, apps: 18, goals: 0,  starting: true, "birthYear": 1976  },
      { name: "Kościelniak",  position: "DEF", overall: 66, apps: 19, goals: 0,  starting: true, "birthYear": 1974  },
      { name: "Żelasko",      position: "DEF", overall: 65, apps: 23, goals: 1,  starting: true, "birthYear": 1972  },
      { name: "Jaroszyński",  position: "DEF", overall: 63, apps: 11, goals: 0,  starting: false, "birthYear": 1974 },
      { name: "Copik",        position: "DEF", overall: 62, apps: 13, goals: 0,  starting: false, "birthYear": 1978 },

      { name: "Skwara",       position: "MID", overall: 72, apps: 24, goals: 4,  starting: true, "birthYear": 1975  },
      { name: "Soczewka",     position: "MID", overall: 70, apps: 23, goals: 1,  starting: true, "birthYear": 1972  },
      { name: "Budka",        position: "MID", overall: 68, apps: 23, goals: 6,  starting: true, "birthYear": 1972  },
      { name: "Bugała",       position: "MID", overall: 76, apps: 24, goals: 2,  starting: true, "birthYear": 1973  },
      { name: "Wolański",     position: "MID", overall: 65, apps: 12, goals: 2,  starting: false, "birthYear": 1979 },
      { name: "P. Bronowicki",position: "MID", overall: 63, apps: 13, goals: 0,  starting: false, "birthYear": 1980 },

      { name: "Czereszewski", position: "FWD", overall: 78, apps: 11, goals: 4,  starting: true, "birthYear": 1971  },
      { name: "Kłosiński",    position: "FWD", overall: 65, apps: 10, goals: 1,  starting: true, "birthYear": 1975  },
      { name: "Szałachowski", position: "FWD", overall: 62, apps: 10, goals: 1,  starting: false, "birthYear": 1984 },
      { name: "Matys",        position: "FWD", overall: 61, apps: 7,  goals: 0,  starting: false, "birthYear": 1978 },
    ]
  },
{
    club: "Odra Wodzisław",
    season: "2003/04",
    "coaches": [{ "name": "Ryszard Wieczorek" }],
    players: [
      { name: "Bęben",        position: "GK",  overall: 72, apps: 27, goals: 0,  starting: true, "birthYear": 1980  },
      { name: "Pawełek",      position: "GK",  overall: 61, apps: 1,  goals: 0,  starting: false, "birthYear": 1981 },

      { name: "Grzyb",        position: "DEF", overall: 71, apps: 24, goals: 1,  starting: true, "birthYear": 1974  },
      { name: "Myszor",       position: "DEF", overall: 69, apps: 20, goals: 1,  starting: true, "birthYear": 1972  },
      { name: "Jankowski",    position: "DEF", overall: 67, apps: 22, goals: 0,  starting: true, "birthYear": 1980  },
      { name: "Madej",        position: "DEF", overall: 66, apps: 19, goals: 1,  starting: true, "birthYear": 1978  },
      { name: "Szymiczek",    position: "DEF", overall: 63, apps: 11, goals: 0,  starting: false, "birthYear": 1982 },
      { name: "Szary",        position: "DEF", overall: 61, apps: 9,  goals: 0,  starting: false, "birthYear": 1979 },

      { name: "Górski W.",    position: "MID", overall: 72, apps: 25, goals: 0,  starting: true, "birthYear": 1972  },
      { name: "Radzewicz",    position: "MID", overall: 78, apps: 26, goals: 1,  starting: true, "birthYear": 1980  },
      { name: "Sokołowski M.",position: "MID", overall: 66, apps: 22, goals: 3,  starting: true, "birthYear": 1978  },
      { name: "Kwiek",        position: "MID", overall: 74, apps: 21, goals: 2,  starting: true, "birthYear": 1983  },
      { name: "Kubisz",       position: "MID", overall: 66, apps: 13, goals: 4,  starting: false, "birthYear": 1974 },
      { name: "Nowacki",      position: "MID", overall: 75, apps: 15, goals: 4,  starting: false, "birthYear": 1981 },
      { name: "Woś",          position: "MID", overall: 63, apps: 10, goals: 1,  starting: false, "birthYear": 1974 },

      { name: "Nosal",        position: "FWD", overall: 76, apps: 15, goals: 4,  starting: true, "birthYear": 1974  },
      { name: "Pałkus",       position: "FWD", overall: 62, apps: 9,  goals: 1,  starting: true, "birthYear": 1980  },
      { name: "Masłowski",    position: "FWD", overall: 64, apps: 10, goals: 2,  starting: false, "birthYear": 1981 },
      { name: "Jarosz",       position: "FWD", overall: 63, apps: 17, goals: 0,  starting: false, "birthYear": 1976 },
    ]
  },
{
    club: "GKS Katowice",
    season: "2003/04",
    "coaches": [{ "name": "Edward Lorens" }, { "name": "Lechosław Olsza" }, { "name": "Jan Żurek" }, { "name": "Lechosław Olsza" }],
    players: [
      { name: "Klytta",       position: "GK",  overall: 68, apps: 14, goals: 0,  starting: true, "birthYear": 1972  },
      { name: "Tkocz",        position: "GK",  overall: 67, apps: 12, goals: 0,  starting: false, "birthYear": 1973 },

      { name: "Widuch",       position: "DEF", overall: 79, apps: 25, goals: 0,  starting: true, "birthYear": 1971  },
      { name: "Adamczyk",     position: "DEF", overall: 72, apps: 23, goals: 0,  starting: true, "birthYear": 1967  },
      { name: "Sadzawicki",   position: "DEF", overall: 70, apps: 23, goals: 0,  starting: true, "birthYear": 1970  },
      { name: "Fonfara",      position: "DEF", overall: 66, apps: 24, goals: 0,  starting: true, "birthYear": 1983  },
      { name: "Adżem",        position: "DEF", overall: 66, apps: 18, goals: 1,  starting: false, "birthYear": 1973 },
      { name: "Markowski",    position: "DEF", overall: 62, apps: 12, goals: 0,  starting: false, "birthYear": 1979 },

      { name: "Muszalik",     position: "MID", overall: 70, apps: 26, goals: 2,  starting: true, "birthYear": 1979  },
      { name: "Owczarek",     position: "MID", overall: 68, apps: 25, goals: 0,  starting: true, "birthYear": 1980  },
      { name: "Bała",         position: "MID", overall: 67, apps: 20, goals: 0,  starting: true, "birthYear": 1973  },
      { name: "Pluta",        position: "MID", overall: 64, apps: 9,  goals: 1,  starting: true, "birthYear": 1978  },
      { name: "Kroczek",      position: "MID", overall: 62, apps: 9,  goals: 0,  starting: false, "birthYear": 1983 },
      { name: "Giesa",        position: "MID", overall: 61, apps: 1,  goals: 0,  starting: false, "birthYear": 1982 },

      { name: "Gajtkowski",   position: "FWD", overall: 78, apps: 22, goals: 4,  starting: true, "birthYear": 1980  },
      { name: "Kęska S.",     position: "FWD", overall: 68, apps: 20, goals: 1,  starting: true, "birthYear": 1980  },
      { name: "Wróbel S.",    position: "FWD", overall: 67, apps: 13, goals: 3,  starting: false, "birthYear": 1977 },
      { name: "Plizga",       position: "FWD", overall: 62, apps: 6,  goals: 2,  starting: false, "birthYear": 1985 },
    ]
  },
{
    club: "Polonia Warszawa",
    season: "2003/04",
    "coaches": [{ "name": "Krzysztof Chrobak" }, { "name": "Mieczysław Broniszewski" }],
    players: [
      { name: "Sarnat",       position: "GK",  overall: 67, apps: 12, goals: 0,  starting: true, "birthYear": 1970  },
      { name: "Gubiec",       position: "GK",  overall: 62, apps: 9,  goals: 0,  starting: false, "birthYear": 1979 },
      { name: "Kieszek",      position: "GK",  overall: 61, apps: 6,  goals: 0,  starting: false, "birthYear": 1984 },

      { name: "Szwed",        position: "DEF", overall: 70, apps: 25, goals: 2,  starting: true, "birthYear": 1973  },
      { name: "Łukasiewicz",  position: "DEF", overall: 68, apps: 26, goals: 0,  starting: true, "birthYear": 1983  },
      { name: "Michniewicz",  position: "DEF", overall: 66, apps: 21, goals: 0,  starting: true, "birthYear": 1977  },
      { name: "Szymanek",     position: "DEF", overall: 64, apps: 20, goals: 0,  starting: true, "birthYear": 1982  },
      { name: "Drajer",       position: "DEF", overall: 63, apps: 10, goals: 0,  starting: false, "birthYear": 1976 },
      { name: "Dźwigała",     position: "DEF", overall: 62, apps: 23, goals: 6,  starting: false, "birthYear": 1969 },

      { name: "Gołaszewski",  position: "MID", overall: 76, apps: 19, goals: 2,  starting: true, "birthYear": 1968  },
      { name: "Mazurkiewicz", position: "MID", overall: 68, apps: 23, goals: 1,  starting: true, "birthYear": 1979  },
      { name: "Stokowiec",    position: "MID", overall: 66, apps: 22, goals: 0,  starting: true, "birthYear": 1972  },
      { name: "Jarosiewicz",  position: "MID", overall: 64, apps: 21, goals: 1,  starting: true, "birthYear": 1983  },
      { name: "Bąk K.",       position: "MID", overall: 64, apps: 14, goals: 2,  starting: false, "birthYear": 1982 },
      { name: "Plewnia",      position: "MID", overall: 63, apps: 19, goals: 1,  starting: false, "birthYear": 1977 },

      { name: "Tarachulski",  position: "FWD", overall: 64, apps: 22, goals: 3,  starting: true, "birthYear": 1975  },
      { name: "Sobczak",      position: "FWD", overall: 66, apps: 12, goals: 3,  starting: true, "birthYear": 1978  },
      { name: "Nuckowski",    position: "FWD", overall: 63, apps: 15, goals: 2,  starting: false, "birthYear": 1976 },
      { name: "Kluzek",       position: "FWD", overall: 61, apps: 6,  goals: 0,  starting: false, "birthYear": 1975 },
    ]
  },
{
    club: "Górnik Polkowice",
    season: "2003/04",
    "coaches": [{ "name": "Mirosław Dragan" }, { "name": "Wiesław Wojno" }],
    players: [
      { name: "Banaszyński",  position: "GK",  overall: 68, apps: 26, goals: 0,  starting: true, "birthYear": 1975  },
      { name: "Kikowski",     position: "GK",  overall: 61, apps: 0,  goals: 0,  starting: false, "birthYear": 1972 },

      { name: "Żelasko",      position: "DEF", overall: 67, apps: 23, goals: 1,  starting: true, "birthYear": 1972  },
      { name: "Majewski B.",  position: "DEF", overall: 65, apps: 13, goals: 0,  starting: true, "birthYear": 1977  },
      { name: "Nawotczyński", position: "DEF", overall: 64, apps: 12, goals: 1,  starting: true, "birthYear": 1982  },
      { name: "Romaniuk",     position: "DEF", overall: 63, apps: 11, goals: 0,  starting: true, "birthYear": 1974  },
      { name: "Żyluk",        position: "DEF", overall: 62, apps: 11, goals: 0,  starting: false, "birthYear": 1974 },
      { name: "Bosanac",      position: "DEF", overall: 65, apps: 23, goals: 1,  starting: false, "birthYear": 1974 },

      { name: "Jamróz",       position: "MID", overall: 69, apps: 21, goals: 1,  starting: true, "birthYear": 1973  },
      { name: "Krzyżanowski", position: "MID", overall: 67, apps: 15, goals: 1,  starting: true, "birthYear": 1975  },
      { name: "Jeziorny",     position: "MID", overall: 65, apps: 22, goals: 1,  starting: true, "birthYear": 1979  },
      { name: "Wojtarowicz",  position: "MID", overall: 63, apps: 20, goals: 1,  starting: true, "birthYear": 1978  },
      { name: "Gorząd",       position: "MID", overall: 63, apps: 21, goals: 1,  starting: false, "birthYear": 1974 },
      { name: "Pater",        position: "MID", overall: 72, apps: 11, goals: 2,  starting: false, "birthYear": 1974 },

      { name: "Moskal T.",    position: "FWD", overall: 67, apps: 19, goals: 3,  starting: true, "birthYear": 1975  },
      { name: "Pilch",        position: "FWD", overall: 64, apps: 17, goals: 0,  starting: true, "birthYear": 1976  },
      { name: "Dubicki",      position: "FWD", overall: 63, apps: 9,  goals: 1,  starting: false, "birthYear": 1975 },
      { name: "Narwojsz",     position: "FWD", overall: 61, apps: 19, goals: 1,  starting: false, "birthYear": 1977 },
    ]
  },
{
    club: "Świt Nowy Dwór Mazowiecki",
    season: "2003/04",
    "coaches": [{ "name": "Miroslav Copjak" }, { "name": "Bogusław Pietrzak" }, { "name": "Władysław Stachurski" }, { "name": "Janusz Wójcik" }],
    players: [
      { name: "Malarz",       position: "GK",  overall: 68, apps: 20, goals: 0,  starting: true, "birthYear": 1980  },
      { name: "Pesković",     position: "GK",  overall: 63, apps: 7,  goals: 0,  starting: false, "birthYear": 1976 },

      { name: "Kaliciak",     position: "DEF", overall: 68, apps: 14, goals: 1,  starting: true, "birthYear": 1975  },
      { name: "Wyczałkowski", position: "DEF", overall: 65, apps: 23, goals: 4,  starting: true, "birthYear": 1976  },
      { name: "Gorszkow",     position: "DEF", overall: 63, apps: 10, goals: 0,  starting: true, "birthYear": 1974  },
      { name: "Łukaszewski",  position: "DEF", overall: 62, apps: 8,  goals: 0,  starting: true, "birthYear": 1978  },
      { name: "Cios",         position: "DEF", overall: 62, apps: 13, goals: 0,  starting: false, "birthYear": 1976 },
      { name: "Bystron",      position: "DEF", overall: 61, apps: 12, goals: 0,  starting: false, "birthYear": 1974 },

      { name: "Wiechowski",   position: "MID", overall: 68, apps: 25, goals: 2,  starting: true, "birthYear": 1974  },
      { name: "Szeremet",     position: "MID", overall: 66, apps: 25, goals: 0,  starting: true, "birthYear": 1974  },
      { name: "Preiksaitis",  position: "MID", overall: 74, apps: 12, goals: 1,  starting: true, "birthYear": 1970  },
      { name: "Zganiacz",     position: "MID", overall: 72, apps: 20, goals: 1,  starting: true, "birthYear": 1984  },
      { name: "Jacek P.",     position: "MID", overall: 63, apps: 12, goals: 0,  starting: false, "birthYear": 1975 },
      { name: "Tasić",        position: "MID", overall: 61, apps: 5,  goals: 0,  starting: false, "birthYear": 1977 },

      { name: "Rasić",        position: "FWD", overall: 76, apps: 11, goals: 4,  starting: true, "birthYear": 1977  },
      { name: "Mierzejewski", position: "FWD", overall: 64, apps: 22, goals: 2,  starting: true, "birthYear": 1982  },
      { name: "Jasiński",     position: "FWD", overall: 62, apps: 9,  goals: 0,  starting: false, "birthYear": 1971 },
      { name: "Bilski K.",    position: "FWD", overall: 61, apps: 7,  goals: 2,  starting: false, "birthYear": 1980 },
      { name: "Kalu",    position: "FWD", overall: 71, apps: 10,  goals: 2,  starting: false, "birthYear": 1976 },
      { name: "Anih",    position: "FWD", overall: 51, apps: 10,  goals: 0,  starting: false, "birthYear": 1981 },
    ]
  },
{
    club: "Widzew Łódź",
    season: "2003/04",
      "coaches": [{ "name": "Andrzej Kretek" }, { "name": "Tomasz Łapiński" }, { "name": "Franciszek Smuda" }, { "name": "Jerzy Kasalik" }],
    players: [
      { name: "Tyrajski",     position: "GK",  overall: 68, apps: 12, goals: 0,  starting: true, "birthYear": 1984  },
      { name: "Robakiewicz",  position: "GK",  overall: 67, apps: 13, goals: 0,  starting: false, "birthYear": 1982 },
      { name: "Ludwikowski",  position: "GK",  overall: 61, apps: 1,  goals: 0,  starting: false, "birthYear": 1981 },

      { name: "Walburg",      position: "DEF", overall: 67, apps: 21, goals: 0,  starting: true, "birthYear": 1976  },
      { name: "Rzeźniczak",   position: "DEF", overall: 70, apps: 11, goals: 0,  starting: true, "birthYear": 1978  },
      { name: "Pizano",       position: "DEF", overall: 64, apps: 13, goals: 1,  starting: true, "birthYear": 1983  },
      { name: "Becalik",      position: "DEF", overall: 63, apps: 16, goals: 1,  starting: true, "birthYear": 1972  },
      { name: "Drajer",       position: "DEF", overall: 63, apps: 8,  goals: 0,  starting: false, "birthYear": 1984 },
      { name: "Kaliszan",     position: "DEF", overall: 65, apps: 10, goals: 0,  starting: false, "birthYear": 1974 },

      { name: "Rachwał",      position: "MID", overall: 68, apps: 24, goals: 0,  starting: true, "birthYear": 1972  },
      { name: "Pawlak",       position: "MID", overall: 70, apps: 26, goals: 3,  starting: true, "birthYear": 1977  },
      { name: "Juliano",      position: "MID", overall: 76, apps: 23, goals: 2,  starting: true, "birthYear": 1985  },
      { name: "Ława",         position: "MID", overall: 63, apps: 11, goals: 1,  starting: true, "birthYear": 1985  },
      { name: "Seweryn",      position: "MID", overall: 64, apps: 12, goals: 0,  starting: false, "birthYear": 1985 },
      { name: "Goliński",     position: "MID", overall: 63, apps: 7,  goals: 1,  starting: false, "birthYear": 1976 },

      { name: "Nazaruk",      position: "FWD", overall: 67, apps: 22, goals: 1,  starting: true, "birthYear": 1978  },
      { name: "Cichoń",       position: "FWD", overall: 66, apps: 18, goals: 3,  starting: true, "birthYear": 1984  },
      { name: "Lelo",         position: "FWD", overall: 70, apps: 19, goals: 2,  starting: false, "birthYear": 1968 },
      { name: "Masłowski",    position: "FWD", overall: 62, apps: 10, goals: 2,  starting: false, "birthYear": 1967 },
      { name: "Włodarczyk",    position: "FWD", overall: 80, apps: 12, goals: 6,  starting: false, "birthYear": 1970 },
      { name: "Matys",    position: "FWD", overall: 60, apps: 1, goals: 1,  starting: false, "birthYear": 1985 },
      { name: "Rybski",    position: "FWD", overall: 60, apps: 10, goals: 0,  starting: false, "birthYear": 1969 },
    ]
  }
);
