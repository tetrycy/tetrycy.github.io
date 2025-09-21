// Aktualizacja czasu w pasku zadań
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pl-PL', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    document.getElementById('time').textContent = timeString;
}

// Uruchom zegar
updateTime();
setInterval(updateTime, 1000);

// Obsługa przycisku Start i menu
let startMenuOpen = false;

document.getElementById('startBtn').addEventListener('click', function(e) {
    e.stopPropagation();
    toggleStartMenu();
});

function toggleStartMenu() {
    const startMenu = document.getElementById('startMenu');
    const programsSubmenu = document.getElementById('programsSubmenu');
    const gamesSubmenu = document.getElementById('gamesSubmenu');
    
    startMenuOpen = !startMenuOpen;
    
    if (startMenuOpen) {
        startMenu.classList.add('show');
        document.getElementById('startBtn').classList.add('pressed');
    } else {
        startMenu.classList.remove('show');
        programsSubmenu.classList.remove('show');
        gamesSubmenu.classList.remove('show');
        document.getElementById('startBtn').classList.remove('pressed');
    }
}

// Zamknij menu po kliknięciu poza nim
document.addEventListener('click', function(e) {
    const startMenu = document.getElementById('startMenu');
    const programsSubmenu = document.getElementById('programsSubmenu');
    const gamesSubmenu = document.getElementById('gamesSubmenu');
    const startBtn = document.getElementById('startBtn');
    
    if (!startMenu.contains(e.target) && !programsSubmenu.contains(e.target) && !gamesSubmenu.contains(e.target) && e.target !== startBtn) {
        startMenu.classList.remove('show');
        programsSubmenu.classList.remove('show');
        gamesSubmenu.classList.remove('show');
        startBtn.classList.remove('pressed');
        startMenuOpen = false;
    }
});

// Obsługa elementów menu Start
document.querySelectorAll('.start-menu-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.stopPropagation();
        const app = this.getAttribute('data-app');
        
        switch(app) {
            case 'maps':
                openMaps();
                toggleStartMenu();
                break;
            case 'outlook':
                openOutlook();
                toggleStartMenu();
                break;
            case 'programs':
                toggleProgramsSubmenu();
                break;
            case 'games':
                toggleGamesSubmenu();
                break;
            case 'paint':
                openPaint();
                toggleStartMenu();
                break;
            case 'notepad':
                openNotepad();
                toggleStartMenu();
                break;
            case 'calculator':
                openCalculator();
                toggleStartMenu();
                break;
            case 'minesweeper':
                openMinesweeper();
                toggleStartMenu();
                break;
            case 'solitaire':
                openSolitaire();
                toggleStartMenu();
                break;
            case 'shutdown':
                showShutdownDialog();
                toggleStartMenu();
                break;
            case 'documents':
                openDocuments();
                toggleStartMenu();
                break;
            case 'search':
                openSearch();
                toggleStartMenu();
                break;
            case 'help':
                openHelp();
                toggleStartMenu();
                break;
            case 'run':
                openRun();
                toggleStartMenu();
                break;
           
            default:
                alert(`Otwieranie: ${this.querySelector('.menu-text').textContent}`);
                toggleStartMenu();
        }
    });
});

function toggleProgramsSubmenu() {
    const programsSubmenu = document.getElementById('programsSubmenu');
    const gamesSubmenu = document.getElementById('gamesSubmenu');
    
    // Ukryj submenu gier jeśli otwarte
    gamesSubmenu.classList.remove('show');
    // Przełącz submenu programów
    programsSubmenu.classList.toggle('show');
}

function toggleGamesSubmenu() {
    console.log('toggleGamesSubmenu wywołane!'); // debug
    const gamesSubmenu = document.getElementById('gamesSubmenu');
    
    // NIE ukrywaj submenu programów - zostaw je otwarte
    // Pokaż submenu gier
    gamesSubmenu.classList.add('show');
}

// Funkcje aplikacji - używają systemu okien
function openPaint() {
    openWindow('paint-window', {
        width: 500,
        height: 450
    });
}

function openNotepad() {
    openWindow('notepad-window', {
        width: 400,
        height: 350
    });
}

function openCalculator() {
    openWindow('calculator-window', {
        width: 250,
        height: 300
    });
}

function openMinesweeper() {
    openWindow('minesweeper-window', {
        width: 350,  // zmień z 250
        height: 400  // zmień z 320
    });
    // Inicjalizuj grę po otwarciu okna
    setTimeout(() => {
        if (typeof initMinesweeper === 'function') {
            initMinesweeper();
        }
    }, 100);
}

function openSolitaire() {
    openWindow('solitaire-window', {
        width: 600,
        height: 500
    });
    setTimeout(() => {
        if (typeof initSolitaire === 'function') {
            initSolitaire();
        }
    }, 100);
}

function showShutdownDialog() {
    openWindow('shutdown-dialog', {
        width: 350,
        height: 250
    });
}

// Nowe funkcje menu Start
function openDocuments() {
    window.open('https://leszekmilewski.pl', '_blank');
}

function openSearch() {
    window.open('https://www.youtube.com/@Tetrycy', '_blank');
}

function openHelp() {
    window.open('https://patronite.pl/tetrycy', '_blank');
}

function openRun() {
    showBSOD();
}

// Menu Start - dodatkowe funkcje
function openMaps() {
    window.open('https://maps.google.com', '_blank');
}

function openOutlook() {
    document.getElementById('outlook-window').style.display = 'block';
}

function closeOutlook() {
    document.getElementById('outlook-window').style.display = 'none';
}

// Blue Screen of Death
function showBSOD() {
    const bsod = document.createElement('div');
    bsod.className = 'bsod';
    bsod.innerHTML = `
        <div class="bsod-content">
            <h1>Windows</h1>
            <p>A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) +<br>
            00010E36. The current application will be terminated.</p>
            
            <p>* Press any key to terminate the current application.<br>
            * Press CTRL+ALT+DEL again to restart your computer. You will<br>
            &nbsp;&nbsp;lose any unsaved information in all open applications.</p>
            
            <p>Press any key to continue _</p>
        </div>
    `;
    
    document.body.appendChild(bsod);
    
    // Kliknięcie lub klawisz usuwa BSOD
    const removeBSOD = () => {
        bsod.remove();
        document.removeEventListener('keydown', removeBSOD);
    };
    
    bsod.addEventListener('click', removeBSOD);
    document.addEventListener('keydown', removeBSOD);
}

// Obsługa kliknięć na ikony pulpitu
document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('click', function() {
        // Usuń zaznaczenie z innych ikon
        document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
        // Zaznacz kliknięta ikonę
        this.classList.add('selected');
        
        // Akcje dla konkretnych ikon
        const iconId = this.id;
        switch(iconId) {
            case 'my-computer':
                window.open('my-computer.html', '_blank', 'width=600,height=500,resizable=yes,scrollbars=yes');
                break;
            case 'recycle-bin':
                window.open('recycle-bin.html', '_blank', 'width=700,height=500,resizable=yes,scrollbars=yes');
                break;
            case 'folder-kuba':
                window.open('folder-kuba.html', '_blank', 'width=700,height=500,resizable=yes,scrollbars=yes');
                break;
            case 'folder-leszek':
                window.open('folder-leszek.html', '_blank', 'width=700,height=500,resizable=yes,scrollbars=yes');
                break;
            case 'folder-mati':
                window.open('folder-mati.html', '_blank', 'width=700,height=500,resizable=yes,scrollbars=yes');
                break;
        }
    });
});

// Obsługa kliknięć na pulpit (odznacz ikony)
document.getElementById('desktop').addEventListener('click', function(e) {
    if (e.target === this) {
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.classList.remove('selected');
        });
    }
});

// Obsługa ikon systemowych
document.querySelectorAll('.system-icon').forEach(icon => {
    icon.addEventListener('click', function() {
        const title = this.getAttribute('title');
        alert(`Kliknięto: ${title}`);
    });
});

// Dodaj skróty klawiszowe
document.addEventListener('keydown', function(e) {
    // F2 = nowa gra Minesweeper (jeśli okno otwarte)
    if (e.key === 'F2') {
        const minesweeperWindow = document.getElementById('minesweeper-window');
        if (minesweeperWindow && minesweeperWindow.classList.contains('show')) {
            e.preventDefault();
            if (typeof resetMinesweeper === 'function') {
                resetMinesweeper();
            }
        }
    }
    
    // Escape = zamknij wszystkie okna
    if (e.key === 'Escape') {
        const openWindows = document.querySelectorAll('.window.show');
        openWindows.forEach(window => {
            if (typeof closeWindow === 'function') {
                closeWindow(window.id);
            }
        });
        
        // Zamknij też menu Start
        const startMenu = document.getElementById('startMenu');
        if (startMenu.classList.contains('show')) {
            toggleStartMenu();
        }
    }
});

// Dodaj wsparcie dla dotknięć na urządzeniach mobilnych
if ('ontouchstart' in window) {
    document.addEventListener('touchstart', function(e) {
        // Zamknij menu Start przy dotknięciu poza nim
        const startMenu = document.getElementById('startMenu');
        const programsSubmenu = document.getElementById('programsSubmenu');
        const gamesSubmenu = document.getElementById('gamesSubmenu');
        const startBtn = document.getElementById('startBtn');
        
        if (!startMenu.contains(e.target) && !programsSubmenu.contains(e.target) && !gamesSubmenu.contains(e.target) && e.target !== startBtn) {
            if (startMenuOpen) {
                toggleStartMenu();
            }
        }
    });
}

console.log('Windows 98 Desktop załadowany!');
console.log('Submenu gier dodane!');
