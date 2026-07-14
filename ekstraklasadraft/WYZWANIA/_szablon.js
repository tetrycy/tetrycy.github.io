// ============================================================
// SZABLON NOWEGO WYZWANIA
//
// Każde wyzwanie to OSOBNY PLIK w folderze WYZWANIA/ — dzięki temu,
// nawet przy 50+ wyzwaniach, nic się nie plącze i każde ma swoje
// własne, często bardzo różne zasady (mecz i rewanż, pojedynczy
// finał, inna liczba rund, itd.).
//
// JAK DODAĆ NOWE WYZWANIE:
// 1. Skopiuj ten plik jako WYZWANIA/twoja-nazwa.js
// 2. Wypełnij dane poniżej
// 3. Dodaj w index.html linijkę:
//      <script src="WYZWANIA/twoja-nazwa.js"></script>
//    (obok pozostałych wyzwań, przed wyzwania.js)
// 4. Gotowe — wyzwanie samo pojawi się na liście w grze.
//
// KAŻDA RUNDA MOŻE MIEĆ INNĄ LICZBĘ MECZÓW:
//   legs: 2  → mecz + rewanż (domyślne, jeśli pominiesz to pole).
//              Remis na dwumeczu: najpierw liczą się bramki strzelone
//              NA WYJEŹDZIE (klasyczna zasada pucharowa), a dopiero
//              gdy i to jest remisowe — seria rzutów karnych.
//   legs: 1  → pojedynczy mecz (np. finał bez rewanżu).
//              Remis od razu rozstrzyga seria rzutów karnych.
//
// MIEJSCE MECZU: normalnie liczy się firstLegHome (kto gra u siebie w danej
// rundzie/meczu — u siebie to +2 do +5 do overallu, rozłożone po liniach).
// Jeśli konkretny mecz był na neutralnym terenie (np. finał na wyznaczonym
// stadionie, bez gospodarza), dodaj do tej rundy: neutral: true
// — wtedy obie strony grają bez żadnego bonusu, niezależnie od firstLegHome.
//
// REMIS NA DWUMECZU: domyślnie liczą się bramki strzelone na wyjeździe, a gdy
// i to remisowe — seria rzutów karnych. Jeśli w danej rozgrywce (np. starsze
// puchary europejskie) obowiązywała inna zasada — mecz dodatkowy na neutralnym
// terenie, a przy kolejnym remisie rzut monetą — dodaj do tej rundy: tiebreak: 'replay'
// ============================================================

window.WYZWANIA = window.WYZWANIA || [];
window.WYZWANIA.push({
  id: 'unikalny-identyfikator',
  title: 'Nazwa wyświetlana graczowi',
  description: 'Krótki opis kontekstu wyzwania.',
  club: 'Dokładna nazwa klubu — MUSI istnieć w TEAMS_DATA (data.js)',
  clubSeason: 'Sezon, z którego bierzemy skład gracza, np. "2002/03"',
  rounds: [
    {
      name: 'Nazwa rundy, np. "1. runda" albo "1/8 finału"',
      legs: 2,
      firstLegHome: true, // czy PIERWSZY mecz tej rundy jest u siebie (false = na wyjeździe)
      opponent: {
        // WARIANT A — rywal z głównej bazy (TEAMS_DATA):
        source: 'real',
        club: 'Dokładna nazwa klubu z TEAMS_DATA',
        season: 'Sezon tego klubu, np. "2001/02"',

        // WARIANT B — rywal spoza bazy (np. zagraniczny), zdefiniowany ręcznie
        // w pliku WYZWANIA_TEAMS_DATA (np. WYZWANIA/druzyny-twoje-wyzwanie.js):
        // source: 'custom',
        // id: 'identyfikator-drużyny',
      },
    },
    // ...kolejne rundy...
  ],
});
