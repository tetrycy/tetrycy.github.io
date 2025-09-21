// Funkcja otwierająca pasjans w nowym oknie
function openSolitaire() {
    // Otwórz pasjans w nowym oknie przeglądarki
    const solitaireWindow = window.open(
        'gry/pasjans.html',  // Ścieżka do twojego pliku
        'solitaire',         // Nazwa okna
        'width=820,height=650,resizable=yes,scrollbars=no,menubar=no,toolbar=no,location=no'
    );
    
    // Sprawdź czy okno się otworzyło (popup blocker)
    if (solitaireWindow) {
        solitaireWindow.focus();
        
        // Opcjonalnie - ustaw tytuł okna
        solitaireWindow.onload = function() {
            if (solitaireWindow.document) {
                solitaireWindow.document.title = "Pasjans - Windows 98";
            }
        };
    } else {
        // Jeśli popup został zablokowany
        alert('Popup został zablokowany! Pozwól na wyskakujące okna dla tej strony.');
    }
}

// Podłącz funkcję do kliknięcia w menu Start
document.addEventListener('DOMContentLoaded', function() {
    // Znajdź element menu pasjansa
    const solitaireMenuItem = document.querySelector('[data-app="solitaire"]');
    
    if (solitaireMenuItem) {
        solitaireMenuItem.addEventListener('click', function(e) {
            e.preventDefault();
            openSolitaire();
            
            // Zamknij menu Start po kliknięciu
            const startMenu = document.getElementById('startMenu');
            const gamesSubmenu = document.getElementById('gamesSubmenu');
            
            if (startMenu) startMenu.style.display = 'none';
            if (gamesSubmenu) gamesSubmenu.style.display = 'none';
        });
    }
});

// Alternatywna funkcja dla bezpośredniego wywołania
window.openSolitaire = openSolitaire;
