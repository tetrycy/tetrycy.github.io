// ============================================================
// TRENERZY.JS — specjalności i modyfikatory trenerów, kluczowane
// NAZWISKIEM (nie klubem, nie klub+sezonem).
//
// DLACZEGO OSOBNY PLIK: jeden trener mógł prowadzić 20 różnych
// klubów w karierze. W bazie klub+sezon (DANE/) każdy taki wpis ma
// pole "coaches" — TABLICĘ (nie pojedynczy obiekt!), bo w jednym
// sezonie mogło być kilku trenerów (zmiana w trakcie sezonu — to się
// naprawdę zdarza i zdarzało). Przykład:
//   "coaches": [{ "name": "Jan Kowalski" }, { "name": "Adam Nowak" }]
// Każdy wpis to czysta referencja po nazwisku. Sama specjalność/
// modyfikator trenera żyje TUTAJ, w jednym miejscu — zmiana tutaj
// aktualizuje się automatycznie we wszystkich klubach i sezonach,
// w których dany trener się pojawia, bez dotykania plików sezonowych.
//
// SCHEMAT (zaimplementowany — patrz TRAITS.js): każdy trener ma pole
// "traits" — TABLICĘ obiektów, bo może mieć więcej niż jedną cechę
// naraz. Trener bez wpisu, albo ze starym { type: 'nothing' }, ma
// po prostu brak cech (traits: []) — nic się nie wywali.
//
//   { type: 'lineBoost', line: 'DEF' | 'MID' | 'FWD', amount: liczba }
//     — stały bonus (może być ujemny) do jednej linii, doliczany RAZ,
//       na starcie meczu, do bazowej siły tej linii.
//
//   { type: 'subtypeBoost', label: '<dokładna etykieta z MEDIUM/HIGH_SUBTYPES>', pGoalMult: liczba }
//     — mnożnik skuteczności KONKRETNEGO typu akcji (np. tylko "długi
//       wyrzut z autu"). Działa wyłącznie dla Twoich akcji.
//
//   { type: 'categoryBoost', category: 'possession' | 'sfg' | 'ind' | 'counter', pGoalMult: liczba }
//     — mnożnik skuteczności CAŁEJ kategorii akcji (np. wszystkie
//       kontry). Działa wyłącznie dla Twoich akcji.
//
// PLANOWANE NA PÓŹNIEJ (jeszcze niezaimplementowane w TRAITS.js, ale
// mieszczące się w tym samym schemacie — po prostu kolejne typy w
// tablicy "traits", gdy będą gotowe):
//   'random_bonus'    — bonus losowany na nowo przed każdym meczem
//                        (jak bonus za miejsce rozgrywania meczu).
//   'ability_modifier' — zmienia zasady reakcji taktycznej (opierdol/
//                        chaos/awantura/busparking), np. usuwa karę
//                        w końcówce albo pozwala użyć dwa razy.
//   'luck_bonus'       — podnosi szansę na "wyjątkową formę" zawodnika.
//
// Cechy działają dziś WYŁĄCZNIE dla trenera GRACZA (state.coach) —
// rywale/AI nie mają jeszcze swoich trenerów podpiętych do silnika.
// ============================================================

window.TRENERZY = window.TRENERZY || {};

// Zaślepkowy trener używany domyślnie we wszystkich klubach, dopóki
// nie podmienisz na prawdziwe nazwisko. Zero efektu.
window.TRENERZY["Nieznany Trener"] = { type: 'nothing' };

// Trenerzy występujący w plikach sezonowych — domyślnie bez efektu.
// Wygenerowane automatycznie z pola "coaches" w plikach sezonowych.
window.TRENERZY["Adam Fedoruk"] = { type: 'nothing' };
window.TRENERZY["Adam Majewski"] = { type: 'nothing' };
window.TRENERZY["Adam Michalski"] = { type: 'nothing' };
window.TRENERZY["Adam Musiał"] = { type: 'nothing' };
window.TRENERZY["Adam Nawałka"] = { type: 'nothing' };
window.TRENERZY["Adam Owen"] = { type: 'nothing' };
window.TRENERZY["Adam Szała"] = { type: 'nothing' };
window.TRENERZY["Adam Topolski"] = { type: 'nothing' };
window.TRENERZY["Adrian Gula"] = { type: 'nothing' };
window.TRENERZY["Adrian Siemieniec"] = { type: 'nothing' };
window.TRENERZY["Albin Mikulski"] = { type: 'nothing' };
window.TRENERZY["Albin Wira"] = { type: 'nothing' };
window.TRENERZY["Aleksandar Rogić"] = { type: 'nothing' };
window.TRENERZY["Aleksandar Vuković"] = { type: 'nothing' };
window.TRENERZY["Alojzy Łysko"] = { type: 'nothing' };
window.TRENERZY["Andrzej Blacha"] = { type: 'nothing' };
window.TRENERZY["Andrzej Garlej"] = { type: 'nothing' };
window.TRENERZY["Andrzej Kretek"] = { type: 'nothing' };
window.TRENERZY["Andrzej Król"] = { type: 'nothing' };
window.TRENERZY["Andrzej Orzeszek"] = { type: 'nothing' };
window.TRENERZY["Andrzej Pyrdoł"] = { type: 'nothing' };
window.TRENERZY["Andrzej Rybarski"] = { type: 'nothing' };
window.TRENERZY["Andrzej Strejlau"] = { type: 'nothing' };
window.TRENERZY["Andrzej Wiśniewski"] = { type: 'nothing' };
window.TRENERZY["Andrzej Wojciechowski"] = { type: 'nothing' };
window.TRENERZY["Andrzej Wyroba"] = { type: 'nothing' };
window.TRENERZY["Angel Perez Garcia"] = { type: 'nothing' };
window.TRENERZY["Ante Simundza"] = { type: 'nothing' };
window.TRENERZY["Antoni Giedrys"] = { type: 'nothing' };
window.TRENERZY["Antoni Piechniczek"] = {
  traits: [
    { type: 'lineBoost', line: 'DEF', amount: 2 }, // twarda, zorganizowana defensywa
  ],
};
window.TRENERZY["Arkadiusz Bilski"] = { type: 'nothing' };
window.TRENERZY["Artur Płatek"] = { type: 'nothing' };
window.TRENERZY["Artur Skowronek"] = { type: 'nothing' };
window.TRENERZY["Bartosch Gaul"] = { type: 'nothing' };
window.TRENERZY["Bartosz Grzelak"] = { type: 'nothing' };
window.TRENERZY["Ben van Dael"] = { type: 'nothing' };
window.TRENERZY["Bernard Szmyt"] = { type: 'nothing' };
window.TRENERZY["Besnik Hasi"] = { type: 'nothing' };
window.TRENERZY["Bogdan Ciućmański"] = { type: 'nothing' };
window.TRENERZY["Bogdan Zając"] = { type: 'nothing' };
window.TRENERZY["Bogusław Baniak"] = { type: 'nothing' };
window.TRENERZY["Bogusław Kaczmarek"] = { type: 'nothing' };
window.TRENERZY["Bogusław Pietrzak"] = { type: 'nothing' };
window.TRENERZY["Bogusław Wilk"] = { type: 'nothing' };
window.TRENERZY["Bohumil Panik"] = { type: 'nothing' };
window.TRENERZY["Bruno Baltazar"] = { type: 'nothing' };
window.TRENERZY["Cezary Molęda"] = { type: 'nothing' };
window.TRENERZY["Constantin Galca"] = { type: 'nothing' };
window.TRENERZY["Czesław Jakołcewicz"] = { type: 'nothing' };
window.TRENERZY["Czesław Michniewicz"] = { type: 'nothing' };
window.TRENERZY["Dan Petrescu"] = { type: 'nothing' };
window.TRENERZY["Daniel Myśliwiec"] = { type: 'nothing' };
window.TRENERZY["Dariusz Banasik"] = { type: 'nothing' };
window.TRENERZY["Dariusz Bednarek"] = { type: 'nothing' };
window.TRENERZY["Dariusz Bratkowski"] = { type: 'nothing' };
window.TRENERZY["Dariusz Czykier"] = { type: 'nothing' };
window.TRENERZY["Dariusz Dudek"] = { type: 'nothing' };
window.TRENERZY["Dariusz Dźwigała"] = { type: 'nothing' };
window.TRENERZY["Dariusz Fornalak"] = { type: 'nothing' };
window.TRENERZY["Dariusz Janowski"] = { type: 'nothing' };
window.TRENERZY["Dariusz Kubicki"] = { type: 'nothing' };
window.TRENERZY["Dariusz Pasieka"] = { type: 'nothing' };
window.TRENERZY["Dariusz Skrzypczak"] = { type: 'nothing' };
window.TRENERZY["Dariusz Wdowczyk"] = { type: 'nothing' };
window.TRENERZY["Dariusz Żuraw"] = { type: 'nothing' };
window.TRENERZY["David Badia"] = { type: 'nothing' };
window.TRENERZY["Dawid Banaczek"] = { type: 'nothing' };
window.TRENERZY["Dawid Kroczek"] = { type: 'nothing' };
window.TRENERZY["Dawid Szulczek"] = { type: 'nothing' };
window.TRENERZY["Dawid Szwarga"] = { type: 'nothing' };
window.TRENERZY["Dean Klafurić"] = { type: 'nothing' };
window.TRENERZY["Dominik Nowak"] = { type: 'nothing' };
window.TRENERZY["Dragomir Okuka"] = { type: 'nothing' };
window.TRENERZY["Drazen Besek"] = { type: 'nothing' };
window.TRENERZY["Dusan Radolsky"] = { type: 'nothing' };
window.TRENERZY["Edward Iordanescu"] = { type: 'nothing' };
window.TRENERZY["Edward Klejdinst"] = { type: 'nothing' };
window.TRENERZY["Edward Lorens"] = { type: 'nothing' };
window.TRENERZY["Eugeniusz Samolczyk"] = { type: 'nothing' };
window.TRENERZY["Franciszek Smuda"] = {
  traits: [
    { type: 'categoryBoost', category: 'counter', pGoalMult: 1.25 }, // mistrz szybkich kontr
  ],
};
window.TRENERZY["Frantisek Straka"] = { type: 'nothing' };
window.TRENERZY["Gino Lettieri"] = { type: 'nothing' };
window.TRENERZY["Goncalo Feio"] = { type: 'nothing' };
window.TRENERZY["Gothard Kokott"] = { type: 'nothing' };
window.TRENERZY["Grzegorz Bakalarczyk"] = { type: 'nothing' };
window.TRENERZY["Grzegorz Kowalski"] = { type: 'nothing' };
window.TRENERZY["Grzegorz Lato"] = { type: 'nothing' };
window.TRENERZY["Grzegorz Mokry"] = { type: 'nothing' };
window.TRENERZY["Grzegorz Niciński"] = { type: 'nothing' };
window.TRENERZY["Grzegorz Wesołowski"] = { type: 'nothing' };
window.TRENERZY["Grzegorz Witt"] = { type: 'nothing' };
window.TRENERZY["Henning Berg"] = { type: 'nothing' };
window.TRENERZY["Henryk Apostel"] = { type: 'nothing' };
window.TRENERZY["Henryk Bałuszyński"] = { type: 'nothing' };
window.TRENERZY["Henryk Górnik"] = { type: 'nothing' };
window.TRENERZY["Henryk Kasperczak"] = { type: 'nothing' };
window.TRENERZY["Henryk Wieczorek"] = { type: 'nothing' };
window.TRENERZY["Hubert Kostka"] = { type: 'nothing' };
window.TRENERZY["Hubert Kościukiewicz"] = { type: 'nothing' };
window.TRENERZY["Igor Jovicević"] = { type: 'nothing' };
window.TRENERZY["Ireneusz Mamrot"] = { type: 'nothing' };
window.TRENERZY["Ivan Djurdjević"] = { type: 'nothing' };
window.TRENERZY["Ivaylo Petev"] = { type: 'nothing' };
window.TRENERZY["Ińaki Astiz"] = { type: 'nothing' };
window.TRENERZY["Jacek Grembocki"] = { type: 'nothing' };
window.TRENERZY["Jacek Magiera"] = { type: 'nothing' };
window.TRENERZY["Jacek Zieliński"] = { type: 'nothing' };
window.TRENERZY["Jan Caliński"] = { type: 'nothing' };
window.TRENERZY["Jan Furtok"] = { type: 'nothing' };
window.TRENERZY["Jan Kocian"] = { type: 'nothing' };
window.TRENERZY["Jan Kowalski"] = { type: 'nothing' };
window.TRENERZY["Jan Pietryga"] = { type: 'nothing' };
window.TRENERZY["Jan Rudnow"] = { type: 'nothing' };
window.TRENERZY["Jan Stępczak"] = { type: 'nothing' };
window.TRENERZY["Jan Urban"] = { type: 'nothing' };
window.TRENERZY["Jan Woś"] = { type: 'nothing' };
window.TRENERZY["Jan Złomańczuk"] = { type: 'nothing' };
window.TRENERZY["Jan Żurek"] = { type: 'nothing' };
window.TRENERZY["Janusz Batugowski"] = { type: 'nothing' };
window.TRENERZY["Janusz Białek"] = { type: 'nothing' };
window.TRENERZY["Janusz Gałek"] = { type: 'nothing' };
window.TRENERZY["Janusz Góra"] = { type: 'nothing' };
window.TRENERZY["Janusz Krupa"] = { type: 'nothing' };
window.TRENERZY["Janusz Kubot"] = { type: 'nothing' };
window.TRENERZY["Janusz Niedźwiedź"] = { type: 'nothing' };
window.TRENERZY["Janusz Pekowski"] = { type: 'nothing' };
window.TRENERZY["Janusz Stańczyk"] = { type: 'nothing' };
window.TRENERZY["Janusz Wójcik"] = { type: 'nothing' };
window.TRENERZY["Janusz Świerad"] = { type: 'nothing' };
window.TRENERZY["Jarosław Skrobacz"] = { type: 'nothing' };
window.TRENERZY["Jarosław Szuba"] = { type: 'nothing' };
window.TRENERZY["Jens Gustafsson"] = { type: 'nothing' };
window.TRENERZY["Jerzy Brzęczek"] = { type: 'nothing' };
window.TRENERZY["Jerzy Dworczyk"] = { type: 'nothing' };
window.TRENERZY["Jerzy Engel"] = {
  traits: [
    { type: 'subtypeBoost', label: 'długi wyrzut z autu', pGoalMult: 1.5 }, // ekspert długiego wyrzutu z autu
  ],
};
window.TRENERZY["Jerzy Fiutowski"] = { type: 'nothing' };
window.TRENERZY["Jerzy Jastrzębowski"] = { type: 'nothing' };
window.TRENERZY["Jerzy Kasalik"] = { type: 'nothing' };
window.TRENERZY["Jerzy Kopa"] = { type: 'nothing' };
window.TRENERZY["Jerzy Kowalik"] = { type: 'nothing' };
window.TRENERZY["Jerzy Wyrobek"] = { type: 'nothing' };
window.TRENERZY["Jiri Necek"] = { type: 'nothing' };
window.TRENERZY["Joan Carrillo"] = { type: 'nothing' };
window.TRENERZY["Joao Henriques"] = { type: 'nothing' };
window.TRENERZY["John Carver"] = { type: 'nothing' };
window.TRENERZY["John van den Brom"] = { type: 'nothing' };
window.TRENERZY["Jorge Paixao"] = { type: 'nothing' };
window.TRENERZY["Jose Antonio Vicuńa"] = { type: 'nothing' };
window.TRENERZY["Jose Carlos Serrao"] = { type: 'nothing' };
window.TRENERZY["Jose Mari Bakero"] = { type: 'nothing' };
window.TRENERZY["Josef Csaplar"] = { type: 'nothing' };
window.TRENERZY["Józef Antoniak"] = { type: 'nothing' };
window.TRENERZY["Józef Dankowski"] = { type: 'nothing' };
window.TRENERZY["Józef Łobocki"] = { type: 'nothing' };
window.TRENERZY["Kamil Kiereś"] = { type: 'nothing' };
window.TRENERZY["Kamil Kuzera"] = { type: 'nothing' };
window.TRENERZY["Kazimierz Kmiecik"] = { type: 'nothing' };
window.TRENERZY["Kazimierz Moskal"] = { type: 'nothing' };
window.TRENERZY["Kiko Ramirez"] = { type: 'nothing' };
window.TRENERZY["Kosta Runjaić"] = { type: 'nothing' };
window.TRENERZY["Krzysztof Brede"] = { type: 'nothing' };
window.TRENERZY["Krzysztof Buliński"] = { type: 'nothing' };
window.TRENERZY["Krzysztof Chrobak"] = { type: 'nothing' };
window.TRENERZY["Krzysztof Etmanowicz"] = { type: 'nothing' };
window.TRENERZY["Krzysztof Gawara"] = { type: 'nothing' };
window.TRENERZY["Krzysztof Pawlak"] = { type: 'nothing' };
window.TRENERZY["Krzysztof Szumski"] = { type: 'nothing' };
window.TRENERZY["Krzysztof Tochel"] = { type: 'nothing' };
window.TRENERZY["Krzysztof Warzycha"] = { type: 'nothing' };
window.TRENERZY["Lech Szymonowicz"] = { type: 'nothing' };
window.TRENERZY["Lechosław Olsza"] = { type: 'nothing' };
window.TRENERZY["Leszek Baczyński"] = { type: 'nothing' };
window.TRENERZY["Leszek Brzeziński"] = { type: 'nothing' };
window.TRENERZY["Leszek Jezierski"] = { type: 'nothing' };
window.TRENERZY["Leszek Ojrzyński"] = { type: 'nothing' };
window.TRENERZY["Lesław Ćmikiewicz"] = { type: 'nothing' };
window.TRENERZY["Luka Elsner"] = { type: 'nothing' };
window.TRENERZY["Maciej Bartoszek"] = { type: 'nothing' };
window.TRENERZY["Maciej Kalkowski"] = { type: 'nothing' };
window.TRENERZY["Maciej Kędziorek"] = { type: 'nothing' };
window.TRENERZY["Maciej Lesisz"] = { type: 'nothing' };
window.TRENERZY["Maciej Skorża"] = { type: 'nothing' };
window.TRENERZY["Maciej Stolarczyk"] = { type: 'nothing' };
window.TRENERZY["Marcin Bochynek"] = { type: 'nothing' };
window.TRENERZY["Marcin Broniszewski"] = { type: 'nothing' };
window.TRENERZY["Marcin Brosz"] = { type: 'nothing' };
window.TRENERZY["Marcin Gawron"] = { type: 'nothing' };
window.TRENERZY["Marcin Kaczmarek"] = { type: 'nothing' };
window.TRENERZY["Marcin Matysiak"] = { type: 'nothing' };
window.TRENERZY["Marcin Prasoł"] = { type: 'nothing' };
window.TRENERZY["Marcin Sadko"] = { type: 'nothing' };
window.TRENERZY["Marcin Sasal"] = { type: 'nothing' };
window.TRENERZY["Marcin Węglewski"] = { type: 'nothing' };
window.TRENERZY["Marcin Włodarski"] = { type: 'nothing' };
window.TRENERZY["Marek Bajor"] = { type: 'nothing' };
window.TRENERZY["Marek Chojnacki"] = { type: 'nothing' };
window.TRENERZY["Marek Dziuba"] = { type: 'nothing' };
window.TRENERZY["Marek Gołębiewski"] = { type: 'nothing' };
window.TRENERZY["Marek Koniarek"] = { type: 'nothing' };
window.TRENERZY["Marek Kostrzewa"] = { type: 'nothing' };
window.TRENERZY["Marek Kusto"] = { type: 'nothing' };
window.TRENERZY["Marek Motyka"] = { type: 'nothing' };
window.TRENERZY["Marek Papszun"] = { type: 'nothing' };
window.TRENERZY["Marek Saganowski"] = { type: 'nothing' };
window.TRENERZY["Marek Wleciałowski"] = { type: 'nothing' };
window.TRENERZY["Marek Woziński"] = { type: 'nothing' };
window.TRENERZY["Marek Zub"] = { type: 'nothing' };
window.TRENERZY["Marian Geszke"] = { type: 'nothing' };
window.TRENERZY["Marian Kosiński"] = { type: 'nothing' };
window.TRENERZY["Marian Kurowski"] = { type: 'nothing' };
window.TRENERZY["Marian Putyra"] = { type: 'nothing' };
window.TRENERZY["Mariusz Arczewski"] = { type: 'nothing' };
window.TRENERZY["Mariusz Kuras"] = { type: 'nothing' };
window.TRENERZY["Mariusz Lewandowski"] = { type: 'nothing' };
window.TRENERZY["Mariusz Misiura"] = { type: 'nothing' };
window.TRENERZY["Mariusz Rumak"] = { type: 'nothing' };
window.TRENERZY["Martin Pulpit"] = { type: 'nothing' };
window.TRENERZY["Martin Sevela"] = { type: 'nothing' };
window.TRENERZY["Mateusz Stolarski"] = { type: 'nothing' };
window.TRENERZY["Max Molder"] = { type: 'nothing' };
window.TRENERZY["Michal Gasparik"] = { type: 'nothing' };
window.TRENERZY["Michał Hetel"] = { type: 'nothing' };
window.TRENERZY["Michał Królikowski"] = { type: 'nothing' };
window.TRENERZY["Michał Libich"] = { type: 'nothing' };
window.TRENERZY["Michał Probierz"] = { type: 'nothing' };
window.TRENERZY["Mieczysław Broniszewski"] = { type: 'nothing' };
window.TRENERZY["Mieczysław Korzeniowski"] = { type: 'nothing' };
window.TRENERZY["Miroslav Copjak"] = { type: 'nothing' };
window.TRENERZY["Mirosław Dragan"] = { type: 'nothing' };
window.TRENERZY["Mirosław Jabłoński"] = { type: 'nothing' };
window.TRENERZY["Mirosław Smyła"] = { type: 'nothing' };
window.TRENERZY["Nenad Bjelica"] = { type: 'nothing' };
window.TRENERZY["Niels Frederiksen"] = { type: 'nothing' };
window.TRENERZY["Orest Lenczyk"] = { type: 'nothing' };
window.TRENERZY["Patryk Czubak"] = { type: 'nothing' };
window.TRENERZY["Patryk Kniat"] = { type: 'nothing' };
window.TRENERZY["Pavel Hapal"] = { type: 'nothing' };
window.TRENERZY["Pavel Malura"] = { type: 'nothing' };
window.TRENERZY["Pavol Stano"] = { type: 'nothing' };
window.TRENERZY["Paweł Barylski"] = { type: 'nothing' };
window.TRENERZY["Paweł Janas"] = {
  traits: [
    { type: 'lineBoost', line: 'FWD', amount: 2 }, // stawia na ofensywę
    { type: 'categoryBoost', category: 'sfg', pGoalMult: 1.2 }, // groźny przy stałych fragmentach gry
  ],
};
window.TRENERZY["Paweł Karmelita"] = { type: 'nothing' };
window.TRENERZY["Paweł Kowalski"] = { type: 'nothing' };
window.TRENERZY["Paweł Sibik"] = { type: 'nothing' };
window.TRENERZY["Paweł Zydroń"] = { type: 'nothing' };
window.TRENERZY["Peter Hyballa"] = { type: 'nothing' };
window.TRENERZY["Petr Nemec"] = { type: 'nothing' };
window.TRENERZY["Petro Kushlyk"] = { type: 'nothing' };
window.TRENERZY["Piotr Brzeziński"] = { type: 'nothing' };
window.TRENERZY["Piotr Jawień"] = { type: 'nothing' };
window.TRENERZY["Piotr Kocąb"] = { type: 'nothing' };
window.TRENERZY["Piotr Mandrysz"] = { type: 'nothing' };
window.TRENERZY["Piotr Nowak"] = { type: 'nothing' };
window.TRENERZY["Piotr Piekarczyk"] = { type: 'nothing' };
window.TRENERZY["Piotr Pierścionek"] = { type: 'nothing' };
window.TRENERZY["Piotr Sowisz"] = { type: 'nothing' };
window.TRENERZY["Piotr Stokowiec"] = { type: 'nothing' };
window.TRENERZY["Piotr Tworek"] = { type: 'nothing' };
window.TRENERZY["Piotr Wiśnik"] = { type: 'nothing' };
window.TRENERZY["Quim Machado"] = { type: 'nothing' };
window.TRENERZY["Radoslav Latal"] = { type: 'nothing' };
window.TRENERZY["Radosław Bella"] = { type: 'nothing' };
window.TRENERZY["Radosław Mroczkowski"] = { type: 'nothing' };
window.TRENERZY["Radosław Sobolewski"] = { type: 'nothing' };
window.TRENERZY["Rafał Grzyb"] = { type: 'nothing' };
window.TRENERZY["Rafał Górak"] = { type: 'nothing' };
window.TRENERZY["Rafał Janas"] = { type: 'nothing' };
window.TRENERZY["Rafał Ulatowski"] = { type: 'nothing' };
window.TRENERZY["Remigiusz Marchlewicz"] = { type: 'nothing' };
window.TRENERZY["Ricardo Sa Pinto"] = { type: 'nothing' };
window.TRENERZY["Robert Góralczyk"] = { type: 'nothing' };
window.TRENERZY["Robert Kasperczyk"] = { type: 'nothing' };
window.TRENERZY["Robert Kolendowicz"] = { type: 'nothing' };
window.TRENERZY["Robert Maaskant"] = { type: 'nothing' };
window.TRENERZY["Robert Moskal"] = { type: 'nothing' };
window.TRENERZY["Robert Podoliński"] = { type: 'nothing' };
window.TRENERZY["Robert Warzycha"] = { type: 'nothing' };
window.TRENERZY["Roman Dębiński"] = { type: 'nothing' };
window.TRENERZY["Roman Jakóbczak"] = { type: 'nothing' };
window.TRENERZY["Romeo Jozak"] = { type: 'nothing' };
window.TRENERZY["Romuald Szukiełowicz"] = { type: 'nothing' };
window.TRENERZY["Ryszard Komornicki"] = { type: 'nothing' };
window.TRENERZY["Ryszard Polak"] = { type: 'nothing' };
window.TRENERZY["Ryszard Tarasiewicz"] = { type: 'nothing' };
window.TRENERZY["Ryszard Urbanek"] = { type: 'nothing' };
window.TRENERZY["Ryszard Wieczorek"] = { type: 'nothing' };
window.TRENERZY["Stanislav Cherchesov"] = { type: 'nothing' };
window.TRENERZY["Stanislav Levy"] = { type: 'nothing' };
window.TRENERZY["Stanisław Dawidczyński"] = { type: 'nothing' };
window.TRENERZY["Stanisław Gielarek"] = { type: 'nothing' };
window.TRENERZY["Stanisław Magiera"] = { type: 'nothing' };
window.TRENERZY["Stanisław Stachura"] = { type: 'nothing' };
window.TRENERZY["Stanisław Świerk"] = { type: 'nothing' };
window.TRENERZY["Stefan Białas"] = { type: 'nothing' };
window.TRENERZY["Stefan Majewski"] = { type: 'nothing' };
window.TRENERZY["Szymon Grabowski"] = { type: 'nothing' };
window.TRENERZY["Sławomir Grzesik"] = { type: 'nothing' };
window.TRENERZY["Sławomir Nazaruk"] = { type: 'nothing' };
window.TRENERZY["Tadeusz Gaszyński"] = { type: 'nothing' };
window.TRENERZY["Tadeusz Pawłowski"] = { type: 'nothing' };
window.TRENERZY["Tadeusz Łuczak"] = { type: 'nothing' };
window.TRENERZY["Theo Bos"] = { type: 'nothing' };
window.TRENERZY["Thomas Thomasberg"] = { type: 'nothing' };
window.TRENERZY["Thomas von Heesen"] = { type: 'nothing' };
window.TRENERZY["Tomasz Fornalik"] = { type: 'nothing' };
window.TRENERZY["Tomasz Grzegorczyk"] = { type: 'nothing' };
window.TRENERZY["Tomasz Hajto"] = { type: 'nothing' };
window.TRENERZY["Tomasz Kaczmarek"] = { type: 'nothing' };
window.TRENERZY["Tomasz Kafarski"] = { type: 'nothing' };
window.TRENERZY["Tomasz Kulawik"] = { type: 'nothing' };
window.TRENERZY["Tomasz Muchiński"] = { type: 'nothing' };
window.TRENERZY["Tomasz Tułacz"] = { type: 'nothing' };
window.TRENERZY["Tomasz Unton"] = { type: 'nothing' };
window.TRENERZY["Tomasz Wieszczycki"] = { type: 'nothing' };
window.TRENERZY["Tomasz Wilman"] = { type: 'nothing' };
window.TRENERZY["Valdas Ivanauskas"] = { type: 'nothing' };
window.TRENERZY["Vitezslav Lavicka"] = { type: 'nothing' };
window.TRENERZY["Waldemar Fornalik"] = { type: 'nothing' };
window.TRENERZY["Waldemar Piątek"] = { type: 'nothing' };
window.TRENERZY["Waldemar Prusik"] = { type: 'nothing' };
window.TRENERZY["Waldemar Wiater"] = { type: 'nothing' };
window.TRENERZY["Werner Licka"] = { type: 'nothing' };
window.TRENERZY["Wiesław Wojno"] = { type: 'nothing' };
window.TRENERZY["Witold Karaś"] = { type: 'nothing' };
window.TRENERZY["Witold Szyguła"] = { type: 'nothing' };
window.TRENERZY["Wojciech Borecki"] = { type: 'nothing' };
window.TRENERZY["Wojciech Stawowy"] = { type: 'nothing' };
window.TRENERZY["Wojciech Wąsikiewicz"] = { type: 'nothing' };
window.TRENERZY["Wojciech Łazarek"] = { type: 'nothing' };
window.TRENERZY["Wojciech Łobodziński"] = { type: 'nothing' };
window.TRENERZY["Władysław Stachurski"] = { type: 'nothing' };
window.TRENERZY["Władysław Łach"] = { type: 'nothing' };
window.TRENERZY["Władysław Żmuda"] = { type: 'nothing' };
window.TRENERZY["Włodzimierz Gąsior"] = { type: 'nothing' };
window.TRENERZY["Włodzimierz Małowiejski"] = { type: 'nothing' };
window.TRENERZY["Włodzimierz Tylak"] = { type: 'nothing' };
window.TRENERZY["Yuriy Shatalov"] = { type: 'nothing' };
window.TRENERZY["Zbigniew Franiak"] = { type: 'nothing' };
window.TRENERZY["Zbigniew Kaczmarek"] = { type: 'nothing' };
window.TRENERZY["Zbigniew Kieżun"] = { type: 'nothing' };
window.TRENERZY["Zbigniew Lepczyk"] = { type: 'nothing' };
window.TRENERZY["Zbigniew Myga"] = { type: 'nothing' };
window.TRENERZY["Zbigniew Smółka"] = { type: 'nothing' };
window.TRENERZY["Zbigniew Stefaniak"] = { type: 'nothing' };
window.TRENERZY["Zdzisław Podedworny"] = { type: 'nothing' };
window.TRENERZY["Zdzisław Ulatowski"] = { type: 'nothing' };
window.TRENERZY["Zeljko Sopić"] = { type: 'nothing' };
window.TRENERZY["Łukasz Nadolski"] = { type: 'nothing' };
window.TRENERZY["Łukasz Tomczyk"] = { type: 'nothing' };

// Trenerzy dopisani z sezonu 2013/14.
window.TRENERZY["Adam Buczek"] = { type: 'nothing' };
window.TRENERZY["Jose Rojo Martin - Pacheta"] = { type: 'nothing' };
window.TRENERZY["Mirosław Hajdo"] = { type: 'nothing' };
window.TRENERZY["Rafał Pawlak"] = { type: 'nothing' };
window.TRENERZY["Ricardo Moniz"] = { type: 'nothing' };

// Bezpieczne pobranie danych trenera po nazwisku — zwraca zawsze poprawny
// obiekt z polem "traits" (tablica, może być pusta), nawet gdy trener nie
// ma wpisu albo coachName jest null. Silnik korzysta z getMyCoachTraits()
// w TRAITS.js (czyta state.coach) — ta funkcja to ogólny odpowiednik
// przydatny, gdy interesuje Cię trener po samym nazwisku, bez state.coach.
function getCoachSpecialty(coachName) {
  if (!coachName) return { traits: [] };
  const entry = window.TRENERZY[coachName];
  if (!entry || !Array.isArray(entry.traits)) return { traits: [] };
  const resolved = (typeof resolveTraits === 'function') ? resolveTraits(entry.traits) : entry.traits;
  return { traits: resolved };
}
