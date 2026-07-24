# Piszpad WAV

Lekki edytor tekstu i ograniczonego RTF z trybem Focus, czytaniem tekstu
oraz lokalnym zapisem całego dokumentu do WAV w Windows.

## Uruchomienie z generowaniem WAV

1. Rozpakuj cały folder w dowolnym miejscu.
2. Kliknij dwukrotnie `Uruchom-Piszpad.bat`.
3. Piszpad otworzy się automatycznie w przeglądarce.
4. Pozostaw otwarte czarne okno „Piszpad WAV”.
5. Kliknij ikonę „Zapisz cały dokument jako WAV”.

Gotowe nagranie zostanie pobrane przez przeglądarkę, zwykle do folderu
„Pobrane”. Nazwa WAV zostanie utworzona z nazwy bieżącego dokumentu.

## Uruchomienie samego edytora

Można otworzyć bezpośrednio `index.html` albo opublikować go przez GitHub
Pages. Edycja, Focus, czytanie, RTF i wyszukiwanie będą działały.

W tym trybie nie działa zapis WAV, ponieważ przeglądarka nie może samodzielnie
uruchomić lokalnego syntezatora Windows. Do WAV należy uruchomić Piszpad przez
`Uruchom-Piszpad.bat`. Kliknięcie ikony WAV w wersji online wyświetla tę
instrukcję bez opuszczania edytora.

Interfejs dopasowuje się również do telefonów: pasek narzędzi zawija się,
pole wyszukiwania zajmuje całą szerokość, a edytor i tryb Focus wykorzystują
wysokość ekranu mobilnego.

## Jak działa WAV

- Tekst nie jest wysyłany do internetu.
- Generator działa wyłącznie na komputerze użytkownika.
- Wykorzystuje zainstalowany w Windows polski głos, preferując Paulinę.
- Jeśli polskiego głosu nie ma, Windows użyje głosu domyślnego.
- Szybkość ustawiona w Piszpadzie jest również stosowana przy zapisie WAV.
- Zamknięcie czarnego okna zatrzymuje lokalny generator.

## Publikacja na GitHub Pages

Plik wejściowy strony nazywa się już `index.html`. W ustawieniach repozytorium
wybierz `Settings → Pages → Deploy from a branch → main → /root`.

GitHub Pages publikuje wersję przeglądarkową. Pełny pakiet Windows należy
udostępnić dodatkowo jako ZIP w sekcji Releases.
